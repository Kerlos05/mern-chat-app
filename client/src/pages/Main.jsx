import AvatarsCollection from '../components/AvatarsCollection';
import ChatWindow from '../components/ChatWindow'; 
import CurrentUserAvatar from '../components/CurrentUserAvatar'; 


export default function Main() {
  return (
    <>
      <div className='d-grid main-container'>
        <div className='h-100 '>
          <header className='d-flex'>
           <CurrentUserAvatar></CurrentUserAvatar>
          </header>
          <div className='d-flex h-100 '>
              <AvatarsCollection />
            <main className='w-75'>
              <ChatWindow />  
            </main>
          </div>
        </div>
      </div>
    </>
  )
}


    