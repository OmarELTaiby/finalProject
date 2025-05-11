import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username: form.username.trim(),
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginTop: "5px",
    fontSize: "16px"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#blue",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s ease"
  };

  const secondaryButtonStyle = {
    marginTop: "15px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    width: "100%",
    cursor: "pointer",
    fontSize: "15px"
  };

  return (
    <div style={{
      maxWidth: "400px",
      margin: "auto",
      marginTop: "60px",
      padding: "30px",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "10px", color: "#333" ,border:"4px solid ",backgroundColor:"white"}}>
  Welcome to AIU Attendance System
</h1>

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="username" style={{ fontWeight: "bold", fontSize: "14px" }}>Username</label>
          <input
            id="username"
            name="username"
            placeholder="Enter username"
            value={form.username}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="password" style={{ fontWeight: "bold", fontSize: "14px" }}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </form>
      <button
        type="button"
        onClick={() => navigate("/register")}
        style={secondaryButtonStyle}
      >
        Don't have an account? Register
      </button>
    </div>
  );
}

export default Login;