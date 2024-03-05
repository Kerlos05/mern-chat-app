import '../style/style.css';
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer,  } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import avatar from '../assets/avatar.png'; 
import { registerEndPoint } from '../utlis/APIRoutes';
import axios from 'axios'; 
import { AppContext } from '../AppContext';
import backgroundPreview from '../assets/backgroundPreview.jpg';
import useToast from '../hooks/useToast'; 


export default function Register() {
  const { setLogin, username, setUsername} = useContext(AppContext);
  const [password, setPassword] = useState(''); 
  const [image, setImage] = useState(''); 
  const showToast = useToast(); 

  const navigate = useNavigate(); 

  const handleValidation = () => {

    if (username.length < 3 || username.length > 20) {
      showToast("Username must be between 3 and 20 characters", 'warning');
      return false;
    }
  
    const UserREG = /^[a-zA-Z][a-zA-Z0-9_]+$/;
    if (!UserREG.test(username)) {
      showToast("Username must start with a letter and can only contain letters, numbers, and underscores", 'warning');
      return false;
    }
  
    
    if (password.length < 8) {
      showToast("Password must be at least 8 characters long", 'warning');
      return false;
    }
  
    return true;
  };
  

  const toBase64 = (e) => {
    e.preventDefault();
    var reader = new FileReader; 
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      setImage(reader.result); 
    } 
    reader.onerror = (err) => {
      showToast(err, 'warning');
    }
  }

  
  const handleSub = async(e) => {
    e.preventDefault();
    if(handleValidation()){
      try {
        const response = await axios.post(registerEndPoint, {
          user: username,
          pwd: password,
          base64: image || avatar
        }, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json', 
            'Access-Control-Allow-Origin': '*', 
          },
          
        });
    
        if (response.status === 201) {
          setLogin(true);
          navigate('/main'); 
        }
      } catch (error) {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message;
          showToast(errorMessage, 'error');
        } else {
          showToast(error.message, 'error');
          console.error(error.message);
        }
      }
    }
  }


  return (
    <>
      <ToastContainer />
      <div className="login">
        <img src={backgroundPreview} alt="image" className="login__bg"  loading='lazy'/>
        <form className="login__form" onSubmit={handleSub}>
          <div className="iconSection">
            <label htmlFor="fileInput">
              <input
                accept="image/*"
                type="file"
                id="fileInput"
                onChange={toBase64}
                style={{ display: 'none' }}
              />
              {image == '' || image == null ? (
                <img width={175} height={175} src={avatar} alt="Default Avatar" />
              ) : (
                <img width={175} height={175} src={image} alt="Selected Image" />
              )}
            </label>
          </div>
          <h1 className="login__title">Register</h1>
          <div className="login__inputs">
            <div className="login__box">
              <input 
                type='text'
                className='login__input'
                placeholder='Username' 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
              <i className="">
                <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>
              </i>
            </div>
              <div className="login__box">
                <input 
                  type='password' 
                  className='login__input ' 
                  placeholder='Password' 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <i className="">
                  <FontAwesomeIcon icon={faLock}></FontAwesomeIcon>
                </i>
              </div>
            </div>
            <div className='w-100 d-flex justify-content-center mb-2 mt-2'>
              <button className='btn text-bg-light  w-100 rounded-pill' style={{color: 'aliceblue'}} type='submit'>Sign up</button>
            </div>
            <div className="login__register">
              Already have an account?  <Link  to='/' className='link'onClick={() => setUsername('')} style={{textTransform: 'uppercase',textDecoration: 'none'}}>Login</Link>          
            </div>
        </form>
      </div>
    </>
  );
}
