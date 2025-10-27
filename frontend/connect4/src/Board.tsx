import React, { useEffect, useRef, useState } from "react";
import "@common/style.css";
const okSound = new Audio("sounds/OK.wav");  
const nokSound = new Audio("sounds/NOK.mp3"); 

interface SudokuBoardProps {
  boardString: string;
  name: string;
  level: number;
}

type BoardArray = string[][];

const SudokuBoard: React.FC<SudokuBoardProps> = ({ boardString, name, level }) => {
  

  const initialBoard: BoardArray = Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => boardString[row * 9 + col])
  );

  const [board, setBoard] = useState<BoardArray>(initialBoard);
  const [focused, setFocused] = useState<[number, number] | null>(null);
  const [message, setMessage] = useState<string>("");
  const [time, setTime] = useState<number>(0); // seconds
  const [mistakes, setMistakes] = useState<number>(0);

  const boardRef = useRef<HTMLDivElement>(null);

  // Auto-focus
  useEffect(() => {
    boardRef.current?.focus();
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Focus first empty cell
  useEffect(() => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === "0") {
          setFocused([r, c]);
          return;
        }
      }
    }
  }, []);

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <>
      {/* Name and level */}
      <div className={"sudokuinfobox"}  >
        <div>Game: {name}</div>
        <div>Level: {level == 2 ? "Medium" : "Easy"}</div>
      </div>
      
      {/* Timer and Mistakes */}
      <div className={"sudokuinfobox"} style={{fontWeight:"600"}}>
        <div>Timer: {formatTime(time)}</div>
        <div>Mistakes: {mistakes}</div>
      </div>

      <div
        className="connect4-board"
      >
        {boardString.split('').map((c,i)=>{
          const classes = [
              "conn4cell",
              c == 'Y' ? "yellow" : "",
              c == 'R' ? "red" : ""
            ].filter(Boolean)
              .join(" ");

          return (<div
            key={i}
            className = {classes}
          >
          </div>)
        })}
      </div>

      <div style={{ marginTop: "20px", fontSize: "18px", minHeight: "24px" }}>
        {message}
      </div>
    </>
  );
};

export default SudokuBoard;
