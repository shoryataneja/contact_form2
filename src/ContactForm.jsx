import { useState } from 'react'
import './ContactForm.css'

const PAGE_LOADED_AT = Date.now()

export default function ContactForm() {
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const payload = Object.fromEntries(new FormData(form))

    setStatus('sending')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body.error || 'Something went wrong. Please try again.')
      }
      setStatus('success')
      form.reset()
    } catch (error) {
      setErrorMessage(error.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-info">
          <h1>Contact Us</h1>
          <p>Have a question or need help? We'd love to hear from you. Fill out the form and we'll get back to you shortly.</p>

          <div className="info-item">
            <span className="info-icon">📍</span>
            <div>
              <strong>Address</strong>
              <p>123 Market Street, Suite 400<br />San Francisco, CA 94105</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">📞</span>
            <div>
              <strong>Phone</strong>
              <p>+1 (800) 123-4567</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">✉️</span>
            <div>
              <strong>Email</strong>
              <p>support@example.com</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">🕐</span>
            <div>
              <strong>Business Hours</strong>
              <p>Mon – Fri: 9:00 AM – 6:00 PM</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input type="text" id="firstName" name="firstName" placeholder="John" required minLength={2} maxLength={100} autoComplete="given-name" />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input type="text" id="lastName" name="lastName" placeholder="Doe" required minLength={2} maxLength={100} autoComplete="family-name" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" placeholder="john@example.com" required maxLength={254} autoComplete="email" />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number <span className="optional">(optional)</span></label>
            <input type="tel" id="phone" name="phone" placeholder="+1 (555) 000-0000" maxLength={20} autoComplete="tel" />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <select id="subject" name="subject" required defaultValue="">
              <option value="" disabled>Select a subject</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Order Support">Order Support</option>
              <option value="Returns &amp; Refunds">Returns &amp; Refunds</option>
              <option value="Product Information">Product Information</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows="5" placeholder="Write your message here..." required minLength={10} maxLength={5000}></textarea>
          </div>

          <div className="form-group checkbox-group">
            <input type="checkbox" id="agree" name="agree" required />
            <label htmlFor="agree">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
          </div>

          <div className="honeypot" aria-hidden="true">
            <label htmlFor="nickname">Leave this empty</label>
            <input type="text" id="nickname" name="nickname" tabIndex={-1} autoComplete="off" />
          </div>
          <input type="hidden" name="formLoadedAt" defaultValue={PAGE_LOADED_AT} />

          {status === 'success' && (
            <p className="form-status success" role="status">
              Thanks! Your message has been sent — we'll get back to you shortly.
            </p>
          )}
          {status === 'error' && (
            <p className="form-status error" role="alert">
              {errorMessage}
            </p>
          )}

          <button type="submit" className="submit-btn" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}
