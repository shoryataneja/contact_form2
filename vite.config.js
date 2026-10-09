import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { handleContact } from './server/contactHandler.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Expose .env / .env.local values (all prefixes, real env wins) to the
  // dev-only API middleware below, which reads them via process.env.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (!(key in process.env)) process.env[key] = value
  }

  return {
    plugins: [
      react(),
      {
        name: 'contact-form-api',
        configureServer(server) {
          server.middlewares.use('/api/contact', (req, res) => {
            handleContact(req, res).catch((err) => {
              console.error('[contact] unhandled error:', err)
              if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Internal server error.' }))
              }
            })
          })
        },
      },
    ],
  }
})
