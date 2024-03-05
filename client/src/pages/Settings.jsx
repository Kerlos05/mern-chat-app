import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../AppContext';
import { avatarEndPoint, updateUserEndPoint } from '../utlis/APIRoutes';
import axios from 'axios';
import useToast from '../hooks/useToast';
import { ToastContainer } from "react-toastify";
import avatarPNG from '../assets/avatar.png'; 

import io from 'socket.io-client';
const newSocket = io('http://localhost:5000');


export default function Settings() {
  const { username } = useContext(AppContext);

  const [group, setGroup] = useState([]);

  const [avatar, setAvatar] = useState('');
  const [removeGroup, setRemoveGroup] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [socket, setSocket] = useState(null);
  const [usernameID, setUsernameID] = useState(null);

  useEffect(() => {
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [setSocket]);


  const showToast = useToast(); 

  const toBase64 = (e) => {
    e.preventDefault();
    var reader = new FileReader; 
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      setAvatar(reader.result); 
    } 
    reader.onerror = (err) => {
      showToast(err, 'warning');
    }
  }

  useEffect(() => {
    const retriveUser = async () => {
      try {
          const response = await axios.post(avatarEndPoint, {
            username: username
          })
          setUsernameID(response.data._id);
      } catch (error) {
          if (error.response && error.response.data) {
            showToast(error.response.data.message, 'error')
          } else {
            showToast(error.message, 'error')
          }
        }
      }
      retriveUser();
    },[username])

  const retrieveAllAvatars = async () => {
    try {
      const response = await axios.get(avatarEndPoint,{
        params:{
          username: username
        }
      });
      setGroup(response.data);

    } catch (error) {
      showToast('Error retrieving avatars:', 'error');
    }
  };

  useEffect(() => {
    retrieveAllAvatars();
  }, [username]);


  const handleSubmit = async(e) => {
    e.preventDefault(); 
  
    if(!newUsername && !avatar && !removeGroup?.length){
      await new Promise((r) => setTimeout(r, 500)); 
      return showToast('Changes are saved successfully', 'success');
    }

    try {
      const response = await axios.put(updateUserEndPoint, {
        oldUsername: username, 
        newUsername, 
        avatar, 
        removeUserFromGroup: removeGroup
      }, {
        headers: { 
          'Content-Type': 'application/json', 
        },
      })

      if(response.status === 200){
        showToast('Changes are saved successfully', 'success');
        await new Promise((r) => setTimeout(r, 800)); 
        socket.emit('updateAvatarUI'); 
        window.location.reload();
        localStorage.removeItem('token');
        localStorage.removeItem('username'); 
      } else{
        showToast(response, 'warning');
      }

    } catch (error) {
      if (error.response && error.response.data) {
        showToast(error.response.data.message, 'error')
      } else {
        showToast(error.message, 'error')
      }
    }
  }

  const handleDeleteUser = async (e) => {
    e.preventDefault(); 
    const encodedUsernameID = encodeURIComponent(usernameID);
    const response = await axios.delete(`${updateUserEndPoint}?usernameID=${encodedUsernameID}`, {
      headers: { 'Content-Type': 'application/json' }
    })
    
    if(response.status === 200){
      socket.emit('updateUserUI');
      socket.emit('updateAvatarUI');
      await new Promise((r) => setTimeout(r, 800)); 
      window.location.reload();
      localStorage.removeItem('token');
      localStorage.removeItem('username'); 
    }
   
  }
  

  return (
    <>
    <ToastContainer></ToastContainer>
    <div className='p-3 container-fluid '>
      <header>
        <a href="/main" >
          <h1>ChatRover</h1>
        </a>
        <hr />
      </header>
      <div>
        <h1 className='mb-3'>Settings</h1>
        <div>
          <form className='d-grid gap-5' onSubmit={handleSubmit} >
            <label htmlFor="username" style={{width: 'fit-content'}}>
              Change username: 
              <input type="text" placeholder={username} className='ms-2 w-50 ' onChange={(e) => setNewUsername(e.target.value)}/>
            </label> 
            <label htmlFor="avatar" style={{width: 'fit-content'}}>
              Change avatar 
              <input type="file" id='avatar' className='d-none' accept='image/*'  onChange={toBase64}/>
              {!avatar ? (
                <img width={100} height={100} src={avatarPNG} alt="Default Avatar" />
              ) : 
                <img width={100} height={100} src={avatar} alt="Default Avatar" />
              }
            </label>         
              <div>
                Leave group 
                {group
                  .filter((item) => item.username !== username && Array.isArray(item.username))
                  .map((item) => (
                    <div key={item._id} className={`avatar-collection-users`}>
                      <label title={item.username} htmlFor='group'>
                        <input type="checkbox" name="" id="group" onChange={() => setRemoveGroup(prev => [item._id, ...prev])}/>
                        {Array.isArray(item.username) ? item.username.join(',') : ''}
                      </label>
                    </div>
                ))}
              </div>
              <div className='w-100 d-flex justify-content-end'>
                <button type="submit" className='btn btn-primary '>Save</button>
              </div>
          </form>     
        </div>

        <hr />

        <form onSubmit={handleDeleteUser} className='mt-2'>
          <button type="submit" className='btn bg-danger'>Delete account</button>
        </form>


      </div>
    </div>
    </>
  )
}
