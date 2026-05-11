# 🚀 API Forge

A powerful full-stack mock API server for developers and QA teams. Create, simulate, and test HTTP endpoints with realistic latency, failures, response templates, and real-time analytics—all without writing a single line of backend code.

**Live Demo:** [https://api-forge-drab.vercel.app/]

---

## ✨ Features

### Core Mock API Management
- **Create Mock Endpoints** - Define custom HTTP endpoints (GET, POST, PUT, DELETE, PATCH) without any backend code
- **Dynamic Routing** - All mocks are automatically routed; no hardcoded handlers needed
- **Rich Responses** - Store JSON responses, text, or any HTTP-compliant body
- **Flexible Status Codes** - Set custom HTTP status codes (200, 404, 500, etc.) for each mock
- **Bulk Operations** - Duplicate, enable/disable, and delete mocks with a single click
- **Share Mocks** - Generate shareable links for public mock endpoints

### Realistic Traffic Simulation
- **Latency Simulation** - Add configurable delays (in milliseconds) to simulate network latency
- **Failure Rate Control** - Define a percentage rate for random failures (e.g., 20% of requests fail)
- **Rate Limiting** - Throttle requests per mock with customizable limits and time windows
- **HTTP Error Simulation** - Test your client's error handling with realistic failure scenarios

### Response Templating
- **Dynamic Placeholders** - Use template variables in responses that resolve at request time:
  - `{{request.body.fieldName}}` - Extract values from request body
  - `{{request.query.key}}` - Access URL query parameters
  - `{{request.headers.X-Header}}` - Read request headers
  - `{{now}}` - Current ISO timestamp
  - `{{date}}` - Current date (YYYY-MM-DD)
  - `{{timestamp}}` - Unix timestamp in milliseconds
  - `{{mock.endpoint}}` - The mock endpoint path
  - `{{mock.method}}` - The HTTP method
- **Smart Substitution** - Templates work in nested JSON objects and arrays

### Real-Time Monitoring
- **Live Request Logs** - Watch incoming requests in real-time with full request/response details (Socket.IO powered)
- **Webhook Call History** - Track all webhook deliveries with status, response time, and error details
- **Call Inspector** - View request headers, body, query parameters, and response data in detail
- **Live Filtering** - Filter logs by status code, time range, and other criteria

### Analytics & Insights
- **Dashboard Charts** - Visual breakdown of:
  - HTTP status code distribution (Doughnut chart)
  - Top performing mocks (Bar chart with call counts)
- **Response Time Metrics** - Track average response time across all requests
- **Request Counts** - See total requests and per-endpoint statistics
- **Time Series Data** - Monitor request trends over the last 60 minutes

### Security & Performance
- **Helmet.js Integration** - Secure HTTP headers to protect against common vulnerabilities
- **Global Rate Limiting** - 100 requests per 15 minutes globally (protects backend)
- **Request Body Limits** - 2MB limit on JSON/URL-encoded payloads
- **Parameterized Queries** - All database queries use prepared statements (SQL injection safe)
- **CORS Support** - Cross-origin requests enabled for public testing

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19 + Vite (lightning-fast dev server and production builds)
- Tailwind CSS (utility-first styling)
- Axios (HTTP client for API communication)
- Socket.IO Client (real-time event subscriptions)
- Chart.js + react-chartjs-2 (analytics visualizations)
- React Router (SPA navigation)
- React Hot Toast (notification system)

**Backend:**
- Node.js + Express 5.1.0 (lightweight HTTP server)
- PostgreSQL (persistent mock storage)
- Socket.IO v4 (real-time bidirectional communication)
- pg (native PostgreSQL driver)
- Helmet (security headers)
- express-rate-limit (rate limiting middleware)

**Deployment:**
- Frontend: Vercel (serverless React hosting)
- Backend: Render (Node.js cloud platform)
- Database: Supabase or any managed PostgreSQL provider

### Project Structure

```
API-Forge/
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components (Dashboard, ApiEditor, etc.)
│   │   ├── services/        # HTTP and Socket.IO services
│   │   ├── hooks/           # Custom React hooks
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                  # Express + Node.js
│   ├── src/
│   │   ├── server.js        # HTTP + Socket.IO initialization
│   │   ├── app.js           # Express middleware and routes
│   │   ├── db/
│   │   │   └── pool.js      # PostgreSQL connection pool
│   │   ├── services/
│   │   │   ├── mockService.js        # Core mock logic, templates, rate limiting
│   │   │   ├── callLogService.js     # Request/response logging
│   │   │   ├── webhookService.js     # Webhook delivery
│   │   │   ├── socketService.js      # Socket.IO event management
│   │   │   └── analyticsService.js   # SQL aggregations for dashboard
│   │   ├── controllers/     # HTTP request handlers
│   │   └── routes/          # Route definitions
│   ├── .env
│   └── package.json
│
├── src/                      # Root assets (shared)
│   └── assets/
│       └── favicon.png
│
└── README.md
```

---

## 📚 Usage Guide

### Creating a Mock API

1. Click **"Create New Mock"** on the dashboard
2. Fill in the form:
   - **Endpoint Path:** `/users` (the path after `/mock/`)
   - **HTTP Method:** GET, POST, PUT, DELETE, PATCH
   - **Status Code:** 200, 404, 500, etc.
   - **Response:** JSON object or any text response
   - **Delay (ms):** Simulated latency (0-5000ms)
   - **Error Rate (%):** Percentage of requests that fail (0-100%)
   - **Rate Limit:** Requests per time window (0 = unlimited)
3. Click **"Save"**

Your mock is now live at: `http://localhost:5000/mock/users`

### Using Response Templates

In your response JSON, use these placeholders:

```json
{
  "message": "Hello {{request.body.name}}",
  "timestamp": "{{now}}",
  "userId": "{{request.query.id}}",
  "endpoint": "{{mock.endpoint}}",
  "requestId": "{{request.headers.X-Request-ID}}"
}
```

When called, `{{now}}` becomes the current ISO timestamp, `{{request.body.name}}` is replaced with the actual request body value, etc.

### Testing Mocks

1. Open the mock detail page
2. Click **"Test This Mock"** tab
3. Enter request parameters:
   - **Query Parameters:** `?key=value`
   - **Request Body:** Raw JSON
   - **Headers:** Custom headers
4. Click **"Send Request"** to test in real-time
5. View response, status code, and response time

### Monitoring Real-Time Activity

- **Call Logs Tab:** See all incoming requests to your mock endpoints with full details
- **Webhook Calls Tab:** Track webhook deliveries (if enabled)
- **Dashboard:** View aggregate statistics and trends across all mocks

---

## 🔌 API Reference

### Mock Management Endpoints

**Create a Mock**
```
POST /api/mock
Content-Type: application/json

{
  "endpoint": "/users",
  "method": "GET",
  "response": { "users": [] },
  "status_code": 200,
  "delay": 100,
  "error_rate": 0,
  "rate_limit_requests": 0,
  "rate_limit_window_ms": 60000
}
```

**List All Mocks**
```
GET /api/mock
```

**Get Single Mock**
```
GET /api/mock/:id
```

**Update Mock**
```
PUT /api/mock/:id
Content-Type: application/json
```

**Delete Mock**
```
DELETE /api/mock/:id
```

**Duplicate Mock**
```
POST /api/mock/:id/duplicate
```

**Toggle Mock Active Status**
```
PATCH /api/mock/:id/toggle
```

### Dynamic Mock Requests

Any mock endpoint can be called at:
```
{METHOD} /mock/{endpoint}
```

Example:
- Created mock: GET `/users`
- Call it at: `GET /mock/users`

The server applies your configured delay, error rate, and returns the stored response.

### Analytics Endpoints

**Get Overview Stats**
```
GET /api/analytics/overview
```

Response:
```json
{
  "total": 1250,
  "avgResponseTimeMs": 145,
  "statusDistribution": {
    "200": 1000,
    "404": 200,
    "500": 50
  },
  "topMocks": [
    { "endpoint": "/users", "count": 500 },
    { "endpoint": "/products", "count": 350 }
  ]
}
```

**Get Time Series Data**
```
GET /api/analytics/mocks/:id/timeseries?from=2026-05-11T00:00:00Z&to=2026-05-12T00:00:00Z
```

---

## 🔒 Security Features

- **SQL Injection Protection:** All queries use parameterized statements
- **Helmet.js:** Secure HTTP headers (Content Security Policy, X-Frame-Options, etc.)
- **Rate Limiting:** 100 req/15 min globally; configurable per-mock limits
- **CORS:** Properly configured for cross-origin requests
- **Input Validation:** Request body/query parameters validated before processing
- **Environment Variables:** Sensitive data stored in `.env` files (never committed)

---

## 📊 Real-Time Features

### Socket.IO Integration

The backend uses Socket.IO to push real-time updates to connected clients:

- **Call Logs:** Every incoming request is broadcast to subscribed clients in real-time
- **Webhook Events:** Webhook delivery attempts are streamed as they happen
- **Automatic Subscriptions:** Frontend automatically joins room-based subscriptions (`mock-{id}`)

This means:
- Open two browser tabs, send a request in one, and see it appear instantly in the other
- No page refresh needed to see new activity
- Sub-second latency for real-time updates

---

<<<<<<< HEAD
**Happy mocking! 🎉**
=======
**Happy mocking! 🎉**
>>>>>>> 7d45c91 (Refine navbar layout and dashboard actions)
