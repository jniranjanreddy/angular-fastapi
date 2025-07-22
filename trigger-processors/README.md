# Trigger Processors - Multi-Framework App

This project consists of a FastAPI backend and an Angular frontend with integrated API services.

## Project Structure

- `fastapi-app/` - FastAPI backend server
- `trigger-processors/` - Angular frontend application

## Backend (FastAPI)

### Setup and Run

1. Navigate to the backend directory:
   ```bash
   cd fastapi-app
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the FastAPI server:
   ```bash
   python main.py
   ```

The backend will be available at `http://localhost:8001`

### API Endpoints

- **Level 0**: `GET /level0/level0?patient_ids_request={ids}` (optional parameter)
- **Level 1**: `GET /level1/level1?patient_ids_request={ids}` (required parameter)
- **Cleanup**: `GET /cleanup/cleanup?patient_ids_request={ids}` (required parameter)

## Frontend (Angular)

### Setup and Run

1. Navigate to the frontend directory:
   ```bash
   cd trigger-processors
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the Angular development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:4200`

## Features

### API Integration

The Angular application includes:

- **Environment Configuration**: Separate configs for development and production
- **API Service**: Centralized service for all backend API calls
- **Demo Component**: Interactive UI to test all three API endpoints
- **Error Handling**: Comprehensive error handling for API calls
- **TypeScript Interfaces**: Strongly typed API responses

### Components

- **ApiDemoComponent**: Demonstrates all three API endpoints with input forms and response display
- **LogReaderComponent**: Original log reader functionality

## API Service Features

- **Level 0 API**: Optional patient IDs parameter
- **Level 1 API**: Required patient IDs parameter  
- **Cleanup API**: Required patient IDs parameter
- **Connection Testing**: Built-in backend connectivity test
- **Error Handling**: User-friendly error messages
- **Response Display**: JSON formatted response display

## Development

### Backend Development

The FastAPI backend includes CORS middleware configured for `http://localhost:4200` to allow frontend communication.

### Frontend Development

The Angular app uses:
- Standalone components
- HttpClient for API communication
- Reactive forms for user input
- Modern CSS styling

## Testing the Integration

1. Start the FastAPI backend first
2. Start the Angular frontend
3. Navigate to the API Demo section
4. Test each endpoint with different patient IDs
5. Use the "Test Connection" button to verify backend connectivity

## Environment Configuration

- **Development**: `src/environments/environment.ts`
- **Production**: `src/environments/environment.prod.ts`

Update the `apiUrl` in these files to match your backend URL.
