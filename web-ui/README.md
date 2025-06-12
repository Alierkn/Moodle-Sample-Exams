# Moodle Exam Simulator

A comprehensive web application for exam preparation with coding challenges, resources, and progress tracking.

## Features

- **User Authentication**: Secure login and registration system
- **Coding Challenges**: Multi-language code execution with test cases
- **Progress Tracking**: Track completed challenges and points earned
- **Resource Library**: Categorized learning materials with favorites
- **Leaderboard**: Competitive rankings based on challenge completion

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS
- **Backend**: Node.js API (separate repository)
- **Authentication**: JWT token-based authentication
- **Code Execution**: Sandboxed environment for multiple languages

## Project Structure

```
web-ui/
├── public/             # Static files
├── src/
│   ├── components/     # React components
│   │   ├── auth/       # Authentication components
│   │   ├── challenges/ # Challenge listing and filtering
│   │   ├── dashboard/  # User statistics and overview
│   │   ├── editor/     # Code editor and execution
│   │   ├── leaderboard/# User rankings
│   │   └── resources/  # Learning materials
│   ├── services/       # API and utility services
│   ├── App.js          # Main application component
│   └── index.js        # Application entry point
└── package.json        # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API server running

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/moodle-exam-simulator.git
cd moodle-exam-simulator/web-ui
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your API URL
```

4. Start the development server
```bash
npm start
# or
yarn start
```

## API Integration

The application uses a centralized API service (`src/services/api.js`) to communicate with the backend. All API calls are organized by functionality:

- Authentication (login, register, logout)
- User profile management
- Challenge retrieval and progress tracking
- Resource management and favorites
- Code execution and testing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
