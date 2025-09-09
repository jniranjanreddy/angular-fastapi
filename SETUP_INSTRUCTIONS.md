# TPR Authentication System Setup Instructions

## Overview
This implementation includes a complete authentication system with MongoDB integration, environment-based access control, and a modern Angular frontend.

## Backend Setup (FastAPI)

### 1. Install Dependencies
```bash
cd fastapi-app
pip install -r requirements.txt
```

### 2. MongoDB Setup
Ensure MongoDB is running and create the required database and collection:

```javascript
// In MongoDB shell or MongoDB Compass
use app_db;

// Insert user documents
db.trigger_tpr.insertMany([
  {
    "region": "US",
    "user": "niranjan",
    "password": "niranjan@12345"
  },
  {
    "region": "IND", 
    "user": "susheel",
    "password": "susheel@12345"
  }
]);
```

### 3. Start FastAPI Server
```bash
cd fastapi-app
python main.py
```

The server will run on `http://localhost:8001`

## Frontend Setup (Angular)

### 1. Install Dependencies
```bash
cd trigger-processors
npm install
```

### 2. Start Angular Development Server
```bash
ng serve
```

The application will run on `http://localhost:4200`

## Usage

### Login Credentials
- **US Region User**: 
  - Username: `niranjan`
  - Password: `niranjan@12345`
  - Available Environments: `stage`, `sup`, `prod`

- **IND Region User**:
  - Username: `susheel` 
  - Password: `susheel@12345`
  - Available Environments: `dev`, `qa`, `qaperf`

### Features Implemented

#### Backend APIs
1. **POST /auth/login**
   - Authenticates user with MongoDB
   - Captures login time
   - Returns JWT token and user info

2. **GET /auth/environments**
   - Returns all environments from db.json
   - Includes region mapping

3. **GET /auth/user-environments**
   - Returns filtered environments based on user's region
   - Requires authentication

4. **GET /auth/verify**
   - Verifies JWT token validity

#### Frontend Components
1. **Login Page**
   - Modern, responsive design
   - Form validation
   - Error handling
   - Demo credentials display

2. **Dashboard**
   - Main application layout
   - User info display
   - Environment selection
   - Integrated processors

3. **Sidebar**
   - Environment selection with icons
   - Region-based filtering
   - Collapsible design
   - User profile section
   - Logout functionality

4. **Authentication Service**
   - JWT token management
   - Auto-login persistence
   - Route protection
   - Environment state management

### Environment Filtering Logic
- **IND Region**: Access to `dev`, `qa`, `qaperf` environments
- **US Region**: Access to `stage`, `sup`, `prod` environments

### Security Features
- JWT token authentication
- Route guards
- Automatic token expiry handling
- Secure logout functionality

## File Structure

```
fastapi-app/
├── routers/
│   └── auth.py              # Authentication endpoints
├── main.py                  # Updated with auth router
├── requirements.txt         # Updated dependencies
└── db.json                  # Environment configurations

trigger-processors/src/app/
├── services/
│   └── auth.service.ts      # Authentication service
├── guards/
│   └── auth.guard.ts        # Route protection
├── login/                   # Login component
├── dashboard/               # Main dashboard
├── sidebar/                 # Environment sidebar
└── app.routes.ts            # Updated routing
```

## Testing the Application

1. Start both backend and frontend servers
2. Navigate to `http://localhost:4200`
3. Use the provided credentials to login
4. Verify environment filtering based on user region
5. Test environment selection functionality
6. Verify logout and re-login flow

## Troubleshooting

### Common Issues
1. **MongoDB Connection**: Ensure MongoDB is running on default port (27017)
2. **CORS Issues**: Backend is configured to allow localhost:4200
3. **Port Conflicts**: Backend uses 8001, frontend uses 4200
4. **JWT Errors**: Check if SECRET_KEY is set in auth.py

### Database Verification
You can verify the login time capture by checking the MongoDB collection after login:
```javascript
db.trigger_tpr.find({}, {user: 1, loginTime: 1});
```
