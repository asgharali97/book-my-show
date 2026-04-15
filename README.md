Stellar Seat Booking System (ChaiCode Hackathon)

This is a backend-focused seat booking system built on top of a starter codebase.

*Overview*

The system allows users to:
- Register and login
- Authenticate using JWT (access + refresh tokens via cookies)
- Book seats in a movie booking system
- Ensure only authenticated users can book seats
- Prevent double booking of seats
- Associate each booking with a real user

*Tech Stack*

- Node.js (Express)
- PostgreSQL (pg)
- JWT Authentication
- bcryptjs
- Joi validation
- Cookies (httpOnly auth storage)

*Authentication Flow*

1. User signs up → stored in PostgreSQL
2. User logs in → receives access + refresh tokens (cookies)
3. Middleware verifies access token
4. Authenticated user can access protected routes

*Booking Flow*

1. User logs in
2. User selects a seat
3. Backend verifies authentication
4. Seat is locked using SQL transaction (FOR UPDATE)
5. Seat is booked and linked to user_id
6. Duplicate booking is prevented

*Database Schema*
Users Table
id, name, email, password, refresh_token, created_at, updated_at
Seats Table
id, isbooked, name, user_id
user_id → references users(id)

*API Endpoints*
- Auth Routes
POST /auth/signup → Register user
POST /auth/login  → Login user
POST /auth/logout → Logout user

*Booking*
PUT /:id/:name → Book seat (Protected route)

*Security Features*
- JWT authentication
- Password hashing (bcrypt)
- SQL injection prevention (parameterized queries)
- Transaction-based booking (BEGIN/COMMIT/ROLLBACK)
- Row-level locking (FOR UPDATE)

*How to Run*

npm install
node index.mjs