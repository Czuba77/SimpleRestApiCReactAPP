import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (passwordHash.length < 9) {
      setErrorMsg("Password must have at least 9 characters.");
      return;
    }

    if (passwordHash !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      await axiosInstance.post("/auth/register", {
        id: 0,
        email: email,
        passwordHash: passwordHash
      });

      setSuccessMsg("Account created. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      if (!error?.response) {
        setErrorMsg(`Network error: Could not reach API. URL might be wrong or CORS blocked it.`);
        return;
      }

      const status = error.response.status;
      const data = error.response.data;

      console.error("REGISTER ERROR:", status, data);

      if (typeof data === "string") {
        setErrorMsg(data);
      } else if (data?.title) {
        setErrorMsg(data.title);
      } else if (data?.errors) {
        const flat = Object.values(data.errors).flat().join(" ");
        setErrorMsg(flat || "Validation failed.");
      } else if (data?.message) {
        setErrorMsg(data.message);
      } else {
        setErrorMsg(`Registration failed (HTTP ${status}).`);
      }
    }
  };

  return (
    <div style={{ maxWidth: "320px", padding: "20px", background: "#fff", borderRadius: "5px" }}>
      <h2>Register</h2>

      {errorMsg && <div style={{ color: "red", marginBottom: "10px" }}>{errorMsg}</div>}
      {successMsg && <div style={{ color: "green", marginBottom: "10px" }}>{successMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>E-mail: </label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Password: </label><br />
          <input
            type="password"
            value={passwordHash}
            onChange={(e) => setPasswordHash(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Confirm password: </label><br />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" style={{ padding: "8px 15px", marginTop: "10px" }}>
          Create account
        </button>
      </form>

      <p style={{ marginTop: "10px" }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}