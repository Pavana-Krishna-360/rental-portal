import { useState } from "react";
import API from "../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      setMsg("✅ Login successful!");
      setTimeout(() => {
        if (res.data.user.role === "tenant") {
          window.location.href = "/tenant";
        } else {
          window.location.href = "/landlord";
        }
      }, 800);
    } catch (err) {
      setMsg("❌ Invalid login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 px-4">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Rental Portal Login
        </h2>
        {msg && <p className="text-center text-yellow-300 mb-2">{msg}</p>}
        <form onSubmit={handleLogin}>
          <input
            className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-bold">
            Login
          </button>
              <p className="text-gray-400">
               New Tenant?{" "}
             <a href="/signup"className="text-blue-400 hover:underline" >Sign up here</a>
             </p>
        </form>
      </div>
    </div>
  );
}
