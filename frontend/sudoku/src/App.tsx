// App.tsx
import Board from "./Board";
import { sendGETRequest } from '@common/restAPI';
import { loadCommonConfig } from '@common/config';

import { useEffect, useState } from "react";


function App() {
  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  const [areBoardsLoaded, setBoardsLoaded] = useState<boolean>(false);
  const [board, setBoard] = useState<string>("");
  const [solution, setSolution] = useState<string>("");
  
  // Config - backend URL for HTTP and WS
  useEffect( () => { 
    loadCommonConfig(setConfigLoaded);     
  }, []);

   useEffect( () => { if( isConfigLoaded){
      sendGETRequest('api/sudoku/board', handleInit );
   }      
  }, [isConfigLoaded]);

  const handleInit = ( jsonResp: any ) => {    
    console.log("Response to GET : ", jsonResp );
    setBoard(jsonResp.boards[0].board);
    setSolution(jsonResp.boards[0].solution);
    setBoardsLoaded(true);
  }

  return (
    <div 
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
      }}>
       
      <h2>Sudoku</h2>
     
      {areBoardsLoaded && board.length === 81 && solution.length === 81 &&
      <Board 
        boardString={board} 
        solutionString={solution} 
      />
      }
    </div>
  );
}

export default App;