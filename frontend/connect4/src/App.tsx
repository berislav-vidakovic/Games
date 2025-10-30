// App.tsx
import Board from "./Board";
import { sendPOSTRequest } from '@common/restAPI';
import { loadCommonConfig } from '@common/config';
import { useEffect, useState } from "react";

function App() {
  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  const [boardString, setBoardString] = useState<string>("YRY---------------------------------------");
  const [gameId, setGameId] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  
  useEffect( () => { 
    loadCommonConfig(setConfigLoaded);     
    console.log( "Loading Config ... ", isConfigLoaded);
    const params = new URLSearchParams(window.location.search);
    const gameID = params.get('gameId');
    const senderID = params.get('senderId');
    console.log('Game ID:', gameID, "UserID:", senderID);
    setGameId(gameID);
    setUserId(Number(senderID));
  }, []);

   useEffect( () => { 
    if( !isConfigLoaded || gameId == null ) return;
    const body = JSON.stringify({gameId, userId});
    sendPOSTRequest( 'api/games/init', body, handleResponse);
    
  }, [isConfigLoaded, gameId]);

  
  async function handleResponse( jsonMsg: any ) {
    console.log("POST init response:", jsonMsg);
  }


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