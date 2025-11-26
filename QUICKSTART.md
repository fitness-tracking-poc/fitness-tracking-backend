# 🚀 Quick Start Guide - Fitness App Backend

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud database
# Update MONGODB_URI in .env with your Atlas connection string
```

## Step 3: Configure Environment

The `.env` file is already created. Update if needed:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fitness-app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

## Step 4: Seed Database (Optional but Recommended)

```bash
npm run seed
```

This will add:
- ✅ 20 food items (proteins, carbs, vegetables, fruits, snacks)
- ✅ 3 workout plans (Beginner, Intermediate, Advanced)

## Step 5: Start the Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
📊 Database Name: fitness-app
🚀 Server running in development mode on port 5000
📡 API available at http://localhost:5000
```

## Step 6: Test with Postman

### Option A: Import Collection

1. Open Postman
2. Import `Fitness_App_API.postman_collection.json`
3. Set environment variable `base_url` to `http://localhost:5000`

### Option B: Manual Testing

#### 1. Register a User

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "age": 25,
  "gender": "male",
  "height": 175,
  "weight": 75,
  "fitnessGoal": "lose_weight",
  "activityLevel": "moderate"
}
```

#### 2. Login

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Copy the `token` from the response!**

#### 3. Get Profile (Protected Route)

```http
GET http://localhost:5000/api/user/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 4. Add a Meal

```http
POST http://localhost:5000/api/meals
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "mealType": "breakfast",
  "foods": [
    {
      "foodName": "Oatmeal",
      "calories": 150,
      "protein": 5,
      "carbs": 27,
      "fats": 3,
      "quantity": 1
    }
  ]
}
```

#### 5. Get Today's Meals

```http
GET http://localhost:5000/api/meals/today
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🎯 What You Can Do Now

### User Management
- ✅ Register users with fitness profiles
- ✅ Login with JWT authentication
- ✅ Update profile and recalculate calories

### Meal Tracking
- ✅ Add meals with nutritional info
- ✅ View daily calorie intake
- ✅ Get weekly summaries
- ✅ Track macros (protein, carbs, fats)

### Exercise Tracking
- ✅ Log workouts
- ✅ Track calories burned
- ✅ View exercise statistics
- ✅ Weekly summaries

### Habit Tracking
- ✅ Create custom habits
- ✅ Track daily completion
- ✅ Monitor streaks
- ✅ View completion rates

### Progress Monitoring
- ✅ Log weight over time
- ✅ Track body measurements
- ✅ View progress charts data

### Workout Plans
- ✅ Browse workout plans
- ✅ Assign plans to users
- ✅ Track workout completion
- ✅ Monitor progress

## 📊 Database Collections

After seeding, you'll have:

```
fitness-app/
├── users
├── profiles
├── foods (20 items)
├── meals
├── exercises
├── habits
├── habitlogs
├── progressweights
├── progressmeasurements
├── workoutplans (3 plans)
└── assignedplans
```

## 🔍 Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Start MongoDB service

```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**: Change PORT in `.env` or kill the process using port 5000

### JWT Token Errors

```
Error: Not authorized to access this route
```

**Solution**: 
1. Make sure you're logged in
2. Copy the token from login response
3. Add to Authorization header: `Bearer YOUR_TOKEN`

## 📝 Next Steps

1. **Test All Endpoints**: Use the Postman collection
2. **Mobile App**: Connect your mobile app to this backend
3. **Deploy**: Deploy to Heroku, Railway, or AWS
4. **Enhance**: Add more features like social sharing, challenges, etc.

## 🎓 API Endpoints Summary

| Module | Count | Base URL |
|--------|-------|----------|
| Authentication | 3 | `/api/auth` |
| User Profile | 4 | `/api/user` |
| Meals | 6 | `/api/meals` |
| Exercises | 7 | `/api/exercises` |
| Habits | 7 | `/api/habits` |
| Progress | 5 | `/api/progress` |
| Workout Plans | 6 | `/api/plans` |

**Total: 38 Endpoints**

---

**🎉 Your fitness app backend is ready!**

For detailed documentation, see [README.md](README.md)
