# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    create_access_token,
    get_jwt_identity,
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

load_dotenv()

# Configuration
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")  # Change in production
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
# app.config["JWT_COOKIE_SECURE"] = False  # Disable for development (no HTTPS)
# app.config["JWT_COOKIE_SAMESITE"] = "Lax"  # Less strict for development
# app.config["JWT_COOKIE_CSRF_PROTECT"] = False  # Disable for development
app.config["JWT_VERIFY_SUB"] = False

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)


# Database Models
class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Users {self.username}>"

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
        }


class Board(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    columns = db.relationship(
        "BoardColumn", backref="board", lazy=True, cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Board {self.title}>"

    def to_dict(self, include_columns=True):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat(),
        }
        if include_columns:
            data["columns"] = [column.to_dict() for column in self.columns]
        return data


class BoardColumn(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(100), nullable=False)
    board_id = db.Column(db.Integer, db.ForeignKey("board.id"), nullable=False)
    position = db.Column(db.Integer, default=0)
    tasks = db.relationship(
        "Task", backref="board_column", lazy=True, cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<BoardColumn {self.title}>"

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "board_id": self.board_id,
            "position": self.position,
            "tasks": [task.to_dict() for task in self.tasks],
        }


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    board_id = db.Column(db.Integer, db.ForeignKey("board.id"), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    column_id = db.Column(db.Integer, db.ForeignKey("board_column.id"), nullable=False)
    position = db.Column(db.Integer, default=0)
    assignee_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    priority = db.Column(db.String(20), default="medium")
    type = db.Column(db.String(20), default="task")
    due_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self):
        return f"<Task {self.title}>"

    def to_dict(self):
        # assignee = Users.query.get(self.assignee_id) if self.assignee_id else None
        assignee = db.session.get(Users, self.assignee_id) if self.assignee_id else None

        return {
            "id": self.id,
            "board_id": self.board_id,
            "title": self.title,
            "description": self.description,
            "column_id": self.column_id,
            "position": self.position,
            "assignee": assignee.to_dict() if assignee else None,
            "priority": self.priority,
            "type": self.type,
            "due_date": self.due_date,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class Epic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    board_id = db.Column(db.Integer, db.ForeignKey("board.id"), nullable=False)
    status = db.Column(db.String(20), default="open")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self):
        return f"<Epic {self.title}>"

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "board_id": self.board_id,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


# API Routes


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"message": "API is healthy"}), 200


