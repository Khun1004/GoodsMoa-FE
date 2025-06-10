import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeImage from '../../assets/welcome1.png';
import "./Login.css";

const Login = ({ setUser, setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email.");
      return;
    }
  
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
  
    const mockUserData = {
      name: "사용자",
      email,
      profileImage: null,
    };
  
    // 사용자 데이터 상태 및 localStorage에 저장
    setUser(mockUserData);
    localStorage.setItem("profileName", mockUserData.name);
    localStorage.setItem("profileImage", mockUserData.profileImage || "");
    localStorage.setItem("isLoggedIn", true);
    
    setIsLoggedIn(true);
    navigate("/");
  };
  

  return (
    <div className="login-overlay">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Login</h2>
          <div className="welcome-image">
            <img src={WelcomeImage} alt="WelcomeImage" className="mx-auto" />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Login
          </button>
          <div className="forgot-password">
            <a href="#">Forgot password?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
