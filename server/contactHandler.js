import nodemailer from 'nodemailer'

const VALID_SUBJECTS = [
  'General Inquiry',
  'Order Support',
  'Returns & Refunds',
  'Product Information',
  'Other',
]

const MAX_BODY_BYTES = 32 * 1024
const MAX_NAME_LENGTH = 100
const MAX_EMAIL_LENGTH = 254
const MAX_MESSAGE_LENGTH = 5000
const MIN_MESSAGE_LENGTH = 10
const MIN_FILL_MS = 3000
const CLOCK_SKEW_MS = 5 * 60 * 1000
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 5

const rateBuckets = new Map()
let transporter

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    })
  }
  return transporter
}

function json(res, status, body) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(status).json(body)
    return
  }
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    return Promise.resolve(typeof req.body === 'string' ? JSON.parse(req.body) : req.body)
  }
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('payload too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      resolve(raw ? JSON.parse(raw) : {})
    })
    req.on('error', reject)
  })
}

function str(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function validate(body) {
  const data = {
    firstName: str(body.firstName),
    lastName: str(body.lastName),
    email: str(body.email),
    phone: str(body.phone),
    subject: str(body.subject),
    message: str(body.message),
    agree: str(body.agree),
  }
  const errors = []

  if (!data.firstName || data.firstName.length > MAX_NAME_LENGTH) {
    errors.push('First name is required (max 100 characters).')
  }
  if (!data.lastName || data.lastName.length > MAX_NAME_LENGTH) {
    errors.push('Last name is required (max 100 characters).')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > MAX_EMAIL_LENGTH) {
    errors.push('A valid email address is required.')
  }
  if (data.phone && !/^[\d\s()+.-]{7,20}$/.test(data.phone)) {
    errors.push('Please enter a valid phone number or leave it blank.')
  }
  if (!VALID_SUBJECTS.includes(data.subject)) {
    errors.push('Please select a subject.')
  }
  if (data.message.length < MIN_MESSAGE_LENGTH) {
    errors.push(`Message must be at least ${MIN_MESSAGE_LENGTH} characters.`)
  }
  if (data.message.length > MAX_MESSAGE_LENGTH) {
    errors.push(`Message must be at most ${MAX_MESSAGE_LENGTH} characters.`)
  }
  if (data.agree !== 'on' && data.agree !== 'true') {
    errors.push('You must agree to the Terms of Service.')
  }

  return errors.length > 0 ? { errors } : { data }
}

function checkFillTime(body) {
  const loadedAt = Number(body.formLoadedAt)
  if (!Number.isFinite(loadedAt) || loadedAt <= 0) {
    return 'Submission rejected.'
  }
  const age = Date.now() - loadedAt
  if (age < -CLOCK_SKEW_MS) {
    return 'Submission rejected.'
  }
  if (age < MIN_FILL_MS) {
    return 'Form was submitted too quickly. Please take a moment and try again.'
  }
  return null
}

function rateLimited(ip) {
  const now = Date.now()
  if (rateBuckets.size > 5000) {
    rateBuckets.clear()
  }
  const bucket = (rateBuckets.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS)
  if (bucket.length >= RATE_MAX) {
    rateBuckets.set(ip, bucket)
    return true
  }
  bucket.push(now)
  rateBuckets.set(ip, bucket)
  return false
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildEmail(data) {
  const fullName = `${data.firstName} ${data.lastName}`
  const text = [
    'New contact form submission',
    '',
    `Name: ${fullName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || 'not provided'}`,
    `Subject: ${data.subject}`,
    '',
    'Message:',
    data.message,
  ].join('\n')

  const row = (label, value) =>
    `<tr><td style="padding:6px 12px;color:#555;white-space:nowrap;"><strong>${label}</strong></td>` +
    `<td style="padding:6px 12px;">${value}</td></tr>`

  const html = [
    '<div style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;">',
    '<h2 style="margin:0 0 12px;">New contact form submission</h2>',
    '<table style="border-collapse:collapse;background:#f7f9fc;border:1px solid #e3e8ef;">',
    row('Name', escapeHtml(fullName)),
    row('Email', `<a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>`),
    row('Phone', escapeHtml(data.phone || 'not provided')),
    row('Subject', escapeHtml(data.subject)),
    '</table>',
    '<p style="margin:16px 0 6px;"><strong>Message</strong></p>',
    `<p style="white-space:pre-wrap;margin:0;">${escapeHtml(data.message)}</p>`,
    '</div>',
  ].join('')

  return { text, html }
}

export async function handleContact(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed.' })
    return
  }

  let body
  try {
    body = await readBody(req)
  } catch (err) {
    const tooLarge = err?.message === 'payload too large'
    json(res, tooLarge ? 413 : 400, {
      error: tooLarge ? 'Submission too large.' : 'Invalid request body.',
    })
    return
  }

  const ip = clientIp(req)

  if (str(body.nickname) !== '') {
    console.warn(`[contact] honeypot triggered from ${ip}`)
    json(res, 400, { error: 'Submission rejected.' })
    return
  }

  const validated = validate(body)
  if (validated.errors) {
    json(res, 400, { error: validated.errors[0], errors: validated.errors })
    return
  }

  const timeError = checkFillTime(body)
  if (timeError) {
    json(res, 400, { error: timeError })
    return
  }

  if (rateLimited(ip)) {
    json(res, 429, { error: 'Too many messages from this address. Please try again later.' })
    return
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('[contact] SMTP environment variables are not set (SMTP_HOST, SMTP_USER, SMTP_PASS)')
    json(res, 500, { error: "We couldn't send your message. Please try again later." })
    return
  }

  const { text, html } = buildEmail(validated.data)
  try {
    await getTransporter().sendMail({
      from: process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER,
      to: process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER,
      replyTo: { name: `${validated.data.firstName} ${validated.data.lastName}`, address: validated.data.email },
      subject: `[Contact] ${validated.data.subject} — ${validated.data.firstName} ${validated.data.lastName}`,
      text,
      html,
    })
  } catch (err) {
    console.error('[contact] email send failed:', err)
    json(res, 500, { error: "We couldn't send your message. Please try again later." })
    return
  }

  json(res, 200, { ok: true })
}
