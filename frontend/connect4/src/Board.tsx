import React, { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import "@common/style.css";
const okSound = new Audio("sounds/OK.wav");  
const nokSound = new Audio("sounds/NOK.mp3"); 

interface Connect4BoardProps {
  boardString: string;
  setBoardString: Dispatch<SetStateAction<string>>;
  myColor: "Red" | "Yellow" | null; 
}

//type BoardArray = string[][];

const Connect4Board: React.FC<Connect4BoardProps> = ({ boardString, 
  setBoardString, myColor  }) => {
  
  const [activeCol, setActiveCol] = useState<number>(0); 
  const boardRef = useRef<HTMLDivElement>(null);
  const [currentPlayer, setCurrentPlayer] = useState<"Red" | "Yellow">("Red"); 
  const [boardRows, setBoardRows] = useState<string[]>([]); 

  //setMyColor(null);

  // Transform string to matrix
  // YRY---------------------------------------
  useEffect(() => {
    const matrix: string[] = [];
    for( let i = 0; i < 6; i++ ){
      const row: string = boardString.slice(i*7,i*7+7);
      matrix.push( row );
    }
    //console.log(...matrix);
    //console.log(rev);
    //console.log(rev.join(''));
    setBoardRows(matrix.reverse());

    // TODO: use this for render from 0 to 6
    // use this for insert from 6 to 0 
  }, []);

  // Auto-focus
  useEffect(() => {
    boardRef.current?.focus();
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


  // "YR-R--RY---RRYYR-R--RY---RRYYR-R--RY---RRY"
  const insertNewDisc = () => {
    let row: number = 0;
    let rev = [...boardRows].reverse();
    while( row < 6 ){
      if( rev[row][activeCol] != '-')
        ++row;
      else {
        const updRow = rev[row]
          .split('')
          .map((cell,col)=>col==activeCol ? cell = currentPlayer[0] : cell)
          .join('');
        rev[row] = updRow;
        setCurrentPlayer(currentPlayer == "Red" ? "Yellow" : "Red");
        const newBoard = [...rev].reverse();
        setBoardRows(newBoard);
        setBoardString(rev.join(''));
        console.log(rev.join(''));
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
              setCurrentPlayer(currentPlayer == "Red" ? "Yellow" : "Red");
            }}
          >
            Your color
          </button>
          <button>Start</button>
        </div>
        <span className="next-move">
          Next Move:
          <span className="conn4cellNew Red"></span>
        </span>
      </div>

        <div className='conn4top'>
          {[0,1,2,3,4,5,6].map(col=>
            <div
              key={col}   
              className={              
                col==activeCol ? `conn4cellNew ${myColor}` : "conn4inactivecol"}
              onClick={() => {
                console.log("Clicked column: ", col);
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
        onClick={() => {
          console.log("Clicked on board");
          insertNewDisc();
        }}
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
          >
          </div>)
        })}
      </div>

    </>
  );
};

export default Connect4Board;
