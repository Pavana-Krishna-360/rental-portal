import { useEffect, useState } from "react";
import axios from "axios";

function LandlordDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch complaints and unapproved tenants
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsRes, tenantsRes] = await Promise.all([
          axios.get("https://rental-portal-backend-98q1.onrender.com/api/complaints", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://rental-portal-backend-98q1.onrender.com/api/auth/unapproved", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setComplaints(complaintsRes.data);
        setTenants(tenantsRes.data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load data. Please refresh.");
      }
    };

    fetchData();
  }, [token]);

  // Approve tenant
  const approveTenant = async (id) => {
    try {
      await axios.put(
        `https://rental-portal-backend-98q1.onrender.com/api/auth/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Tenant approved successfully ✅");
      setTenants((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setMessage("Error approving tenant ❌");
    }
  };

  // Reject tenant
  const rejectTenant = async (id) => {
    try {
      await axios.delete(
        `https://rental-portal-backend-98q1.onrender.com/api/auth/reject/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Tenant rejected ❌");
      setTenants((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setMessage("Error rejecting tenant");
    }
  };

  // Update complaint status
  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `https://rental-portal-backend-98q1.onrender.com/api/complaints/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status } : c))
      );
      setMessage(`Complaint marked as "${status}" ✅`);
    } catch (err) {
      console.error("Failed to update status", err);
      setMessage("Error updating complaint status ❌");
    }
  };

  // Logout
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Landlord Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {message && (
        <p className="text-green-400 mb-4 font-semibold transition-all duration-300">
          {message}
        </p>
      )}

      {/* Pending Tenant Approvals */}
      <h2 className="text-2xl mb-2 font-semibold">Pending Tenant Approvals</h2>
      {tenants.length === 0 ? (
        <p className="text-gray-400 mb-6">No pending tenants</p>
      ) : (
        <div className="mb-6 space-y-3">
          {tenants.map((tenant) => (
            <div
              key={tenant._id}
              className="flex justify-between bg-gray-800 p-3 rounded"
            >
              <div>
                <p className="font-semibold">{tenant.name}</p>
                <p className="text-gray-400">{tenant.email}</p>
              </div>
              <div>
                <button
                  onClick={() => approveTenant(tenant._id)}
                  className="bg-green-600 px-3 py-1 rounded hover:bg-green-700 mr-2"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectTenant(tenant._id)}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaints Section */}
      <h2 className="text-2xl mb-2 font-semibold">All Complaints</h2>
      {complaints.length === 0 ? (
        <p className="text-gray-400">No complaints yet</p>
      ) : (
        complaints.map((c) => (
          <div
            key={c._id}
            className="bg-gray-800 p-4 rounded mb-3 border border-gray-700"
          >
            <p>
              <strong>Tenant:</strong> {c.tenant?.name} ({c.tenant?.email})
            </p>
            <p>
              <strong>Property:</strong> {c.propertyName}
            </p>
            <p>
              <strong>Issue:</strong> {c.issue}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`${
                  c.status === "Resolved"
                    ? "text-green-400"
                    : c.status === "In Progress"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {c.status}
              </span>
            </p>

            {/* Status Buttons or “Resolved” message */}
        {c.status !== "Resolved" ? (
          <div className="flex gap-2 mt-3">
        <button
      onClick={() => updateStatus(c._id, "In Progress")}
      className="bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-700"
    >
      In Progress
    </button>
    <button
      onClick={() => updateStatus(c._id, "Resolved")}
      className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
    >
      Resolved
    </button>
  </div>
) : (
  <p className="text-green-400 font-semibold mt-3">
    Complaint Resolved ✅
  </p>
          )}
          </div>
        ))
      )}
    </div>
  );
}

export default LandlordDashboard;
