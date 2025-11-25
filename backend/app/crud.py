from sqlalchemy.orm import Session
from . import models, schemas
from .auth import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(email=user.email, name=user.name, password_hash=get_password_hash(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user

def create_project(db: Session, user_id: int, project_in: dict):
    p = models.Project(user_id=user_id, title=project_in["title"], doc_type=project_in["doc_type"], main_prompt=project_in.get("main_prompt"))
    db.add(p); db.commit(); db.refresh(p)
    nodes = project_in.get("nodes") or []
    for n in nodes:
        node = models.Node(project_id=p.id, title=n["title"], idx=n["idx"])
        db.add(node)
    db.commit()
    db.refresh(p)
    return p

def get_projects_for_user(db: Session, user_id: int):
    return db.query(models.Project).filter(models.Project.user_id == user_id).all()

def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def add_node(db: Session, project_id: int, title: str, idx: int):
    node = models.Node(project_id=project_id, title=title, idx=idx)
    db.add(node); db.commit(); db.refresh(node)
    return node

def update_node_content(db: Session, node_id: int, new_content: str):
    node = db.query(models.Node).get(node_id)
    node.content_current = new_content
    db.commit()
    db.refresh(node)
    return node

def create_revision(db: Session, node_id: int, user_id: int, prompt_text: str, result_text: str, feedback: str = None):
    rev = models.Revision(node_id=node_id, user_id=user_id, prompt_text=prompt_text, result_text=result_text, feedback=feedback)
    db.add(rev); db.commit(); db.refresh(rev)
    return rev
