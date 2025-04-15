// import React, { useContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { UserContext } from "../context/user.context";

// const UserAuth = ({ children }) => {
//   const { user } = useContext(UserContext);
//   const [loading, setLoading] = useState(true);
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (user) {
//       setLoading(false);
//     }

//     if (!token) {
//       navigate("/login");
//     }

//     // if (!user) {
//     //   navigate("/login");
//     // }
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return <>{children}</>;
// };

// export default UserAuth;

// auth/UserAuth.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";

const UserAuth = ({ children }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const sessionUser = sessionStorage.getItem("user");   
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && user) {
      setLoading(false);
    } else if (!token || !sessionUser) {
      navigate("/login");
    }
  }, [token, user, navigate]);

  if (!token) return null; // prevent flicker

  if (loading) return <div>Loading...</div>;

  return <>{children}</>;
};

export default UserAuth;
