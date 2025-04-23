# Voting System Backend

A RESTful API backend for a voting system built with Express.js and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally on port 27017)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/voting-system.git
cd voting-system/voting-system-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:

```env
SECRET_KEY=your_jwt_secret_key_here
```

## Running the Application

1. Make sure MongoDB is running locally
2. Start the application:

```bash
node .
```

The server will start on port 3000 by default.

## API Endpoints

### Authentication

- POST /api/v1/auth/register - Register a new user
- POST /api/v1/auth/login - Login with username and password

### Users

- GET /api/v1/users/me - Get current user info
- GET /api/v1/users - Get all users (admin only)
- DELETE /api/v1/users?id=userId - Delete a user (admin only)

### Voting

- GET /api/v1/votings - Get all voting options (admin only)
- POST /api/v1/votings - Create a new voting option
- GET /api/v1/votings/vote?id=votingId - Vote for an option
- DELETE /api/v1/votings?id=votingId - Delete a voting option (admin only)

## Running Tests

The application uses Jest and Supertest for testing.

1. Make sure MongoDB is running locally
2. Run the tests:

```bash
npm test
```

This will start Jest in watch mode, which will automatically rerun tests when files change.

## Project Structure

- src/ - Source code

  - controllers/ - Route handlers
  - middlewares/ - Express middlewares
  - models/ - Mongoose models
  - response/ - Response formatting
  - services/ - Business logic
  - app.js - Express application setup
  - index.js - Application entry point

- tests/ - Test files

## Notes

- The admin user is automatically created when registering with the username "admin"
- Users can only vote once
- Deleted users and voting options are soft-deleted (marked as deleted in the database)
