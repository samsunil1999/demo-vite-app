import React, { useState, useRef, useEffect } from 'react';
import './App.css';


const App = () => {
  const [file, setFile] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [outputMessages, setOutputMessages] = useState([])
  const [disableSentBtn, setDisableSentBtn] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleFileChange = (e) => {
    const chosenFile = Array.from(e.target.files);
    setFile(chosenFile);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setDisableSentBtn(true)
      setMessages([...messages, message]);
      setMessage('');
      setTimeout(() => {
        fetch("./data/data.json")
          .then((res) => {
            return res.json()
          })
          .then(data => {
            setOutputMessages([...outputMessages, data.response])
          }
          )
          .catch((err) => {
            console.log(err)
          })

        setDisableSentBtn(false)

      }, 2000)
    }
  };

  const handleUploadFile = () => {
    if (file.length == 0) {
      return
    }

    for (let f of uploadedFiles) {
      if (f.name === file[0].name) {
        alert(`File ${f.name} is already uploaded`);
        return
      }
    }

    setFile([]);
    setUploadedFiles([...uploadedFiles, file[0]])
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleEndChat = () => {
    // Clearing all states
    setFile([])
    setUploadedFiles([])
    setMessages([])
    setOutputMessages([])
    setSelectedFile(null)
  }

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, outputMessages]);

  return (
    <div className="container">
      <div className="left">
        <h2>Upload Files</h2>
        <input
          type="file"
          id="choose-file-input"
          onChange={handleFileChange}
          ref={fileInputRef}
          accept=".pdf, .doc, .csv, .xlsx, .xls"
        />
        <button onClick={handleUploadFile}>Upload</button>
        <div className="file-list">
          <h2>Uploaded Files:</h2>
          {uploadedFiles.length > 0 && <div className="files">
            {uploadedFiles.map((f) => (
              <div
                className={`uploaded-file ${selectedFile && selectedFile.name === f.name ? 'selected' : ''}`}
                key={f.name}
                onClick={() => handleFileSelect(f)}
              >
                <p>{f.name}</p>
              </div>
            ))}
          </div>}

        </div>
        <div className=""></div>
      </div>
      <div className="right">
        <div className="header">
          <h2>Chat</h2>
          <button onClick={handleEndChat}>End Chat</button>
        </div>
        <div className="messages">
          {messages.map((msg, index) => (
            <React.Fragment key={index}>
              <div className="message">{msg}</div>
              <div className="output-message">{outputMessages[index]}</div>
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Select an uploaded file and type your message..."
          />
          <button disabled={disableSentBtn || selectedFile === null} onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default App;
