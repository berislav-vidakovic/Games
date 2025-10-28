import sudokuImg from '../assets/sudoku.jpg';
import connect4Img from '../assets/connect4.png';
import battleshipImg from '../assets/battleships.gif';
import './App.css';
import "@common/style.css";
import { URL_SUDOKU, URL_CONNECT4, URL_BATTLESHIP } from '@common/config';
import { loadCommonConfig } from '@common/config';
import { useState, useEffect } from 'react';
import { sendGETRequest, sendPOSTRequest } from '@common/restAPI';
import { connectWS } from '@common/webSocket';
import type { User } from '@common/interfaces';

function App() {
  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  const [usersRegistered, setUsersRegistered] = useState<User[]>([]);
  const [isWsConnected, setWsConnected] = useState<boolean>(false);
  
  useEffect( () => { 
    loadCommonConfig(setConfigLoaded);     
  }, []);

  useEffect( () => { if( isConfigLoaded){
      sendGETRequest('api/users/all', handleResponseGetAllUsers );
   }      
  }, [isConfigLoaded]);

  
  const handleResponseGetAllUsers = ( jsonResp: any ) => {    
    // Map API response fields to match your User interface
    const mappedUsers: User[] = jsonResp.users.map((u: any) => ({
      userId: u.userId,
      login: u.login,
      fullname: u.fullName,  
      isonline: u.isOnline   
    }));
    // Update React state - ref. to setUsersRegistered 
    setUsersRegistered(mappedUsers);
    console.log("Response to GET users: ", jsonResp );
    console.log("Users: ", ...usersRegistered );
    sessionStorage.setItem("myID", jsonResp.id );

  }

  useEffect( () => { if( isConfigLoaded){
      connectWS( setWsConnected, handleWsMessage );
   }      
  }, [isConfigLoaded]);

  async function handleWsMessage( jsonMsg: any ) {
    console.log("WS conn:", isWsConnected );
     if( jsonMsg.type== "userRegister" )
      handleWsUserRegister(jsonMsg.data);
  }

  function handleWsUserRegister( jsonResp: any ){
    console.log("*** Ws-HANDLE User registered: ", jsonResp);
    if( jsonResp.acknowledged ) { 
      // Construct the new user object
      const newUser: User = {
        userId: jsonResp.user.userId,
        login: jsonResp.user.login,
        fullname: jsonResp.user.fullName,
        isonline: jsonResp.user.isOnline,
      };
      // Update frontend state (append to existing users list)    
      setUsersRegistered(prev => {
        const dupe = prev.some(u => u.userId === newUser.userId);
        if( dupe ) console.log("=====================Duplicate ID found, no user appending");
        return dupe ? prev : [...prev, newUser];
      });

      console.log("Ws-User registered: ", jsonResp.user);
    }
    else {
      console.log("User NOT registered: ", jsonResp.error);
      alert("NOT registered: User already exists");
    }
  }

  const handleSignUp = () => {
    console.log("Sign Up clicked"); 
    const body = JSON.stringify({ register: { login:"penny5", fullname:"Penny5" } } );
    sendPOSTRequest('api/users/new', body, handleResponseSignUp);
  }

  const handleResponseSignUp = ( jsonResp: any, status: number ) => {    
    console.log("*** HANDLE User registered: ", jsonResp, "Status: ", status);
    if( jsonResp.acknowledged ) {     
      console.log("User registered: ", jsonResp.user);
    }
    else {
      console.log("User NOT registered: ", jsonResp.error);
      alert("NOT registered: User already exists");
    }
  }


  const handleSignIn = () => console.log("Sign In clicked");
  const handleSignOut = () => console.log("Sign Out clicked");
  const handleInvite = () => console.log("Invite User clicked");

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
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleSignOut}>Sign Out</button>
      <button onClick={handleInvite}>Invite User</button>
    </div>

    
    <h1>Game Panel</h1>

    {/* Game buttons */}
    <div className="buttons-container">
      
      <button onClick={() => isConfigLoaded ? handleSelectGame(URL_SUDOKU) : console.log("Config not loaded")}>
        <img src={sudokuImg} alt="Sudoku" />
      </button>
      <button onClick={() => handleSelectGame(URL_CONNECT4)}>
        <img src={connect4Img} alt="Connect 4" />
      </button>
      <button onClick={() => handleSelectGame(URL_BATTLESHIP)}>
        <img src={battleshipImg} alt="Battleship" />
      </button>
    </div>
  </div>
</div>

  );
}

export default App;