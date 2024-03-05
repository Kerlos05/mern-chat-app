import { useContext, useEffect, useRef, useState } from 'react';
import { Modal, } from 'react-bootstrap';
import {  avatarEndPoint, createGroupEndpoint } from '../utlis/APIRoutes';
import { AppContext } from '../AppContext';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import useToast from '../hooks/useToast';
import { ToastContainer } from 'react-toastify';

import io from 'socket.io-client';
const newSocket = io('http://localhost:5000');



export default function AvatarsCollection() {
  const [selectedDiv, setSelectedDiv] = useState(null);
  const { setSelectedUser, username} = useContext(AppContext);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const parentDiv = useRef(null);
  const [socket, setSocket] = useState(null);

  const showToast = useToast();


  useEffect(() => {
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [setSocket]);

  

  const handleClick = (userID, username) => {
    setSelectedDiv(userID);
    setSelectedUser(username); 
  }
  
  const handleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  const handleCheckboxChange = (username) => {
    if (selectedUsers.includes(username)) {
      setSelectedUsers(selectedUsers.filter((user) => user !== username));
    } else {
      setSelectedUsers([...selectedUsers, username]);
    }
  };

  const handleSubmit = async(event) => {
    event.preventDefault();
    const usersString = [...selectedUsers, username].join(',');
    const newUsers = usersString.split(',');
      try {
        const response = await axios.post(createGroupEndpoint, { usernames: newUsers, createdBy: username });
        showToast(response.message, 'success') 
        setUsers([...users, newUsers]);
        retrieveAllAvatars();
        socket.emit('updateAvatarUI'); 
      } catch (error) {
        if (error.response) {
        return showToast(error.response.data.error, 'error')
        } else if (error.request) {
          showToast('No response received from the server', 'error')
        } else {
          showToast(error.message, 'error')
        }
      } 
  }

  const retrieveAllAvatars = async () => {
    try {
      const response = await axios.get(avatarEndPoint,{
        params:{
          username: username
        }
      });
      setUsers(response.data);
      setAllUsers(response.data);

    } catch (error) {
      showToast('Error retrieving avatars:', 'error');
    }
  };


  useEffect(() => {
    if (socket) {
      socket.on('updateAvatar', () => {
        retrieveAllAvatars(); 
      })
      return () => {
        if(socket) {
          socket.off('updateAvatar');
        }
      };
    }
  },[socket]);
  
  useEffect(() => {
    retrieveAllAvatars();
  }, []);


  function debounce(func, wait) {
    let timeout;
  
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
  
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  const searchFor = debounce((e) => {
    if(e.target.value === ''){
      setUsers(allUsers); 
    } else {
      setUsers(allUsers.filter(user => { 
        if (Array.isArray(user.username)) {
          return user.username.join('').includes(e.target.value);
        } else {
          return user.username.includes(e.target.value);
        }
      }));
    }
  }, 300);


  const handleFocus = () => {
    if (window.innerWidth < 470) {
      parentDiv.current.classList.add('expand');
    }
  };

  const handleBlur = async(e) => {
    await new Promise(r => setTimeout(r, 30));
    e.target.value = ''; 
    parentDiv.current.classList.remove('expand');
    searchFor(e)
  };

  

  return (
   <>
   <ToastContainer></ToastContainer>
    <div ref={parentDiv} className='avatar-collection' >
      <div className="d-flex flex-column justify-content-start h-100 ">
        <div className=' p-3  '>
          <div style={{ position: 'relative', display: 'inline-block'}}>
            <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', top: '6px', left: '6px',zIndex:'10' }} />
            <input 
              type="text" 
              name="" 
              id="" 
              className=' rounded-pill border border-dark w-100' 
              style={{ paddingLeft: '30px', textOverflow: 'ellipsis' }}
              placeholder="Search conversation"
              onChange={(e) => searchFor(e)}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <hr />
        </div>
        <div className='avatar-collection-container'>
          {users
            .filter((item) => item.username !== username)
            .map((item, index) => (
              <div
                key={index}
                className={`avatar-collection-users`}
                style={{ backgroundColor: (item._id === selectedDiv) ? 'rgba(240,240,240)' : '' , minHeight: "60px"}}
                onClick={() => handleClick(item._id, item.username)}
              >
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={`avatar ${index}`}
                    className='rounded-pill border p-1 me-3 chaningImage'
                  />
                ) : null}
                <p title={item.username}>
                  {Array.isArray(item.username) ? item.username.join(',') : item.username}
                </p>
              </div>
            ))}
        </div>
      </div>
      <div className='w-100 d-flex justify-content-end me-2'>
        <button className='btn rounded-pill mb-4' style={{transform: 'scale(220%)'}} onClick={handleModal}>
          <FontAwesomeIcon icon={faPlusCircle}></FontAwesomeIcon>
        </button> 
          <Modal show={isModalVisible} onHide={handleModal}>
            <Modal.Header closeButton>
              <Modal.Title>Create Group</Modal.Title>
            </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit}>
              {users
                .filter((item) => item.username !== username && item.avatar) 
                .map((item, index) => (
                  <div key={index} className="d-flex align-items-center mb-4 ms-2">
                    <input
                      type="checkbox"
                      id={`userCheckbox-${index}`}
                      checked={selectedUsers.includes(item.username)}
                      onChange={() => handleCheckboxChange(item.username)}
                    />
                      {item.avatar ? (
                        <img src={item.avatar} alt={`avatar ${index}`} width={75} height={75} className='rounded-pill' />
                      ) : null}
                      <p
                        style={{
                          transform: 'translateY(22px)',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                        }}
                        title={item.username}
                      >
                        {Array.isArray(item.username) ? item.username.join(',') : item.username}
                      </p>
                  </div>
                ))}
                <div className='w-100 d-flex justify-content-center modal-footer'>
                  <button type="submit" className='btn' onClick={handleModal}>Submit</button>
                </div>
            </form>
            </Modal.Body>
          </Modal> 
      </div>
    </div>
  </>
  );
}