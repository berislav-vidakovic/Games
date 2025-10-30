// App.tsx
import Board from "./Board";
//import { sendGETRequest } from '@common/restAPI';
import { loadCommonConfig } from '@common/config';
import { useEffect, useState } from "react";

function App() {
  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  const [boardString, setBoardString] = useState<string>("YRY---------------------------------------");
  
  useEffect( () => { 
    loadCommonConfig(setConfigLoaded);     
    console.log( "Loading Config ... ", isConfigLoaded);
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('gameId');
    console.log('Game ID:', gameId);
  }, []);


  return (
    <div 
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
       
      <h2>Connect Four</h2>
     
      {<Board 
        boardString={boardString} 
        setBoardString={setBoardString}
      />
      }
    </div>
  );
}

export default App;