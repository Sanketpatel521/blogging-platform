# Blogging Platform Backend

The Blogging Platform Backend is a NestJS application. It serves as the backend infrastructure for a blogging platform. The backend is designed to handle user authentication, post-creation, retrieval, and management.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- Nest.js
- npm
- MongoDB

## Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Sanketpatel521/blogging-platform-backend.git
   ```
2. **Navigate to the project directory:**

   ```bash
   cd blogging-platform-backend
   ```
3. **Install dependencies:**

   ```bash
   npm i
   ```
4. **Create a .env file in the project root:**

   ```bash
    MONGODB_URI= mongodb://localhost:27017/blog_platform (Can also use MongoDB Atlas URI)
    JWT_SECRET=your-secret-key
   ```
   - Node.js to generate a random secret key
      ```bash
      node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
      ```

## Running the Application
**Start the application:**
   ```bash
   npm run start
   ```
   - The backend API will be available at http://localhost:3000
## Run Tests
**Run all test cases:**
   ```bash
   npm run test
   ```

## Authentication
**Start the application:**
   This application uses JSON Web Tokens (JWT) for authentication. Two guards, AuthGuard and PostsAuthGuard, are implemented for authorization.

## Important Design Decisions
**Authorization Guards:**
This application uses two custom authorization guards:

1. AuthGuard:
This guard checks for a valid JWT token in the request header. If a valid token is present, it decodes the token and sets the userId in the request. Unauthorized requests without a token result in a 401 status.

2. PostsAuthGuard:
This guard is specific to post-related actions. It extends the AuthGuard and additionally checks if the author of the post matches the userId from the JWT token. If they match, access is allowed; otherwise, a Forbidden error is thrown.

## API Endpoints
- POST /api/users/register: Register a new user.
- POST /api/users/login: Log in and receive a JWT token.
- GET /api/users/profile: Get user profile (requires authentication).
- PUT /api/users/update: Update user details (requires authentication).
- DELETE /api/users/delete: Delete user account (requires authentication).
- POST /api/posts: Create a new post (requires authentication).
- GET /api/posts/latest: Get the latest posts.
- PUT /api/posts/:id: Update a post (requires authentication and ownership).
- DELETE /api/posts/:id: Delete a post (requires authentication and ownership).
