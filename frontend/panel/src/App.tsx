import sudokuImg from '../assets/sudoku.jpg';
import connect4Img from '../assets/connect4.png';
import battleshipImg from '../assets/battleships.gif';
import './App.css';
import "@common/style.css";
import { URL_SUDOKU, URL_CONNECT4, URL_BATTLESHIP } from '@common/config';
import { loadCommonConfig } from '@common/config';
import { useState, useEffect } from 'react';
import { sendGETRequest } from '@common/restAPI';
import type { User } from '@common/interfaces';

function App() {
  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  const [usersRegistered, setUsersRegistered] = useState<User[]>([]);

  
  useEffect( () => { 
    loadCommonConfig(setConfigLoaded);     
  }, []);

  useEffect( () => { if( isConfigLoaded){
      sendGETRequest('api/users/all', handleInit );
   }      
  }, [isConfigLoaded]);

  const handleInit = ( jsonResp: any ) => {    
    // Map API response fields to match your User interface
    const mappedUsers: User[] = jsonResp.map((u: any) => ({
      userId: u.userId,
      login: u.login,
      fullname: u.fullName,  
      isonline: u.isOnline   
    }));
    // Update React state - ref. to setUsersRegistered 
    setUsersRegistered(mappedUsers);
    console.log("Response to GET users: ", jsonResp );
    console.log("Users: ", ...usersRegistered );

  }


  const handleClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="app-container">
      <h1>Game Panel</h1>
      <div className="buttons-container">
        <button onClick={() => {
            isConfigLoaded 
            ? handleClick(URL_SUDOKU)
            : console.log("Config not loaded");
          }
        }>
          <img src={sudokuImg} alt="Sudoku" />
        </button>
        <button onClick={() => handleClick(URL_CONNECT4)}>
          <img src={connect4Img} alt="Connect 4" />
        </button>
        <button onClick={() => handleClick(URL_BATTLESHIP)}>
          <img src={battleshipImg} alt="Battleship" />
        </button>
      </div>
    </div>
  );
}

export default App;
