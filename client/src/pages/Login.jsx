import '../style/style.css';
import '../style/drawingPen.css';
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../AppContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authEndPoint } from '../utlis/APIRoutes';
import axios from 'axios'; 
import backgroundPreview from '../assets/backgroundPreview.jpg'
import useToast from '../hooks/useToast'; 

export default function Login() {
  const { setLogin, username, setUsername } = useContext(AppContext);
  const [password, setPassword] = useState(''); 
  const [waitForStyle, setWaitForStyle] = useState(false); 

  const showToast = useToast();
  const navigate = useNavigate(); 

  const handleValidation = () =>{
    if(password.length < 1 || username.length < 1){
      showToast('Username or password are not provided', 'warning'); 
      return false; 
    } 
    return true; 
  }

  const handleSub = async(e) => {
    e.preventDefault();
    if(handleValidation()){
      try {
        const response = await axios({
          method: 'post',
          url: authEndPoint,
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            username: username,
            password: password
          }
        });
      
        if (response.status === 200) {
          setWaitForStyle(true);
          await new Promise(r => setTimeout(r, 2000));
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('username', response.data.username);
          setLogin(true);
          navigate('/main');
        }
      } catch (error) {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message;
          showToast(errorMessage, 'error');
        } else {
          showToast('An error occurred while processing your request', 'error');
        }
      }
      
    }
  }



return (
  <>
    <ToastContainer />
    {!waitForStyle ? (
      <div className="login" id='login'>
        <img src={backgroundPreview} alt="image" className="login__bg" loading='lazy'/>
        <form className="login__form" onSubmit={handleSub}>
          <h1 className="login__title">Login</h1>
            <div className="login__inputs">
              <div className="login__box">
                <input 
                type='text'
                className='login__input'
                placeholder='Username' 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required={true}
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
                required={true}
                />                  
                <i className="">
                  <FontAwesomeIcon icon={faLock}></FontAwesomeIcon>
                </i>
              </div>
            </div>
            <div className='w-100 d-flex justify-content-center mb-2 mt-2'>
              <button className='btn text-bg-light w-100 rounded-pill' style={{color: 'aliceblue'}} type='submit'>Login</button>
            </div>
            <div className="login__register">
              Don't have an account?  <Link  to='/register' className='link'onClick={() => setUsername('')} style={{textTransform: 'uppercase',textDecoration: 'none'}}>Register</Link>
            </div>
        </form>
      </div>
      ) : 
        <div className='d-flex align-items-center justify-content-center' style={{'height': '60vh' }} >
          <svg xmlns="http://www.w3.org/2000/svg" height="200px" width="200px" viewBox="0 0 200 200" className="pencil">
            <defs>
              <clipPath id="pencil-eraser">
                <rect height="30" width="30" ry="5" rx="5"></rect>
              </clipPath>
            </defs>
            <circle transform="rotate(-113,100,100)" strokeLinecap="round" strokeDashoffset="439.82" strokeDasharray="439.82 439.82" strokeWidth="2" stroke="currentColor" fill="none" r="70" className="pencil__stroke"></circle>
              <g transform="translate(100,100)" className="pencil__rotate">
                <g fill="none">
                  <circle transform="rotate(-90)" strokeDashoffset="402" strokeDasharray="402.12 402.12" strokeWidth="30" stroke="hsl(223,90%,50%)" r="64" className="pencil__body1"></circle>
                  <circle transform="rotate(-90)" strokeDashoffset="465" strokeDasharray="464.96 464.96" strokeWidth="10" stroke="hsl(223,90%,60%)" r="74" className="pencil__body2"></circle>
                  <circle transform="rotate(-90)" strokeDashoffset="339" strokeDasharray="339.29 339.29" strokeWidth="10" stroke="hsl(223,90%,40%)" r="54" className="pencil__body3"></circle>
                </g>
                <g transform="rotate(-90) translate(49,0)" className="pencil__eraser">
                  <g className="pencil__eraser-skew">
                    <rect height="30" width="30" ry="5" rx="5" fill="hsl(223,90%,70%)"></rect>
                    <rect clipPath="url(#pencil-eraser)" height="30" width="5" fill="hsl(223,90%,60%)"></rect>
                    <rect height="20" width="30" fill="hsl(223,10%,90%)"></rect>
                    <rect height="20" width="15" fill="hsl(223,10%,70%)"></rect>
                    <rect height="20" width="5" fill="hsl(223,10%,80%)"></rect>
                  <rect height="2" width="30" y="6" fill="hsla(223,10%,10%,0.2)"></rect>
                  <rect height="2" width="30" y="13" fill="hsla(223,10%,10%,0.2)"></rect>
                </g>
              </g>
              <g transform="rotate(-90) translate(49,-30)" className="pencil__point">
                <polygon points="15 0,30 30,0 30" fill="hsl(33,90%,70%)"></polygon>
                <polygon points="15 0,6 30,0 30" fill="hsl(33,90%,50%)"></polygon>
                <polygon points="15 0,20 10,10 10" fill="hsl(223,10%,10%)"></polygon>
              </g>
            </g>
          </svg>
        </div>
      } 
    </>
  );
}
