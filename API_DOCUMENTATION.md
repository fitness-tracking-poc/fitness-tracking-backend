# Fitness App API Documentation

This document outlines the APIs implemented in the simplified Postman collection for the Fitness App backend. It focuses on basic data recording: mobile/OTP authentication, profile management, meal logging, and exercise logging. No calculations or advanced features are included.

**Base URL:** `http://localhost:5000` (development) | `https://fitness-tracking-backend-0dvp.onrender.com` (production)  
**Authentication:** Bearer token (JWT) required for most endpoints.  
**Content-Type:** `application/json` for all requests.

---

## Authentication

### 1. Send OTP
- **Endpoint:** `POST /api/auth/send-otp`
- **Description:** Sends OTP to the provided mobile number for registration or login.
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "mobileNumber": "string"  // Required. Valid mobile number with country code (e.g., "+911234567890")
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "data": {
      "mobileNumber": "string",
      "expiresIn": "10 minutes"
    }
  }
  ```
- **Notes:** In development, OTP is always "123456". Check backend console for logs.

    "message": "User registered successfully",
    "data": {
      "user": { ... },  // User object
      "token": "string" // JWT token for authentication
    }
  }
  ```
- **Notes:** Collects basic profile details at registration. Only name, gender, and birth date are required.

### 3. Login (Verify OTP)
- **Endpoint:** `POST /api/auth/verify-login`
- **Description:** Verifies OTP for existing user login.
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "mobileNumber": "string",  // Required. Registered mobile number
    "otp": "string"            // Required. 6-digit OTP
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": { ... },  // User object
      "token": "string" // JWT token for authentication
    }
  }
  ```
- **Notes:** User must be registered. Send OTP before login.

### 4. Get Current User
- **Endpoint:** `GET /api/auth/me`
- **Description:** Retrieves details of the currently authenticated user.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": { ... }  // User object with profile populated
  }
  ```

---

## User Profile

### 1. Get Profile
- **Endpoint:** `GET /api/user/profile`
- **Description:** Retrieves the user's profile details.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": { ... }  // Profile object
  }
  ```

### 2. Update Profile
- **Endpoint:** `PUT /api/user/profile`
- **Description:** Updates the user's profile details.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body:** (Partial updates allowed)
  ```json
  {
    "age": "number",           // Optional
    "gender": "string",        // Optional
    "height": "number",        // Optional
    "weight": "number",        // Optional
    "fitnessGoal": "string",   // Optional
    "activityLevel": "string", // Optional
    "dietaryPreferences": ["string"], // Optional. Array of preferences
    "waterGoal": "number",     // Optional
    "stepsGoal": "number",     // Optional
    "sleepGoal": "number"      // Optional
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": { ... }  // Updated profile object
  }
  ```

---

## Meals

### 1. Add Meal
- **Endpoint:** `POST /api/meals`
- **Description:** Records a new meal entry. Meal types have time restrictions: Breakfast (6-11 AM), Brunch (10 AM-2 PM), Lunch (11 AM-3 PM), Dinner (5-11 PM), Snack (anytime).
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "mealType": "string",      // Required. "breakfast", "brunch", "lunch", "dinner", or "snack"
    "foodItems": [             // Required. Array of food items
      {
        "name": "string",      // Required. Food name
        "quantity": "string"   // Optional. e.g., "1 bowl"
      }
    ],
    "calories": "number",      // Optional. Manual calorie entry
    "notes": "string",         // Optional. Max 500 characters
    "date": "string"           // Optional. Date string; defaults to now
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Meal added successfully",
    "data": { ... }  // Meal object
  }
  ```

### 2. Get Meals
- **Endpoint:** `GET /api/meals`
- **Description:** Retrieves all meals for the user, optionally filtered by date range.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Query Parameters:** (Optional)
  - `startDate`: Date string (YYYY-MM-DD)
  - `endDate`: Date string (YYYY-MM-DD)
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "count": "number",
    "data": [ ... ]  // Array of meal objects
  }
  ```

### 3. Get Today's Meals
- **Endpoint:** `GET /api/meals/today`
- **Description:** Retrieves meals logged today for the user.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "count": "number",
    "data": [ ... ]  // Array of today's meal objects
  }
  ```

