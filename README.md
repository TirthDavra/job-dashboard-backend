# Job Platform Backend

A Node.js/Express backend for a job platform application, built with TypeScript, MongoDB, and JWT authentication.

## Features

- User authentication and authorization (JWT-based)
- Role-based access control (Admin, Recruiter, Candidate)
- Job posting and management
- Application management
- Profile management
- Admin dashboard functionality

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Zod (for input validation)
- **Other**: CORS, dotenv

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd job-platform/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/job-platform 
   JWT_SECRET=your-super-secret-jwt-key-here
   SEED_ADMIN_NAME=Admin
   SEED_ADMIN_EMAIL=admin@admin.com
   SEED_ADMIN_PASSWORD=admin123
   ```

4. **Start MongoDB**:
   Ensure MongoDB is running locally or update `MONGO_URI` for a cloud instance.

5. **Run the development server**:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000` (or the port specified in `.env`).

6. **Health Check**:
   Visit `http://localhost:5000/health` to verify the server is running.

## API Endpoints

- `GET /health` - Server health check
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create a job (Recruiter only)
- `PUT /api/jobs/:id` - Update a job (Recruiter only)
- `DELETE /api/jobs/:id` - Delete a job (Recruiter only)
- `PUT /api/jobs/:id/close` - Close a job (Recruiter only)
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Apply to a job
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/recruiter/jobs` - Get recruiter's jobs
- `GET /api/admin/dashboard` - Admin dashboard data

## Environment Variables

| Variable            | Description                          | Default |
|---------------------|--------------------------------------|---------|
| `PORT`              | Server port                          | 5000    |
| `MONGO_URI`         | MongoDB connection string            | mongodb://localhost:27017/job-platform |
| `JWT_SECRET`        | Secret key for JWT token signing     | (required) |
| `SEED_ADMIN_NAME`   | Default admin user name              | Admin   |
| `SEED_ADMIN_EMAIL`  | Default admin user email             | admin@admin.com |
| `SEED_ADMIN_PASSWORD`| Default admin user password          | admin123 |


## Architectural Decisions

- **Express.js with TypeScript**: Chosen for its simplicity, strong typing support, and extensive middleware ecosystem. Trade-off: Slightly more verbose than plain JavaScript but provides better maintainability and error prevention.

- **MongoDB with Mongoose**: NoSQL database for flexibility in handling varying job and user data structures. Trade-off: Less strict schema enforcement compared to SQL, but allows for rapid iteration.

- **JWT Authentication**: Stateless authentication using JSON Web Tokens. Trade-off: Tokens can become invalid if secret is compromised, but provides good performance without server-side sessions.

- **Role-Based Access Control**: Implemented at the route level with middleware. Trade-off: Simple to implement but may require more complex logic for fine-grained permissions.

- **Zod Validation**: Used for input validation on API endpoints. Trade-off: Adds runtime type checking but ensures data integrity and provides clear error messages.

## Bonus Features

- **Input Validation with Zod**: All API inputs are validated using Zod schemas, providing type-safe validation and detailed error responses.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Start production server
- `npm run seed` - Run database seeding scripts

## Project Structure

```
backend/
├── src/
│   ├── common/
│   │   ├── middleware/
│   │   └── utils/
│   ├── config/
│   ├── controller/
│   ├── model/
│   ├── routes/
│   ├── seed/
│   └── validations/
├── package.json
├── tsconfig.json
└── README.md
```