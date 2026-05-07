"""
User service for database operations.
"""

from datetime import datetime
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorCollection
from bson import ObjectId

from app.core.database import get_collection
from app.models.user import User, UserCreate, UserUpdate, UserInDB
from app.auth.security import get_password_hash


class UserService:
    """Service for user-related database operations."""

    def __init__(self):
        self.collection: AsyncIOMotorCollection = None

    def _collection(self) -> AsyncIOMotorCollection:
        return get_collection("users")

    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user."""
        # Check if user already exists
        collection = self._collection()

        existing_user = await collection.find_one({
            "$or": [
                {"email": user_data.email},
                {"username": user_data.username}
            ]
        })

        if existing_user:
            if existing_user["email"] == user_data.email:
                raise ValueError("Email already registered")
            else:
                raise ValueError("Username already taken")

        # Create user document
        user_doc = UserInDB(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            avatar_url=user_data.avatar_url,
            password_hash=get_password_hash(user_data.password)
        )

        # Convert to dict for MongoDB
        user_dict = user_doc.dict(by_alias=True)
        user_dict["_id"] = ObjectId()

        # Insert into database
        result = await collection.insert_one(user_dict)

        # Retrieve the created user
        created_user = await collection.find_one({"_id": result.inserted_id})

        return User(**created_user)

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        try:
            user_doc = await self._collection().find_one({"_id": ObjectId(user_id)})
            return User(**user_doc) if user_doc else None
        except:
            return None

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        user_doc = await self._collection().find_one({"email": email})
        return User(**user_doc) if user_doc else None

    async def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username."""
        user_doc = await self._collection().find_one({"username": username})
        return User(**user_doc) if user_doc else None

    async def get_user_by_github_id(self, github_id: str) -> Optional[User]:
        """Get user by GitHub ID."""
        user_doc = await self._collection().find_one({"github_id": github_id})
        return User(**user_doc) if user_doc else None

    async def authenticate_user(self, username_or_email: str, password: str) -> Optional[User]:
        """Authenticate user with username/email and password."""
        # Try to find user by email first, then by username
        user = await self.get_user_by_email(username_or_email)
        if not user:
            user = await self.get_user_by_username(username_or_email)

        if not user:
            return None

        if not user.password_hash:
            return None

        from app.auth.security import verify_password
        if not verify_password(password, user.password_hash):
            return None

        # Update last login
        await self._collection().update_one(
            {"_id": ObjectId(user.id)},
            {"$set": {"last_login": datetime.utcnow()}}
        )

        return user

    async def update_user(self, user_id: str, update_data: UserUpdate) -> Optional[User]:
        """Update user information."""
        update_dict = update_data.dict(exclude_unset=True)
        update_dict["updated_at"] = datetime.utcnow()

        result = await self._collection().update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_dict}
        )

        if result.modified_count == 0:
            return None

        return await self.get_user_by_id(user_id)

    async def update_github_tokens(self, user_id: str, access_token: str, refresh_token: Optional[str] = None) -> bool:
        """Update user's GitHub tokens."""
        update_dict = {
            "github_access_token": access_token,
            "updated_at": datetime.utcnow()
        }

        if refresh_token:
            update_dict["github_refresh_token"] = refresh_token

        result = await self._collection().update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_dict}
        )

        return result.modified_count > 0

    async def delete_user(self, user_id: str) -> bool:
        """Delete a user."""
        result = await self._collection().delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0

    async def list_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """List users with pagination."""
        cursor = self._collection().find().skip(skip).limit(limit)
        users = []
        async for user_doc in cursor:
            users.append(User(**user_doc))
        return users

    async def count_users(self) -> int:
        """Count total users."""
        return await self._collection().count_documents({})


# Global user service instance
user_service = UserService()


# Convenience functions
async def create_user(user_data: UserCreate) -> User:
    return await user_service.create_user(user_data)


async def get_user_by_id(user_id: str) -> Optional[User]:
    return await user_service.get_user_by_id(user_id)


async def get_user_by_email(email: str) -> Optional[User]:
    return await user_service.get_user_by_email(email)


async def get_user_by_username(username: str) -> Optional[User]:
    return await user_service.get_user_by_username(username)


async def authenticate_user(username_or_email: str, password: str) -> Optional[User]:
    return await user_service.authenticate_user(username_or_email, password)