import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  const handleSignin = (e) => {
    e.preventDefault();
    // Simulate authentication and store user information
    const user = { name: username };
    localStorage.setItem('user', JSON.stringify(user));
    // Redirect to the Login (or Dashboard) page after signing in
    navigate('/login', { replace: true });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <form onSubmit={handleSignin}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="p-2 mt-4 border rounded"
          required
        />
        <button type="submit" className="p-2 mt-4 text-white bg-blue-500 rounded">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Signin;
