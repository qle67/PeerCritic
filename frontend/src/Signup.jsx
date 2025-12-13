import { useState } from 'react'
import './Signup.css'

function App() {
  const [form, setForm] = useState({
    username: "",
    email: "",
  });

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:8000/users/", {
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify(form),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Unable to create user");
      }

      const data = await response.json();
      console.log("Account Created:", data);

      setStatus("success");
      setForm({username: "", email: ""});
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
        <h1>Welcome</h1>
        <p className="muted">
          create a PeerCritic account.
        </p>
        <form onSubmit={handleSubmit} className="form">
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
            <span>Email</span>
            <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            />
          </label>

          <button className="btn" type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Creating..." : "Sign up"}
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
