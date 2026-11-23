# LBI FIB UI Landing Page

Frontend landing page and student portal for Lembaga Bahasa Internasional FIB UI.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- Access to the LBI registration API for live data and authentication

## Local development

```bash
npm ci
copy .env.example .env
npm run dev
```

Vite starts the development server at `http://localhost:5173`.

## Environment variables

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Backend API base URL, including `/api/v1` |
| `VITE_STORAGE_BASE_URL` | Backend base URL used for uploaded assets |

Set these values in the deployment environment. Do not commit `.env` files or credentials.

## Production build

```bash
npm run build
npm run preview
```

The production bundle is generated in `dist/`. Deploy the contents of that directory to a static web server configured to serve the SPA entry point for client-side routes.
