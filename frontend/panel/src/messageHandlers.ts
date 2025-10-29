//import { StatusCodes } from "http-status-codes"
import type { Dispatch, SetStateAction } from "react";
import type { User } from '@common/interfaces';

let setInitializedRef:  Dispatch<SetStateAction<boolean>>;
let setWsConnectedRef:  Dispatch<SetStateAction<boolean>>;
let setUsersRegisteredRef:  Dispatch<SetStateAction<User[]>>;
let setCurrentUserIdRef:  Dispatch<SetStateAction<number | null>>; 

export function setStateFunctionRefs(
  setInitialized:  Dispatch<SetStateAction<boolean>>,
  setWsConnected:  Dispatch<SetStateAction<boolean>>,
  setUsersRegistered:  Dispatch<SetStateAction<User[]>>,
  setCurrentUserId:  Dispatch<SetStateAction<number | null>>,
){
    setInitializedRef = setInitialized;
    setWsConnectedRef = setWsConnected;
    setUsersRegisteredRef = setUsersRegistered;
    setCurrentUserIdRef = setCurrentUserId;
}

export  const handleResponseGetAllUsers = ( jsonResp: any ) => {    
    // Map API response fields to match your User interface
    const mappedUsers: User[] = jsonResp.users.map((u: any) => ({
      userId: u.userId,
      login: u.login,
      fullname: u.fullName,  
      isonline: u.isOnline   
    }));
    // Update React state - ref. to setUsersRegistered 
    setUsersRegisteredRef(mappedUsers);
    console.log("Response to GET users: ", jsonResp );
    sessionStorage.setItem("myID", jsonResp.id );
    setInitializedRef(true);
  }

export const handleResponseSignUp = ( jsonResp: any, status: number ) => {    
  console.log("*** HANDLE User registered: ", jsonResp, "Status: ", status);
  if( jsonResp.acknowledged ) {     
    console.log("User registered: ", jsonResp.user);
  }
  else {
    console.log("User NOT registered: ", jsonResp.error);
    alert("NOT registered: User already exists");
  }
}

// ws message handlers -----------------------------------
export async function handleWsMessage( jsonMsg: any ) {
  //console.log("WS conn:", isWsConnected );
    if( jsonMsg.type== "userRegister" )
    handleWsUserRegister(jsonMsg.data);
}

function handleWsUserRegister( jsonResp: any ){
  console.log("*** Ws-HANDLE User registered: ", jsonResp);
  if( jsonResp.acknowledged ) { 
    // Construct the new user object
    const newUser: User = {
      userId: jsonResp.user.userId,
      login: jsonResp.user.login,
      fullname: jsonResp.user.fullName,
      isonline: jsonResp.user.isOnline,
    };
    // Update frontend state (append to existing users list)    
    setUsersRegisteredRef(prev => {
      const dupe = prev.some(u => u.userId === newUser.userId);
      if( dupe ) console.log("=====================Duplicate ID found, no user appending");
      return dupe ? prev : [...prev, newUser];
    });

    console.log("Ws-User registered: ", jsonResp.user);
  }
  else {
    console.log("User NOT registered: ", jsonResp.error);
    alert("NOT registered: User already exists");
  }
}
