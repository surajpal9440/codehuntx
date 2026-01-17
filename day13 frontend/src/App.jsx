import {Routes,Route } from "react-router"
import Login from "./pages/Login"
import Signup from "./pages/signup"
import Homepage from "./pages/Homepage"
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authslice";
import { useEffect } from "react";
import { Navigate } from "react-router";
import AdminPanel from "./components/Adminpanel"
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin";
import AdminDelete from "./components/AdminDelete";
import AuthSuccess from "./pages/AuthSuccess";
import LoginSuccess from "./components/LoginSuccess";
import AdminVideo from "./components/AdminVideo";
import AdminUpload from "./components/AdminUpload";

function App() {

    const dispatch = useDispatch();
    const {isAuthenticated,user,loading} = useSelector((state)=>state.auth);
  
    // check initial authentication
    useEffect(() => {
      dispatch(checkAuth());
    }, [dispatch]);
    
    if (loading) {
      return <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>;
    }
  return(
    <>
      <Routes>
        <Route path="/" element={<Homepage></Homepage>}></Route>
        <Route path="/login" element={<Login></Login>}></Route>
        <Route path="/signup" element={<Signup></Signup>}></Route>
        {/* <Route path="/admin" element={<AdminPanel />} />  */}
        {/*upper wali line pehle without authentication ka kiya tha direct adminpanel me jarra tha */}
        <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
        <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
        <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
        <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
        <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
        {/* for google auth */}
        <Route path="/auth/success" element={<AuthSuccess />} />
        // Inside your App.jsx Routes
        <Route path="/login-success" element={<LoginSuccess />} />    
      </Routes>
    </>
  )
}

export default App
