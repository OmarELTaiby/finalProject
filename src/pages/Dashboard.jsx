import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./Dashboard.css";
import { FaComments } from "react-icons/fa"; // install react-icons if not already
import Chatbot from '../pages/Chatbot';


const Dashboard = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [manualClass, setManualClass] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("present");
  const [formUrl, setFormUrl] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchId, setSearchId] = useState("");
  const qrCodeRef = useRef(null);
  const scannerContainerRef = useRef(null);
  const scannerInstance = useRef(null);
  const [editStudent, setEditStudent] = useState(null); // State for editing student
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("classes")) || [];
    setClasses(stored);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const addClass = (e) => {
    e.preventDefault();
    const name = e.target["class-name"].value;
    const code = e.target["class-code"].value;
    const schedule = e.target["class-schedule"].value;
    const newClass = { name, code, schedule };
    const updatedClasses = [...classes, newClass];
    localStorage.setItem("classes", JSON.stringify(updatedClasses));
    setClasses(updatedClasses);
    e.target.reset();
  };

  const generateQRCode = () => {
    if (!formUrl.trim()) return;
    QRCode.toCanvas(formUrl, { width: 200 }, (err, canvas) => {
      if (err) return console.error(err);
      qrCodeRef.current.innerHTML = "";
      qrCodeRef.current.appendChild(canvas);
    });
  };

  const fetchAttendance = async () => {
    try {
      const url = selectedClass
        ? `http://localhost:5000/api/attendance?className=${encodeURIComponent(selectedClass)}`
        : `http://localhost:5000/api/attendance`;

      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setAttendanceData(data);
      else setAttendanceData([]);
    } catch (err) {
      console.error("Fetch failed:", err);
      setAttendanceData([]);
    }
  };

  const postAttendance = async ({ userId, userName, className, method }) => {
    try {
      const res = await fetch("http://localhost:5000/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName, className, method }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Attendance marked");
        fetchAttendance(); // refresh
      } else {
        alert(data.message || "Failed to mark attendance");
      }
    } catch (err) {
      console.error("POST error:", err);
    }
  };

  const addManualAttendance = async (e) => {
    e.preventDefault();
    await postAttendance({
      userId: studentId,
      userName: studentName,
      className: manualClass,
      method: attendanceStatus,
    });
    e.target.reset();
  };

  const startQRScanner = () => {
    if (!selectedClass) {
      alert("Please select a class before scanning.");
      return;
    }

    if (scannerInstance.current) {
      scannerInstance.current.clear();
      scannerInstance.current = null;
    }

    scannerInstance.current = new Html5QrcodeScanner("scanner-container", {
      fps: 10,
      qrbox: 250,
    });

    scannerInstance.current.render(
      async (decodedText) => {
        const scannedId = decodedText.trim();
        await postAttendance({
          userId: scannedId,
          userName: "QR Student",
          className: selectedClass,
          method: "present",
        });
      },
      (err) => console.warn(err)
    );
  };

  const searchStudent = () => {
    return attendanceData.filter((a) =>
      a.userId?.toLowerCase().includes(searchId.toLowerCase())
    );
  };

  const handleEditClick = (student) => {
    setEditStudent(student);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (editStudent) {
      try {
        const res = await fetch(`http://localhost:5000/api/attendance/${editStudent._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: editStudent.userId,
            userName: studentName || editStudent.userName,
            className: editStudent.className,
            method: attendanceStatus || editStudent.method,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          alert("Student details updated");
          fetchAttendance(); // Refresh attendance data
          setEditStudent(null); // Close the edit form
        } else {
          const data = await res.json();
          alert(data.message || "Failed to update student details");
        }
      } catch (err) {
        console.error("Error updating student:", err);
        alert("Failed to update student details");
      }
    }
  };

  // Function to calculate the total absences for a student in a specific class
  const calculateTotalAbsences = (studentId, className) => {
    const totalAbsences = attendanceData.filter(
      (record) => record.userId === studentId && record.method === "absent" && record.className === className
    ).length;
    return totalAbsences;
  };

  return (
    <>
      <header>
        <div className="logo-container">
          <img src="/AIU_New_Logo.png" alt="Logo" className="logo-img" />
          <span className="logo-text">Instructor Dashboard</span>
        </div>
        <nav>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </nav>
      </header>

      <main>
        <div className="dashboard-container">
          {/* Add Class */}
          <div className="card">
            <h2>Add a New Class</h2>
            <form onSubmit={addClass}>
              <input type="text" name="class-name" placeholder="Class Name" required />
              <input type="text" name="class-code" placeholder="Class Code" required />
              <input type="time" name="class-schedule" required />
              <button type="submit" className="primary-btn">➕ Add Class</button>
            </form>
          </div>

          {/* Add Student Manually */}
          <div className="card">
            <h2>Add Student Manually</h2>
            <form onSubmit={addManualAttendance}>
              <input
                type="text"
                placeholder="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Class Name"
                value={manualClass}
                onChange={(e) => setManualClass(e.target.value)}
                required
              />
              <select
                value={attendanceStatus}
                onChange={(e) => setAttendanceStatus(e.target.value)}
                required
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
              <button type="submit" className="primary-btn">Add Student</button>
            </form>
          </div>

          {/* View Attendance */}
          <div className="card">
            <h2>View Students Attendance</h2>
            <select onChange={(e) => setSelectedClass(e.target.value)} value={selectedClass}>
              <option value="">Select Class</option>
              {classes.map((cls, i) => (
                <option key={i} value={cls.name}>{cls.name}</option>
              ))}
            </select>
            <button onClick={fetchAttendance}>Show Attendance</button>
            <input
              type="text"
              placeholder="Search by Student ID"
              onInput={(e) => setSearchId(e.target.value)}
            />
            <table id="attendance-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Attendance Date</th>
                  <th>Status</th>
                  <th>Class</th>
                  <th>Total Absences</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {searchStudent().map((record, i) => {
                  const totalAbsences = calculateTotalAbsences(record.userId, record.className); // Pass class name
                  return (
                    <tr key={i}>
                      <td>{record.userId}</td>
                      <td>{record.userName || "-"}</td>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.method}</td>
                      <td>{record.className}</td>
                      <td>{totalAbsences}</td> {/* Show total absences per class */}
                      <td>
                        <button onClick={() => handleEditClick(record)}>Edit</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Edit Student Modal */}
          {editStudent && (
            <div className="modal">
              <h2>Edit Student Details</h2>
              <form onSubmit={handleEditSubmit}>
                <label>Student ID</label>
                <input
                  type="text"
                  value={editStudent.userId}
                  readOnly
                />
                <label>Student Name</label>
                <input
                  type="text"
                  value={studentName || editStudent.userName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
                <label>Attendance Status</label>
                <select
                  value={attendanceStatus || editStudent.method}
                  onChange={(e) => setAttendanceStatus(e.target.value)}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
                <label>Absence Count</label>
                <input
                  type="number"
                  value={calculateTotalAbsences(editStudent.userId, editStudent.className) || 0} // Pass class name
                  disabled
                />
                <button type="submit">Update Details</button>
                <button type="button" onClick={() => setEditStudent(null)}>Cancel</button>
              </form>
            </div>
          )}

          {/* QR Code Scanner */}
          <div className="card">
            <h2>Scan QR Code</h2>
            <label>Select Class for QR Attendance</label>
            <select required onChange={(e) => setSelectedClass(e.target.value)} value={selectedClass}>
              <option value="">Select Class</option>
              {classes.map((cls, i) => (
                <option key={i} value={cls.name}>{cls.name}</option>
              ))}
            </select>
            <button onClick={startQRScanner} disabled={!selectedClass}>
              Start Scanning
            </button>
            {!selectedClass && <p className="warning-text">Please select a class before scanning.</p>}
            <div id="scanner-container" ref={scannerContainerRef}></div>
            <div ref={qrCodeRef}></div>
          </div>

          {/* QR Code Generation */}
          <div className="card">
            <h2>Generate QR Code</h2>
            <input
              type="text"
              placeholder="Enter form URL"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
            />
            <button onClick={generateQRCode}>Generate QR</button>
            <div ref={qrCodeRef}></div>
          </div>
          {/* Chatbot Toggle Icon */}
<div
  onClick={() => setShowChatbot(!showChatbot)}
  style={{
    position: 'fixed',
    bottom: 20,
    right: 20,
    background: '#007bff',
    color: 'white',
    borderRadius: '50%',
    width: 50,
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 2000,
  }}
  title="Ask AI Chatbot"
>
  <FaComments size={24} />
</div>

{/* Show Chatbot if toggled */}
{showChatbot && <Chatbot />}

        </div>
      </main>
    </>
  );
};

export default Dashboard;
