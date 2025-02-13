import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Chatbot from './Chatbot';
import LandingPage from './LandingPage'; // Landing page with Hero and About sections
import DashboardPage from './DashboardPage';
import Login from './Login';       // Component for login (protected route or post-login view)
import Signin from './Signin';     // Component for sign-in (user not yet authenticated)
import CartPage from './CartPage';
import AboutPage from './AboutPage';

const App = () => {
  const [visible, setVisible] = useState(false); // State to control chatbot visibility

  return (
    <Router>
      {/* Render the Navbar */}
      <Navbar />

      {/* Main content with padding for fixed Navbar */}
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>

      {/* Render the Chatbot component */}
      <Chatbot visible={visible} setVisible={setVisible} />
    </Router>
  );
};

export default App;
