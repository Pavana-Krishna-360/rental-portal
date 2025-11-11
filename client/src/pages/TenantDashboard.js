import { useState, useEffect } from "react";
import API from "../utils/api";

export default function TenantDashboard() {
  const [propertyName, setPropertyName] = useState("");
  const [issue, setIssue] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [msg, setMsg] = useState("");

  // Fetch complaints on load
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints/my");
      setComplaints(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    try {
      await API.post("/complaints", { propertyName, issue });
      setMsg("✅ Complaint Submitted");
      setPropertyName("");
      setIssue("");
      fetchComplaints();
    } catch (error) {
      setMsg("❌ Error submitting complaint");
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tenant Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="bg-gray-800 p-5 rounded-lg mb-6">
        <h2 className="text-xl mb-3 font-semibold">Submit a Complaint</h2>
        {msg && <div className="text-yellow-300 mb-2">{msg}</div>}

        <form onSubmit={submitComplaint} className="space-y-3">
          <input
            className="bg-gray-700 px-4 py-2 rounded w-full"
            placeholder="Property Name"
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
            required
          />

          <input
            className="bg-gray-700 px-4 py-2 rounded w-full"
            placeholder="Issue description"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            required
          />

          <button className="bg-blue-600 px-4 py-2 rounded w-full font-bold">
            Submit
          </button>
        </form>
      </div>

      <h2 className="text-xl font-bold mb-2">My Complaints</h2>
      <div className="space-y-2">
        {complaints.map((c) => (
          <div key={c._id} className="bg-gray-800 p-4 rounded">
            <p><b>Property:</b> {c.propertyName}</p>
            <p><b>Issue:</b> {c.issue}</p>
            <p><b>Status:</b> {c.status}</p>
            <p className="text-sm text-gray-400">
              {new Date(c.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
