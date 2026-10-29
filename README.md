# Lanka Batiks — E-Commerce Web Application

Lanka Batiks is a full-stack e-commerce web application developed as a university web application development assignment. The application allows customers to browse batik products, manage their shopping carts, place orders, and view their order history. Administrators can manage products, process customer orders, and monitor store activity through an administration dashboard.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Quality Checks](#quality-checks)
- [Security Notes](#security-notes)
- [Limitations](#limitations)

## Project Overview

The main objective of Lanka Batiks is to provide a simple online shopping experience for batik products while offering administrators the tools needed to manage products and customer orders.

The application uses a React frontend, an Express backend API, and MongoDB for data persistence.

## Features

### Customer Features

- Browse available products.
- View product details.
- Add products to the shopping cart.
- Update item quantities and remove items from the cart.
- Enter shipping details and place orders.
- View order confirmations.
- Access personal order history and order details.
- Register and log in to an account.

### Administrator Features

- Access protected administration pages.
- Create and edit products.
- View and manage customer orders.
- Update order statuses.
- View an administration dashboard with order summary statistics.
- Review recent orders.
- View monthly sales analytics, including order counts and revenue from orders marked as paid.

### Order Management

- Store order items and their purchase-time prices.
- Validate product prices and available stock when creating orders.
- Track order statuses and payment statuses.
- Maintain customer order history.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Routing | React Router |
| HTTP requests | Axios |
| Styling | CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Password hashing | bcryptjs |
| Security middleware | Helmet, CORS |
| Code linting | Oxlint |

## Project Structure

```text
lanka-batiks-web-app-new/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── services/
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
└── README.md
```

The backend separates routes, controllers, services, models, middleware, and configuration. The frontend separates reusable components, pages, authentication context, and API services.

## Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) and npm.
- [MongoDB](https://www.mongodb.com/) — either a local MongoDB server or an accessible MongoDB deployment.
- Git, if cloning the repository.
- A modern web browser.

## Installation and Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd lanka-batiks-web-app-new
```

Replace `<repository-url>` with the repository's actual Git URL.

### 2. Install backend dependencies

From the project root:

```bash
npm --prefix backend install
```

### 3. Install frontend dependencies

```bash
npm --prefix frontend install
```

### 4. Configure the environment

Create `backend/.env` and configure the variables described below. Never commit real credentials or secrets.

### 5. Configure MongoDB

Make sure your MongoDB instance is running or that your MongoDB deployment is accessible. Configure the connection string and database name in `backend/.env`.

## Environment Configuration

The backend reads its environment configuration through `dotenv`.

Create `backend/.env` with values appropriate for your development environment:

```dotenv
PORT=5000
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=lanka_batiks
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
```

**Important:**

- Replace every placeholder with an appropriate value.
- Use a strong, private JWT secret. Never use the example value in a real deployment.
- Use the expiration format supported by your existing JWT configuration.
- Ensure the frontend origin matches the address used by your Vite development server.
- Do not commit `.env` files, database credentials, or authentication secrets to GitHub.
- Confirm that `backend/.env` is excluded by your `.gitignore`.

The example above documents the configuration variables identified in the backend. If your frontend API service requires a separate environment variable, configure it according to that service's implementation.

## Running the Application

Run the backend and frontend in separate terminals from the project root.

### Terminal 1 — Start the backend

```bash
npm --prefix backend run dev
```

The backend connects to MongoDB before starting the HTTP server. The default API port is `5000`.

The backend also provides a production start script:

```bash
npm --prefix backend start
```

### Terminal 2 — Start the frontend

```bash
npm --prefix frontend run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173`

The frontend must be able to reach the backend API, and the backend must be configured to allow the frontend origin.

## Quality Checks

### Build the frontend

Run from the project root:

```bash
npm --prefix frontend run build
```

This creates the frontend production build in `frontend/dist`.

### Lint the frontend

```bash
npm --prefix frontend run lint
```

Review any errors or warnings reported by the linter. Warnings should be assessed rather than automatically treated as build failures.

### Preview the production build

After building the frontend:

```bash
npm --prefix frontend run preview
```

Use the URL printed by Vite to preview the production build locally.

## Security Notes

- Passwords should be stored as hashes, not plaintext.
- Protected backend routes must enforce authentication and the appropriate authorization checks.
- Administrative functionality must not be available to ordinary customer accounts.
- Validate submitted data on the backend, even when the frontend also validates forms.
- Keep secrets and database credentials outside the source code.
- Use HTTPS and appropriate deployment security settings when hosting the application publicly.

## Limitations

Lanka Batiks is developed as an academic project. Its implemented functionality should be evaluated against the actual application and assignment requirements.

The documented order workflow uses cash on delivery. A third-party online payment gateway, advanced notification systems, and additional production infrastructure are not included in this project description.

Further development could include automated tests, additional reporting, online payment integration, and deployment automation if required.

---

**Project:** Lanka Batiks — E-Commerce Web Application  
**Purpose:** University web application development assignment  
**Repository:** Add the repository URL when preparing the final submission.