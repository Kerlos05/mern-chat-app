import { useContext, useEffect, useState } from 'react'
import axios from 'axios'; 
import { AppContext } from '../AppContext';
import {  faPaperclip, faPlay, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { messageEndPoint, uploadEndPoint } from '../utlis/APIRoutes';
import JSencrypt from 'jsencrypt'; 
import { Modal, } from 'react-bootstrap';
import "react-toastify/dist/ReactToastify.css";

import io from 'socket.io-client';
import useToast from '../hooks/useToast';
import { ToastContainer } from 'react-toastify';
const newSocket = io('http://localhost:5000');


export default function ChatWindow() {
  const [file, setFile] = useState(''); 
  const [message, setMessage] = useState(''); 
  const [messages, setMessages] = useState([]); 
  const [newFileName, setNewFileName] = useState(''); 
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);


  const { selectedUser, username } = useContext(AppContext);
  const showToast = useToast();

  const [socket, setSocket] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const key = new JSencrypt(); 

  key.setPublicKey(`
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmODPwOt/V5mr8U0LZaZT
    rIKb9gxwZ5apWgaDK6fYy+anbhe52gacLHFfimw+Q2JMAOADQwqR+lSA7i/heP0o
    3+ZGw7sFDa3pvzG/87qs+94cgUay6wpFM5ijbvCNj17OKGdeFfINtYVknMA8bHIy
    i3OaMu0ychGSB1k1i2PXZQ+dznnGWG/9MwBd/ZMXbzjWFKMhYEbgImv43+47XNRh
    5+KWz29ap4gI0QfYGxFsVpmcaxsiS81MbCvPCg7wftogHT3Fy32yJ9YQvzlsYzi0
    bP8or0eCpIVvqvrdDj6A9mvEttTCXK2oiPQNlGNAiejaHAagx6S3/44pStDNKsIB
    5QIDAQAB`
  ); 

  useEffect(() => {
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [setSocket]);

  

  useEffect(() => {
    if (socket && conversationId) {
      socket.on('messageReceived', ({ decryptedMessage, sender }) => {
        const message = decryptedMessage
        setMessages(messages => [...messages, { message, sender }]);
      });

      socket.on('updateUI', () => {
        getMessage(); 
      })

      return () => {
        if (socket) {
          socket.off('messageReceived');
          socket.off('updateUI');
        }
      };
    }
  }, [socket, conversationId]);
  

  
  useEffect(() => {
    if (selectedUser) {
      socket.emit('startConversation', { participants: [username , selectedUser] });

      socket.on('conversationStarted', ({ conversationId }) => {
        getMessage(conversationId)
        setConversationId(conversationId);
      });
    }
    getMessage(); 

  }, [selectedUser]);

  

  const handleDeleteMessage = async(index, messageID) => {
    if(!messageID){
      return ; 
    }

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];
      updatedMessages.splice(index, 1);
      return updatedMessages;
    });

    const response = await axios.post(messageEndPoint, {
      selectedUser: conversationId,
      username: username,
      messageID: messageID,
    });

    if(response.status === 200){
      getMessage(); 
      socket.emit('updateUserUI'); 
    }
  }
  

  function handleReset (reset){
    switch(reset){
      case 'all':{
        setFile('')
        setMessage(''); 
        setNewFileName('')
      } 
      break; 
      case 'file':{
        setFile('')
        setNewFileName(''); 
        handleModal();
      } 
      break; 
      case 'message':{
        setMessage(''); 
      } 
      break; 
      default: return 0; 
    } 
  }


  const handleSubmit = async (e) => {
    e.preventDefault(); 

    if (!message && !file || !conversationId  ) {
      handleReset('all'); 
      return ; 
    } else if(newFileName.length !== 0){
      if(newFileName.length < 4 || newFileName.length > 40 || newFileName === 'localhost:8080'){
        showToast('Filename must be between 4 and 40 characters', 'warning'); 
      }
    }

    let formData = new FormData(); 

    if(newFileName){
      const newFile = new File([file], newFileName, {type: file.type});
      formData.append('file', newFile); 
    } else {
      formData.append('file', file); 
    }
        
    try {
      const encryptedMessage = key.encrypt(message.toString()); 
      
      const response = await axios.post(uploadEndPoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      const fileLink = {
        fileName: response.data.fileName || '',
        fileLink: response.data.fileLink || ''
      };
          
      socket.emit('sendMessage', 
        username,
        conversationId, 
        encryptedMessage || '',
        fileLink
      );
      
      await new Promise(r => setTimeout(r,500)); 

      getMessage()
      handleReset('all'); 
    } catch (error) {
      if (error.response) {
        showToast(error.response.data.error, 'error')
      } else if (error.request) {
        showToast('No response received from the server', 'error')
      } else {
        showToast(error.message, 'error')
      }
    }
  }


  
  const getMessage = async(tempConversationID) =>{
    try {
      const response = await axios.get(messageEndPoint, {
        params: {
          selectedUser: tempConversationID || conversationId,
        },
      });

      Promise.all(
        response.data.map(async item => {
          let message = item.message;
          let localhostIndex = message.indexOf('localhost:8080');

          if (localhostIndex !== -1) {
            let [before, localhostAndAfter] = message.split('localhost');
            let [localhost, ...after] = localhostAndAfter.split(' ');

            const response = await fetch(`http://localhost${localhost} `);
            const blob = await response.blob();
            
            const blobUrl = URL.createObjectURL(blob);

            let newMessage = (
              <span>
                {before}
                <a href={blobUrl} download>localhost{localhost} </a>
                <br />
                {after.join(' ')}
              </span>
            );

            item.message = newMessage;
          }

          return item;
        })
      ).then(newData => {
        setMessages(newData);
      });

    } catch (error) {
      showToast(error, 'error'); 
    }
  }

  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
 
  function handleFile(e) {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setNewFileName(''); 
    }
  }
  

  const handleModal = () => {
    setIsModalVisible(!isModalVisible);
    if(file.name && !newFileName){
      return setNewFileName(file.name);
    }
  };

  return (
    <>
    <ToastContainer />
      <div className="h-100 ps-2">
        <div className="chat-window rounded p-3">
        {(!messages ? [] : messages).map((message, index) => {
          const messageDate = new Date(message.timestamp);
          const isValidDate = !isNaN(messageDate);
          const messageID = message._id; 
          return (
            <div key={index} className='mb-4 position-relative'>
              <strong className='me-1'>
                {(message.sender === username ? 'You' : message.sender) }:
                <span>
                  {isValidDate
                    ? messageDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      })
                    : new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                  })}
                </span>
              </strong>
              <br />
              <p style={{wordBreak: 'break-word', width: '95%'}}>
                {message.message}
              </p>
              <span className='d-flex flex-column position-absolute top-0 end-0'>
                  <button className='btn' onClick={() => handleDeleteMessage(index, messageID)}> 
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 position-relative" >
        <form onSubmit={handleSubmit} className="d-flex">
          <div className='imageName' onClick={handleModal}>
            {windowWidth <= 500 ? '' : (newFileName ? newFileName : file.name || '')}
          </div>
          <Modal show={isModalVisible} onHide={handleModal}>
            <Modal.Header closeButton>
              <Modal.Title>Change file name</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form onSubmit={() => handleModal()}>
                <input 
                  type="text" 
                  name="file_name" 
                  className="form-control p-2" 
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                />
              </form>
              <button onClick={() => handleReset('file')} className='btn btn-danger mt-4 mb-4 w-100 text-center'>Delete file</button>
              <div className='w-100 d-flex justify-content-center modal-footer'>
                <button type="submit" className='btn w-100 ' onClick={handleModal}>Submit</button>
              </div>
            </Modal.Body>
          </Modal>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="form-control w-100"
          />
          <div className="me-2 ms-2 d-flex align-items-center">
            <label htmlFor="file">
              <input
                type="file"
                name=""
                id="file"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e)}
              />
              <FontAwesomeIcon icon={faPaperclip} />
            </label>
          </div>
          <button type="submit" className="btn btn-primary">
            <FontAwesomeIcon icon={faPlay} />
          </button>
        </form>
        </div>
      </div>
    </>
  );  
}
