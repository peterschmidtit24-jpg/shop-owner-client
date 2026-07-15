# Shop Owner Client

React and TypeScript administration dashboard for the Shop Owner application. The client uses Vite, Tailwind CSS, Axios, and Lucide icons. During local development it runs on `http://localhost:5173` and communicates with the Express API on `http://localhost:8080`.

## Technology overview

- React for user-interface components
- TypeScript for type checking
- Vite for the development server and production build
- Tailwind CSS for styling
- Axios for HTTP requests to the server
- React Router for URL-based client navigation
- Lucide React for interface icons
- ESLint for code-quality checks

## Requirements

Install the following software before starting:

- Node.js
- npm, which is included with Node.js
- The Shop Owner server and its PostgreSQL database

Check that Node.js and npm are available:

```bash
node --version
npm --version
```

## 1. Creating the client from scratch

The existing client is already created. These commands document how an equivalent project can be initialized:

```bash
npm create vite@latest shop-owner-client -- --template react-ts
cd shop-owner-client
npm install
```

The `react-ts` template provides React, TypeScript, Vite, the application entry point, and the TypeScript configuration files.

## 2. Installing the project dependencies

To install the dependencies of this existing repository, run:

```bash
cd shop-owner-client
npm install
```

When creating the project manually, install the additional runtime packages with:

```bash
npm install axios lucide-react react-router-dom
```

Install Tailwind CSS and its Vite integration as development dependencies:

```bash
npm install --save-dev tailwindcss @tailwindcss/vite
```

The resulting dependency groups are:

```text
Runtime:     react, react-dom, react-router-dom, axios, lucide-react
Development: vite, typescript, eslint, tailwindcss, @tailwindcss/vite
```

Do not install the old Tailwind PostCSS configuration for this project. It uses Tailwind's Vite plugin directly.

## 3. Configuring Tailwind CSS

Import the Tailwind Vite plugin in `vite.config.ts` and add it to the plugin list:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Load Tailwind in `src/index.css`:

```css
@import "tailwindcss";
```

`src/main.tsx` must import this stylesheet before rendering the application:

```ts
import './index.css'
```

Tailwind utility classes can then be used directly in JSX:

```tsx
<button className="rounded-xl bg-indigo-600 px-4 py-3 text-white">
  Simulate Order
</button>
```

## 4. Client structure

The important client files are organized as follows:

```text
shop-owner-client/
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── orders.ts
│   │   └── products.ts
│   ├── components/
│   │   ├── Badge.tsx
│   │   ├── LowStockList.tsx
│   │   ├── MetricCard.tsx
│   │   └── RecentOrdersList.tsx
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── OrdersPage.tsx
│   │   └── ProductsPage.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── package.json
└── vite.config.ts
```

- `main.tsx` mounts the React application.
- `App.tsx` provides the application shell, navigation, and page selection.
- `api/` contains the shared Axios client, API request functions, and response types.
- `pages/` contains complete application pages such as the dashboard.
- `components/` contains reusable cards and lists.
- `index.css` loads Tailwind and defines global base styles.
- `vite.config.ts` configures React and Tailwind for Vite.

The dashboard currently uses dummy data. This allows the interface and interactions to be developed before every API operation is connected.

## 5. Starting the server

The client requires the API server for real HTTP requests. Open a terminal and run:

```bash
cd shop-owner-server
npm install
npm run dev
```

The server should print:

```text
Server running on http://localhost:8080
```

Verify the products endpoint directly in a browser or API client:

```text
http://localhost:8080/api/products
```

The endpoint should return a JSON array. An empty database returns `[]`.

## 6. Allowing browser requests with CORS

The client and server use different origins:

```text
Client: http://localhost:5173
Server: http://localhost:8080
```

A different port means a different origin. The browser therefore blocks the request unless the Express server explicitly permits the client origin.

Install CORS in the server project if it is not installed:

