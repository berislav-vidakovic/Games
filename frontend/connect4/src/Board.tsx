import React, { useEffect, useRef, useState } from "react";
import "@common/style.css";
//const okSound = new Audio("sounds/OK.wav");  
//const nokSound = new Audio("sounds/NOK.mp3"); 

interface Connect4BoardProps {
  boardString: string;
  name: string;
  level: number;
}

//type BoardArray = string[][];

const Connect4Board: React.FC<Connect4BoardProps> = ({ boardString, name, level }) => {
  


  const [time, setTime] = useState<number>(0); // seconds

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
      
      {/* Timer  */}
      <div className={"sudokuinfobox"} style={{fontWeight:"600"}}>
        <div>Timer: {formatTime(time)}</div>
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

    </>
  );
};

export default Connect4Board;
