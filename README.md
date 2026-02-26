# 🗓️ Leave Management System (LMS)
> **Automated Workflow. Intelligent Logic. Professional Leave Management.**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

The **Leave Management System (LMS)** is a high-performance, full-stack enterprise application designed to streamline employee leave workflows. Featuring a stunning **"Pure Monochrome Black"** aesthetic with **"Retro Atomic"** neon accents, it combines cutting-edge design with robust business logic.

---

## ✨ Key Features

### 🚀 For Employees
- **Intelligent Leave Submission**: Automated balance verification and real-time overlap detection.
- **Dynamic Dashboard**: High-density interface with free-form widget placement and resizing.
- **Interactive Calendar**: FullCalendar integration for precise scheduling and viewing of leave history.
- **Personal Metrics**: Real-time tracking of leave balances and request statuses.

### 🛡️ For Administrators
- **Global Overview**: Comprehensive visibility into all employee leave requests.
- **One-Click Approval**: Streamlined workflow for approving or rejecting requests.
- **Admin Cooldown Logic**: Built-in 7-day cooldown for admin role requests to prevent system spam.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Custom Design System)
- **State Management**: React Context API (AuthContext)
- **Visuals**: [Lottie](https://lottiefiles.com/) for micro-animations
- **Scheduling**: [FullCalendar](https://fullcalendar.io/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) / [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via Mongoose)
- **Authentication**: Stateless [JWT](https://jwt.io/) + BcryptJS password hashing
- **Automation**: [Node-cron](https://www.npmjs.com/package/node-cron) for automated accruals
- **Communication**: [Nodemailer](https://nodemailer.com/) for automated email notifications

---

## 📡 API Reference

### Authentication (`/api/auth`)
- `POST /register`: User registration
- `POST /login`: Secure login
- `GET /profile`: Fetch user details

### Leave Operations (`/api/leaves`)
- `POST /apply`: Submit leave (includes balance & overlap checks)
- `GET /my-leaves`: User-specific request history
- `GET /balance`: Current leave day counters
- `PUT /:id/status`: (Admin) Update request status (Approved/Rejected)

### Administrative (`/api/users`)
- `POST /request-admin`: Initiates admin role request with 7-day cooldown
- `GET /admin-requests`: (Admin) View pending promotions

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- NPM or Yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/Leave_management_system.git
    cd Leave_management_system
    ```

2.  **Server Setup**:
    ```bash
    cd server
    npm install
    # Create a .env file based on the environment section below
    npm start # Use 'npm run dev' for development
    ```

3.  **Client Setup**:
    ```bash
    cd ../client
    npm install
    npm run dev
    ```

### Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

---

## 🎨 Design Philosophy
The system follows a **Pure Monochrome Black** aesthetic, utilizing:
- **Neon Accents**: For critical interactive elements.
- **Glassmorphism**: Subtle blur effects for modern depth.
- **Typography**: Inter and Outfit fonts for superior readability.

---

## 📄 License
Distributed under the **ISC License**. See `LICENSE` for more information.