### 4. Update Meal
- **Endpoint:** `PUT /api/meals/:id`
- **Description:** Updates an existing meal entry.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **URL Parameters:**
  - `id`: Meal ID (string)
- **Request Body:** (Partial updates allowed)
  ```json
  {
    "mealType": "string",      // Optional
    "foodItems": [             // Optional
      {
        "name": "string",
        "quantity": "string"
      }
    ],
    "calories": "number",      // Optional
    "notes": "string",         // Optional
    "date": "string"           // Optional
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Meal updated successfully",
    "data": { ... }  // Updated meal object
  }
  ```

### 5. Delete Meal
- **Endpoint:** `DELETE /api/meals/:id`
- **Description:** Deletes a meal entry.
- **Headers:**
  - `Authorization: Bearer <token>`
- **URL Parameters:**
  - `id`: Meal ID (string)
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Meal deleted successfully"
  }
  ```

---

## Exercises

### 1. Add Exercise
- **Endpoint:** `POST /api/exercises`
- **Description:** Records a new exercise entry.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "exerciseName": "string",  // Required. Name of exercise
    "duration": "number",      // Optional. Duration in minutes
    "sets": "number",          // Optional. Number of sets
    "reps": "number",          // Optional. Reps per set
    "weight": "number",        // Optional. Weight in kg
    "distance": "number",      // Optional. Distance in km
    "notes": "string",         // Optional. Max 500 characters
    "date": "string"           // Optional. Date string; defaults to now
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Exercise added successfully",
    "data": { ... }  // Exercise object
  }
  ```

### 2. Get Exercises
- **Endpoint:** `GET /api/exercises`
- **Description:** Retrieves all exercises for the user, optionally filtered by date range.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Query Parameters:** (Optional)
  - `startDate`: Date string (YYYY-MM-DD)
  - `endDate`: Date string (YYYY-MM-DD)
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "count": "number",
    "data": [ ... ]  // Array of exercise objects
  }
  ```

### 3. Get Today's Exercises
- **Endpoint:** `GET /api/exercises/today`
- **Description:** Retrieves exercises logged today for the user.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "count": "number",
    "data": [ ... ]  // Array of today's exercise objects
  }
  ```

### 4. Update Exercise
- **Endpoint:** `PUT /api/exercises/:id`
- **Description:** Updates an existing exercise entry.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **URL Parameters:**
  - `id`: Exercise ID (string)
- **Request Body:** (Partial updates allowed)
  ```json
  {
    "exerciseName": "string",  // Optional
    "duration": "number",      // Optional
    "sets": "number",          // Optional
    "reps": "number",          // Optional
    "weight": "number",        // Optional
    "distance": "number",      // Optional
    "notes": "string",         // Optional
    "date": "string"           // Optional
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Exercise updated successfully",
    "data": { ... }  // Updated exercise object
  }
  ```

### 5. Delete Exercise
- **Endpoint:** `DELETE /api/exercises/:id`
- **Description:** Deletes an exercise entry.
- **Headers:**
  - `Authorization: Bearer <token>`
