# JFlow Backend Server

NestJS-based REST API server for JFlow Workflow Management System.

## Features

- **RESTful API** - Complete CRUD operations for all entities
- **Authentication** - JWT-based authentication system
- **RBAC** - Role-Based Access Control
- **Database** - PostgreSQL with TypeORM
- **Swagger** - API documentation
- **Validation** - Request validation with class-validator
- **Seeding** - Database seeding with sample data

## Tech Stack

- NestJS 10
- TypeORM 0.3
- PostgreSQL 12+
- JWT Authentication
- Swagger/OpenAPI
- TypeScript 5

## Prerequisites

- Node.js 18+
- PostgreSQL 12+

1. Install dependencies:

```bash
cd server
npm install
```

2. Configure environment:

```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Create empty database:

```bash
# Using PostgreSQL CLI
psql -U postgres
CREATE DATABASE jflow;
\q
```

**Note**: No need to run schema.sql manually! The seed script will create all tables automatically.

## Database Setup

### Automatic Setup (Recommended)

The seed script will automatically create the complete database schema and seed data:

```bash
npm run seed
```

This will:
1. Create all ENUM types
2. Create all tables with proper indexes
3. Create triggers for auto-updating timestamps
4. Seed initial data:
   - 2 users (admin/admin123, user1/user123)
   - 2 roles (super_admin, user)
   - 11 permissions
   - 2 form configs
   - 3 sample workflows

### Manual Schema Creation (Optional)

If you prefer to create the schema manually:

```bash
psql -U postgres -d jflow -f src/database/schema.sql
```

Then seed the data:

```bash
npm run seed
```

**⚠️ Production Warning**: The seed script will **drop and recreate** the entire database schema! Only use it for:
- Initial development setup
- First-time production deployment (with caution)
- Testing environments

For production migrations, use TypeORM migrations instead. See [DATABASE_INIT.md](DATABASE_INIT.md) for detailed information.

## Running the Application

### Development mode:

```bash
npm run start:dev
```

### Production mode:

```bash
npm run build
npm run start:prod
```

The server will start on `http://localhost:3000`

## API Documentation

Swagger documentation is available at:

```
http://localhost:3000/api/docs
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Roles

- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role by ID
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### Permissions

- `GET /api/permissions` - Get all permissions
- `GET /api/permissions/:id` - Get permission by ID
- `POST /api/permissions` - Create permission
- `PUT /api/permissions/:id` - Update permission
- `DELETE /api/permissions/:id` - Delete permission

### Workflows

- `GET /api/workflows` - Get all workflows
- `GET /api/workflows/:id` - Get workflow by ID
- `GET /api/workflows/:id/history` - Get workflow history
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Forms

- `GET /api/forms` - Get all form configs
- `GET /api/forms/:id` - Get form config by ID
- `POST /api/forms` - Create form config
- `PUT /api/forms/:id` - Update form config
- `DELETE /api/forms/:id` - Delete form config

## Project Structure

```
server/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── database/
│   │   ├── schema.sql             # Database schema
│   │   └── seeds/
│   │       └── run-seed.ts        # Seed script
│   └── modules/
│       ├── auth/                  # Authentication module
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   └── auth.module.ts
│       ├── users/                 # Users module
│       │   ├── user.entity.ts
│       │   ├── user.dto.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   └── users.module.ts
│       ├── roles/                 # Roles module
│       ├── permissions/           # Permissions module
│       ├── workflows/             # Workflows module
│       └── forms/                 # Forms module
├── .env                           # Environment variables
├── .env.example                   # Environment example
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Database Schema

### Tables

- `users` - User accounts
- `roles` - User roles
- `permissions` - System permissions
- `user_roles` - User-Role associations
- `role_permissions` - Role-Permission associations
- `workflows` - Workflow instances
- `workflow_history` - Workflow audit trail
- `dynamic_form_configs` - Dynamic form configurations

## Environment Variables

```env
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=jflow

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:4200
```

## Default Credentials

After seeding:

**Admin User:**

- Username: `admin`
- Password: `admin123`
- Role: Super Admin (all permissions)

**Normal User:**

- Username: `user1`
- Password: `user123`
- Role: User (limited permissions)

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Build

```bash
npm run build
```

## Scripts

- `npm run start` - Start application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run seed` - Seed the database
- `npm run lint` - Lint the code
- `npm run format` - Format the code

## Notes

- The server uses TypeORM auto-synchronization in development mode
- For production, disable `synchronize` and use migrations
- All passwords are hashed using bcrypt
- JWT tokens expire in 7 days (configurable)
- API responses follow the format: `{ data: any, total?: number }`

## License

MIT
