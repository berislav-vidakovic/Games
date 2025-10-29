import { sendGETRequest, sendPOSTRequest } from '@common/restAPI';
import { handleResponseSignUp } from './messageHandlers';

const GETusersEndpoint = 'api/users/all';
const POSTregisterUserEndpoint = 'api/users/new';


export async function getAllUsers(
  handleGetUsers: (data: any) => void
) {
    sendGETRequest(GETusersEndpoint, handleGetUsers);
    console.log("GET users sent...");
}

export async function registerUser(login: string, fullname: string) {
  const body = JSON.stringify({ register: { login, fullname } } );
  //{ register: { login, fullname } 
  sendPOSTRequest(POSTregisterUserEndpoint, body, handleResponseSignUp);
  console.log("POST sending: ", body );
}
