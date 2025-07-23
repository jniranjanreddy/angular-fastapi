# Angular FastAPI Integration

This project integrates an Angular frontend with a FastAPI backend for processing patient data through different levels of processors.

## Features

- **L1 Processor**: Processes patient IDs through Level 1 processing
- **L3 Processor**: Processes patient IDs through Level 3 processing  
- **Cleanup Processor**: Handles cleanup operations for patient data
- **Real-time Response Display**: Shows processing results with success/error status
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Comprehensive error handling and user feedback

## Backend Integration

The frontend is integrated with the following FastAPI endpoints:

- `GET /level1/level1` - L1 Processor endpoint
- `GET /level3/level3` - L3 Processor endpoint  
- `GET /cleanup/cleanup` - Cleanup Processor endpoint

All endpoints accept a `patient_ids_request` query parameter.

## Project Structure

```
src/app/
├── services/
│   ├── api.service.ts              # Main API service with processor integrations
│   ├── l1-processor.service.ts     # L1 processor service
│   ├── l3-processor.service.ts     # L3 processor service
│   └── cleanup-processor.service.ts # Cleanup processor service
└── log-reader/
    ├── log-reader.component.ts     # Main component with processor logic
    ├── log-reader.component.html   # UI template
    └── log-reader.component.css    # Styling
```

## Setup Instructions

1. **Start the FastAPI Backend**:
   ```bash
   cd fastapi-app
   pip install -r requirements.txt
   python main.py
   ```
   The backend will run on `http://localhost:8001`

2. **Start the Angular Frontend**:
   ```bash
   cd trigger-processors
   npm install
   ng serve
   ```
   The frontend will run on `http://localhost:4200`

## Usage

1. Open the application in your browser at `http://localhost:4200`
2. Navigate between the three processor tabs:
   - **L1 Processor**: For Level 1 processing
   - **L3 Processor**: For Level 3 processing
   - **Cleanup**: For cleanup operations
3. Enter a Patient ID in the input field
4. Click "Submit" to process the request
5. View the response with status indicators and detailed information

## API Response Format

All processors return responses in the following format:

```json
{
  "level": number|string,
  "status": number,  // 1 for success, 0 for failure
  "message": string,
  "result": string
}
```

## Error Handling

The application handles various error scenarios:
- Network connectivity issues
- Invalid patient ID input
- Backend service errors
- CORS issues

All errors are displayed to the user with clear messaging.

## Development

### Adding New Processors

1. Create a new service file in `src/app/services/`
2. Define the response interface
3. Implement the processing method
4. Add the service to the main `ApiService`
5. Update the component to use the new processor

### Environment Configuration

The API URL is configured in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8001'
};
```

## Technologies Used

- **Frontend**: Angular 17, TypeScript, CSS3
- **Backend**: FastAPI, Python
- **HTTP Client**: Angular HttpClient
- **Styling**: Custom CSS with responsive design
