import { useState } from 'react';
import axios from 'axios';

export default function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

const handleSend = async () => {
  const userMessage = { sender: 'user', text: input };
  setMessages([...messages, userMessage]);
  setInput('');

  try {
    const response = await axios.post('/api/chat', { message: input });
    const botReply = { sender: 'bot', text: response.data.reply };
    setMessages(prev => [...prev, botReply]);
  } catch (err) {
    setMessages(prev => [...prev, { sender: 'bot', text: "Error: Cannot connect to AI." }]);
    console.error(err);
  }
};


  return (
    <div style={{ border: '1px solid #ccc', padding: 10, width: 300, position: 'fixed', bottom: 20, right: 20, background: 'white', zIndex: 1000 }}>
      <h3>AI Chatbot</h3>
      <div style={{ height: 200, overflowY: 'auto', marginBottom: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <b>{msg.sender}:</b> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        style={{ width: '75%' }}
      />
      <button onClick={handleSend} style={{ width: '20%', marginLeft: '5%' }}>Send</button>
    </div>
  );
}