- **URL Parameters:**
  - `id`: Exercise ID (string)
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Exercise deleted successfully"
  }
  ```

---

## Error Handling
- All endpoints return errors in this format:
  ```json
  {
    "success": false,
    "error": "Error message"
  }
  ```
- Common errors: 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error).

## Notes
- All dates are in ISO format (YYYY-MM-DDTHH:mm:ssZ).
- Authentication is required for all endpoints except Send OTP, Register, and Login.
- No calculations are performed; data is recorded as-is.
- In development, OTP is mocked as "123456".

---

## Health Metrics

The Health Metrics API provides a generic system for tracking various health measurements. Each metric type has a specific value structure.

### Supported Metric Types and Value Structures

- **blood_pressure**: `{ systolic: number, diastolic: number }`
- **heart_rate**: `{ bpm: number }`
- **weight**: `{ kg: number }`
- **blood_sugar**: `{ mg_dL: number }`
- **steps**: `{ count: number }`
- **sleep_hours**: `{ hours: number }`
- **water_intake**: `{ liters: number }`
- **body_fat_percentage**: `{ percentage: number }`
- **muscle_mass**: `{ kg: number }`
- **bmi**: `{ value: number }`

### 1. Add Health Metric
- **Endpoint:** `POST /api/health-metrics`
- **Description:** Records a new health metric measurement.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "metric_type": "string",    // Required. See supported types above
    "value": {                  // Required. Object structure varies by metric_type
      "systolic": 120,          // Example for blood_pressure
      "diastolic": 80
    },
    "measured_at": "string"     // Optional. ISO date string; defaults to now
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
  }
  ```

### 3. Update Health Metric
- **Endpoint:** `PUT /api/health-metrics/:id`
- **Description:** Updates an existing health metric.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **URL Parameters:**
  - `id`: Health metric ID (string)
- **Request Body:** (Partial updates allowed)
  ```json
  {
    "metric_type": "string",    // Optional
    "value": { ... },           // Optional
    "measured_at": "string"     // Optional
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Health metric updated successfully",
    "data": { ... }  // Updated HealthMetric object
  }
  ```

### 4. Delete Health Metric
- **Endpoint:** `DELETE /api/health-metrics/:id`
- **Description:** Deletes a health metric measurement.
- **Headers:**
  - `Authorization: Bearer <token>`
- **URL Parameters:**
  - `id`: Health metric ID (string)
- **Request Body:** None
- **Response (Success):**
  ```json
  {
        "start": "2025-11-20T00:00:00.000Z",
        "end": "2025-11-27T12:34:56.789Z",
        "range": "weekly"
      },
      "summary": {
        "count": 7,
        "systolic": {           // For blood_pressure
          "average": 118,
          "highest": 125,
          "lowest": 110
        },
        "diastolic": {
          "average": 78,
          "highest": 85,
          "lowest": 70
        },
        "dataPoints": [ ... ]  // All measurements in the period
  - `Authorization: Bearer <token>`
- **Query Parameters:** (Optional)
  - `date`: Date string (YYYY-MM-DD); defaults to today
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": {
      "date": "2025-11-27",
      "meals": {
        "count": 3,
        "totalCalories": 1200,
        "breakdown": {
          "breakfast": 400,
          "lunch": 500,
          "dinner": 300
        }
      },
      "exercises": {
        "count": 2,
        "totalDuration": 60,
        "estimatedCaloriesBurned": 300,
        "activities": [
          {
            "name": "Running",
            "duration": 30,
            "sets": null,
            "reps": null,
            "weight": null,
            "distance": 5
          }
        ]
      },
      "netCalories": 900,
      "goals": {
        "fitnessGoal": "lose_weight",
        "waterGoal": 8,
        "stepsGoal": 10000,
        "sleepGoal": 8
      }
    }
  }
  ```

---

## Health Analysis

The Health Analysis API provides detailed analysis and risk assessment for various health metrics, including blood pressure, blood sugar, BMI, heart rate, and body fat percentage.

