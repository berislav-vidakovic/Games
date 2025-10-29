//import { StatusCodes } from "http-status-codes"
import type { Dispatch, SetStateAction } from "react";
import type { User } from '@common/interfaces';
import { StatusCodes } from "http-status-codes";

let setInitializedRef:  Dispatch<SetStateAction<boolean>>;
let setUsersRegisteredRef:  Dispatch<SetStateAction<User[]>>;
let setCurrentUserIdRef:  Dispatch<SetStateAction<number | null>>; 
let setOnlineUsersRef:  Dispatch<SetStateAction<number>>;
let setCallerUserIdRef:  Dispatch<SetStateAction<number | null>>;
let setCalleeUserIdRef:  Dispatch<SetStateAction<number | null>>;


export function setStateFunctionRefs(
  setInitialized:  Dispatch<SetStateAction<boolean>>,
  setUsersRegistered:  Dispatch<SetStateAction<User[]>>,
  setCurrentUserId:  Dispatch<SetStateAction<number | null>>,
  setOnlineUsers:  Dispatch<SetStateAction<number>>,
  setCallerUserId:  Dispatch<SetStateAction<number | null>>,
  setCalleeUserId:  Dispatch<SetStateAction<number | null>>
){
    setInitializedRef = setInitialized;
    setUsersRegisteredRef = setUsersRegistered;
    setCurrentUserIdRef = setCurrentUserId;
    setOnlineUsersRef = setOnlineUsers;
    setCallerUserIdRef = setCallerUserId;
    setCalleeUserIdRef = setCalleeUserId;
}

export  const handleResponseGetAllUsers = ( jsonResp: any ) => {    
  // Map API response fields to match your User interface
  const mappedUsers: User[] = jsonResp.users.map((u: any) => ({
    userId: u.userId,
    login: u.login,
    fullname: u.fullName,  
    isonline: u.isOnline   
  }));
  const onlineusers = mappedUsers.filter( u => u.isonline == true ).length;
  console.log("Online user(s):", onlineusers );
  setOnlineUsersRef( onlineusers );

  // Update React state - ref. to setUsersRegistered 
  setUsersRegisteredRef(mappedUsers);
  console.log("Response to GET users: ", jsonResp );
  sessionStorage.setItem("myID", jsonResp.id );
  setInitializedRef(true);
  setCurrentUserIdRef(null);
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

export function handleUserLogin( jsonResp: any, status: number ){
  //var response = new { userId, isOnline = true };
  console.log("******** ****** POST response handleUserLogin received: ", 
      jsonResp, "Status: ", status); 
  if( status == StatusCodes.OK )
    setCurrentUserIdRef(Number(jsonResp.userId));
}

export function handleUserLogout( jsonResp: any, status: number ){
  console.log("Logout POST response received: ", jsonResp); 
  //var response = new { userId, isOnline = false };  
  if( status == StatusCodes.OK )
    setCurrentUserIdRef(null);
}

export function handleInvite( jsonResp: any, status: number ){
  //var response = new { userId, isOnline = true };
  console.log("******** ****** POST response handleInvite received: ", 
      jsonResp, "Status: ", status); 
  if( status == StatusCodes.OK ){
    //setCurrentUserIdRef(Number(jsonResp.userId));
    console.log("user Invited");
    // var response = new { acknowledged = true, callerId, calleeId };
    
    setCallerUserIdRef( Number(jsonResp.callerId) );
    setCalleeUserIdRef( Number(jsonResp.calleeId) );
  }
}

// ws message handlers -----------------------------------
export async function handleWsMessage( jsonMsg: any ) {
  //console.log("WS conn:", isWsConnected );
    if( jsonMsg.type== "userRegister" )
      handleWsUserRegister(jsonMsg.data);
    else if( jsonMsg.type == "userSessionUpdate" )
      handleWsUserSessionUpdate(jsonMsg.data)
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

async function handleWsUserSessionUpdate( jsonMsgData: any ) {
  //var response = new { userId, isOnline = true };
  //var msg = new { type = "userSessionUpdate", status = "WsStatus.OK", data = response };
  const userId = jsonMsgData.userId;
  const isOnline = jsonMsgData.isOnline;    
    setUsersRegisteredRef(prev => {
    const updated = prev.map(u =>
      u.userId === userId
        ? { ...u, isonline: isOnline } // update online status
        : u
    );

    // compute online users count from the updated array
    const onlineCount = updated.filter(u => u.isonline).length;
    setOnlineUsersRef(onlineCount);

    console.log("Online user(s):", onlineCount);
    return updated;
  });
}


