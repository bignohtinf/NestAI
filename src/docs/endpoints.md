# NestAI Backend API Endpoints

Base URL: `http://localhost:8000` (local) or `https://xxxx-xx-xxx-xxx.ngrok.io` (production)

## Health Check

### GET /health
Check if backend is running.

**Response:**
```json
{
  "status": "ok"
}
```

---

## Authentication (Supabase)

> **Note:** Authentication is handled by Supabase. These endpoints are for reference only.

### POST /api/auth/signup
Sign up a new user (handled by Supabase Auth).

### POST /api/auth/login
Login user (handled by Supabase Auth).

---

## Users

### GET /api/users/me
Get current user profile.

**Query Parameters:**
- `user_id` (string, required) - User ID

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "mother",
  "is_active": true
}
```

---

## Partnerships

### POST /api/partnerships/request
Request a partnership with another user.

**Request Body:**
```json
{
  "partner_email": "partner@example.com",
  "partner_phone": "+84912345678"
}
```

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Response:**
```json
{
  "status": "created",
  "data": {
    "id": "uuid",
    "mother_id": "uuid",
    "father_id": "uuid",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/partnerships/pending
Get pending partnership requests.

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Response:**
```json
{
  "partnerships": [
    {
      "id": "uuid",
      "mother_id": "uuid",
      "father_id": "uuid",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/partnerships/active
Get active partnership.

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Response:**
```json
{
  "partnership": {
    "id": "uuid",
    "mother_id": "uuid",
    "father_id": "uuid",
    "status": "accepted",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/partnerships/{partnership_id}/respond
Respond to partnership request.

**Path Parameters:**
- `partnership_id` (string, required) - Partnership ID

**Query Parameters:**
- `action` (string, required) - "accept" or "reject"

**Response:**
```json
{
  "status": "updated",
  "data": {
    "id": "uuid",
    "mother_id": "uuid",
    "father_id": "uuid",
    "status": "accepted",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/partnerships/{partnership_id}
Get partnership details with user info.

**Path Parameters:**
- `partnership_id` (string, required) - Partnership ID

**Response:**
```json
{
  "partnership": {
    "id": "uuid",
    "mother_id": "uuid",
    "father_id": "uuid",
    "status": "accepted",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "mother": {
    "id": "uuid",
    "email": "mother@example.com",
    "full_name": "Jane Doe",
    "role": "mother"
  },
  "father": {
    "id": "uuid",
    "email": "father@example.com",
    "full_name": "John Doe",
    "role": "father"
  }
}
```

---

## Babies

### GET /api/babies
Get all babies for user's partnership.

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Response:**
```json
{
  "babies": [
    {
      "id": "uuid",
      "partnership_id": "uuid",
      "name": "Baby Name",
      "date_of_birth": "2024-01-01",
      "gender": "male",
      "weight_at_birth": 3.5,
      "height_at_birth": 50,
      "blood_type": "O+",
      "notes": "Some notes",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/babies
Create a new baby record.

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Request Body:**
```json
{
  "name": "Baby Name",
  "date_of_birth": "2024-01-01",
  "gender": "male",
  "weight_at_birth": 3.5,
  "height_at_birth": 50,
  "blood_type": "O+",
  "notes": "Some notes"
}
```

**Response:**
```json
{
  "status": "created",
  "data": {
    "id": "uuid",
    "partnership_id": "uuid",
    "name": "Baby Name",
    "date_of_birth": "2024-01-01",
    "gender": "male",
    "weight_at_birth": 3.5,
    "height_at_birth": 50,
    "blood_type": "O+",
    "notes": "Some notes",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/babies/{baby_id}
Get baby details.

**Path Parameters:**
- `baby_id` (string, required) - Baby ID

**Response:**
```json
{
  "baby": {
    "id": "uuid",
    "partnership_id": "uuid",
    "name": "Baby Name",
    "date_of_birth": "2024-01-01",
    "gender": "male",
    "weight_at_birth": 3.5,
    "height_at_birth": 50,
    "blood_type": "O+",
    "notes": "Some notes",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /api/babies/{baby_id}
Update baby information.

**Path Parameters:**
- `baby_id` (string, required) - Baby ID

**Request Body:**
```json
{
  "name": "Updated Name",
  "gender": "female",
  "weight_at_birth": 3.6,
  "height_at_birth": 51,
  "blood_type": "A+",
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "status": "updated",
  "data": {
    "id": "uuid",
    "partnership_id": "uuid",
    "name": "Updated Name",
    "date_of_birth": "2024-01-01",
    "gender": "female",
    "weight_at_birth": 3.6,
    "height_at_birth": 51,
    "blood_type": "A+",
    "notes": "Updated notes",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### DELETE /api/babies/{baby_id}
Delete a baby record.

**Path Parameters:**
- `baby_id` (string, required) - Baby ID

**Response:**
```json
{
  "status": "deleted"
}
```

### GET /api/babies/{baby_id}/entries
Get daily entries for a baby.

**Path Parameters:**
- `baby_id` (string, required) - Baby ID

**Query Parameters:**
- `limit` (integer, optional, default: 30) - Number of entries to return

**Response:**
```json
{
  "entries": [
    {
      "id": "uuid",
      "baby_id": "uuid",
      "recorded_by": "uuid",
      "entry_date": "2024-01-01",
      "milk_score": 8.5,
      "weight": 3.6,
      "height": 51,
      "notes": "Baby is healthy",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/babies/{baby_id}/entries
Create a daily entry for a baby.

**Path Parameters:**
- `baby_id` (string, required) - Baby ID

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Request Body:**
```json
{
  "entry_date": "2024-01-01",
  "milk_score": 8.5,
  "weight": 3.6,
  "height": 51,
  "notes": "Baby is healthy"
}
```

**Response:**
```json
{
  "status": "created",
  "data": {
    "id": "uuid",
    "baby_id": "uuid",
    "recorded_by": "uuid",
    "entry_date": "2024-01-01",
    "milk_score": 8.5,
    "weight": 3.6,
    "height": 51,
    "notes": "Baby is healthy",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/babies/{baby_id}/milestones
Get milestones for a baby.

**Path Parameters:**
- `baby_id` (string, required) - Baby ID

**Response:**
```json
{
  "milestones": [
    {
      "id": "uuid",
      "baby_id": "uuid",
      "title": "First Smile",
      "description": "Baby smiles for the first time",
      "age_weeks": 6,
      "achieved_at": null,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/babies/{baby_id}/milestones/{milestone_id}/achieve
Mark a milestone as achieved.

**Path Parameters:**
- `baby_id` (string, required) - Baby ID
- `milestone_id` (string, required) - Milestone ID

**Response:**
```json
{
  "status": "updated",
  "data": {
    "id": "uuid",
    "baby_id": "uuid",
    "title": "First Smile",
    "description": "Baby smiles for the first time",
    "age_weeks": 6,
    "achieved_at": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## Nutrition

### GET /api/nutrition/logs
Get nutrition logs for a user.

**Query Parameters:**
- `user_id` (string, required) - Current user ID
- `limit` (integer, optional, default: 30) - Number of logs to return

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "meal_name": "Breakfast",
      "calories": 500,
      "protein": 20,
      "carbs": 60,
      "fat": 15,
      "image_url": "https://example.com/image.jpg",
      "notes": "Healthy breakfast",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/nutrition/logs
Create a nutrition log entry.

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Request Body:**
```json
{
  "meal_name": "Breakfast",
  "calories": 500,
  "protein": 20,
  "carbs": 60,
  "fat": 15,
  "image_url": "https://example.com/image.jpg",
  "notes": "Healthy breakfast"
}
```

**Response:**
```json
{
  "status": "created",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "meal_name": "Breakfast",
    "calories": 500,
    "protein": 20,
    "carbs": 60,
    "fat": 15,
    "image_url": "https://example.com/image.jpg",
    "notes": "Healthy breakfast",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/nutrition/summary
Get nutrition summary for the past N days.

**Query Parameters:**
- `user_id` (string, required) - Current user ID
- `days` (integer, optional, default: 7) - Number of days to summarize

**Response:**
```json
{
  "total_calories": 3500,
  "total_protein": 140,
  "avg_calories": 500,
  "log_count": 7
}
```

---

## Health

### GET /api/health/milk-score
Get milk scores for a mother.

**Query Parameters:**
- `user_id` (string, required) - Current user ID
- `limit` (integer, optional, default: 30) - Number of scores to return

**Response:**
```json
{
  "scores": [
    {
      "id": "uuid",
      "mother_id": "uuid",
      "score": 8.5,
      "date": "2024-01-01T00:00:00Z",
      "notes": "Good milk production",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/health/milk-score
Create a milk score entry.

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Request Body:**
```json
{
  "score": 8.5,
  "notes": "Good milk production"
}
```

**Response:**
```json
{
  "status": "created",
  "data": {
    "id": "uuid",
    "mother_id": "uuid",
    "score": 8.5,
    "date": "2024-01-01T00:00:00Z",
    "notes": "Good milk production",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/health/current-score
Get the latest milk score.

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Response:**
```json
{
  "score": 8.5,
  "date": "2024-01-01T00:00:00Z"
}
```

### GET /api/health/trend
Get milk score trend for the past N days.

**Query Parameters:**
- `user_id` (string, required) - Current user ID
- `days` (integer, optional, default: 30) - Number of days to analyze

**Response:**
```json
{
  "scores": [
    {
      "id": "uuid",
      "mother_id": "uuid",
      "score": 8.5,
      "date": "2024-01-01T00:00:00Z",
      "notes": "Good milk production",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "average": 8.2,
  "count": 30
}
```

---

## Missions

### GET /api/missions
Get all missions for a user.

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Response:**
```json
{
  "missions": [
    {
      "id": "uuid",
      "partnership_id": "uuid",
      "title": "Cook 5 meals per week",
      "description": "Cook healthy meals",
      "target": 5,
      "progress": 3,
      "level": "bronze",
      "is_completed": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/missions
Create a new mission.

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Request Body:**
```json
{
  "title": "Cook 5 meals per week",
  "description": "Cook healthy meals",
  "target": 5,
  "level": "bronze"
}
```

**Response:**
```json
{
  "status": "created",
  "data": {
    "id": "uuid",
    "partnership_id": "uuid",
    "title": "Cook 5 meals per week",
    "description": "Cook healthy meals",
    "target": 5,
    "progress": 0,
    "level": "bronze",
    "is_completed": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /api/missions/{mission_id}
Update mission progress.

**Path Parameters:**
- `mission_id` (string, required) - Mission ID

**Request Body:**
```json
{
  "progress": 4,
  "is_completed": false
}
```

**Response:**
```json
{
  "status": "updated",
  "data": {
    "id": "uuid",
    "partnership_id": "uuid",
    "title": "Cook 5 meals per week",
    "description": "Cook healthy meals",
    "target": 5,
    "progress": 4,
    "level": "bronze",
    "is_completed": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/missions/stats
Get mission statistics.

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Response:**
```json
{
  "total": 5,
  "completed": 2,
  "in_progress": 3
}
```

---

## Budget & Expenses

### GET /api/admin/budget
Get current budget for a user.

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Response:**
```json
{
  "budget": {
    "id": "uuid",
    "partnership_id": "uuid",
    "weekly_limit": 1000,
    "spent": 650,
    "week_start": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "expenses": [
    {
      "id": "uuid",
      "budget_id": "uuid",
      "amount": 150,
      "category": "groceries",
      "description": "Weekly groceries",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "remaining": 350
}
```

### POST /api/admin/budget
Create a new budget.

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Request Body:**
```json
{
  "weekly_limit": 1000
}
```

**Response:**
```json
{
  "status": "created",
  "data": {
    "id": "uuid",
    "partnership_id": "uuid",
    "weekly_limit": 1000,
    "spent": 0,
    "week_start": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/admin/expense
Add an expense to the current budget.

**Query Parameters:**
- `user_id` (string, required) - Current user ID

**Request Body:**
```json
{
  "amount": 150,
  "category": "groceries",
  "description": "Weekly groceries"
}
```

**Response:**
```json
{
  "status": "created",
  "data": {
    "id": "uuid",
    "budget_id": "uuid",
    "amount": 150,
    "category": "groceries",
    "description": "Weekly groceries",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/admin/expenses
Get recent expenses.

**Query Parameters:**
- `user_id` (string, required) - Current user ID
- `limit` (integer, optional, default: 30) - Number of expenses to return

**Response:**
```json
{
  "expenses": [
    {
      "id": "uuid",
      "budget_id": "uuid",
      "amount": 150,
      "category": "groceries",
      "description": "Weekly groceries",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "detail": "Error message"
}
```

Common HTTP status codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
