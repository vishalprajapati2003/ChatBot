// import React, { createContext, useState, useContext } from 'react';

// // Create the UserContext
// export const UserContext = createContext();

// // Create a provider component
// export const UserProvider = ({ children }) => {
//     const [ user, setUser ] = useState(null);

//     return (
//         <UserContext.Provider value={{ user, setUser }}>
//             {children}
//         </UserContext.Provider>
//     );
// };

// context/user.context.jsx
import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(
      sessionStorage.getItem("user") || localStorage.getItem("user")
    );
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
