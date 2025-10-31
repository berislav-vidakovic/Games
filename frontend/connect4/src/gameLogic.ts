import type { Dispatch, SetStateAction } from "react";
import { sendPOSTRequest } from '@common/restAPI';
import { StatusCodes } from "http-status-codes";

let setMyColorRef: Dispatch<SetStateAction<"Red" | "Yellow" | null>>;
let setGameStateRef: Dispatch<SetStateAction<"init" | "myMove" | "theirMove" | "draw" | "myWin" | "theirWin" | null>>;
let setBoardRowsRef: Dispatch<SetStateAction<string[]>>;

let myUserId : number | null = null;
export function updateUserId(userId: number | null){
  myUserId = userId;
  console.log("===============User ID updated: ", myUserId);
}

export function updateSetBoardRows( setBoardRows: Dispatch<SetStateAction<string[]>> ){
  setBoardRowsRef = setBoardRows;
}

export function setStateFunctionRefs(
  setMyColor: Dispatch<SetStateAction<"Red" | "Yellow" | null>>,
  setGameState: Dispatch<SetStateAction<"init" | "myMove" | "theirMove" | "draw" | "myWin" | "theirWin" | null>>

){
    setMyColorRef = setMyColor;
    setGameStateRef = setGameState;
}


export function stringToMatrix( boardString: string,  
    setBoardRows: Dispatch<SetStateAction<string[]>> ){
  const matrix: string[] = [];
  for( let i = 0; i < 6; i++ ){
    const row: string = boardString.slice(i*7,i*7+7);
    matrix.push( row );
  }
  setBoardRows(matrix.reverse());
  console.log(" --------- stringToMatrix ----------------");
}


// -------------swapColors - POST request, POST reposne, WS incoming ----------
export async function swapColors( 
    gameId: string | null ){
  // /api/games/connect4/swapcolors
  // 1- send POST
  // 2- handle POST
  // 3- handle WS
  const body = JSON.stringify({gameId, userId: myUserId});
  sendPOSTRequest( 'api/games/connect4/swapcolors', body, handleSwapColorsResponse);
}

async function handleSwapColorsResponse( jsonResp: any, status: number ) {
  if( status == StatusCodes.OK ){
    setMyColorRef(jsonResp.color);
  }
  else 
    alert(`Error: ${jsonResp.error} STATUS: ${status}`);
}

// -------------startGame - POST request, POST reposne, WS incoming ----------
export async function startGame( 
    gameId: string | null ){
  // /api/games/connect4/start
  // 1- send POST
  // 2- handle POST
  // 3- handle WS
  const body = JSON.stringify({gameId, userId: myUserId });
  sendPOSTRequest( 'api/games/connect4/start', body, handleStartGameResponse);
}

async function handleStartGameResponse( jsonResp: any, status: number ) {
  if( status == StatusCodes.OK ){
    console.log("jsonResp.userId", jsonResp.userId, myUserId)
    if( Number(jsonResp.userId) == myUserId )
      setGameStateRef( "myMove");
    else
      setGameStateRef( "theirMove");
    console.log("Board POST: ", jsonResp.board);
    stringToMatrix(jsonResp.board, setBoardRowsRef);   
  }
  else 
    alert(`Error: ${jsonResp.error} STATUS: ${status}`);
}

// -------------insertDisk - POST request, POST reposne, WS incoming ----------
export async function insertDisk( 
    gameId: string | null, row: number, col: number ){
  const body = JSON.stringify({gameId, userId: myUserId, row, col });
  sendPOSTRequest( 'api/games/connect4/insertdisk', body, handleInsertDiskResponse);
}

async function handleInsertDiskResponse( jsonResp: any, status: number ) {
  if( status == StatusCodes.OK ){
    
    stringToMatrix(jsonResp.board, setBoardRowsRef);   
  }
  else 
    alert(`Error: ${jsonResp.error} STATUS: ${status}`);
}



// ------------- WS message handlers -----------------------------------
export async function handleWsMessage( jsonMsg: any ) {
  //console.log("WS conn:", isWsConnected );
  
    if( jsonMsg.type== "swapColors" )
      setMyColorRef(jsonMsg.data.color);
    else if( jsonMsg.type== "startGame" ) {
      console.log("jsonMsg.data.userId", jsonMsg.data.userId, myUserId)
      if( Number(jsonMsg.data.userId) == myUserId )
        setGameStateRef( "myMove");
      else
        setGameStateRef( "theirMove");
      stringToMatrix(jsonMsg.data.board, setBoardRowsRef);      
      console.log("Board WS: ", jsonMsg.data.board);
    }
    else if( jsonMsg.type == "insertDisk" ) {
      stringToMatrix(jsonMsg.data.board, setBoardRowsRef);
    }
    console.log(jsonMsg);
}


