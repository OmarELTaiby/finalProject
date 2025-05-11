import React from "react";

const Chatbot = () => (
  <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
    <iframe
      allow="microphone;"
      width="350"
      height="430"
      src=<iframe height="430" width="350" src="https://bot.dialogflow.com/49bb7de4-a3b0-4fb7-b54f-872c196fcf5e"></iframe>
      style={{ border: "none" }}
      title="Chatbot"
    ></iframe>
  </div>
);

export default Chatbot;
