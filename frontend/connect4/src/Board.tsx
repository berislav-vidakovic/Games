import React, { useEffect, useRef, useState } from "react";
import "@common/style.css";
import '@common/style-mobile.css';

import { startGame, swapColors, stringToMatrix, updateSetBoardRows, insertDisk, newGame } from './gameLogic'


const okSound = new Audio("sounds/OK.wav");  
const nokSound = new Audio("sounds/NOK.mp3"); 

interface Connect4BoardProps {
  boardString: string;
  myColor: "Red" | "Yellow" | null; 
  gameId: string | null;
  gameState: "init" | "myMove" | "theirMove" | "draw" | "myWin" | "theirWin" | null;
}

const Connect4Board: React.FC<Connect4BoardProps> = ({ boardString, 
  myColor, gameId, gameState  }) => {
  
  const [activeCol, setActiveCol] = useState<number>(0); 
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardRows, setBoardRows] = useState<string[]>([]); 

  //console.log(userId);

  // Transform string to matrix
  useEffect(() => {
    stringToMatrix( boardString, setBoardRows);
    updateSetBoardRows(setBoardRows);
  }, []);

  useEffect(() => {
    if (!/Mobi|Android/i.test(navigator.userAgent)) {
      boardRef.current?.focus(); // only auto-focus on desktop
    }
  }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        insertNewDisc();
        break;
      case "ArrowLeft":
        e.preventDefault();
        if( activeCol == 0 ) return;
        setActiveCol(activeCol-1);
        break;
      case "ArrowRight":
        e.preventDefault();
        if( activeCol == 6 ) return;
        setActiveCol(activeCol+1);
        break;    
    }
  };

  const getPartnerColor = (): "Red" | "Yellow" => {
    return myColor == "Red" ? "Yellow": "Red"; 
  }

  const getClass = (): string => {
    //console.log("getClass - gameState: ", gameState);
    switch(gameState ){
      case "myMove":
        return myColor as string;
      case "theirMove":
        return getPartnerColor();
      case "myWin":
        return "Win";
      case "theirWin":
        return "Lose";
      default:
        return "";
    }
  }

  // "YR-R--RY---RRYYR-R--RY---RRYYR-R--RY---RRY"
  const insertNewDisc = () => {
    if (!["myMove", "theirMove"].includes(gameState as string))
      return;
    let row: number = 0;
    let rev = [...boardRows].reverse();
    while( row < 6 ){
      if( rev[row][activeCol] != '-')
        ++row;
      else {
        /*
        const updRow = rev[row]
          .split('')
          .map((cell,col)=>col==activeCol ? cell = currentPlayer[0] : cell)
          .join('');
        rev[row] = updRow;
        setCurrentPlayer(currentPlayer == "Red" ? "Yellow" : "Red");
        const newBoard = [...rev].reverse();
        setBoardRows(newBoard);
        setBoardString(rev.join(''));
        //console.log(rev.join(''));*/
        insertDisk( gameId, row, activeCol );
        okSound.play();
        return;
      }
    }  
    nokSound.play();
  };

  return (
    <>
      <div className="info-connect4">
        <div>
          <button
            onClick={() => {
              swapColors(gameId);
            }}
          >
            Your color
          </button>
          
          {gameState == "init" && <button
            onClick={() => {
              startGame(gameId, gameState);
            }}
          >Start</button>}

          {["myWin", "theirWin", "draw"].includes(gameState as string) 
            && <button
              onClick={() => {
                newGame(gameId);
              }}
            >New Game</button>}

        </div>
        <span className="next-move">
          STATE: {gameState}
          <br />
          {(gameState == "myMove" || gameState == "theirMove") && "Next Move:"}
          {<span 
            className={`conn4cellNew ${getClass()}`}></span>}
        </span>
      </div>

        <div className='conn4top'>
          {[0,1,2,3,4,5,6].map(col=>
            <div
              key={col}   
              className={              
                col==activeCol ? `conn4cellNew ${myColor}` : "conn4inactivecol"}
              onClick={() => {
                //console.log("Clicked column: ", col);
                setActiveCol(col);
                boardRef.current?.focus(); // 👈 restore keyboard focus
              }}
            >
            </div>
          )}
        </div>


      <div
        className="connect4-board"
        tabIndex={0}  
        ref={boardRef}
        onKeyDown={handleKeyDown}        
      >
       
        {boardRows.join('').split('').map((c,i)=>{
          const classes = [
              "conn4cell",
              c == 'Y' ? "Yellow" : "",
              c == 'R' ? "Red" : ""
            ].filter(Boolean)
            .join(" ");

          return (<div
            key={i}
            className = {classes} 
            onClick={() => {
              //console.log("Clicked on board");
              if( i%7 == activeCol)
                insertNewDisc();
            }}           
          >
          </div>)
        })}
      </div>

    </>
  );
};

export default Connect4Board;
