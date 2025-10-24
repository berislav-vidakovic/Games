import React, { useEffect, useRef, useState } from "react";
import "../../common/style.css";

interface SudokuBoardProps {
  boardString: string;
  solutionString: string;
}

type BoardArray = string[][];

const SudokuBoard: React.FC<SudokuBoardProps> = ({ boardString, solutionString }) => {
  

  const initialBoard: BoardArray = Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => boardString[row * 9 + col])
  );

  const solutionBoard: BoardArray = Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => solutionString[row * 9 + col])
  );

  const [board, setBoard] = useState<BoardArray>(initialBoard);
  const [focused, setFocused] = useState<[number, number] | null>(null);
  const [message, setMessage] = useState<string>("");
  const [errorCells, setErrorCells] = useState<(string | null)[][]>(
    Array.from({ length: 9 }, () => Array(9).fill(null))
  );
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

  const moveFocus = (dr: number, dc: number) => {
    if (!focused) return;
    const [r0, c0] = focused;

    if (dr !== 0) {
      for (let step = 1; step <= 9; step++) {
        const newR = (r0 + dr * step + 9) % 9;
        if (board[newR][c0] === "0" || errorCells[newR][c0]) {
          setFocused([newR, c0]);
          return;
        }
      }
    } else if (dc !== 0) {
      for (let step = 1; step <= 9; step++) {
        const newC = (c0 + dc * step + 9) % 9;
        if (board[r0][newC] === "0" || errorCells[r0][newC]) {
          setFocused([r0, newC]);
          return;
        }
      }
    }

    let nearestCell: [number, number] | null = null;
    let minDist = Infinity;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === "0" || errorCells[r][c]) {
          const dist = Math.abs(r - r0) + Math.abs(c - c0);
          if (dist < minDist) {
            minDist = dist;
            nearestCell = [r, c];
          }
        }
      }
    }
    if (nearestCell) setFocused(nearestCell);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!focused) return;
    const [r, c] = focused;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        moveFocus(-1, 0);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveFocus(1, 0);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(0, -1);
        break;
      case "ArrowRight":
        e.preventDefault();
        moveFocus(0, 1);
        break;
      default:
        if (/^[1-9]$/.test(e.key) && (board[r][c] === "0" || errorCells[r][c])) {
          const newBoard = board.map(row => [...row]);
          const newErrors = errorCells.map(row => [...row]);

          if (e.key === solutionBoard[r][c]) {
            newBoard[r][c] = e.key;
            newErrors[r][c] = null;
            setMessage("Good guess ✅");
          } else {
            newBoard[r][c] = "0";
            newErrors[r][c] = e.key;
            setMistakes(prev => prev + 1);
            setMessage("Wrong guess ❌");
          }

          setBoard(newBoard);
          setErrorCells(newErrors);
        }
    }
  };

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };



  return (
    <>
      {/* Timer and Mistakes */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", width: "100%", padding: "0 10px", marginBottom: "10px" }}>
        <div>Timer: {formatTime(time)}</div>
        <div>Mistakes: {mistakes}</div>
      </div>

      <div
        className="sudoku-board"
        tabIndex={0}
        ref={boardRef}
        onKeyDown={handleKeyDown}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isFocused = focused?.[0] === r && focused?.[1] === c;
            const wrongNumber = errorCells[r][c];

            return (
              <div
                key={`${r}-${c}`}
                className={`sudoku-cell${
                  ((r + 1) % 3 === 0 && r !== 8 ? " border-bottom" : "") +
                  ((c + 1) % 3 === 0 && c !== 8 ? " border-right" : "") +
                  (isFocused ? " focused" : "") +
                  (wrongNumber ? " error" : "")
                }`}
                onClick={() => {
                  // Allow focusing only empty or error cells
                  if (board[r][c] === "0" || errorCells[r][c]) {
                    setFocused([r, c]);
                    boardRef.current?.focus(); // ensure keyboard input works
                  }
                }}
              >
                {cell !== "0" ? cell : wrongNumber ? wrongNumber : ""}
              </div>
            );
          })
        )}
      </div>

      <div style={{ marginTop: "20px", fontSize: "18px", minHeight: "24px" }}>
        {message}
      </div>
    </>
  );
};

export default SudokuBoard;
