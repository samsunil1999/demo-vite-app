import React, { useState, useRef, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import './App.css';

// TODO: input text of choose file removal using useRef

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
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [messageLoadingIndex, setMessageLoadingIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isInitialLoading) {
      listFiles();
      setIsInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    if(uploadedFiles.length === 1) {
      setDisableSentBtn(false)
      setDisableUploadBtn(true);
    } else {
      setDisableSentBtn(true)
      setDisableUploadBtn(false);
    }  
  }, [uploadedFiles])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, outputMessages]);

  const listFiles = () => {
    setLoading(true);
    fetch('http://34.198.177.67:5000/list', {
      method: 'GET',
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Network response was not ok');
        }
        return resp.json()
      })
      .then((data) => {
        console.log(data)
        setUploadedFiles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Err: ", err)
      })
  }

  const deleteFiles = () => {
    fetch('http://34.198.177.67:5000/end_chat', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadedFiles),
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('Network response was not ok');
        }
        return resp.json()
      })
      .then((data) => {
        console.log(data)
        setUploadedFiles([])
      })
      .catch((err) => {
        console.log("Err: ", err)
      })
  }

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
      const currentIndex = messages.length;
      setMessages([...messages, message]);
      setMessageLoadingIndex(currentIndex);
      const urlParams = new URLSearchParams({
        searchText: message,
        // fileName: selectedFile.fileName,
        // knowledgeBaseId: selectedFile.knowledgeBaseId,
        fileName: uploadedFiles[0].fileName,
        knowledgeBaseId: uploadedFiles[0].knowledgeBaseId,
      });

      setMessage('');

      fetch(`http://34.198.177.67:5000/chat?${urlParams.toString()}`)
        .then((res) => {
          return res.json()
        })
        .then((data) => {
          // setOutputMessages([...outputMessages, data.message])
          setOutputMessages((prevOutputMessages) => {
            const newOutputMessages = [...prevOutputMessages];
            newOutputMessages[currentIndex] = data.message;
            return newOutputMessages;
          });
          setMessageLoadingIndex(null);
        }
        )
        .catch((err) => {
          console.log(err)
        })

      setDisableSentBtn(false)

    }
  };

  const handleUploadFile = () => {
    if (file.length == 0) {
      alert('Upload a file')
      return
    }

    for (let f of uploadedFiles) {
      if (f.fileName === file[0].name) {
        alert(`File ${f.name} is already uploaded`);
        return
      }
    }
    setDisableUploadBtn(true);
    setLoading(true);

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
      .then(() => {
        setFile([]);
        alert('Upload Successful');
        listFiles();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      })
      .catch((err) => {
        console.log("Error : ", err);
      })
      .finally(() => {
        setLoading(false);
      })
  };

  // const handleFileSelect = (file) => {
  //   setSelectedFile(file);
  // };

  const handleEndChat = () => {
    // Clearing all states
    setFile([])
    setUploadedFiles([])
    setMessages([])
    setOutputMessages([])
    setSelectedFile(null)
    setChatEnded(true)
    deleteFiles()
    setDisableUploadBtn(false)
  }

  return (
    <div className="container">
      <div className="left">
        <h2>Upload Files</h2>
        <div className='d-flex'>
          <input
            type="file"
            id="choose-file-input"
            onChange={handleFileChange}
            ref={fileInputRef}
            accept=".pdf, .doc, .csv, .xlsx, .xls"
          />
          <button className='upload-button' disabled={disableUploadBtn} onClick={handleUploadFile}>Upload</button>
        </div>
        <div className="file-list">
          <h2>Uploaded Files:</h2>
          {loading ?
            <div className="loader">
              <ClipLoader size={50} color={"#123abc"} loading={loading} />
            </div>
            :
            <div className="result">
              {uploadedFiles.length > 0 && !loading ? <div className="files">
                {uploadedFiles.map((f) => (
                  <div
                    // className={`uploaded-file ${selectedFile && selectedFile.fileName === f.fileName ? 'selected' : ''}`}
                    className={`uploaded-file`}
                    key={f.dataSourceId}
                    // onClick={() => handleFileSelect(f)}
                  >
                    <p>{f.fileName}</p>
                  </div>
                ))}
              </div> : <div className="no-files"><span>No files Uploaded</span></div>}
            </div>
          }

        </div>
      </div>

      <div className="right">

        <div className="header">
          <h2>Chat</h2>
          <button className={`${messages.length > 0 ? '' : 'hide'}`} onClick={handleEndChat}>End Chat</button>
        </div>

        <div className="messages">
          {chatEnded && <div className="chat-end-msg"><span>This chat has been ended</span></div>}
          {messages.map((msg, index) => (
            <React.Fragment key={msg}>
              <div className="message">{msg}</div>
              {messageLoadingIndex === index ?
                <div className="loader">
                  <ClipLoader size={50} color={"#123abc"} loading={true} />
                </div>
                : <div className="output-message">{outputMessages[index]}</div>}
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
          <button disabled={disableSentBtn /*selectedFile === null*/} onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default App;
