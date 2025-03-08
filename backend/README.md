# OpenKanban

OpenKanban is a Kanban board management system built with Flask, providing a RESTful API for managing boards, columns, tasks, and epics in an agile workflow.

## Features

- User authentication with JWT
- Board management
- Column organization
- Task tracking with priorities and types
- Epic management
- RESTful API endpoints

## Tech Stack

- **Backend Framework**: Flask
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **CORS**: Flask-CORS

## Prerequisites

- Python 3.x
- PostgreSQL
- pip (Python package manager)

## Environment Variables

The application uses the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string (default: "postgresql://saurabhchopda:password@localhost:5432/openkanban")
- `JWT_SECRET_KEY`: Secret key for JWT token generation

## Installation

1. Clone the repository
2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install flask flask-cors flask-sqlalchemy flask-jwt-extended psycopg2-binary
```

4. Set up the database:

```bash
# Create PostgreSQL database named 'openkanban'
```

5. Run the application:

```bash
python app.py
```

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/users/me` - Get current user details

### Boards

- `GET /api/boards` - List all boards
- `POST /api/boards` - Create a new board
- `GET /api/boards/<board_id>` - Get board details
- `PUT /api/boards/<board_id>` - Update board
- `DELETE /api/boards/<board_id>` - Delete board

### Columns

- `POST /api/boards/<board_id>/columns` - Create column
- `PUT /api/columns/<column_id>` - Update column
- `DELETE /api/columns/<column_id>` - Delete column

### Tasks

- `POST /api/columns/<column_id>/tasks` - Create task
- `GET /api/tasks/<task_id>` - Get task details
- `PUT /api/tasks/<task_id>` - Update task
- `DELETE /api/tasks/<task_id>` - Delete task

### Epics

- `GET /api/boards/<board_id>/epics` - List epics
- `POST /api/boards/<board_id>/epics` - Create epic
- `GET /api/epics/<epic_id>` - Get epic details
- `PUT /api/epics/<epic_id>` - Update epic
- `DELETE /api/epics/<epic_id>` - Delete epic

## Data Models

- **Users**: User management
- **Board**: Kanban boards
- **BoardColumn**: Columns within boards
- **Task**: Individual tasks with properties
- **Epic**: Large work items that can contain multiple tasks

## Security Features

- Password hashing using PBKDF2
- JWT-based authentication
- Protected routes using `@jwt_required` decorator
- HTTP-only cookies for JWT storage

## Development

The application runs in debug mode when executed directly. For production deployment, ensure to:

1. Set a secure `JWT_SECRET_KEY`
2. Configure proper database credentials
3. Enable secure cookie settings
4. Configure CORS appropriately

## Health Check

- `GET /health` - Check API health status
