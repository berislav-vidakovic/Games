import sudokuImg from '../assets/sudoku.jpg';
import connect4Img from '../assets/connect4.png';
import battleshipImg from '../assets/battleships.gif';
import './App.css';
import "@common/style.css";
import { URL_SUDOKU, URL_CONNECT4, URL_BATTLESHIP } from '@common/config';
import { loadCommonConfig } from '@common/config';
import { useState, useEffect } from 'react';



function App() {
  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  
  useEffect( () => { 
    loadCommonConfig(setConfigLoaded);     
  }, []);


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
