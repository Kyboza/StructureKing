# Structure King - Book Workstations or Conference Rooms

StructureKing enables users to easily book workstations or conference rooms.
The website fulfills that purpose in a simple and easy way.
It allows users to see which rooms are available and which ones have already been booked.

## Run Project Locally

To run this project locally follow these steps

1. Download the project
2. Extract the contents of the downloaded ZIP file.
3. Open the project folder in your preferred IDE.
4. Open a terminal in the project directory and run: `npm install`.
5. Start the development server by running: `npm run dev`.
6. Open your browser and navigate to the provided local URL

## Api Documentation

## Authentication & Users

| Endpoint              | Method | Description                | Middleware                             |
| --------------------- | ------ | -------------------------- | -------------------------------------- |
| `/register`           | POST   | Register a new user        | ratelimitCheck, noJWTAllowed           |
| `/login`              | POST   | Login a user               | ratelimitCheck, noJWTAllowed           |
| `/logout`             | DELETE | Logout the current user    | ratelimitCheck, verifyJWT              |
| `/refreshAccessToken` | POST   | Refresh JWT access token   | ratelimitCheck                         |
| `/users`              | GET    | Get all users (admin only) | ratelimitCheck, verifyJWT, verifyAdmin |
| `/users/:id`          | DELETE | Delete a user (admin only) | ratelimitCheck, verifyJWT, verifyAdmin |

## Rooms

| Endpoint     | Method | Description                  | Middleware                             |
| ------------ | ------ | ---------------------------- | -------------------------------------- |
| `/rooms`     | GET    | Get all rooms                | ratelimitCheck, verifyJWT              |
| `/rooms`     | POST   | Create a new room (admin)    | ratelimitCheck, verifyJWT, verifyAdmin |
| `/rooms/:id` | PUT    | Update room capacity (admin) | ratelimitCheck, verifyJWT, verifyAdmin |
| `/rooms/:id` | DELETE | Delete a room (admin)        | ratelimitCheck, verifyJWT, verifyAdmin |

## Bookings

| Endpoint        | Method | Description                | Middleware                |
| --------------- | ------ | -------------------------- | ------------------------- |
| `/bookings`     | GET    | Get all bookings           | ratelimitCheck, verifyJWT |
| `/bookings/:id` | GET    | Get bookings for a user    | ratelimitCheck, verifyJWT |
| `/bookings`     | POST   | Create a new booking       | ratelimitCheck, verifyJWT |
| `/bookings/:id` | PUT    | Update an existing booking | ratelimitCheck, verifyJWT |
| `/bookings/:id` | DELETE | Delete a booking           | ratelimitCheck, verifyJWT |

## Frontend Authentication Check

| Endpoint            | Method | Description                                                                                                                           | Middleware     |
| ------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `/frontendRedirect` | POST   | Check auth status and role for front-end, also refreshes "access_token" if it is missing by calling the /refreshAccessToken endpoint. | ratelimitCheck |

### Notes

- Most endpoints require JWT authentication.
- Admin privileges are required for user management and room management actions.
- Requests/Responses are in JSON format.
- Rate limiting is applied to all endpoints.
