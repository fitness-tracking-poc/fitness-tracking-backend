# Fitness App Backend

A simplified REST API backend for a fitness tracking application built with Node.js, Express, and MongoDB. Focuses on basic data recording without complex calculations.

## 🌐 **Live API**
**Production URL:** https://fitness-tracking-backend-0dvp.onrender.com

## 📋 Features

- **OTP Authentication**: Mobile number verification with SMS OTP (mocked in development)
- **Profile Management**: Minimal profile collection (name, gender, birthdate required)
- **Meal Tracking**: Log meals with time-based validation (breakfast, brunch, lunch, dinner, snack)
- **Exercise Tracking**: Basic exercise logging without calculations
- **Daily Summaries**: Get daily health data summaries with calorie tracking and exercise metrics
- **Health Reports**: Weekly and monthly reports with aggregated health data and trends
- **Health Metrics**: Generic system for tracking various health measurements (blood pressure, heart rate, weight, blood sugar, etc.)
- **Metrics Reports**: Aggregated reports with averages, min/max values for health metrics

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory:
```env
NODE_ENV=development
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secure-jwt-secret-here
PORT=5000
```

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/send-otp` | Send OTP to mobile number |
| POST | `/auth/verify-register` | Register with OTP verification |
| POST | `/auth/verify-login` | Login with OTP verification |
| GET | `/auth/me` | Get current authenticated user |

### User Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/profile` | Get user profile |
| PUT | `/user/profile` | Update profile |
| PUT | `/user/account` | Update account info (name) |

### Meal Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/meals` | Add meal (with time validation) |
| GET | `/meals` | Get all meals (with date filtering) |
| GET | `/meals/today` | Get today's meals |
| PUT | `/meals/:id` | Update meal |
| DELETE | `/meals/:id` | Delete meal |

### Exercise Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/exercises` | Add exercise |
| GET | `/exercises` | Get all exercises (with date filtering) |
| GET | `/exercises/today` | Get today's exercises |
| PUT | `/exercises/:id` | Update exercise |
| DELETE | `/exercises/:id` | Delete exercise |

### Health Metrics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/health-metrics` | Add health metric |
| GET | `/health-metrics` | Get health metrics (with filtering) |
| GET | `/health-metrics/report` | Get aggregated report (daily/weekly/monthly) |
| PUT | `/health-metrics/:id` | Update health metric |
| DELETE | `/health-metrics/:id` | Delete health metric |

### Summary & Reports Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/summary/daily` | Get daily summary |
| GET | `/summary/weekly` | Get weekly report |
| GET | `/summary/monthly` | Get monthly report |

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection with validation
│   ├── controllers/
│   │   ├── auth.controller.js   # OTP authentication
│   │   ├── user.controller.js   # Profile management
│   │   ├── meal.controller.js   # Meal tracking with time validation
│   │   ├── exercise.controller.js # Exercise logging
│   │   ├── healthMetric.controller.js # Health metrics tracking
│   │   └── summary.controller.js # Daily/weekly/monthly reports
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── User.js              # User with mobile auth & optional email
│   │   ├── Profile.js           # User profile (gender, goals, preferences)
│   │   ├── Meal.js              # Meal with time validation
│   │   ├── Exercise.js          # Basic exercise tracking
│   │   └── HealthMetric.js      # Generic health metrics
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── meal.routes.js
│   │   ├── exercise.routes.js
│   │   ├── healthMetric.routes.js
│   │   └── summary.routes.js
│   ├── services/
│   │   └── OTPService.js        # Mock OTP service
│   ├── utils/
│   │   ├── asyncHandler.js      # Async error wrapper
│   │   ├── ErrorResponse.js     # Custom error class
│   │   └── seedDatabase.js      # Database seeding
│   └── server.js                # App entry point
├── API_DOCUMENTATION.md         # Detailed API docs
├── Fitness_App_API.postman_collection.json  # Postman collection
├── .env                         # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🔐 Authentication

The app uses OTP-based authentication:

1. **Send OTP**: POST `/api/auth/send-otp` with mobile number
2. **Verify & Register/Login**: Use the OTP to register or login
3. **JWT Token**: All subsequent requests require `Authorization: Bearer <token>`

**Development Note**: OTP is always "123456" in development mode.

## 🧪 Testing with Postman

1. Import `Fitness_App_API.postman_collection.json` into Postman
2. Set environment variables:
   - `base_url`: `http://localhost:5000`
   - `token`: (will be set after login)
3. Start with "Send OTP" request
4. Use "Register" or "Login" with OTP "123456"
5. Copy the returned token to the `token` variable
6. Test other endpoints

## 📝 Example Requests

### Send OTP
```json
POST /api/auth/send-otp
{
  "mobileNumber": "+911234567890"
}
```

### Register User
```json
POST /api/auth/verify-register
{
  "mobileNumber": "+911234567890",
  "otp": "123456",
  "name": "John Doe",
  "profile": {
    "birthDate": "1999-01-01",
    "gender": "male"
  }
}
```

### Add Meal
```json
POST /api/meals
Authorization: Bearer <your_jwt_token>
{
  "mealType": "breakfast",
  "foodItems": [
    {
      "name": "Oatmeal",
      "quantity": "1 bowl"
    }
  ],
  "calories": 150
}
```

## ⏰ Meal Time Validation

Meals must be logged within specific time windows:
- **Breakfast**: 6:00 AM - 11:00 AM
- **Brunch**: 10:00 AM - 2:00 PM
- **Lunch**: 11:00 AM - 3:00 PM
- **Dinner**: 5:00 PM - 11:00 PM
- **Snack**: Anytime

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **express-validator** - Input validation

## 🚀 Deployment

This app is configured for easy deployment on platforms like Render, Heroku, or Vercel.

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-secure-production-jwt-secret
PORT=10000
```

## 📄 License

ISC

## 👨‍💻 Author

Fitness Tracking POC
