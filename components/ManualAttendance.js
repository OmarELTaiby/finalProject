import React, { useState } from 'react';
import axios from 'axios';

const ManualAttendance = () => {
  const [userId, setUserId] = useState('');
  const [className, setClassName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/attendance/add', {
        userId,
        className,
        method: 'manual',
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Error recording attendance');
    }
  };

  return (
    <div>
      <h2>Manual Attendance</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Class Name"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ManualAttendance;
