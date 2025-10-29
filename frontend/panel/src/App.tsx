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
import { getAllUsers, logoutUser } from './utils';
import RegisterDialog from './components/RegisterDialog.tsx' 
import LoginDialog from './components/LoginDialog.tsx' 
import InviteDialog from './components/InviteDialog.tsx' 


function App() {
  const [usersRegistered, setUsersRegistered] = useState<User[]>([]);
  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  const [isInitialized, setInitialized] = useState<boolean>(false);
  const [isWsConnected, setWsConnected] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [showRegisterDialog, setShowRegisterDialog] = useState<boolean>(false);
  const [showLoginDialog, setShowLoginDialog] = useState<boolean>(false);
  const [showInviteDialog, setShowInviteDialog] = useState<boolean>(false);
  const [callerUserId, setCallerUserId] = useState<number | null>(null);
  const [calleeUserId, setCalleeUserId] = useState<number | null>(null);
  const [invitationState, setInvitationState] = useState<"init" | "sent" | "pending" | "paired">("init");
  const [selectedGame, setSelectedGame] = useState<"sudoku" | "connect4" | null>(null);

  useEffect( () => { 
    loadCommonConfig(setConfigLoaded);     
  }, []);

  useEffect( () => { if( isConfigLoaded){
      setStateFunctionRefs(setInitialized, setUsersRegistered, 
        setCurrentUserId, setOnlineUsers, setCallerUserId, setCalleeUserId,
        setInvitationState );
      getAllUsers(handleResponseGetAllUsers );
   }      
  }, [isConfigLoaded]); 

  useEffect( () => { if( isConfigLoaded && isInitialized){
      connectWS( setWsConnected, handleWsMessage );
   }      
  }, [isConfigLoaded, isInitialized]);

  //const handleSignIn = () => console.log("Sign In clicked");
  const handleSignOut = () => { 
    logoutUser( currentUserId as number); 
    clearInvitations();
  }

  const handleInvite = () => { if( currentUserId && onlineUsers > 1) setShowInviteDialog(true); }
  const handleRespond = () => console.log("Respond to Invitaion clicked");
  const handleRun = () => console.log("Run clicked");

  const handleSelectGame = (url: string) => {
    window.open(url, '_blank');
  };

  const clearInvitations = (): void => {
    setCalleeUserId(null);  
    setCallerUserId(null);
    console.log(callerUserId, "called ", calleeUserId);
  }

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
        <button 
          id="btnLogin" 
          onClick={() => setShowLoginDialog(true)}
          disabled={
            (currentUserId != null) || !isWsConnected || 
            !usersRegistered.some(u=>!u.isonline)
          }
        >
            Sign In
        </button>
        <button 
          onClick={handleSignOut}
          disabled={
            currentUserId == null
          }          
        >
            Sign Out
        </button>


        {(invitationState == "paired" || selectedGame == "sudoku")  && 
          currentUserId != null &&
        <button 
          onClick={handleRun}
        >
          Run
        </button>}
          
        {invitationState == "init" && selectedGame == "connect4" && 
          currentUserId != null &&
        <button 
          onClick={handleInvite}

        >Invite 
        </button>}

        {invitationState == "sent" &&  <button 
          onClick={handleRespond}
        >Cancel 
        </button>}

        {invitationState == "pending" && <button 
          onClick={handleInvite}
          
        >Accept 
        </button>}

        {invitationState == "pending" &&  <button 
          onClick={handleRespond}
        >Reject 
        </button>}

      
      
      </div>

      
      <h1>Game Panel</h1>

      {/* Game buttons */}
      <div className="buttons-container">      
        <button 
          onClick={() => {
              if( !isConfigLoaded ) {
                console.log("Config not loaded");
                return;
              }
              if( selectedGame == 'sudoku') handleSelectGame(URL_SUDOKU);
              else setSelectedGame('sudoku');
              }
            }
          title="Sudoku"
          className={selectedGame === 'sudoku' ? 'selected-button' : ''}
        >
          <img src={sudokuImg} alt="Sudoku" />
        </button>
        <button 
          onClick={() => {
            if( !isConfigLoaded ) {
              console.log("Config not loaded");
              return;
            }
            if( selectedGame == 'connect4') handleSelectGame(URL_CONNECT4);
            else setSelectedGame('connect4');
          }} 
          title="Connect 4"
          className={selectedGame === 'connect4' ? 'selected-button' : ''}

        >
          <img src={connect4Img} alt="Connect 4" />
        </button>
        <button 
          onClick={() => { console.log("Memory is under construction..."); setSelectedGame(null);}} 
          title="Memory">
          <img src={memoryImg} alt="Memory" />
        </button>
        <button 
          onClick={() => { console.log("Master Mind is under construction..."); setSelectedGame(null);}}
          title="Master Mind">
          <img src={mmImg} alt="Master Mind" />
        </button>
        <button 
          onClick={() => { console.log("Tic Tac Toe is under construction..."); setSelectedGame(null);}}
          title="Tic Tac Toe">
          <img src={tictactoeImg} alt="Tic Tac Toe" />
        </button>
        <button onClick={() => { console.log("Black Jack is under construction..."); setSelectedGame(null);}}
          title="Black Jack">
          <img src={blackjackImg} alt="Black Jack" />
        </button>
      </div>
      <div className='status-box'>
        { currentUserId != null  
           ? <p><b>Logged in as: {
                usersRegistered.find(u=>u.userId==currentUserId)!.fullname
              } </b>[{onlineUsers} user(s) online]</p>
           : <p>You are not logged in [{onlineUsers} user(s) online]</p>
        }
        { calleeUserId && callerUserId == currentUserId && 
          <p style={{fontWeight:"700", color:"#090"}}>
              You invited user: {usersRegistered.find(u=>u.userId==calleeUserId)!.fullname}
          </p> }
          { callerUserId && calleeUserId == currentUserId && 
          <p style={{fontWeight:"700", color:"#e00"}}>
              You have invitation from: {usersRegistered.find(u=>u.userId==callerUserId)!.fullname}
          </p> }
        {/*<p>Game selected: Connect4</p>*/}
      </div>
    </div>
    {showRegisterDialog && (
      <RegisterDialog
        isWsConnected={isWsConnected}  
        setShowRegisterDialog={setShowRegisterDialog}
      />
    )}
    {showLoginDialog && usersRegistered.some(u=>!u.isonline) && (
      <LoginDialog
        setShowLoginDialog={setShowLoginDialog}
        usersRegistered={usersRegistered}  
        isWsConnected={isWsConnected}  
      />
    )}
     {showInviteDialog && onlineUsers > 1 && 
      currentUserId != null &&
     (
      <InviteDialog
        setShowInviteDialog={setShowInviteDialog}
        usersRegistered={usersRegistered}  
        isWsConnected={isWsConnected}  
        currentUserId={currentUserId}
      />
    )}

  </div>
  );
}

export default App;
