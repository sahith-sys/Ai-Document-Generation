from pydantic import BaseModel
from typing import Optional, List

class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class NodeCreate(BaseModel):
    title: str
    idx: int

class NodeOut(BaseModel):
    id: int
    title: Optional[str]
    idx: int
    content_current: Optional[str]

    class Config:
        orm_mode = True

class ProjectCreate(BaseModel):
    title: str
    doc_type: str
    main_prompt: Optional[str] = None
    nodes: Optional[List[NodeCreate]] = None

class ProjectOut(BaseModel):
    id: int
    title: str
    doc_type: str
    main_prompt: Optional[str]
    nodes: List[NodeOut]

    class Config:
        orm_mode = True

class RefinementRequest(BaseModel):
    refinement_prompt: str
