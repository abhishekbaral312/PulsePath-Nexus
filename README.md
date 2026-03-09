# PulsePath Nexus – Health Diagnosis Platform

PulsePath Nexus is a health-focused backend platform designed to manage user authentication and provide AI-powered diagnosis support through a machine learning API. The system uses a Node.js backend to handle application logic and database operations, while a separate Python-based machine learning service performs predictive health analysis.

The platform demonstrates a modern architecture where web services and machine learning models work together to build intelligent healthcare applications.

## Features

* User authentication and secure access
* Health diagnosis request management
* RESTful API architecture
* MongoDB database integration
* Modular backend structure
* Middleware-based authentication and error handling
* Integration with external machine learning prediction API
* Simple frontend interface for login, registration, and diagnosis interaction

## Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication
* dotenv

### Machine Learning Service

* Python
* FastAPI
* Machine Learning Models

### Frontend

* HTML
* CSS
* JavaScript

## Project Structure

src/

config/
Database connection configuration

controllers/
Business logic for authentication and diagnosis

middleware/
Authentication and error-handling middleware

models/
MongoDB schemas for users and diagnosis records

routes/
API route definitions

services/
External service communication (e.g., ML prediction API)

app.js
Express application configuration

server.js
Application entry point

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/pulsepath-nexus.git
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure the environment variables.

Start the development server:

```bash
npm run dev
```

Start the production server:

```bash
npm start
```

## Deployment

The backend API is deployed on Render and connected with a MongoDB Atlas database. The machine learning prediction API is deployed separately using Python.

## API Base URL
https://symptoms-api-hfa7.onrender.com -- ML model
https://pulsepath-nexus.onrender.com -- NODE + EXPRESS

## Future Improvements

* Advanced AI-powered diagnosis models
* Real-time health monitoring features
* Improved user dashboard
* Integration with wearable health devices

## License

ISC License

**LIVE URL: https://abhishekbaral312.github.io/PulsePath-Nexus/index.html**

**Please wait for 1 min after visiting live url as render have a cold start (API) on free version on 1st visit and reload**
