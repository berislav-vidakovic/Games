import type { Dispatch, SetStateAction } from "react";
import { sendPOSTRequest } from '@common/restAPI';
import { StatusCodes } from "http-status-codes";


let setMyColorRef: Dispatch<SetStateAction<"Red" | "Yellow" | null>>;



export function setStateFunctionRefs(
  setMyColor: Dispatch<SetStateAction<"Red" | "Yellow" | null>>
){
    setMyColorRef = setMyColor;
}




export async function swapColors( 
    gameId: string | null, userId: number | null ){
  // /api/games/connect4/swapcolors
  // 1- send POST
  // 2- handle POST
  // 3- handle WS
  const body = JSON.stringify({gameId, userId });
  sendPOSTRequest( 'api/games/connect4/swapcolors', body, handleResponseSwapColors);
}

async function handleResponseSwapColors( jsonResp: any, status: number ) {
  if( status == StatusCodes.OK ){
    setMyColorRef(jsonResp.color);
  }
  else 
    alert(`Error: ${jsonResp.error} STATUS: ${status}`);
}

// ws message handlers -----------------------------------
export async function handleWsMessage( jsonMsg: any ) {
  //console.log("WS conn:", isWsConnected );
  
    if( jsonMsg.type== "swapColors" )
      setMyColorRef(jsonMsg.data.color);
    console.log(jsonMsg);
}
