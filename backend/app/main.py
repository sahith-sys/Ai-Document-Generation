from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .db import SessionLocal, engine, Base
from . import models, crud, schemas, auth
from .services import llm_service, export_service
import os
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Doc Gen")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/auth/register", response_model=schemas.Token)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.create_user(db, user_in)
    token = auth.create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/auth/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

def get_current_user(token: str = Depends(auth.get_current_token), db: Session = Depends(get_db)):
    payload = auth.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(models.User).get(int(payload.get("sub")))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/projects", response_model=schemas.ProjectOut)
def create_project(payload: schemas.ProjectCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = {"title": payload.title, "doc_type": payload.doc_type, "main_prompt": payload.main_prompt, "nodes": [n.dict() for n in (payload.nodes or [])]}
    p = crud.create_project(db, current_user.id, data)
    return p

@app.get("/projects", response_model=list[schemas.ProjectOut])
def list_projects(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_projects_for_user(db, current_user.id)

@app.get("/projects/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = crud.get_project(db, project_id)
    if not p or p.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return p

@app.post("/projects/{project_id}/nodes", response_model=schemas.NodeOut)
def add_node(project_id: int, node_in: schemas.NodeCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = crud.get_project(db, project_id)
    if not p or p.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    node = crud.add_node(db, project_id, node_in.title, node_in.idx)
    return node

@app.post("/projects/{project_id}/nodes/{node_id}/generate")
def generate_node(project_id: int, node_id: int, db: Session = Depends(get_db)):
    node = db.query(models.Node).filter_by(id=node_id, project_id=project_id).first()

    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    # Build LLM prompt
    prompt = f"""
    Generate content for the document section:
    Title: {node.title}
    Main Topic: {node.project.main_prompt}
    """

    # Call LLM (stubbed)
    generated_text = llm_service.call_llm(prompt)

    # Update DB
    node.content_current = generated_text
    db.commit()
    db.refresh(node)

    return {
        "node": {
            "id": node.id,
            "title": node.title,
            "idx": node.idx,
            "content_current": node.content_current
        }
    }


@app.post("/projects/{project_id}/nodes/{node_id}/refine")
def refine_node(project_id: int, node_id: int, payload: schemas.RefinementRequest, db: Session = Depends(get_db)):
    node = db.query(models.Node).filter_by(id=node_id, project_id=project_id).first()

    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    # Build refinement prompt
    prompt = f"""
    Refine the existing content.
    Section Title: {node.title}
    Existing Content: {node.content_current}
    Refinement Instruction: {payload.refinement_prompt}
    """

    # Call LLM (stub)
    refined_text = llm_service.call_llm(prompt)

    # Update node
    node.content_current = refined_text
    db.commit()
    db.refresh(node)

    return {
        "node": {
            "id": node.id,
            "title": node.title,
            "idx": node.idx,
            "content_current": node.content_current
        }
    }


@app.post("/projects/{project_id}/export")
def export(project_id: int, format: str = "docx", current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = crud.get_project(db, project_id)
    if not p or p.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    nodes = p.nodes
    if format == "docx":
        bio = export_service.assemble_docx(p, nodes)
        return StreamingResponse(bio, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": f"attachment; filename={p.title or 'document'}.docx"})
    elif format == "pptx":
        bio = export_service.assemble_pptx(p, nodes)
        return StreamingResponse(bio, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", headers={"Content-Disposition": f"attachment; filename={p.title or 'presentation'}.pptx"})
    else:
        raise HTTPException(status_code=400, detail="Invalid format")

@app.get("/projects/{project_id}/nodes/{node_id}")
def get_node(project_id: int, node_id: int, db: Session = Depends(get_db)):
    node = (
        db.query(models.Node)
        .filter(models.Node.project_id == project_id, models.Node.id == node_id)
        .first()
    )
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    return {
        "id": node.id,
        "title": node.title,
        "idx": node.idx,
        "content_current": node.content_current,
        "project_id": node.project_id,
    }

