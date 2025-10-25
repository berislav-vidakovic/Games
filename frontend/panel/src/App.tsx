import React from 'react';
import sudokuImg from '../assets/sudoku.jpg';
import connect4Img from '../assets/connect4.png';
import battleshipImg from '../assets/battleships.gif';
import './App.css';
import "@common/style.css";


function App() {
  const handleClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="app-container">
      <h1>Games Panel</h1>
      <div className="buttons-container">
        <button onClick={() => handleClick('http://localhost:5175/')}>
          <img src={sudokuImg} alt="Sudoku" />
        </button>
        <button onClick={() => handleClick('http://localhost:5176/')}>
          <img src={connect4Img} alt="Connect 4" />
        </button>
        <button onClick={() => handleClick('http://localhost:5177/')}>
          <img src={battleshipImg} alt="Battleship" />
        </button>
      </div>
    </div>
  );
}

export default App;
