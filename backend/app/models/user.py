"""
Pydantic models for User entity.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from pydantic_core import core_schema
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId for Pydantic models."""

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.union_schema([
                core_schema.str_schema(),
                core_schema.is_instance_schema(ObjectId),
            ]),
            serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def __get_pydantic_json_schema__(cls, schema, handler):
        json_schema = handler(schema)
        json_schema.update(type="string")
        return json_schema


class UserPreferences(BaseModel):
    """User preferences model."""
    theme: str = Field(default="dark", enum=["light", "dark"])
    notifications: bool = Field(default=True)
    email_updates: bool = Field(default=True)


class UserBase(BaseModel):
    """Base user model."""
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    """User creation model."""
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator('username')
    @classmethod
    def username_alphanumeric(cls, v):
        assert v.replace('_', '').replace('-', '').isalnum(), 'Username must be alphanumeric'
        return v


class UserUpdate(BaseModel):
    """User update model."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[UserPreferences] = None


class UserInDB(UserBase):
    """User model as stored in database."""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    password_hash: str
    github_id: Optional[str] = None
    github_access_token: Optional[str] = None
    github_refresh_token: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    role: str = Field(default="user", enum=["user", "admin"])
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    preferences: UserPreferences = Field(default_factory=UserPreferences)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )


class User(UserInDB):
    """User model for API responses."""
    pass


class UserLogin(BaseModel):
    """User login model."""
    username: str  # Can be username or email
    password: str


class Token(BaseModel):
    """JWT token model."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    """Simple user response for auth."""
    id: str
    email: EmailStr
    username: str
    full_name: Optional[str] = None


class TokenResponse(Token):
    """JWT token model with user data."""
    user: UserResponse


class TokenData(BaseModel):
    """JWT token data model."""
    user_id: Optional[str] = None
    username: Optional[str] = None