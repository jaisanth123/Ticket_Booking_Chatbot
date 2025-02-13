import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Simulate checking for an authenticated user
  useEffect(() => {
    // For example, check localStorage for a stored user object
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
      // If there's no user, redirect to the signin page
      navigate('/signin', { replace: true });
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  // While checking authentication (or if redirecting), you might want to show nothing or a loader
  if (!user) {
    return null;
  }

  // If a user exists, render the protected content
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
      <p>You are now logged in.</p>
      {/* Additional login content here */}
    </div>
  );
};

export default Login;
