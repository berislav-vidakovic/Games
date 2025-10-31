// App.tsx
import Board from "./Board";
import { sendPOSTRequest } from '@common/restAPI';
import { loadCommonConfig } from '@common/config';
import { useEffect, useState } from "react";
import { StatusCodes } from "http-status-codes";
import { handleWsMessage, setStateFunctionRefs, updateUserId } from "./gameLogic";
import { connectWS } from '@common/webSocket';

function App() {
  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  const [isGameInitialized, setGameInitialized] = useState<boolean>(false);
  const [isWsConnected, setWsConnected] = useState<boolean>(false);
  const [boardString, setBoardString] = useState<string>("YRY---------------------------------------");
  const [gameId, setGameId] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [user2Id, setUser2Id] = useState<number | null>(null);
  const [user2Name, setUser2Name] = useState<string | null>(null);
  const [myColor, setMyColor] = useState<"Red" | "Yellow" | null>(null); 
  const [gameState, setGameState] = 
    useState<"init" | "myMove" | "theirMove" | "draw" | "myWin" | "theirWin" | null>(null); 
  
  // Common config
  useEffect( () => { 
    loadCommonConfig(setConfigLoaded);     
    console.log( "Loading Config ... ", isConfigLoaded);
    const params = new URLSearchParams(window.location.search);
    const gameID = params.get('gameId');
    const senderID = params.get('senderId');
    console.log('Game ID:', gameID, "UserID:", senderID);
    setGameId(gameID);
    setUserId(Number(senderID));
    updateUserId(Number(senderID));    
  }, []);

  // Common init
  useEffect( () => { 
    if( !isConfigLoaded || gameId == null ) return;
    const body = JSON.stringify({gameId, userId});
    sendPOSTRequest( 'api/games/init', body, handleResponseInit);
    setStateFunctionRefs(setMyColor, setGameState);
    setGameState("init");
  }, [isConfigLoaded, gameId]);
  
  async function handleResponseInit( jsonResp: any, status: number ) {
    console.log("POST init response:", jsonResp);
    // Req: {gameId, userId} Resp: {gameId, id, userName, user2Id, user2Name}
    if( status == StatusCodes.OK ){
      setUserName( jsonResp.userName);
      setUser2Id(Number(jsonResp.user2Id));
      setUser2Name(jsonResp.user2Name);
      sessionStorage.setItem("myID", jsonResp.id);
      setGameInitialized(true);
      connectWS( setWsConnected, handleWsMessage );
    }
    else 
      alert(`Error: ${jsonResp.error} STATUS: ${status}`);

    console.log( user2Id, user2Name, userName );
  }

  // Game-specific init
  useEffect( () => { 
    
    if( !isGameInitialized || !isWsConnected ) 
      console.log( "------NOT Ready for Connect4 initilization");
    else  {
      console.log( "--------Ready for Connect4 initilization");
      const body = JSON.stringify({gameId, userId});
      sendPOSTRequest( 'api/games/connect4/init', body, handleResponseConnect4Init);
    }
    
  }, [isGameInitialized, isWsConnected]);

  
  async function handleResponseConnect4Init( jsonResp: any, status: number ) {
    console.log("POST init response:", jsonResp);
    // Req: {gameId, userId} Resp: {gameId, id, userName, user2Id, user2Name}
    if( status == StatusCodes.OK ){
      console.log("My COLOR:", jsonResp.color);
      setMyColor(jsonResp.color);
    }
    else 
      alert(`Error: ${jsonResp.error} STATUS: ${status}`);
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
       <div className="info-connect4">
        <p>
          You: <b>{userName}</b> 
        </p>
        <p>
          Against: <b>{user2Name}</b> 
        </p>
      </div>
     
      {<Board 
        boardString={boardString} 
        setBoardString={setBoardString}
        myColor={myColor}
        gameId={gameId}
        userId={userId}
        gameState={gameState}
      />
      }
    </div>
  );
}

export default App;