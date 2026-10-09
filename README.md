# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Contact form

Submissions to the contact form are sent to your inbox as email via SMTP — no third-party form service.

- `src/ContactForm.jsx` — form UI, client-side validation, submit states
- `server/contactHandler.js` — shared handler: server-side validation, honeypot, rate limiting, email delivery
- `api/contact.js` — Vercel serverless entry point (deployed automatically by Vercel)

### Local setup

1. Copy `.env.example` to `.env.local` and fill in your SMTP credentials.
2. Run `npm run dev` — the `/api/contact` endpoint is served by a dev middleware, so the form works locally.

### Deploying to Vercel

Import the repo; Vercel detects Vite and picks up `api/contact.js` automatically. Then set the same variables from `.env.example` in **Project → Settings → Environment Variables** (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`) and redeploy.

Messages arrive in your inbox from the visitor's address with `Reply-To` set, so you can reply directly.


Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
