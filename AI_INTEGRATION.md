# AI Diet Plan Integration

This document explains how the AI-powered diet plan generation is integrated into the Fitness Tracking application using Google's Gemini API.

## Overview

The AI integration allows users to generate personalized 7-day meal plans based on their profile data (age, gender, height, weight, activity level, dietary restrictions, and goals). The backend acts as a secure API gateway, hiding the Gemini API key from the client and handling the complex AI interactions.

## Backend Setup

### 1. Environment Variables

Add your Gemini API key to the `.env` file:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

To get a Gemini API key:
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

### 2. Install Dependencies

```bash
npm install
```

This will install the `node-fetch` package required for making HTTP requests to the Gemini API.

### 3. API Endpoints

#### Generate Diet Plan
- **Endpoint**: `POST /api/generate-plan`
- **Description**: Generates a personalized 7-day meal plan using AI
- **Request Body**:
```json
{
  "profile": {
    "age": 30,
    "gender": "male",
    "height_cm": 175,
    "weight_kg": 75,
    "activity_level": "moderate",
    "goal": "lose 0.5kg/week",
    "dietary_restrictions": "vegetarian, no nuts"
  }
}
```

- **Response**:
```json
{
  "success": true,
  "plan": {
    "summary": {
      "target_calories": 2000,
      "macro_breakdown": "P: 40%, C: 35%, F: 25%"
    },
    "meal_plan": [
      {
        "day": "Monday",
        "meals": [
          {
            "name": "Breakfast",
            "item": "Oatmeal with berries and protein powder",
            "calories": 450
          },
          {
            "name": "Lunch",
            "item": "Chicken Caesar salad (dressing on side)",
            "calories": 600
          },
          {
            "name": "Dinner",
            "item": "Lentil soup with whole-wheat bread",
            "calories": 750
          },
          {
            "name": "Snack",
            "item": "Apple and peanut butter",
            "calories": 200
          }
        ]
      }
      // ... continues for Tuesday to Sunday
    ]
  }
}
```

#### Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Checks if the AI Gateway is running
- **Response**:
```json
{
  "message": "API Gateway is running."
}
```

## Architecture

### Components

1. **fetchWithRetry Utility** (`src/utils/fetchWithRetry.js`)
   - Implements exponential backoff retry logic
   - Handles rate limiting (429 errors) from Gemini API
   - Provides resilience for API calls

2. **AI Controller** (`src/controllers/ai.controller.js`)
   - Receives user profile data from Flutter app
   - Constructs detailed prompts for Gemini AI
   - Defines JSON schema for structured output
   - Calls Gemini API with retry logic
   - Validates and returns AI-generated meal plans

3. **AI Routes** (`src/routes/ai.routes.js`)
   - Defines API endpoints for AI features
   - Can be secured with authentication middleware

### Security

- **API Key Protection**: The Gemini API key is stored server-side in environment variables
- **Rate Limiting**: Automatic retry logic handles API rate limits
- **Error Handling**: Comprehensive error handling for API failures

## Frontend Integration (Flutter)

### Sample Flutter Code

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> generateDietPlan(Map<String, dynamic> profileData) async {
  const String apiUrl = 'http://localhost:5000/api/generate-plan';
  
  final response = await http.post(
    Uri.parse(apiUrl),
    headers: {'Content-Type': 'application/json'},
    body: json.encode({'profile': profileData}),
  );
  
  if (response.statusCode == 200) {
    final Map<String, dynamic> data = json.decode(response.body);
    if (data['success'] == true) {
      return data['plan'];
    } else {
      throw Exception(data['error'] ?? 'Failed to get plan from API Gateway');
    }
  } else {
    throw Exception('Failed to connect to Node.js backend. Status: ${response.statusCode}');
  }
}
```

## Free Tier Limits

The Gemini API offers a generous free tier:

- **Cost**: Free of Charge
- **Rate Limits**: Typically a certain number of requests per minute/day
- **Model**: gemini-2.5-flash-preview-09-2025 (fast, cost-effective)
- **Perfect for**: Prototyping and early-stage development

For production apps, monitor usage and upgrade to paid tiers if needed.

## Testing

### Using cURL

```bash
curl -X POST http://localhost:5000/api/generate-plan \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "age": 30,
      "gender": "male",
      "height_cm": 175,
      "weight_kg": 75,
      "activity_level": "moderate",
      "goal": "lose 0.5kg/week",
      "dietary_restrictions": "vegetarian"
    }
  }'
```

### Using Postman

1. Import the `Fitness_App_API.postman_collection.json` file
2. Add a new request: `POST /api/generate-plan`
3. Set the request body as shown above
4. Send the request

## Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY not found"**
   - Ensure `.env` file exists and contains `GEMINI_API_KEY=your_key_here`
   - Restart the server after adding the key

2. **Rate Limit Errors (429)**
   - The retry logic will automatically handle this
   - If persistent, check your API quota at Google AI Studio

3. **"AI returned an unusable or empty response"**
   - Check your API key is valid
   - Ensure you're using a supported Gemini model
   - Verify the prompt and schema are correct

4. **"User profile data is required"**
   - Ensure your request body includes a `profile` object with all required fields

## Next Steps

1. Add authentication middleware to protect the endpoint
2. Store generated plans in MongoDB for future reference
3. Implement plan caching to reduce API calls
4. Add user feedback collection for plan quality
5. Create Flutter UI to display the meal plans beautifully
