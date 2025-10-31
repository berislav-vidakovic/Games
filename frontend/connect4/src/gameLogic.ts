


export async function toggleColor(){

}


// ws message handlers -----------------------------------
export async function handleWsMessage( jsonMsg: any ) {
  //console.log("WS conn:", isWsConnected );
  /*
    if( jsonMsg.type== "userRegister" )
      handleWsUserRegister(jsonMsg.data);
    else if( jsonMsg.type == "userSessionUpdate" )
      handleWsUserSessionUpdate(jsonMsg.data)
    else if( jsonMsg.type == "invitation" )
      handleWsInvitation(jsonMsg.data) */
    console.log(jsonMsg);
}
