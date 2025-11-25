import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function CreateProject() {
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("docx");
  const [mainPrompt, setMainPrompt] = useState("");
  const [nodes, setNodes] = useState([{ title: "", idx: 0 }]);
  const navigate = useNavigate();

  // Add new section/slide
  const addNode = () => {
    setNodes([
      ...nodes,
      { title: "", idx: nodes.length },
    ]);
  };

  // Update section/slide name
  const updateNode = (index, value) => {
    const updated = [...nodes];
    updated[index].title = value;
    setNodes(updated);
  };

  // Create project in backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/projects", {
        title,
        doc_type: docType,
        main_prompt: mainPrompt,
        nodes,
      });

      navigate(`/dashboard`);
    } catch (err) {
      console.error("Failed to create project", err);
      alert("Error creating project. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md max-w-2xl"
      >
        {/* Title */}
        <input
          type="text"
          placeholder="Project Title"
          className="w-full p-2 border rounded mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Doc Type */}
        <label className="block mb-2 font-semibold">Document Type</label>
        <select
          className="w-full p-2 border rounded mb-4"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
        >
          <option value="docx">Word (.docx)</option>
          <option value="pptx">PowerPoint (.pptx)</option>
        </select>

        {/* Main Topic */}
        <input
          type="text"
          placeholder="Main topic or prompt"
          className="w-full p-2 border rounded mb-4"
          value={mainPrompt}
          onChange={(e) => setMainPrompt(e.target.value)}
          required
        />

        {/* Dynamic Sections/Slides */}
        <h2 className="text-lg font-semibold mb-2">
          {docType === "docx" ? "Sections" : "Slides"}
        </h2>

        {nodes.map((node, index) => (
          <input
            key={index}
            type="text"
            placeholder={
              docType === "docx"
                ? `Section ${index + 1} Title`
                : `Slide ${index + 1} Title`
            }
            className="w-full p-2 border rounded mb-3"
            value={node.title}
            onChange={(e) => updateNode(index, e.target.value)}
            required
          />
        ))}

        <button
          type="button"
          onClick={addNode}
          className="bg-gray-600 text-white px-3 py-1 rounded mb-4"
        >
          + Add {docType === "docx" ? "Section" : "Slide"}
        </button>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded mt-4"
        >
          Create Project
        </button>
      </form>
    </div>
  );
}