### 1. Get Comprehensive Health Analysis
- **Endpoint:** `GET /api/health-analysis`
- **Description:** Retrieves a comprehensive health analysis summary for all tracked metrics.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Query Parameters:** (Optional)
  - `days`: Number of days to analyze (default: 30)
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": {
      "analyzedAt": "2025-12-01T00:00:00.000Z",
      "period": {
        "days": 30,
        "start": "2025-11-01",
        "end": "2025-12-01"
      },
      "metrics": {
        "bloodPressure": {
          "latest": { "systolic": 120, "diastolic": 80 },
          "measuredAt": "2025-11-30T10:00:00.000Z",
          "category": "Normal",
          "status": "normal",
          "interpretation": "Your blood pressure is in the normal range.",
          "recommendations": ["Maintain healthy habits"]
        },
        "bloodSugar": { ... },
        "bmi": { ... },
        "heartRate": { ... },
        "bodyFat": { ... }
      },
      "overallStatus": "normal",
      "summary": "All monitored metrics are in healthy ranges. Keep up the good work!"
    }
  }
  ```

### 2. Get Blood Pressure Analysis
- **Endpoint:** `GET /api/health-analysis/blood-pressure`
- **Description:** Retrieves detailed blood pressure analysis and trend information.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Query Parameters:** (Optional)
  - `days`: Number of days to analyze (default: 30)
  - `includeHistory`: Include historical data (true/false, default: false)
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": {
      "latestReading": {
        "systolic": 120,
        "diastolic": 80,
        "measuredAt": "2025-11-30T10:00:00.000Z"
      },
      "category": "Normal",
      "status": "normal",
      "interpretation": "Your blood pressure is in the normal range.",
      "recommendations": ["Maintain healthy habits"],
      "trend": {
        "readings": 10,
        "systolic": { "average": 118, "highest": 125, "lowest": 110 },
        "diastolic": { "average": 78, "highest": 85, "lowest": 70 },
        "history": [ ... ]
      }
    }
  }
  ```

### 3. Get Diabetes Risk Assessment
- **Endpoint:** `GET /api/health-analysis/diabetes-risk`
- **Description:** Retrieves diabetes risk assessment based on blood sugar readings.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Query Parameters:** (Optional)
  - `days`: Number of days to analyze (default: 30)
  - `includeHistory`: Include historical data (true/false, default: false)
  - `type`: Blood sugar type ('fasting' or 'random', default: 'fasting')
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": {
      "latestReading": {
        "value": 95,
        "measuredAt": "2025-11-30T08:00:00.000Z",
        "type": "fasting"
      },
      "category": "Normal",
      "riskLevel": "Low",
      "status": "normal",
      "interpretation": "Your fasting blood glucose level is in the normal range.",
      "recommendations": ["Maintain balanced diet"],
      "trend": {
        "average": 92,
        "readings": 15,
        "direction": "stable",
        "history": [ ... ]
      }
    }
  }
  ```

### 4. Get BMI Analysis
- **Endpoint:** `GET /api/health-analysis/bmi`
- **Description:** Retrieves BMI analysis and weight trend information.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Query Parameters:** (Optional)
  - `days`: Number of days to analyze (default: 30)
  - `includeHistory`: Include historical data (true/false, default: false)
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": {
      "latestReading": {
        "value": 22.5,
        "measuredAt": "2025-11-30T10:00:00.000Z"
      },
      "category": "Normal Weight",
      "status": "normal",
      "interpretation": "Your BMI is in the healthy range.",
      "recommendations": ["Continue balanced eating"],
      "weightTrend": {
        "average": 70.5,
        "readings": 8,
        "direction": "stable",
        "change": 0,
        "history": [ ... ]
      }
    }
  }
  ```

