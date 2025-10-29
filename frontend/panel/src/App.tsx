import sudokuImg from '../assets/sudoku.jpg';
import connect4Img from '../assets/connect4.png';
import memoryImg from '../assets/memory.png';
import tictactoeImg from '../assets/tictactoe.png';
import blackjackImg from '../assets/blackjack.png';
import mmImg from '../assets/mm.jpg';

import './App.css';
import "@common/style.css";
import { URL_SUDOKU, URL_CONNECT4 } from '@common/config';
import { loadCommonConfig } from '@common/config';
import { useState, useEffect } from 'react';
import { connectWS } from '@common/webSocket';
import type { User } from '@common/interfaces';
import { setStateFunctionRefs, handleResponseGetAllUsers, handleWsMessage } from './messageHandlers';
import { getAllUsers } from './utils';
import RegisterDialog from './components/RegisterDialog.tsx' 


function App() {
  const [usersRegistered, setUsersRegistered] = useState<User[]>([]);

  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  const [isInitialized, setInitialized] = useState<boolean>(false);
  const [isWsConnected, setWsConnected] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState<boolean>(false);


  useEffect( () => { 
    loadCommonConfig(setConfigLoaded);     
  }, []);

  useEffect( () => { if( isConfigLoaded){
      setStateFunctionRefs(setInitialized, setUsersRegistered, setCurrentUserId)
      getAllUsers(handleResponseGetAllUsers );
   }      
  }, [isConfigLoaded]); 


  /* handleSignUp - open Dialog pass handleResponse
        Dialog - call sendPOST pass handleResponse
     handleResponse   
   */



  useEffect( () => { if( isConfigLoaded && isInitialized){
      connectWS( setWsConnected, handleWsMessage );
   }      
  }, [isConfigLoaded, isInitialized]);


  const handleSignIn = () => console.log("Sign In clicked");
  const handleSignOut = () => console.log("Sign Out clicked");
  const handleInvite = () => console.log("Invite User clicked");
  const handleAccept = () => console.log("Accept User clicked");
  const handleRun = () => console.log("Run clicked");

  const handleSelectGame = (url: string) => {
    window.open(url, '_blank');
  };

  return (
   <div className="app-container">
    {/* --- Users Box on the left --- */}
    <div className="users-box">
        <h2>Users:</h2>
        <ul>
        { usersRegistered.map((u) => ( 
            <li key={u.userId} className="user-item">               
              {u.fullname} 
              <span
                className={`status-dot ${
                  u.isonline ? "status-online" : "status-offline"
                }`}
              ></span>
            </li>
          ))
        }        
      </ul>
    </div>

    {/* --- Right main content --- */}
    <div className="main-content">
      {/* Top auth buttons */}
      <div className="auth-buttons">
        <button 
          //onClick={handleSignUp}
          id="btnRegister" 
          onClick={() => setShowRegisterDialog(true)}
          disabled={(currentUserId != null) || !isWsConnected}
        >
          Sign Up
        </button>
        <button onClick={handleSignIn}>Sign In</button>
        <button onClick={handleSignOut}>Sign Out</button>
        <button onClick={handleInvite}>Invite </button>
        <button onClick={handleAccept}>Accept </button>
        <button onClick={handleRun}>Run</button>
      </div>

      
      <h1>Game Panel</h1>

      {/* Game buttons */}
      <div className="buttons-container">      
        <button onClick={() => isConfigLoaded ? handleSelectGame(URL_SUDOKU) : console.log("Config not loaded")}
          title="Sudoku">
          <img src={sudokuImg} alt="Sudoku" />
        </button>
        <button onClick={() => handleSelectGame(URL_CONNECT4)} title="Connect 4">
          <img src={connect4Img} alt="Connect 4" />
        </button>
        <button onClick={() => { console.log("Memory is under construction..."); }} 
          title="Memory">
          <img src={memoryImg} alt="Battleship" />
        </button>
        <button onClick={() => { console.log("Master Mind is under construction..."); }}
          title="Master Mind">
          <img src={mmImg} alt="Battleship" />
        </button>
        <button onClick={() => { console.log("Tic Tac Toe is under construction..."); }}
          title="Tic Tac Toe">
          <img src={tictactoeImg} alt="Battleship" />
        </button>
        <button onClick={() => { console.log("Black Jack is under construction..."); }}
          title="Black Jack">
          <img src={blackjackImg} alt="Battleship" />
        </button>
      </div>
      <div className='status-box'>
        <p>Login as: Sheldon</p>
        <p>Game selected: Connect4</p>
      </div>
    </div>
    {showRegisterDialog && (
      <RegisterDialog
        isWsConnected={isWsConnected}  
        setShowRegisterDialog={setShowRegisterDialog}
      />
    )}
  </div>


  );
}

export default App;