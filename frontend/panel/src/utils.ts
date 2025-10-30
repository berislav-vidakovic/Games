import { sendGETRequest, sendPOSTRequest } from '@common/restAPI';
import { handleResponseSignUp, handleUserLogin, handleUserLogout, 
  handleInvite } from './messageHandlers';

const GETusersEndpoint = 'api/users/all';
const POSTuserRegisterEndpoint = 'api/users/new';
const POSTuserLoginEndpoint = 'api/users/login';
const POSTuserLogoutEndpoint = 'api/users/logout';
const POSTinviteEndpoint = 'api/invitations/invite';
const POSTcancelEndpoint = 'api/invitations/cancel';
const POSTacceptEndpoint = 'api/invitations/accept';
const POSTrejectEndpoint = 'api/invitations/reject';


export async function getAllUsers(
  handleGetUsers: (data: any) => void
) {
    sendGETRequest(GETusersEndpoint, handleGetUsers);
    console.log("GET users sent...");
}

export async function registerUser(login: string, fullname: string) {
  const body = JSON.stringify({ register: { login, fullname } } );
  //{ register: { login, fullname } 
  sendPOSTRequest(POSTuserRegisterEndpoint, body, handleResponseSignUp);
  console.log("POST sending: ", body );
}


export async function loginUser(userId: number) {
  const body = JSON.stringify({ userId } );
  
  sendPOSTRequest(POSTuserLoginEndpoint, body, handleUserLogin);
  console.log("POST sending: ", body );
}

export async function logoutUser(userId: number) {
  const body = JSON.stringify({ userId } );
  
  sendPOSTRequest(POSTuserLogoutEndpoint, body, handleUserLogout);
  console.log("POST sending: ", body );
}

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
      console.log("POST invitiation CANCEL: ", body );
      break;
    case "accept":
      sendPOSTRequest(POSTacceptEndpoint, body, handleInvite);
      console.log("POST invitiation Accept: ", body );
      break;
    case "reject":
      sendPOSTRequest(POSTrejectEndpoint, body, handleInvite);
      console.log("POST invitiation Reject: ", body );
      break;
  }
}
