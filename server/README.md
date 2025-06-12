# Moodle Exam Simulator - Server

Backend server for the Moodle Exam Simulator platform with document upload functionality.

## Features

- User authentication (register, login, token verification)
- Resource management with file uploads
- Challenge tracking and progress saving
- Leaderboard functionality
- Code execution simulation

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables (optional):
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/moodle_exam_simulator
     JWT_SECRET=your_jwt_secret
     ```

3. Start the server:
   - For development:
     ```
     npm run dev
     ```
   - For production:
     ```
     npm start
     ```

## API Endpoints

### Authentication

- **POST /login**
  - Login with username and password
  - Returns JWT token and user info

- **POST /register**
  - Register new user
  - Required fields: username, email, password
  - Returns JWT token and user info

- **GET /logout**
  - Logout user (client-side token removal)

- **GET /user/verify**
  - Verify JWT token
  - Requires authentication

- **POST /user/refresh-token**
  - Refresh JWT token
  - Requires authentication

- **GET /user/profile**
  - Get user profile information
  - Requires authentication

### Resources

- **GET /resources**
  - Get all resources

- **POST /resources/upload**
  - Upload a new resource
  - Requires authentication
  - Form data:
    - file: The file to upload (for non-link resources)
    - title: Resource title
    - description: Resource description
    - category: Resource category
    - type: Resource type (pdf, code, image, link, video)
    - author: Resource author (optional)

- **GET /resources/user/favorites**
  - Get user's favorite resources
  - Requires authentication

- **POST /resources/user/favorites/toggle**
  - Toggle resource favorite status
  - Requires authentication
  - Body: { resource_id: "id" }

### Challenges

- **GET /challenges**
  - Get all challenges
  - Requires authentication

- **POST /challenges/progress**
  - Save challenge progress
  - Requires authentication
  - Body: { challenge_id, code, language, passed }

### Code Execution

- **POST /run-code**
  - Run code submission
  - Requires authentication
  - Body: { code, language, expectedOutput, additionalParams }

### Leaderboard

- **GET /leaderboard**
  - Get top 10 users by points

## File Upload Details

The server supports uploading various file types:

- **Documents**: PDF, DOC, DOCX, TXT, MD
- **Images**: JPG, JPEG, PNG, GIF, SVG
- **Code Files**: PY, JS, HTML, CSS, JAVA, C, CPP, CS, PHP, RB, GO, TS, SQL, JSON, XML

Files are stored in the `uploads/resources` directory with unique filenames. Maximum file size is 10MB.

## Directory Structure

```
server/
├── middleware/
│   └── auth.js           # Authentication middleware
├── routes/
│   └── resources.js      # Resource routes
├── uploads/
│   └── resources/        # Uploaded files
├── package.json
├── server.js             # Main server file
└── README.md
```

## Error Handling

All API endpoints return responses in the following format:

```json
{
  "success": true|false,
  "message": "Success or error message",
  "data": {}  // Optional data object
}
```

HTTP status codes are used appropriately:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error
