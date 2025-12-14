import { useState } from 'react'
import './Signup.css'

function App() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [mode, setMode] = useState("signup");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    if (mode === "signup" && form.password !== form.confirmPassword) {
        setStatus("error");
        setErrorMessage("Passwords do not match");
        return;
    }

    try {
      const response = await fetch("http://localhost:8000/signup", {
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
            username: form.username,
            password: form.password,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Unable to create user");
      }

      const data = await response.json();
      console.log("Account Created:", data);

      setStatus("success");
      setForm({username: "", password: "", confirmPassword: ""});
    }
    catch(error) {
      console.error(error);
      setStatus("error");
      setErrorMessage(error.message);
    }
  };

  return (
  <div className="page">
    <header className="topBar">
      <div className="brand">
        <span className="brandMain">PeerCritic</span>
      </div>

      <nav className="navLinks">
        <button className="navLink">Movies</button>
        <button className="navLink">TV Shows</button>
        <button className="navLink">Music</button>
        <button className="navLink">Discussion</button>
        <button className="navLink navLinkActive">Home</button>
      </nav>

      <div className="topBarRight">
        <div className="searchBox">
          <input
          type="text"
          placeholder="Search"
          className="searchInput"
          />
        </div>
        <button className="loginChip">LOGIN/SIGNUP</button>
      </div>
    </header>

    <main className="authMain">
      <div className="card">
        
        <div className="authTabs">
            <button className={`authTab ${mode === "login" ? "activeTab" : ""}`}
            onClick={() => {setMode("login"); setStatus("idle"); setErrorMessage(""); setForm({ username: "", password: "", confirmPassword: ""});
            }} >LOGIN</button>

            <button className={`authTab ${mode === "signup" ? "activeTab" : ""}`}
            onClick={() => {setMode("signup"); setForm({ username: "", password: "", confirmPassword: ""});

            }} >SIGNUP</button>
        </div>

        <form onSubmit={handleSubmit} className="form">
            {mode === "signup" && (
            <p className="muted">Create a PeerCritic account.</p>
            )}

          <label className="field">
            <span>Username</span>
            <input
            type ="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            />
          </label>
          
          <label className="field">
            <span>Password</span>
            <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            />
          </label>

        {mode === "signup" && (
            <label className="field">
            <span>Confirm Password</span>
            <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            />
          </label>
        )}

          <button className="btn" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Processing..." : mode === "signup" ? "Sign up" : "Login"}
          </button>
        </form>

        {status === "success" && (
          <p className="success">Account created successfully</p>
        )}
        {status === "error" &&(
          <p className="error">Error: {errorMessage}</p>
        )}
      </div>
    </main>
  </div>
  )
}

export default App
