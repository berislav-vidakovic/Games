import type { Dispatch, SetStateAction } from "react";
import { sendPOSTRequest } from '@common/restAPI';
import { StatusCodes } from "http-status-codes";

let setMyColorRef: Dispatch<SetStateAction<"Red" | "Yellow" | null>>;
let setGameStateRef: Dispatch<SetStateAction<"init" | "myMove" | "theirMove" | "draw" | "myWin" | "theirWin" | null>>;


let myUserId : number | null = null;
export function updateUserId(userId: number | null){
  myUserId = userId;
  console.log("===============User ID updated: ", myUserId);
}

export function setStateFunctionRefs(
  setMyColor: Dispatch<SetStateAction<"Red" | "Yellow" | null>>,
  setGameState: Dispatch<SetStateAction<"init" | "myMove" | "theirMove" | "draw" | "myWin" | "theirWin" | null>>

){
    setMyColorRef = setMyColor;
    setGameStateRef = setGameState;
}

export async function swapColors( 
    gameId: string | null ){
  // /api/games/connect4/swapcolors
  // 1- send POST
  // 2- handle POST
  // 3- handle WS
  const body = JSON.stringify({gameId, userId: myUserId});
  sendPOSTRequest( 'api/games/connect4/swapcolors', body, handleResponseSwapColors);
}

async function handleResponseSwapColors( jsonResp: any, status: number ) {
  if( status == StatusCodes.OK ){
    setMyColorRef(jsonResp.color);
  }
  else 
    alert(`Error: ${jsonResp.error} STATUS: ${status}`);
}

// -------------------------------------------------------------------------
export async function startGame( 
    gameId: string | null ){
  // /api/games/connect4/start
  // 1- send POST
  // 2- handle POST
  // 3- handle WS
  const body = JSON.stringify({gameId, userId: myUserId });
  sendPOSTRequest( 'api/games/connect4/start', body, handleResponsePlayerMove);
}

async function handleResponsePlayerMove( jsonResp: any, status: number ) {
  if( status == StatusCodes.OK ){
    console.log("jsonResp.userId", jsonResp.userId, myUserId)
    if( Number(jsonResp.userId) == myUserId )
      setGameStateRef( "myMove");
    else
      setGameStateRef( "theirMove");
  }
  else 
    alert(`Error: ${jsonResp.error} STATUS: ${status}`);
}

// ws message handlers -----------------------------------
export async function handleWsMessage( jsonMsg: any ) {
  //console.log("WS conn:", isWsConnected );
  
    if( jsonMsg.type== "swapColors" )
      setMyColorRef(jsonMsg.data.color);
    if( jsonMsg.type== "startGame" ) {
      console.log("jsonMsg.data.userId", jsonMsg.data.userId, myUserId)
      if( Number(jsonMsg.data.userId) == myUserId )
        setGameStateRef( "myMove");
      else
        setGameStateRef( "theirMove");
    }
    console.log(jsonMsg);
}


