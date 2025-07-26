# Volunteer Network Backend

A Node.js/Express backend for the Volunteer Network platform that connects volunteers with organizations.

## Features

- **User Authentication**: JWT-based authentication for volunteers and organizations
- **Role-based Access Control**: Separate permissions for volunteers and organizations
- **Opportunity Management**: Organizations can create, update, and delete volunteer opportunities
- **Application System**: Volunteers can apply to opportunities, organizations can review applications
- **Search & Filtering**: Advanced search and filtering for opportunities
- **Pagination**: Efficient pagination for large datasets
- **Input Validation**: Comprehensive input validation using express-validator
- **Error Handling**: Robust error handling and meaningful error messages

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **mongoose-paginate-v2** - Pagination

## Project Structure

```
backend/
├── models/           # Database models
│   ├── User.js
│   ├── Opportunity.js
│   └── Application.js
├── controllers/      # Business logic
│   ├── authController.js
│   ├── opportunityController.js
│   └── applicationController.js
├── routes/          # API routes
│   ├── auth.js
│   ├── opportunities.js
│   └── applications.js
├── middleware/      # Custom middleware
│   ├── auth.js
│   └── validation.js
├── server.js        # Main server file
├── package.json
└── .env
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your configuration:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PORT=5000
NODE_ENV=development
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (volunteer/organization)
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Opportunities (Public)
- `GET /api/opportunities` - Get all opportunities with filtering
- `GET /api/opportunities/:id` - Get single opportunity

### Opportunities (Protected)
- `POST /api/opportunities` - Create new opportunity (organizations only)
- `PUT /api/opportunities/:id` - Update opportunity (owner only)
- `DELETE /api/opportunities/:id` - Delete opportunity (owner only)
- `GET /api/opportunities/my/list` - Get organization's opportunities
- `POST /api/opportunities/:id/apply` - Apply to opportunity (volunteers only)

### Applications
- `GET /api/applications/my` - Get volunteer's applications
- `DELETE /api/applications/:id/withdraw` - Withdraw application (volunteer only)
- `GET /api/applications/opportunity/:opportunityId` - Get applications for opportunity (organization only)
- `PUT /api/applications/:id/review` - Review application (organization only)
- `GET /api/applications/opportunity/:opportunityId/stats` - Get application statistics

## Data Models

### User
- `name` (required)
- `email` (required, unique)
- `password` (required, hashed)
- `role` (required: "volunteer" or "organization")
- `location` (required)
- `bio` (optional)
- `profileImage` (optional)

### Opportunity
- `title` (required)
- `description` (required)
- `location` (required)
- `date` (required, future date)
- `createdBy` (ref to User)
- `volunteersApplied` (array of volunteer IDs)
- `maxVolunteers` (optional)
- `isActive` (boolean)
- `category` (required: education, healthcare, environment, community, animals, other)
- `duration` (required: 1-2 hours, 3-5 hours, 6-8 hours, Full day, Multiple days)

### Application
- `volunteerId` (ref to User)
- `opportunityId` (ref to Opportunity)
- `message` (optional)
- `status` (pending, accepted, rejected)
- `appliedAt` (timestamp)
- `reviewedAt` (timestamp)
- `reviewMessage` (optional)

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Validation

All inputs are validated using express-validator with custom error messages and sanitization.

## Pagination

List endpoints support pagination with the following query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalDocs": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Environment Variables

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Development

The server runs on `http://localhost:5000` by default. Use `npm run dev` for development with auto-restart. 