### 5. Get Heart Rate Analysis
- **Endpoint:** `GET /api/health-analysis/heart-rate`
- **Description:** Retrieves heart rate analysis and trend information.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Query Parameters:** (Optional)
  - `days`: Number of days to analyze (default: 30)
  - `includeHistory`: Include historical data (true/false, default: false)
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": {
      "latestReading": {
        "bpm": 72,
        "measuredAt": "2025-11-30T10:00:00.000Z"
      },
      "category": "Good",
      "status": "normal",
      "interpretation": "Your resting heart rate is good.",
      "recommendations": ["Continue regular exercise"],
      "trend": {
        "average": 70,
        "readings": 12,
        "highest": 85,
        "lowest": 60,
        "history": [ ... ]
      }
    }
  }
  ```

---

## Goals

The Goals API provides a comprehensive system for setting, tracking, and managing fitness goals with milestones and progress monitoring.

### 1. Create Goal
- **Endpoint:** `POST /api/goals`
- **Description:** Creates a new fitness goal with target values and optional milestones.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "goalType": "string",         // Required. See goal types below
    "title": "string",            // Required. Max 100 characters
    "description": "string",      // Optional. Max 500 characters
    "targetValue": "number",      // Required. Target to achieve
    "currentValue": "number",     // Optional. Starting value (default: 0)
    "startValue": "number",       // Optional. Baseline value (default: 0)
    "unit": "string",             // Required. "kg", "lbs", "km", "miles", etc.
    "customUnit": "string",       // Optional. If unit is "custom"
    "targetDate": "string",       // Required. ISO date format
    "category": "string",         // Optional. "fitness", "nutrition", "health", "lifestyle"
    "priority": "string",         // Optional. "low", "medium", "high"
    "reminderEnabled": "boolean", // Optional. Default: true
    "reminderTime": "string",     // Optional. Format "HH:MM"
    "reminderDays": ["string"],   // Optional. Array of days
    "milestones": [               // Optional. Array of milestones
      {
        "title": "string",
        "targetValue": "number"
      }
    ]
  }
  ```
- **Goal Types:**
  - `weight_loss`, `weight_gain`, `muscle_gain`, `body_fat_reduction`
  - `distance_running`, `exercise_duration`, `exercise_frequency`
  - `steps_daily`, `water_intake`, `sleep_hours`, `calorie_intake`
  - `strength_milestone`, `custom`
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Goal created successfully",
    "data": { ... }  // Goal object
  }
  ```

### 2. Get All Goals
- **Endpoint:** `GET /api/goals`
- **Description:** Retrieves all goals for the authenticated user with optional filtering.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Query Parameters:** (Optional)
  - `status`: Filter by status ("active", "completed", "paused", "abandoned")
  - `goalType`: Filter by goal type
  - `category`: Filter by category
  - `priority`: Filter by priority
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "count": "number",
    "stats": {
      "total": "number",
      "active": "number",
      "completed": "number",
      "paused": "number",
      "abandoned": "number"
    },
    "data": [ ... ]  // Array of goal objects
  }
  ```

### 3. Get Active Goals
- **Endpoint:** `GET /api/goals/active`
- **Description:** Retrieves only active goals for the user.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "count": "number",
    "data": [ ... ]  // Array of active goal objects
  }
  ```

### 4. Get Goals Dashboard
- **Endpoint:** `GET /api/goals/dashboard`
- **Description:** Retrieves a comprehensive dashboard with goal statistics, streaks, and upcoming milestones.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "totalGoals": "number",
        "activeGoals": "number",
        "completedGoals": "number",
        "averageProgress": "number",
        "goalsNearCompletion": "number",
        "overdueGoals": "number"
      },
      "activeGoals": [ ... ],
      "recentlyCompleted": [ ... ],
      "upcomingMilestones": [ ... ],
      "streak": {
        "currentStreak": "number",
        "longestStreak": "number",
        "totalActiveDays": "number"
      }
    }
  }
  ```

### 5. Get Single Goal
- **Endpoint:** `GET /api/goals/:id`
- **Description:** Retrieves details of a specific goal.
- **Headers:**
  - `Authorization: Bearer <token>`
