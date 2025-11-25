import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + New Project
          </button>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Project List */}
      {projects.length === 0 ? (
        <p className="text-gray-500">No projects yet. Create your first one.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate(`/editor/${project.id}`)}
            >
              <h2 className="text-lg font-semibold">{project.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Type: {project.doc_type.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Topic: {project.main_prompt.substring(0, 60)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
