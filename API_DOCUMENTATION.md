# Fitness App API Documentation

This document outlines the APIs implemented in the simplified Postman collection for the Fitness App backend. It focuses on basic data recording: mobile/OTP authentication, profile management, meal logging, and exercise logging. No calculations or advanced features are included.

**Base URL:** `http://localhost:5000`  
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

### 2. Register (Verify OTP & Create Profile)
- **Endpoint:** `POST /api/auth/verify-register`
- **Description:** Verifies OTP and registers a new user with profile details.
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "mobileNumber": "string",  // Required. Must match OTP request
    "otp": "string",           // Required. 6-digit OTP
    "name": "string",          // Required. User's full name
    "profile": {               // Required. Profile object
      "birthDate": "string",   // Required. Date string (YYYY-MM-DD)
      "gender": "string",      // Required. "male", "female", or "other"
      "age": "number",         // Optional. Age in years (13-120)
      "height": "number",      // Optional. Height in cm (min 50)
      "weight": "number",      // Optional. Weight in kg (min 20)
      "fitnessGoal": "string", // Optional. "lose_weight", "gain_muscle", or "maintain"
      "activityLevel": "string" // Optional. "sedentary", "light", "moderate", "active", or "very_active"
    }
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
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