- **URL Parameters:**
  - `id`: Goal ID (string)
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": { ... }  // Goal object with full details
  }
  ```

### 6. Update Goal
- **Endpoint:** `PUT /api/goals/:id`
- **Description:** Updates goal details (not progress - use separate endpoint).
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **URL Parameters:**
  - `id`: Goal ID (string)
- **Request Body:** (Partial updates allowed)
  ```json
  {
    "title": "string",
    "description": "string",
    "targetValue": "number",
    "targetDate": "string",
    "priority": "string",
    "reminderEnabled": "boolean",
    "reminderTime": "string",
    "reminderDays": ["string"]
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Goal updated successfully",
    "data": { ... }  // Updated goal object
  }
  ```

### 7. Update Goal Progress
- **Endpoint:** `PUT /api/goals/:id/progress`
- **Description:** Updates the current progress value for a goal. Automatically calculates progress percentage and checks milestones.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **URL Parameters:**
  - `id`: Goal ID (string)
- **Request Body:**
  ```json
  {
    "currentValue": "number",  // Required. New progress value
    "note": "string"           // Optional. Progress note
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Progress updated successfully",
    "data": { ... }  // Updated goal with new progress
  }
  ```

### 8. Update Goal Status
- **Endpoint:** `PUT /api/goals/:id/status`
- **Description:** Changes goal status (pause, resume, abandon).
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **URL Parameters:**
  - `id`: Goal ID (string)
- **Request Body:**
  ```json
  {
    "status": "string"  // Required. "active", "paused", or "abandoned"
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Goal paused|resumed|abandoned",
    "data": { ... }  // Updated goal
  }
  ```

### 9. Add Milestone
- **Endpoint:** `POST /api/goals/:id/milestones`
- **Description:** Adds a new milestone to an existing goal.
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **URL Parameters:**
  - `id`: Goal ID (string)
- **Request Body:**
  ```json
  {
    "title": "string",       // Required. Milestone name
    "targetValue": "number"  // Required. Value to achieve
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Milestone added successfully",
    "data": { ... }  // Updated goal with new milestone
  }
  ```

### 10. Get Progress History
- **Endpoint:** `GET /api/goals/:id/history`
- **Description:** Retrieves the complete progress history for a goal.
- **Headers:**
  - `Authorization: Bearer <token>`
- **URL Parameters:**
  - `id`: Goal ID (string)
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": {
      "goalId": "string",
      "title": "string",
      "progressHistory": [
        {
          "value": "number",
          "recordedAt": "string",
          "note": "string"
        }
      ],
      "currentProgress": "number"
    }
  }
  ```

### 11. Delete Goal
- **Endpoint:** `DELETE /api/goals/:id`
- **Description:** Deletes a goal permanently.
- **Headers:**
  - `Authorization: Bearer <token>`
- **URL Parameters:**
  - `id`: Goal ID (string)
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Goal deleted successfully"
  }
  ```

---

## Achievements & Badges

The Achievements API tracks user accomplishments, awards badges, and manages activity streaks.

### 1. Get All Achievements
- **Endpoint:** `GET /api/achievements`
- **Description:** Retrieves all earned achievements for the user.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Query Parameters:** (Optional)
  - `badgeType`: Filter by badge type
  - `tier`: Filter by tier ("bronze", "silver", "gold", "platinum", "diamond")
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "count": "number",
    "data": [ ... ]  // Array of achievement objects
  }
  ```

### 2. Get Achievement Statistics
- **Endpoint:** `GET /api/achievements/stats`
- **Description:** Retrieves statistics about earned achievements.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": {
      "total": "number",
      "byType": {
        "streak_milestone": "number",
        "goal_completion": "number",
        "exercise_milestone": "number",
        "meal_milestone": "number"
      },
      "byTier": {
        "bronze": "number",
        "silver": "number",
        "gold": "number",
        "platinum": "number",
        "diamond": "number"
      },
      "recent": [ ... ]  // Last 5 achievements
    }
  }
  ```

### 3. Get Streak Information
- **Endpoint:** `GET /api/achievements/streak`
- **Description:** Retrieves current and historical streak information.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": {
      "currentStreak": {
        "count": "number",
        "startDate": "string",
        "lastActivityDate": "string"
      },
      "longestStreak": {
        "count": "number",
        "startDate": "string",
        "endDate": "string"
      },
      "totalActiveDays": "number",
      "exerciseStreak": { ... },
      "mealLoggingStreak": { ... },
      "goalProgressStreak": { ... }
    }
  }
  ```

