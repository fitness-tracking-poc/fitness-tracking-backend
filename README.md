# Fitness App Backend

A comprehensive REST API backend for a fitness tracking application built with Node.js, Express, and MongoDB.

## 📋 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Profile Management**: User profiles with BMR and calorie calculations
- **Meal Tracking**: Log meals with nutritional information and daily summaries
- **Exercise Tracking**: Track workouts with statistics and progress
- **Habit Tracking**: Daily habits with streak tracking
- **Progress Tracking**: Weight and body measurements over time
- **Workout Plans**: Predefined workout plans with progress tracking

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Copy .env file and update with your values
cp .env .env.local
```

Update `.env` with your configuration:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `PORT`: Server port (default: 5000)

3. Seed the database (optional):
```bash
node src/utils/seedDatabase.js
```

4. Start the server:
```bash
# Development mode with auto-reload
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
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user |

### User Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/profile` | Get user profile |
| PUT | `/user/profile` | Update profile |
| GET | `/user/calories/required` | Get calorie requirements |

### Meal Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/meals` | Add meal |
| GET | `/meals/today` | Get today's meals |
| GET | `/meals/week` | Get weekly summary |
| DELETE | `/meals/:id` | Delete meal |
| GET | `/meals/foods` | Get food database |
| POST | `/meals/foods` | Add custom food |

### Exercise Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/exercises` | Add exercise |
| GET | `/exercises/today` | Get today's exercises |
| GET | `/exercises/week` | Get weekly summary |
| GET | `/exercises/stats` | Get statistics |
| DELETE | `/exercises/:id` | Delete exercise |

### Habit Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/habits` | Create habit |
| GET | `/habits` | Get all habits |
| GET | `/habits/today` | Get today's habits |
| PATCH | `/habits/:id/complete` | Mark habit complete |
| GET | `/habits/:id/history` | Get habit history |

### Progress Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/progress/weight` | Add weight entry |
| GET | `/progress/weight/history` | Get weight history |
| POST | `/progress/measurements` | Add measurements |
| GET | `/progress/measurements/history` | Get measurement history |
| GET | `/progress/summary` | Get progress summary |

### Workout Plan Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/plans` | Get all plans |
| GET | `/plans/:id` | Get plan details |
| POST | `/plans/assign` | Assign plan to user |
| GET | `/plans/user` | Get user's active plan |
| POST | `/plans/complete-workout` | Mark workout complete |

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── controllers/
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── user.controller.js   # User profile logic
│   │   ├── meal.controller.js   # Meal tracking logic
│   │   ├── exercise.controller.js
│   │   ├── habit.controller.js
│   │   ├── progress.controller.js
│   │   └── plan.controller.js
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Profile.js
│   │   ├── Food.js
│   │   ├── Meal.js
│   │   ├── Exercise.js
│   │   ├── Habit.js
│   │   ├── HabitLog.js
│   │   ├── ProgressWeight.js
│   │   ├── ProgressMeasurements.js
│   │   ├── WorkoutPlan.js
│   │   └── AssignedPlan.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── meal.routes.js
│   │   ├── exercise.routes.js
│   │   ├── habit.routes.js
│   │   ├── progress.routes.js
│   │   └── plan.routes.js
│   ├── utils/
│   │   ├── asyncHandler.js      # Async error wrapper
│   │   ├── calculations.js      # BMR & calorie calculations
│   │   ├── ErrorResponse.js     # Custom error class
│   │   └── seedDatabase.js      # Database seeding
│   └── server.js                # App entry point
├── .env                         # Environment variables
├── .gitignore
└── package.json
```

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🧪 Testing with Postman

1. Import the API endpoints into Postman
2. Register a new user via `/api/auth/register`
3. Copy the returned JWT token
4. Set the token in Postman's Authorization tab (Bearer Token)
5. Test other endpoints

## 📝 Example Requests

### Register User
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 25,
  "gender": "male",
  "height": 175,
  "weight": 75,
  "fitnessGoal": "lose_weight",
  "activityLevel": "moderate"
}
```

### Add Meal
```json
POST /api/meals
{
  "mealType": "breakfast",
  "foods": [
    {
      "foodId": "food_id_here",
      "quantity": 1
    }
  ]
}
```

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 📄 License

ISC

## 👨‍💻 Author

Fitness App Backend Team
