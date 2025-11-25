import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

export default function Editor() {
  const { id } = useParams(); // project ID
  const [project, setProject] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState("");

  // Fetch project + nodes
  const loadProject = async () => {
    try {
      const res = await API.get(`/projects/${id}`);
      setProject(res.data);
      setNodes(res.data.nodes);

      if (res.data.nodes.length > 0) {
        setSelectedNode(res.data.nodes[0]);
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  // Select a node from sidebar
  const handleNodeSelect = async (node) => {
    const res = await API.get(`/projects/${id}/nodes/${node.id}`);
    setSelectedNode(res.data);
  };

  // Generate content for selected node
  const handleGenerate = async () => {
    if (!selectedNode) return;
    setLoading(true);

    try {
      const res = await API.post(
        `/projects/${id}/nodes/${selectedNode.id}/generate`
      );
      setSelectedNode(res.data.node);
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Refine content
  const handleRefine = async () => {
    if (!selectedNode || refinePrompt.trim() === "") return;

    setLoading(true);
    try {
      const res = await API.post(
        `/projects/${id}/nodes/${selectedNode.id}/refine`,
        {
          refinement_prompt: refinePrompt,
        }
      );

      setSelectedNode(res.data.node);
      setRefinePrompt("");
    } catch (err) {
      console.error("Refinement failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
  try {
    const response = await API.post(
      `/projects/${id}/export?format=${format}`,
      {},
      { responseType: "blob" }
    );

    const blob = new Blob([response.data]);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = project.title + "." + format;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Export failed");
  }
};


  if (!project) {
    return <p className="p-6">Loading project...</p>;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r p-4">
        <h2 className="font-bold text-lg mb-4">Sections / Slides</h2>

        {nodes.map((node) => (
          <div
            key={node.id}
            className={`p-3 rounded mb-2 cursor-pointer ${
              selectedNode?.id === node.id
                ? "bg-blue-100 border border-blue-600"
                : "bg-gray-100"
            }`}
            onClick={() => handleNodeSelect(node)}
          >
            <p className="font-semibold">{node.title}</p>
          </div>
        ))}

        <button
          onClick={() => handleExport("docx")}
          className="w-full bg-blue-600 text-white py-2 rounded mt-6"
        >
          Export DOCX
        </button>

        <button
          onClick={() => handleExport("pptx")}
          className="w-full bg-orange-600 text-white py-2 rounded mt-2"
        >
          Export PPTX
        </button>
      </div>

      {/* Main Editor */}
      <div className="w-3/4 p-6">
        <h1 className="text-2xl font-bold">{project.title}</h1>
        <p className="text-gray-600 mb-4">{project.main_prompt}</p>

        {selectedNode && (
          <div>
            <h2 className="text-xl font-semibold mb-3">
              {selectedNode.title}
            </h2>

            <textarea
              className="w-full h-64 p-3 border rounded"
              value={selectedNode.content_current || ""}
              onChange={(e) =>
                setSelectedNode({
                  ...selectedNode,
                  content_current: e.target.value,
                })
              }
            ></textarea>

            <div className="flex gap-4 mt-4">
              <button
                onClick={handleGenerate}
                className="bg-green-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate"}
              </button>

              <button
                onClick={async () => {
                  await API.put(
                    `/projects/${id}/nodes/${selectedNode.id}`,
                    selectedNode
                  );
                  alert("Saved!");
                }}
                className="bg-gray-700 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>

            {/* Refinement Box */}
            <div className="mt-6">
              <h3 className="font-bold mb-1">Refine This Section</h3>
              <textarea
                className="w-full p-2 border rounded mb-2"
                placeholder="Ex: Make this more formal, shorten to 100 words..."
                value={refinePrompt}
                onChange={(e) => setRefinePrompt(e.target.value)}
              ></textarea>

              <button
                onClick={handleRefine}
                className="bg-purple-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Refining..." : "Refine"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
