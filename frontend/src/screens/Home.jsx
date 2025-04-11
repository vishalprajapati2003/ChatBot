import React, { useContext, useState, useRef, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);
  const [screenError, setScreenError] = useState(false);

  const navigate = useNavigate();
  const modalRef = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width < 230 || height < 430) {
        setScreenError(true);
      } else {
        setScreenError(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsModalOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isModalOpen]);

  const fetchProjects = () => {
    axios
      .get("/projects/all")
      .then((res) => setProject(res.data.projects))
      .catch((err) => console.error("Error fetching projects:", err));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = (e) => {
    e.preventDefault();
    axios
      .post("/projects/create", { name: projectName })
      .then(() => {
        setIsModalOpen(false);
        setProjectName("");
        fetchProjects();
      })
      .catch((error) => console.error("Error creating project:", error));
  };

  if (screenError) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-100 text-red-800 p-6 text-center">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-sm w-full">
          <h1 className="text-xl font-semibold mb-3">Screen Too Small</h1>
          <p>
            This app requires at least <strong>300px width</strong> and{" "}
            <strong>400px height</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    
    <main className="p-4 sm:p-6 md:p-8 bg-gradient-to-tr from-indigo-100 via-blue-100 to-purple-100 min-h-screen overflow-x-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center w-full p-4 sm:p-6 border-2 border-dashed border-blue-400 rounded-xl bg-white hover:bg-blue-100 transition shadow-md min-w-0"
        >
          <span className="text-blue-700 font-semibold text-base sm:text-lg truncate">
            + New Chat
          </span>
        </button>

        {project.map((proj) => (
          <div
            key={proj._id}
            onClick={() => navigate(`/project`, { state: { project: proj } })}
            className="bg-white hover:bg-blue-50 border border-slate-200 rounded-xl p-4 sm:p-5 shadow-lg transition cursor-pointer w-full min-w-0"
          >
            <h2 className="text-base sm:text-lg font-bold text-indigo-700 truncate">
              {proj.name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-3 truncate">
              <i className="ri-user-line"></i>
              <span className="truncate">
                Collaborator{proj.users.length !== 1 ? "s" : ""}:{" "}
                {proj.users.length}
              </span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-full sm:max-w-md md:max-w-lg p-4 sm:p-6"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-blue-700 mb-4 break-words">
              Create a New Chat
            </h2>

            <form onSubmit={createProject}>
              <label className="block text-gray-700 text-sm mb-2">
                Chat Name
              </label>
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                type="text"
                required
                className="w-full p-3 mb-5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                placeholder="e.g. John doe"
              />

              <div className="flex justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 sm:px-4 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm sm:text-base transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 sm:px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm sm:text-base transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
