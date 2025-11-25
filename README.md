
# AI Document Generation Platform

AI Document Generation Platform is a full-stack web application that enables users to create structured business documents using AI. Users can build Word documents or PowerPoint slides, generate content with an LLM, refine it interactively, and export the final result.

Designed for students, professionals, and content teams, this platform simplifies document creation using a fast AI workflow.


## Features

- **AI-Based Content Generation** — Create section-wise or slide-wise content using Google Gemini (Flash model).
- **Interactive Refinement** — Improve tone, shorten content, convert to bullet points, and more using custom instructions.
- **Word & PowerPoint Document Creation** — DOCX export with structured headings and PPTX export with slide titles and content
- **User Authentication** — Secure login, JWT-based protected routes.
- **Project Management** — Create multiple projects, each with its own sections or slides.
- **Real-Time Editor** — Modify content, generate, refine, and save updates instantly.
- **Frontend–Backend Integration** — React (Vite) + FastAPI with Axios and JWT middleware.


## Folder Structure

```bash

ai-doc-gen/

├── backend/
│   ├── app/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── services/
│   │   │   └── llm_service.py
│   ├── .env
│   ├── requirements.txt
│   ├── .venv/
│   └── dev.db
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateProject.jsx
│   │   │   └── Editor.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── README.md
└── .gitignore



```

## Tech Stack

| Layer       | Technology / Tool                       | Purpose                                      |
|------------|----------------------------------------|---------------------------------------------|
| Frontend    | React.js, Vite, TailwindCSS            | UI + routing + editor      |
| Backend     | FastAPI (Python)                       | API, auth, LLM integration |
| Database    | SQLite + SQLAlchemy ORM                 | Projects, nodes, users         |
| AI Model    | Google Gemini Flash                     | Content generation & refinement |
| Auth	      | JWT + python-jose	                      | Secure login & sessions
| Documents	  | python-docx, python-pptx	              | DOCX/PPTX export
| State Mgmt	| React Context API	                      | Global auth handling
| API Client	| Axios	                                  | HTTP calls with auto JWT header

## Getting started it locally

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-doc-gen.git
cd ai-doc-gen

```
### 2. Setup the Frontend
```bash
cd ../frontend
npm install


```
### 3. Setup the Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate      # Windows
# OR
source .venv/bin/activate     # macOS/Linux

pip install -r requirements.txt

```
### 4. Environment Variables
```bash
DATABASE_URL="sqlite:///./dev.db"
SECRET_KEY="your_jwt_secret"
JWT_ALGO="HS256"
GEMINI_API_KEY="your_gemini_api_key_here"

```
### 5. Run the app
```bash
uvicorn app.main:app --reload
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **POST** |`/auth/register`  | 	Register new user
| **POST** |	`/auth/token`	 | Log in
| **GET**	 | `/projects`	| Fetch all projects
| **POST** |	`/projects`	 | Create a new project
| **GET**  |	`/projects/{id}`	| Fetch project details
| **GET**	 | `/projects/{id}/nodes/{node_id}`	 | Fetch a specific node
| **POST** | `/projects/{id}/nodes/{node_id}/generate` | Generate AI content
| **POST** | `/projects/{id}/nodes/{node_id}/refine`	| Refine content
| **POST** | `/projects/{id}/export?format=docx`	| Export DOCX
| **POST** | `/projects/{id}/export?format=pptx`	| Export PPTX



## Todo

- Add autosave for editor
- Add AI-suggested outline generation
- Add history of refinements per section
- Add dark mode UI
- Dockerize backend + frontend
- Deploy to Render (API) + Vercel (Frontend)


## Credits

- React + TailwindCSS
- FastAPI
- SQLAlchemy
- python-docx + python-pptx
- Google Gemini API

