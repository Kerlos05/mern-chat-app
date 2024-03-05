import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [login, setLogin] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  

  return (
    <AppContext.Provider
      value={{
        login, 
        username,
        setLogin,
        setUsername,
        selectedUser, 
        setSelectedUser, 
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
