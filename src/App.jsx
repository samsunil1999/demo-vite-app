import React, { useState } from 'react';
import './App.css';


const App = () => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [outputMessages, setOutputMessages] = useState([])

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length == 0) {
      return
    }
    const updatedFiles = selectedFiles[0]
    setFiles([...files, updatedFiles]);
  };

  console.log(files)
  
  const handleSendMessage = (e) => {
    if (message.trim()) {
      setMessages([...messages, message]);
      fetch("./data/data.json")
      .then((res) => {
        return res.json()
      })
      .then(data => {
        // setChatOutput(data.response)
        console.log(data.response)
        setOutputMessages([...outputMessages, data.response])
      }
    )

      setMessage('');
    }
  };

  return (
    <div className="container">
      <div className="left">
        <h2>Upload Files</h2>
        <input type="file" multiple onChange={handleFileChange} />
        <div className="file-list">
          <h3>Uploaded Files:</h3>
          <ul>
            {files.map((file) => (
              
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        </div>
        <button onClick={handleSendMessage}>Upload</button>
      </div>
      <div className="right">
        <h2>Chat</h2>
        <div className="messages">
          {messages.map((msg, index) => (
            <>
            <div key={index} className="message">{msg}</div>
            <div className="output-message">{outputMessages[index]}</div>
            </>
          ))}
          
        </div>
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default App;
