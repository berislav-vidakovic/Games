import { sendPOSTRequest } from '@common/restAPI';
import { getAllUsersAPI, refreshLoginAPI, logoutUserAPI,
  loginUserAPI, registerUserAPI } from '@common/hubAPI';

import { handleResponseSignUp, handleUserLogin, handleUserLogout, 
  handleInvite, handleResponseRunGame, handleResponseGetAllUsers } from './messageHandlers';

const POSTinviteEndpoint = 'api/invitations/invite';
const POSTcancelEndpoint = 'api/invitations/cancel';
const POSTacceptEndpoint = 'api/invitations/accept';
const POSTrejectEndpoint = 'api/invitations/reject';
const POSTrunGame = 'api/games/run';

export async function getAllUsers() {  
  const jsonResp: string = await getAllUsersAPI();
  if( jsonResp )
    handleResponseGetAllUsers( jsonResp );    
  else
    console.error("Error fetching all users. No data received." );
}

export async function loginRefresh(handleLoginRefresh: (data: any) => void) {  
  const jsonResp = await refreshLoginAPI();
  console.log("RESPONSE of refreshLoginAPI: ", jsonResp);
  handleLoginRefresh( jsonResp);  
}

export async function logoutUser(userId: number) {
  const jsonResp = await logoutUserAPI(userId);
  handleUserLogout( jsonResp );
}

export async function loginUser(userId: number, password: string) {
  const jsonResp = await loginUserAPI(userId, password);
  handleUserLogin( jsonResp );  
}


export async function registerUser(login: string, fullname: string, password: string) {
  const jsonResp = await registerUserAPI(login, fullname, password);
  
  console.log("Register User Response: ", jsonResp );
  handleResponseSignUp( jsonResp );
}


/*
export async function registerUser(login: string, fullname: string, password: string) {
  const body = JSON.stringify({ register: { login, fullname, password } } );
  //{ register: { login, fullname } 
  sendPOSTRequest(POSTuserRegisterEndpoint, body, handleResponseSignUp);
  //console.log("POST sending: ", body );
}
*/

/// Refactoring from callback to async/await design ----------------------------------


// -> Request { callerId, calleeId, selectedGame }  
// Response { "invitation": "send" | "cancel" | "accept" | "reject", callerId, calleeId, selectedGame }
export async function inviteUser(callerId: number, calleeId: number, 
    invitation: "send" | "cancel" | "accept" | "reject",
    selectedGame: string | null = null) {
  const body = JSON.stringify({ callerId, calleeId, selectedGame } );
  switch(invitation){
    case "send":
      sendPOSTRequest(POSTinviteEndpoint, body, handleInvite);
      console.log("POST invitiation sending: ", body );
      break;
    case "cancel":
      sendPOSTRequest(POSTcancelEndpoint, body, handleInvite);
      //console.log("POST invitiation CANCEL: ", body );
      break;
    case "accept":
      sendPOSTRequest(POSTacceptEndpoint, body, handleInvite);
      //console.log("POST invitiation Accept: ", body );
      break;
    case "reject":
      sendPOSTRequest(POSTrejectEndpoint, body, handleInvite);
      //console.log("POST invitiation Reject: ", body );
      break;
  }
}


// ->Req: { run: "Connect Four", userId1, userId2, senderId, refreshToken } 
// Resp: { game: "Connect Four", gameid, senderId, refreshToken, accessToken }
export async function runGame(userId1: number, 
    userId2: number, run: string | null, senderId: number) {
  const body = JSON.stringify({ run, userId1, userId2, senderId,
    refreshToken: sessionStorage.getItem("refreshToken") } );
  sendPOSTRequest(POSTrunGame, body, handleResponseRunGame);  
}