### 4. Update Streak
- **Endpoint:** `POST /api/achievements/streak/update`
- **Description:** Updates the user's activity streak. Call this when user logs any activity.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Streak updated successfully",
    "data": {
      "streak": { ... },
      "newBadges": [ ... ]  // Any badges earned from streak milestone
    }
  }
  ```

### 5. Check and Award Badges
- **Endpoint:** `POST /api/achievements/check`
- **Description:** Checks all badge criteria and awards any newly earned badges.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "New badges awarded!" or "No new badges",
    "data": {
      "newBadges": [ ... ],
      "count": "number"
    }
  }
  ```

### 6. Get Available Badges
- **Endpoint:** `GET /api/achievements/available`
- **Description:** Retrieves all possible badges with their earned status.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": {
      "total": "number",
      "earned": "number",
      "remaining": "number",
      "badges": [
        {
          "badgeType": "string",
          "name": "string",
          "icon": "string",
          "criteriaValue": "number",
          "tier": "string",
          "earned": "boolean"
        }
      ]
    }
  }
  ```

### 7. Delete Achievement
- **Endpoint:** `DELETE /api/achievements/:id`
- **Description:** Deletes a specific achievement (for testing or corrections).
- **Headers:**
  - `Authorization: Bearer <token>`
- **URL Parameters:**
  - `id`: Achievement ID (string)
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Achievement deleted successfully"
  }
  ```

### Badge Types
- **streak_milestone**: Consecutive days of activity (7, 14, 30, 60, 100, 180, 365 days)
- **goal_completion**: Awarded when a goal is completed
- **exercise_milestone**: Total exercises logged (10, 50, 100, 250, 500)
- **meal_milestone**: Total meals logged (50, 100, 250, 500, 1000)
- **first_achievement**: First goal completed
- **early_bird**: 7+ exercises before 8 AM
- **perfectionist**: All goals on track or ahead

---

## Summary
- **Endpoint:** `GET /api/summary/weekly`
- **Description:** Retrieves a weekly report with daily breakdowns and weekly totals.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Query Parameters:** (Optional)
  - `endDate`: Date string (YYYY-MM-DD); defaults to today (week ends on this date)
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": {
      "period": {
        "startDate": "2025-11-21",
        "endDate": "2025-11-27"
      },
      "weeklyTotals": {
        "totalCaloriesConsumed": 8400,
        "totalCaloriesBurned": 2100,
        "netCalories": 6300,
        "totalMeals": 21,
        "totalExercises": 14,
        "totalExerciseDuration": 420,
        "averageDailyCalories": 900,
        "averageDailyExercise": 60
      },
      "dailySummaries": {
        "2025-11-21": {
          "caloriesConsumed": 1200,
          "caloriesBurned": 300,
          "netCalories": 900,
          "mealsCount": 3,
          "exercisesCount": 2,
          "exerciseDuration": 60
        }
      }
    }
  }
  ```

### 3. Get Monthly Report
- **Endpoint:** `GET /api/summary/monthly`
- **Description:** Retrieves a monthly report with aggregated data.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Query Parameters:** (Optional)
  - `month`: Month number (1-12); defaults to current month
  - `year`: Year number; defaults to current year
- **Request Body:** None
- **Response (Success):**
  ```json
  {
    "success": true,
    "data": {
      "period": {
        "month": 11,
        "year": 2025,
        "daysInMonth": 30
      },
      "monthlyTotals": {
        "totalCaloriesConsumed": 36000,
        "totalCaloriesBurned": 9000,
        "netCalories": 27000,
        "totalMeals": 90,
        "totalExercises": 60,
        "totalExerciseDuration": 1800,
        "averageDailyCalories": 900,
        "averageDailyExercise": 60,
        "activeDays": 25
      }
    }
  }
  ```