import { useContext, useEffect,  } from "react";
import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";
import { AppProvider, AppContext } from "./AppContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import { jwtEndPoint } from "./utlis/APIRoutes";
import axios from "axios";
import Settings from "./pages/Settings";

const App = () => {


  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginWrapper />} />
          <Route path="/settings" element={<SettingsWrapper/>} />   
          <Route path="/main" element={<MainWrapper />} /> 
          <Route path="/register" element={<RegisterWrapper />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};


function LoginWrapper() {
  const {setUsername, setLogin} = useContext(AppContext);

  useEffect(() => {
    const checkUser = async() => {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      if(token){
        const response = await axios.post(jwtEndPoint, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if(response.status === 500){
          console.clear(); 
        } else{
          setUsername(username); 
          setLogin(true); 
        }
      }
    }
    checkUser(); 
  }, [])
  const { login } = useContext(AppContext);
  return !login ? <Login /> : <Navigate to="/main" />;
}

function RegisterWrapper() {
  const { login } = useContext(AppContext);
  return !login ? <Register /> : <Navigate to="/register"/>;
}

function SettingsWrapper() {
  const { login } = useContext(AppContext);
  return login ? <Settings /> : <Navigate to="/"/>;
}


function MainWrapper() {
  const { login } = useContext(AppContext);
  return login ? <Main /> : <Navigate to="/"/>;
}


export default App;
