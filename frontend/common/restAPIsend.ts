import { sendGETRequestAsync, sendPOSTRequestAsync } from './API';
import type { ApiResponse } from './API';
import { StatusCodes } from 'http-status-codes';

const GETusersEndpoint = 'api/users/all';
const POSTuserRegisterEndpoint = 'api/users/new';
const POSTuserLoginEndpoint = 'api/auth/login';
const POSTloginRefreshEndpoint = 'api/auth/refresh';
const POSTuserLogoutEndpoint = 'api/auth/logout';
//const POSTinviteEndpoint = 'api/invitations/invite';
//const POSTcancelEndpoint = 'api/invitations/cancel';
//const POSTacceptEndpoint = 'api/invitations/accept';
//const POSTrejectEndpoint = 'api/invitations/reject';
//const POSTrunGame = 'api/games/run';
const GETlocalizationEnpoint = 'api/localization/get';

const GETsudokuBoardsEnpoint = 'api/sudoku/board';
const POSTsudokuTestedOK = 'api/sudoku/tested';
const POSTsudokuAddGame = 'api/sudoku/addgame';
const POSTsudokuSetName = 'api/sudoku/setname';
const POSTsudokuSolution = 'api/sudoku/solution';


// PANEL client API functions ----------------------------------------------
export async function getAllUsersREST() {
  let jsonResp: string = "";
  const apiResp : ApiResponse = await sendGETRequestAsync(GETusersEndpoint);
  if( apiResp.status == StatusCodes.OK )
    jsonResp = apiResp.data;
  else
    console.error("Error fetching all users. STATUS: ", apiResp.status );
  // Adapter pattern - normalize responses
  console.log("getAllUsers Reponse: ", jsonResp );

  return jsonResp;
}

export async function refreshLoginREST(){
  const refreshToken = sessionStorage.getItem("refreshToken");
  const body = JSON.stringify({ refreshToken } );
  console.log("POST sending: ", body );
  const resp : ApiResponse = await sendPOSTRequestAsync(POSTloginRefreshEndpoint, body );
  if( resp.status != StatusCodes.OK )
    return null;
  return resp.data;
}

export async function getLocalizationREST(){
  const resp:ApiResponse = await sendGETRequestAsync(GETlocalizationEnpoint);
  if( resp.status == StatusCodes.OK )
    return resp.data;
  return null;
}

export async function logoutUserREST( userId: number){
  const body = JSON.stringify({ userId } );
  const resp:ApiResponse = await sendPOSTRequestAsync(POSTuserLogoutEndpoint, body);
  if( resp.status == StatusCodes.OK )
    return resp.data;
  return null;
}

export async function loginUserREST(userId: number, password: string) {
  const body = JSON.stringify({ userId, password } );
  const resp:ApiResponse = await sendPOSTRequestAsync(POSTuserLoginEndpoint, body);
  if( resp.status == StatusCodes.OK )
    return resp.data;
  return null;
}

export async function registerUserREST(login: string, fullname: string, password: string) {
  const body = JSON.stringify({ register: { login, fullname, password } } );
  const resp:ApiResponse = await sendPOSTRequestAsync(POSTuserRegisterEndpoint, body);
  if(  resp.status == StatusCodes.OK 
    || resp.status == StatusCodes.CREATED // successfully registered
    || resp.status == StatusCodes.BAD_REQUEST // missing fields
    || resp.status == StatusCodes.CONFLICT // user already exists
  )
    return resp.data;
  return null;
}

// SUDOKU game API functions ----------------------------------------------
export async function getSudokuBoardsREST(){
  const resp:ApiResponse = await sendGETRequestAsync( GETsudokuBoardsEnpoint );
  if( resp.status == StatusCodes.OK )
    return resp.data;
  return null;
}

export async function setTestedOkREST(board: string ){
  const body = JSON.stringify({  board });
  const resp:ApiResponse = await sendPOSTRequestAsync( POSTsudokuTestedOK, body );
  if( resp.status == StatusCodes.OK )
    return resp.data;
  return null;
}

export async function setNameREST(board: string, name: string){
  const body = JSON.stringify({ board, name });
  const resp:ApiResponse = await sendPOSTRequestAsync( POSTsudokuSetName, body );
  if( resp.status == StatusCodes.OK )
    return resp.data;
  return null;
}

export async function addGameREST(board: string, name: string){
  const body = JSON.stringify({ board, name });
  console.log("Adding game REST API call, body: ", body );
  const resp:ApiResponse = await sendPOSTRequestAsync( POSTsudokuAddGame, body );
  if( resp.status == StatusCodes.OK || resp.status == StatusCodes.CREATED )
    return resp.data;
  return null;
}

export async function updateSolutionREST(board: string, solution: string){
  const body = JSON.stringify({ board, solution });
  const resp:ApiResponse = await sendPOSTRequestAsync( POSTsudokuSolution, body );
  if( resp.status == StatusCodes.OK )
    return resp.data;
  return null;
}


// CONNECT4 game API functions --------------------------------------------

