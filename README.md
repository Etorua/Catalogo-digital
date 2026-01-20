# Digital Catalog with ERP/CRM Integration

This project is a full-stack digital catalog designed to integrate with ERP and CRM systems.

## Tech Stack
- **Database**: PostgreSQL 15.2 (Driver included, connection configured in `server/db.js`)
- **Server**: Node.js 18.17.0 (Express)
- **Framework**: React 18.2.0 (Vite)

## Project Structure
- `client/`: React Frontend
- `server/`: Node.js Express Backend

## Prerequisites
- Node.js installed (v18+)
- PostgreSQL installed and running (optional for demo mode, required for full DB persistence)

## Setup & Run

### 1. Backend (Server)
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Start the server:
```bash
npm run dev
```
The server will run on [http://localhost:5000](http://localhost:5000).

### 2. Frontend (Client)
Open a new terminal, navigate to the client directory and install dependencies:
```bash
cd client
npm install
```

Start the development server:
```bash
npm run dev
```
The client will run on [http://localhost:5173](http://localhost:5173) and proxy API requests to the server.

## Features Implemented
- **Product API**: Mocked ERP integration returning product SKUs, stock, and pricing.
- **Frontend Catalog**: Dynamic grid displaying products fetched from the backend.
- **Real-time Availability**: Visual indicators for stock status.
- **Database Connection**: Configured in `server/db.js` using `pg` pool.

## Configuration
Create a `.env` file in the `server` directory based on the provided example to connect to your real PostgreSQL database.
