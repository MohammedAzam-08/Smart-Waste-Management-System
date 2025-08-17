# Smart Waste Management System - Backend

This is the backend API for the Smart Waste Management System built with Java Spring Boot.

## Features

- **User Management**: Registration, authentication, and role-based access control
- **Complaint Management**: CRUD operations for waste management complaints
- **File Upload**: Image upload for complaints and completion photos
- **Activity Logging**: Track all actions performed on complaints
- **Dashboard Analytics**: Statistics and reports for different user roles
- **JWT Authentication**: Secure API endpoints with JWT tokens
- **Role-based Authorization**: Different permissions for Citizens, Agents, and Workers

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security**
- **Spring Data JPA**
- **MySQL 8.0**
- **JWT (JSON Web Tokens)**
- **Maven**
- **ModelMapper**

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

## Setup Instructions

### 1. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE waste_management_db;
```

### 2. Configuration

Update `src/main/resources/application.yml` with your database credentials:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/waste_management_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
    username: your_username
    password: your_password
```

### 3. Environment Variables (Optional)

You can set the following environment variables:

- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: JWT secret key
- `MAIL_HOST`: SMTP host for email notifications
- `MAIL_USERNAME`: Email username
- `MAIL_PASSWORD`: Email password

### 4. Build and Run

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Complaints
- `GET /api/complaints` - Get complaints (filtered by user role)
- `POST /api/complaints` - Create new complaint (Citizens only)
- `GET /api/complaints/{id}` - Get complaint by ID
- `PUT /api/complaints/{id}/assign` - Assign worker to complaint (Agents only)
- `PUT /api/complaints/{id}/start` - Start work on complaint (Workers only)
- `PUT /api/complaints/{id}/complete` - Complete work with photos (Workers only)
- `PUT /api/complaints/{id}/verify` - Verify completion (Agents only)
- `PUT /api/complaints/{id}/feedback` - Submit feedback (Citizens only)

### Users
- `GET /api/users` - Get all users (Agents only)
- `GET /api/users/workers` - Get all workers (Agents only)
- `GET /api/users/{id}` - Get user by ID (Agents only)
- `PUT /api/users/{id}/activate` - Activate user (Agents only)
- `PUT /api/users/{id}/deactivate` - Deactivate user (Agents only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Activity Logs
- `GET /api/complaints/{id}/logs` - Get activity logs for complaint

## User Roles

### CITIZEN
- Register and login
- Report garbage issues with photos and location
- Track complaint status
- Provide feedback and ratings

### AGENT (Municipality Agent)
- View all complaints with filtering options
- Assign complaints to workers
- Verify work completion
- Generate reports and analytics
- Manage users

### WORKER (Municipality Worker)
- View assigned tasks
- Start work on complaints
- Upload before/after photos
- Mark tasks as completed

## Database Schema

The application uses the following main entities:

- **User**: User information and authentication
- **Complaint**: Waste management complaints
- **ActivityLog**: Audit trail of all actions
- **UserRole**: Enum for user roles
- **ComplaintStatus**: Enum for complaint statuses
- **Priority**: Enum for complaint priorities

## Security

- JWT-based authentication
- Role-based authorization using Spring Security
- Password encryption using BCrypt
- CORS configuration for cross-origin requests
- Input validation and sanitization

## File Upload

- Images are stored locally in the `uploads/` directory
- File size limit: 5MB
- Supported formats: JPG, PNG, GIF
- Unique filename generation to prevent conflicts

## Error Handling

Global exception handler provides consistent error responses:

- `400 Bad Request`: Validation errors, file upload errors
- `401 Unauthorized`: Authentication failures
- `403 Forbidden`: Authorization failures
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Unexpected errors

## Testing

Run tests with:

```bash
mvn test
```

## Production Deployment

1. Update `application.yml` for production environment
2. Set environment variables for sensitive data
3. Configure proper database connection pooling
4. Set up SSL/HTTPS
5. Configure logging levels
6. Set up monitoring and health checks

## API Documentation

The API follows RESTful conventions and returns JSON responses. All endpoints require authentication except for registration and login.

For detailed API documentation, consider integrating Swagger/OpenAPI.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.