// App.tsx
import Board from "./Board";
//import { sendGETRequest } from '@common/restAPI';
import { loadCommonConfig } from '@common/config';

import { useEffect, useState } from "react";


function App() {
  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [level, setLevel] = useState<number>(0);
  
  useEffect( () => { 
    loadCommonConfig(setConfigLoaded);     
    console.log( "Loading Config ... ", isConfigLoaded);
    setName("");
    setLevel(0);
  }, []);

  const boardString="YR-R--RY---RRYYR-R--RY---RRYYR-R--RY---RRY";

  return (
    <div 
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
      }}>
       
      <h2>Connect Four</h2>
     
      {<Board 
        boardString={boardString} 
        name={name}
        level={level}
      />
      }
    </div>
  );
}

export default App;