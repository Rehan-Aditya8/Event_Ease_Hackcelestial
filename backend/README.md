# Event Ease Backend

This is the backend server for the Event Ease application, providing API endpoints for authentication, event management, and QR code functionality.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Firebase Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Authentication (Email/Password)
   - Create a Firestore database

2. **Generate Service Account Key**:
   - In Firebase Console, go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `serviceAccountKey.json` in the backend folder

3. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`
   - Update the Firebase configuration values

### 3. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-token` - Verify Firebase JWT token

### Event Management

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event
- `POST /api/events/:id/attendees` - Manage event attendees
- `GET /api/events/:id/qr` - Generate QR code for an event

### QR Code System

- `POST /api/qr/generate` - Generate a secure QR code
- `POST /api/qr/validate` - Validate QR code for event entry

## Frontend Integration

To integrate the frontend with this backend, you'll need to update the following files:

1. **js/firebase.js**: Update to use the backend API for authentication
2. **js/login.js and js/signup.js**: Modify to communicate with backend endpoints
3. **js/functions.js**: Update event management functions to use backend APIs

## Security Notes

- Never commit your `serviceAccountKey.json` or `.env` file to version control
- Use HTTPS in production
- Implement rate limiting for production use