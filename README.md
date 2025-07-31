# EasyDoor Backend API

A comprehensive API for EasyDoor backend operations with CRUD functionality for Users, Companies, Offices, Service Cards, Visits, and Attendance management.

## 🚀 Features

- **Complete CRUD Operations** with PATCH instead of UPDATE
- **JWT Authentication** with bcrypt password encryption
- **Swagger/OpenAPI Documentation** 
- **MongoDB with Mongoose ODM**
- **Express.js with Security Middleware** (Helmet, CORS, Rate Limiting)
- **PM2 Process Management**
- **Comprehensive Models**: User, Company, Office, ServiceCard, Visit, Attendance

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Yarn package manager
- PM2 (will be installed as dev dependency)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EasyDoor
   ```

2. **Install dependencies with Yarn**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
# Using nodemon for development
yarn dev
```

### Production Mode with PM2

```bash
# Start with PM2
yarn pm2:start

# Check status
yarn pm2:status

# View logs
yarn pm2:logs

# Restart application
yarn pm2:restart

# Stop application
yarn pm2:stop

# Delete PM2 process
yarn pm2:delete
```

### Direct Start
```bash
yarn start
```

## 📚 API Documentation

Once the server is running, access the interactive API documentation at:
- **Swagger UI**: http://localhost:8009/api-docs
- **Health Check**: http://localhost:8009/health

## 🔗 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `POST /api/users/logout` - Logout user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Companies
- `POST /api/companies` - Create company
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get company by ID
- `PATCH /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company
- `PATCH /api/companies/:id/add-employee` - Add employee
- `PATCH /api/companies/:id/remove-employee` - Remove employee

### Offices
- `POST /api/offices` - Create office
- `GET /api/offices` - Get all offices
- `GET /api/offices/:id` - Get office by ID
- `PATCH /api/offices/:id` - Update office
- `DELETE /api/offices/:id` - Delete office

### Service Cards
- `POST /api/service-cards` - Create service card
- `GET /api/service-cards` - Get all service cards
- `GET /api/service-cards/:id` - Get service card by ID
- `PATCH /api/service-cards/:id` - Update service card
- `DELETE /api/service-cards/:id` - Delete service card

### Visits
- `POST /api/visits` - Create visit
- `GET /api/visits` - Get all visits
- `GET /api/visits/:id` - Get visit by ID
- `PATCH /api/visits/:id` - Update visit
- `PATCH /api/visits/:id/accept` - Accept visit
- `PATCH /api/visits/:id/cancel` - Cancel visit
- `PATCH /api/visits/:id/clock-in` - Clock in visitor
- `PATCH /api/visits/:id/clock-out` - Clock out visitor
- `DELETE /api/visits/:id` - Delete visit

### Attendance
- `POST /api/attendance` - Clock in employee
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/:id` - Get attendance by ID
- `PATCH /api/attendance/:id` - Update attendance
- `PATCH /api/attendance/:id/clock-out` - Clock out employee
- `DELETE /api/attendance/:id` - Delete attendance record

## 🏗️ Project Structure

```
├── config/
│   └── database.js         # Database configuration
├── controllers/            # Request handlers
│   ├── userController.js
│   ├── companyController.js
│   ├── officeController.js
│   ├── serviceCardController.js
│   ├── visitController.js
│   └── attendanceController.js
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/                # Mongoose schemas
│   ├── User.js
│   ├── Company.js
│   ├── Office.js
│   ├── ServiceCard.js
│   ├── Visit.js
│   └── Attendance.js
├── routes/                # API routes
│   ├── userRoutes.js
│   ├── companyRoutes.js
│   ├── officeRoutes.js
│   ├── serviceCardRoutes.js
│   ├── visitRoutes.js
│   └── attendanceRoutes.js
├── logs/                  # PM2 logs
├── ecosystem.config.js    # PM2 configuration
├── server.js             # Main application file
└── package.json
```

## 🔧 Environment Variables

```env
PORT=8009
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/easydoor
JWT_SECRET=your_super_secure_jwt_secret_key_here
```

## 🔒 Security Features

- **JWT Authentication** for protected routes
- **Password Encryption** with bcryptjs
- **Rate Limiting** (100 requests per 15 minutes)
- **CORS** configuration
- **Helmet** for security headers

## 📊 Models Overview

- **UserModel**: User management with roles and authentication
- **CompanyModel**: Company information and employee management
- **OfficeModel**: Office locations and capacity management
- **ServiceCardModel**: Employee service cards with expiration
- **VisitModel**: Visitor management and tracking
- **AttendanceModel**: Employee attendance and working hours

## 🎯 Key Features

- ✅ **PATCH Operations** instead of UPDATE
- ✅ **Comprehensive Swagger Documentation**
- ✅ **JWT Authentication & Authorization**
- ✅ **Data Validation** with Mongoose schemas
- ✅ **Error Handling** middleware
- ✅ **Pagination** for list endpoints
- ✅ **Filtering & Search** capabilities
- ✅ **PM2 Process Management**
- ✅ **Yarn Package Management**

## 🚦 Server Status

- **Port**: 8009
- **Health Check**: GET /health
- **API Docs**: GET /api-docs
- **Database**: MongoDB (easydoor)

## 📝 PM2 Commands

```bash
# Production deployment
yarn pm2:start

# Monitor application
pm2 monit

# Check logs
yarn pm2:logs

# Restart gracefully
yarn pm2:restart

# Stop all processes
yarn pm2:stop

# Remove from PM2
yarn pm2:delete
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.