@app.route("/api/register", methods=["POST"])
def register():
    data = request.json

    if (
        not data
        or not data.get("username")
        or not data.get("email")
        or not data.get("password")
    ):
        return jsonify({"message": "Missing required fields"}), 400

    if Users.query.filter_by(username=data["username"]).first():
        return jsonify({"message": "Usersname already exists"}), 400

    if Users.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 400

    password_hash = generate_password_hash(data["password"], method="pbkdf2:sha256")
    new_user = Users(
        username=data["username"], email=data["email"], password_hash=password_hash
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Users created successfully"}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"message": "Missing username or password"}), 400

    user = Users.query.filter_by(username=data["username"]).first()

    if not user or not check_password_hash(user.password_hash, data["password"]):
        return jsonify({"message": "Invalid username or password"}), 401

    access_token = create_access_token(identity=str(user.id))
    response = jsonify({"access_token": access_token, "user": user.to_dict()})

    # Set JWT as cookie
    response.set_cookie(
        "access_token_cookie",
        access_token,
        httponly=True,
        secure=False,  # Disable for development (no HTTPS)
        samesite="Lax",  # Less strict for development
        max_age=3600,  # 1 hour
    )

    return response, 200


@app.route("/api/boards", methods=["GET"])
@jwt_required()
def get_boards():
    user_id = int(get_jwt_identity())
    boards = Board.query.filter_by(owner_id=user_id).all()
    return jsonify([board.to_dict(include_columns=False) for board in boards]), 200


@app.route("/api/boards", methods=["POST"])
@jwt_required()
def create_board():
    user_id = int(get_jwt_identity())
    data = request.json

    if not data or not data.get("title"):
        return jsonify({"message": "Missing board title"}), 400

    new_board = Board(
        title=data["title"], description=data.get("description", ""), owner_id=user_id
    )

    db.session.add(new_board)
    db.session.commit()

    # Create default columns
    default_columns = [
        BoardColumn(title="To Do", board_id=new_board.id, position=0),
        BoardColumn(title="In Progress", board_id=new_board.id, position=1),
        BoardColumn(title="Blocked", board_id=new_board.id, position=2),
        BoardColumn(title="Done", board_id=new_board.id, position=3),
    ]

    db.session.add_all(default_columns)
    db.session.commit()

    return jsonify(new_board.to_dict()), 201


@app.route("/api/boards/<int:board_id>", methods=["GET"])
@jwt_required()
def get_board(board_id):
    user_id = int(get_jwt_identity())
    board = Board.query.filter_by(id=board_id, owner_id=user_id).first()
    print(board)

    if not board:
        return jsonify({"message": "Board not found"}), 404

    return jsonify(board.to_dict()), 200


@app.route("/api/boards/<int:board_id>", methods=["PUT"])
@jwt_required()
def update_board(board_id):
    user_id = int(get_jwt_identity())
    board = Board.query.filter_by(id=board_id, owner_id=user_id).first()

    if not board:
        return jsonify({"message": "Board not found"}), 404

    data = request.json
    if data.get("title"):
        board.title = data["title"]
    if data.get("description") is not None:
        board.description = data["description"]

    db.session.commit()
    return jsonify(board.to_dict()), 200


@app.route("/api/boards/<int:board_id>", methods=["DELETE"])
@jwt_required()
def delete_board(board_id):
    user_id = int(get_jwt_identity())
    board = Board.query.filter_by(id=board_id, owner_id=user_id).first()

    if not board:
        return jsonify({"message": "Board not found"}), 404

    db.session.delete(board)
    db.session.commit()
    return jsonify({"message": "Board deleted successfully"}), 200


@app.route("/api/boards/<int:board_id>/columns", methods=["POST"])
@jwt_required()
def create_column(board_id):
    user_id = int(get_jwt_identity())
    board = Board.query.filter_by(id=board_id, owner_id=user_id).first()

    if not board:
        return jsonify({"message": "Board not found"}), 404

    data = request.json
    if not data or not data.get("title"):
        return jsonify({"message": "Missing column title"}), 400

    # Get max position to place the new column at the end
    max_position = (
        db.session.query(db.func.max(BoardColumn.position))
        .filter_by(board_id=board_id)
        .scalar()
        or -1
    )

    new_column = BoardColumn(
        title=data["title"], board_id=board_id, position=max_position + 1
    )

    db.session.add(new_column)
    db.session.commit()

    return jsonify(new_column.to_dict()), 201


@app.route("/api/columns/<int:column_id>", methods=["PUT"])
@jwt_required()
def update_column(column_id):
    user_id = int(get_jwt_identity())
    column = (
        BoardColumn.query.join(Board)
        .filter(BoardColumn.id == column_id, Board.owner_id == user_id)
        .first()
    )

    if not column:
        return jsonify({"message": "BoardColumn not found"}), 404

    data = request.json
    if data.get("title"):
        column.title = data["title"]
    if data.get("position") is not None:
        column.position = data["position"]

    db.session.commit()
    return jsonify(column.to_dict()), 200


@app.route("/api/columns/<int:column_id>", methods=["DELETE"])
@jwt_required()
def delete_column(column_id):
    user_id = int(get_jwt_identity())
    column = (
        BoardColumn.query.join(Board)
        .filter(BoardColumn.id == column_id, Board.owner_id == user_id)
        .first()
    )

    if not column:
        return jsonify({"message": "BoardColumn not found"}), 404

    db.session.delete(column)
    db.session.commit()
    return jsonify({"message": "BoardColumn deleted successfully"}), 200


@app.route("/api/columns/<int:column_id>/tasks", methods=["POST"])
@jwt_required()
def create_task(column_id):
    user_id = int(get_jwt_identity())
    column = (
        BoardColumn.query.join(Board)
        .filter(BoardColumn.id == column_id, Board.owner_id == user_id)
        .first()
    )

    if not column:
        return jsonify({"message": "Column not found"}), 404

    data = request.json
    if not data or not data.get("title"):
        return jsonify({"message": "Missing task title"}), 400

    # Get max position to place the new task at the end
    max_position = (
        db.session.query(db.func.max(Task.position))
        .filter_by(column_id=column_id)
        .scalar()
        or -1
    )

    dd = data.get("due_date") if data.get("due_date") else datetime.now()

    date_obj = datetime.strptime(dd, "%Y-%m-%dT%H:%M:%S.%fZ")
    formatted_date = date_obj.strftime("%Y-%m-%d")

    new_task = Task(
        board_id=data.get("board_id"),
        title=data["title"],
        description=data.get("description", ""),
        column_id=column_id,
        position=max_position + 1,
        assignee_id=data.get("assignee_id"),
        priority=data.get("priority", "medium"),
        type=data.get("type", "task"),
        due_date=formatted_date,
    )

    db.session.add(new_task)
    db.session.commit()

    return jsonify(new_task.to_dict()), 201


@app.route("/api/tasks/<int:task_id>", methods=["GET"])
@jwt_required()
def get_task(task_id):
    user_id = int(get_jwt_identity())
    task = (
        Task.query.join(BoardColumn, Board)
        .filter(Task.id == task_id, Board.owner_id == user_id)
        .first()
    )

    if not task:
        return jsonify({"message": "Task not found"}), 404

    return jsonify(task.to_dict()), 200


@app.route("/api/tasks/<int:task_id>", methods=["PUT", "PATCH"])
@jwt_required()
def update_task(task_id):
    user_id = int(get_jwt_identity())
    task = (
        Task.query.join(BoardColumn, Board)
        .filter(Task.id == task_id, Board.owner_id == user_id)
        .first()
    )

    if not task:
        return jsonify({"message": "Task not found"}), 404

    data = request.json
    if data.get("title"):
        task.title = data["title"]
    if data.get("description") is not None:
        task.description = data["description"]
    if data.get("column_id"):
        # Check if column exists and belongs to the same board
        new_column = (
            BoardColumn.query.join(Board)
            .filter(
                BoardColumn.id == data["column_id"],
                Board.owner_id == user_id,
                BoardColumn.board_id == task.column.board_id,
            )
            .first()
        )

        if new_column:
            task.column_id = data["column_id"]
        else:
            return jsonify({"message": "Invalid column ID"}), 400

    if data.get("position") is not None:
        task.position = data["position"]
    if data.get("assignee_id") is not None:
        task.assignee_id = data["assignee_id"]
    if data.get("priority"):
        task.priority = data["priority"]
    if data.get("type"):
        task.type = data["type"]
    if data.get("due_date") is not None:
        task.due_date = (
            datetime.fromisoformat(data["due_date"]) if data["due_date"] else None
        )

    task.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify(task.to_dict()), 200


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())
    task = (
        Task.query.join(BoardColumn, Board)
        .filter(Task.id == task_id, Board.owner_id == user_id)
        .first()
    )

    if not task:
        return jsonify({"message": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted successfully"}), 200


@app.route("/api/boards/<int:board_id>/epics", methods=["GET"])
@jwt_required()
def get_epics(board_id):
    user_id = int(get_jwt_identity())
    board = Board.query.filter_by(id=board_id, owner_id=user_id).first()

    if not board:
        return jsonify({"message": "Board not found"}), 404

    epics = Epic.query.filter_by(board_id=board_id).all()
    return jsonify([epic.to_dict() for epic in epics]), 200


@app.route("/api/boards/<int:board_id>/epics", methods=["POST"])
@jwt_required()
def create_epic(board_id):
    user_id = int(get_jwt_identity())
    board = Board.query.filter_by(id=board_id, owner_id=user_id).first()

    if not board:
        return jsonify({"message": "Board not found"}), 404

    data = request.json
    if not data or not data.get("title"):
        return jsonify({"message": "Missing epic title"}), 400

    new_epic = Epic(
        title=data["title"],
        description=data.get("description", ""),
        board_id=board_id,
        status=data.get("status", "open"),
    )

    db.session.add(new_epic)
    db.session.commit()

    return jsonify(new_epic.to_dict()), 201


@app.route("/api/epics/<int:epic_id>", methods=["GET", "PUT", "DELETE"])
@jwt_required()
def manage_epic(epic_id):
    user_id = int(get_jwt_identity())
    epic = (
        Epic.query.join(Board)
        .filter(Epic.id == epic_id, Board.owner_id == user_id)
        .first()
    )

    if not epic:
        return jsonify({"message": "Epic not found"}), 404

    if request.method == "GET":
        return jsonify(epic.to_dict()), 200

    elif request.method == "PUT":
        data = request.json

        if data.get("title"):
            epic.title = data["title"]
        if data.get("description") is not None:
            epic.description = data["description"]
        if data.get("status"):
            epic.status = data["status"]

        epic.updated_at = datetime.now(timezone.utc)
        db.session.commit()

        return jsonify(epic.to_dict()), 200

    elif request.method == "DELETE":
        db.session.delete(epic)
        db.session.commit()
        return jsonify({"message": "Epic deleted successfully"}), 200


@app.route("/api/users/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())
    user = Users.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200


@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    # Access the identity of the current user with get_jwt_identity
    current_user = int(get_jwt_identity())
    return jsonify(logged_in_as=current_user), 200


# Create database tables if they don't exist
with app.app_context():
    db.create_all()

# When running directly
if __name__ == "__main__":
    app.run(debug=True)