```bash
cd shop-owner-server
npm install cors
npm install --save-dev @types/cors
```

Configure it in `shop-owner-server/src/server.ts` before registering the API routes:

```ts
import cors from 'cors'
import express from 'express'

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)
```

Middleware order matters: CORS should be registered before the route handlers so its response headers are included in API responses.

## 7. Connecting the client with Axios

Import Axios in the component or API module that needs server data:

```ts
import axios from 'axios'
```

A minimal products request looks like this:

```ts
async function getProducts() {
  try {
    const response = await axios.get('http://localhost:8080/api/products')
    console.log('Products from server:', response.data)
    return response.data
  } catch (error) {
    console.error('Could not fetch products:', error)
    throw error
  }
}
```

Axios parses a JSON response automatically and exposes it through `response.data`. It also rejects unsuccessful HTTP status codes, so errors can be handled in `catch`.

For repeated requests, create one shared Axios instance:

```ts
// src/api/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})
```

Requests then contain only the endpoint path:

```ts
import { apiClient } from './client'

export async function getProducts() {
  const response = await apiClient.get('/products')
  return response.data
}
```

This shared-client structure is recommended when the dummy dashboard is connected to real product and order data.

## 8. Using an environment variable for the API URL

Avoid repeating the server address across components. Add a `.env` file to the client root:

```env
VITE_API_URL=http://localhost:8080/api
```

Use it in the Axios instance:

```ts
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})
```

Only variables beginning with `VITE_` are exposed to client code. Restart the Vite development server after changing `.env`.

Do not put database credentials, passwords, or other secrets in client environment variables. Browser users can inspect all client-side values.

## 9. Running the client

Open a second terminal while the server remains running:

```bash
cd shop-owner-client
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://localhost:5173
```

Both processes must remain active:

```text
Browser → React client on port 5173
             ↓ Axios request
          Express API on port 8080
             ↓ Prisma query
          PostgreSQL database
```

## 10. Available npm scripts

Run these commands from `shop-owner-client`:

```bash
npm run dev
```

Starts the Vite development server with hot module replacement.

```bash
npm run lint
```

Checks the source code with ESLint.

```bash
npm run build
```

Runs TypeScript checks and creates an optimized production build in `dist/`.

```bash
npm run preview
```

Serves the production build locally for a final check. Run `npm run build` first.

## 11. Production build checklist

Before delivering client changes, run:

```bash
npm run lint
npm run build
```

The generated `dist/` directory contains static files for deployment. The Express API is a separate application and must be deployed independently or configured behind the same domain.

For production, update both of these values:

1. `VITE_API_URL` must point to the deployed API.
2. The Express CORS `origin` must permit the deployed client URL.

## 12. Troubleshooting

### The browser reports a CORS error

- Confirm the client URL matches the origin configured in `server.ts` exactly.
- Confirm `app.use(cors(...))` appears before the API routes.
- Restart the Express server after changing its configuration.
- If Vite selected another port, either return it to port `5173` or update the allowed origin.

### Axios reports `Network Error` or `ERR_CONNECTION_REFUSED`

- Confirm the server is running on port `8080`.
- Open `http://localhost:8080/api/products` directly.
- Confirm the Axios base URL and endpoint path are correct.
- Check the browser Network panel for the failed request.

### The request succeeds but no products appear

- An empty array means the request worked but the database contains no products.
- Check `response.data` rather than the complete Axios response object.
- Confirm that UI state is updated with the returned array.

### Vite starts on a port other than 5173

Port `5173` may already be in use. Stop the other process or update the server's CORS origin to the new port shown by Vite.

### Tailwind classes have no effect

- Confirm `@tailwindcss/vite` is included in `vite.config.ts`.
- Confirm `src/index.css` contains `@import "tailwindcss";`.
- Confirm `main.tsx` imports `./index.css`.
- Restart the Vite development server after configuration changes.
