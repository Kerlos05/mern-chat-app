import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../AppContext';
import axios from 'axios'; 
import { avatarEndPoint } from '../utlis/APIRoutes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer } from 'react-toastify';
import useToast from '../hooks/useToast';
import avatarPNG from '../assets/avatar.png'; 
import { faEllipsisVertical, faGear, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { Link,  } from "react-router-dom";


export default function CurrentUserAvatar() {
  const { username, selectedUser} = useContext(AppContext);
  
  const [avatar, setAvatar] = useState(''); 
  const showToast = useToast(); 


  useEffect(() => {
    const retriveUser = async () => {
      try {
          const response = await axios.post(avatarEndPoint, {
            username: username
          })
          setAvatar(response.data.avatar);
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
  
  const handleLogout = async(e) => {
    e.stopPropagation();

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('username'); 
      window.location.reload();
    } catch (error) {
      if (error.response && error.response.data) {
        showToast(error.response.data.message, 'error')
      } else {
        showToast(error.message, 'error')
      }
    }
  }

  return (
  <>
    <ToastContainer></ToastContainer>
    <div className='d-flex bg-danger justify-content-between w-25' style={{borderRight: '2px solid white'}}>
        <div className='d-flex align-items-center'>
          {!avatar ? (
            <img src={avatarPNG} alt="Pic" className='rounded-pill chaningImage '/>
            ) : 
            <img src={avatar} alt="Pic" className='rounded-pill chaningImage '/>
          }
          <p style={{transform: 'translateY(12px)'}} className='d-none d-sm-block ps-2'>{username}</p>
        </div>
      </div>
    <div className='d-flex bg-danger align-items-center justify-content-between ps-3 pe-3 w-75 '>
      <p className='text-white'>
        {!selectedUser ? '' : (
        Array.isArray(selectedUser) ? 
        Array.from(selectedUser).join(', ') :
        selectedUser
      )}
      </p>
      <div className="dropdown ">
        <button className="btn text-white" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
          <FontAwesomeIcon icon={faEllipsisVertical}></FontAwesomeIcon>
        </button>
        <ul className="dropdown-menu  " aria-labelledby="dropdownMenuButton1">
            <li>
              <Link to='/settings' className='dropdown-item d-flex justify-content-center btn mt-1 mb-1 p-3'>
                <FontAwesomeIcon icon={faGear}></FontAwesomeIcon>
              </Link>
            </li>
            <li>
              <a className="dropdown-item d-flex justify-content-center btn mt-1 mb-1 p-3"  onClick={(e) => handleLogout(e)}>
                <FontAwesomeIcon icon={faSignOut} ></FontAwesomeIcon>
              </a>
            </li>
        </ul>
      </div>
    </div>
  </>
  )
}


