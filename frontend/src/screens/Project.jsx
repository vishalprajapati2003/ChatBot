import React, { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";
import { getWebContainer } from "../config/webcontainer";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

const Project = () => {
  const location = useLocation();
  // console.log(location.state);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set()); // Initialized as Set
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const { user } = useContext(UserContext);
  const messageBox = React.createRef();

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]); // New state variable for messages
  const [fileTree, setFileTree] = useState({});

  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);

  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(true);

  const [runProcess, setRunProcess] = useState(null);
  const [screenError, setScreenError] = useState(false);
  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }

      return newSelectedUserId;
    });
  };

  function addCollaborators() {
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
        // Update project.users to reflect the newly added collaborators
        setProject((prevProject) => ({
          ...prevProject,
          users: [
            ...prevProject.users,
            ...users.filter((u) => selectedUserId.has(u._id)),
          ],
        }));

        // Clear selected users
        setSelectedUserId(new Set());
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = () => {
    if (!message.trim()) return;

    sendMessage("project-message", {
      message,
      sender: user,
    });
    setMessages((prevMessages) => [...prevMessages, { sender: user, message }]); // Update messages state
    setMessage("");
  };

  function WriteAiMessage(message) {
    const messageObject = message;
    console.log("today:", messageObject);
    return (
      <div className="overflow-auto bg-slate-950 text-white rounded-sm p-2">
        <Markdown
          children={messageObject}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>
    );
  }

  useEffect(() => {
    initializeSocket(project._id);

    // if (!webContainer) {
    //   getWebContainer().then((container) => {
    //     setWebContainer(container);
    //     console.log("container started");
    //   });
    // }

    receiveMessage("project-message", (data) => {
      // console.log("received data:", data.message);

      if (data.sender._id == "ai") {
        const message = data.message;

        // console.log("message: ",message);

        // webContainer?.mount(message.fileTree);

        // if (message.fileTree) {
        //   setFileTree(message.fileTree || {});
        // }
        setMessages((prevMessages) => [...prevMessages, data]); // Update messages state
      } else {
        setMessages((prevMessages) => [...prevMessages, data]); // Update messages state
      }
    });

    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        console.log(res.data.project);

        setProject(res.data.project);
        setFileTree(res.data.project.fileTree || {});
      });

    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // function saveFileTree(ft) {
  //   axios
  //     .put("/projects/update-file-tree", {
  //       projectId: project._id,
  //       fileTree: ft,
  //     })
  //     .then((res) => {
  //       console.log(res.data);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }

  function scrollToBottom() {
    messageBox.current.scrollTop = messageBox.current.scrollHeight;
  }

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width < 230 || height < 400) {
        setScreenError(true);
      } else {
        setScreenError(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
    <main className="min-h-screen w-screen flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* LEFT PANEL */}
      <section className="relative flex flex-col h-[100vh] lg:h-screen bg-indigo-100 w-full">
        {/* HEADER */}
        <header className="flex justify-between items-center p-3 px-5 bg-indigo-300 shadow-md z-10 fixed top-0 w-full lg:static">
          <button
            className="flex items-center gap-2 text-indigo-800 font-semibold hover:text-indigo-900 transition"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-add-fill text-xl"></i>
            <span className="hidden sm:inline">Add Collaborator</span>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="text-indigo-900 hover:text-indigo-950 p-2"
          >
            <i className="ri-group-fill text-xl"></i>
          </button>
        </header>

        {/* MESSAGES */}
        <div className="lg:mt-0 mt-16 pb-20 flex-grow flex flex-col relative overflow-hidden">
          {/* SCROLLABLE MESSAGE CONTAINER */}
          <div
            ref={messageBox}
            className="flex-grow p-4 flex flex-col gap-3 overflow-y-auto "
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`w-fit px-4 py-2 rounded-xl shadow-md break-words
    ${
      msg.sender._id === "ai"
        ? "bg-violet-100 text-left max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%]"
        : msg.sender._id === user._id.toString()
        ? "bg-white text-gray-800 ml-auto text-right max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%]"
        : "bg-white max-w-[90%]"
    }`}
              >
                <small
                  className={`block  ${
                    msg.sender._id === "ai"
                      ? "text-gray-700 font-semibold text-sm"
                      : "text-gray-400 font-thin text-xs"
                  } mb-1 `}
                >
                  {msg.sender.email}
                </small>
                <div className="text-sm break-words font-semibold max-h-[500px] overflow-scroll  scrollbar-hide">
                  {msg.sender._id === "ai" ? (
                    WriteAiMessage(msg.message)
                  ) : (
                    <p className="text-left">{msg.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* INPUT BAR */}
          <div className="absolute bottom-0 left-0 w-full bg-indigo-200 flex p-2 gap-2 items-center">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow p-2 rounded-md border-none outline-none text-sm bg-white shadow-inner"
              type="text"
              placeholder="Enter your message"
            />
            <button
              onClick={send}
              className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-1 rounded-md transition"
            >
              <i className="ri-send-plane-fill "></i>
            </button>
          </div>
        </div>

        {/* SIDEPANEL */}
        <div
          className={`fixed top-0 left-0 h-full w-full max-w-xs bg-white z-50 shadow-lg transition-transform duration-300 ease-in-out ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <header className="flex justify-between items-center px-4 py-3 bg-indigo-100 border-b border-gray-300">
            <h1 className="text-lg font-bold text-indigo-800">Collaborators</h1>
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="text-xl text-indigo-800 hover:text-indigo-900"
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users p-4 space-y-3 overflow-y-auto scrollbar-hide">
            {project.users &&
              project.users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-3 hover:bg-indigo-100 rounded-md cursor-pointer"
                >
                  <div className="bg-indigo-500 text-white w-10 h-10 flex items-center justify-center rounded-full">
                    <i className="ri-user-fill"></i>
                  </div>
                  <span className="text-indigo-800 font-medium">
                    {user.email}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* RIGHT PANEL - OPTIONAL CODE EDITOR OR OTHER FEATURES */}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-indigo-800">
                Select Users
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <i className="ri-close-fill text-xl text-gray-500 hover:text-red-500"></i>
              </button>
            </header>
            <div className="users-list space-y-2 max-h-72 overflow-y-auto scrollbar-hide mb-4">
              {users
                .filter(
                  (u) =>
                    !project.users.some((pUser) => pUser._id === u._id) &&
                    u._id !== user._id
                )
                .map((filteredUser) => (
                  <div
                    key={filteredUser._id}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                      selectedUserId.has(filteredUser._id)
                        ? "bg-indigo-200"
                        : "hover:bg-slate-100"
                    }`}
                    onClick={() => handleUserClick(filteredUser._id)}
                  >
                    <div className="bg-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-full">
                      <i className="ri-user-fill"></i>
                    </div>
                    <span>{filteredUser.email}</span>
                  </div>
                ))}
            </div>
            <button
              onClick={addCollaborators}
              className="w-full py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-800 transition"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
