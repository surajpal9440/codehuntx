// src/pages/AuthSuccess.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract token from URL: ?token=ey...
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token); // Save token to local storage
      // Optional: if you have a user context/dispatch, update it here
      navigate('/dashboard'); // Send user to dashboard
    } else {
      navigate('/login'); // Something went wrong, go back to login
    }
  }, [navigate, location]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg"></span>
        <p>Completing login, please wait...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;