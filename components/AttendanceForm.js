import React, { useState } from 'react';

const AttendanceForm = () => {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState('Present');  // Default to 'Present'

  const handleSubmit = async (e) => {
    e.preventDefault();

    const attendanceData = {
      studentName,
      studentId,
      status,
    };

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Attendance saved:', result);
      } else {
        console.error('Error saving attendance:', result.message);
      }
    } catch (err) {
      console.error('Error saving attendance:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Student Name"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        required
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
      </select>
      <button type="submit">Submit Attendance</button>
    </form>
  );
};

export default AttendanceForm;
