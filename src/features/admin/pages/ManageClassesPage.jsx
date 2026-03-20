import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import classService from "../../../services/classService";
import Loader from "../../../components/layout/Loader";
import toast from "react-hot-toast";
import "../../admin/admin.css";

const ManageClassesPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await classService.getAllClasses();
      if (res.success) {
        setClasses(res.classes);
      }
    } catch (err) {
      setError(err.error || "Failed to load classes");
      toast.error(err.error || "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await classService.createClass({ name: newClassName });
      if (res.success) {
        toast.success("Class added successfully");
        setNewClassName("");
        fetchClasses();
      }
    } catch (err) {
      toast.error(err.error || "Failed to add class");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    
    try {
      const res = await classService.deleteClass(id);
      if (res.success) {
        toast.success("Class deleted successfully");
        fetchClasses();
      }
    } catch (err) {
      toast.error(err.error || "Failed to delete class");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-content">
        <div className="details-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Manage Classes</h2>
          <button onClick={() => navigate("/admin")} className="btn-secondary">
            Back to Dashboard
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="details-card" style={{ padding: '20px', marginBottom: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Add New Class</h3>
          <form onSubmit={handleAddClass} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g. Form 1, Grade 9, Year 7"
              className="form-control"
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={!newClassName.trim() || isSubmitting}
              style={{ padding: '10px 20px', borderRadius: '4px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              {isSubmitting ? "Adding..." : "Add Class"}
            </button>
          </form>
        </div>

        <div className="details-card" style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Current Classes ({classes.length})</h3>
          
          {classes.length === 0 ? (
            <p style={{ marginTop: '15px', color: '#666' }}>No classes currently defined. Add some classes to appear on the booking form.</p>
          ) : (
            <ul style={{ listStyleMode: 'none', padding: 0, marginTop: '15px' }}>
              {classes.map((c) => (
                <li key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>{c.name}</span>
                  <button
                    onClick={() => handleDeleteClass(c._id)}
                    className="btn-action-danger"
                    style={{ padding: '6px 12px', borderRadius: '4px', background: '#dc2626', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageClassesPage;
