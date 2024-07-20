import React, { useState, useRef, useEffect } from 'react';
import './App.css';


const App = () => {
  const [file, setFile] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [outputMessages, setOutputMessages] = useState([]);
  const [disableSentBtn, setDisableSentBtn] = useState(false);
  const [disableUploadBtn, setDisableUploadBtn] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [chatEnded, setChatEnded] = useState(false)

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleFileChange = (e) => {
    const chosenFile = Array.from(e.target.files);
    setFile(chosenFile);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      if (chatEnded) {
        setChatEnded(false)
      }
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
    setDisableUploadBtn(true);

    // Create the formData
    const formData = new FormData();
    formData.append("file", file[0])

    fetch('http://34.198.177.67:5000/upload', {
      method: 'POST',
      body: formData,
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Network response was not ok');
        }
        return resp.json()
      })
      .then((data) => {
        console.log("UPLOAD FILE response: ", data)
        setUploadedFiles([...uploadedFiles, file[0]])
        setFile([]);
        
        setDisableUploadBtn(false);
      })
      .catch((err) => {
        console.log("Error : ", err)
        setDisableUploadBtn(false);
      })
  };
// console.log(file[0][name])
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
    setChatEnded(true)
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
          accept=".pdf, .doc, .csv, .xlsx, .xls"
        />
        <button disabled={disableUploadBtn} onClick={handleUploadFile}>Upload</button>
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
          <button className={`${messages.length > 0 ? '' : 'hide'}`} onClick={handleEndChat}>End Chat</button>
        </div>

        <div className="messages">
          {chatEnded && <div className="chat-end-msg"><span>This chat has been ended</span></div>}
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
