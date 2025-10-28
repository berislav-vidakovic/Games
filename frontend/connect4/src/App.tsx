// App.tsx
import Board from "./Board";
//import { sendGETRequest } from '@common/restAPI';
import { loadCommonConfig } from '@common/config';

import { useEffect, useState } from "react";


function App() {
  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [level, setLevel] = useState<number>(0);
  const [boardString, setBoardString] = useState<string>("YRY---------------------------------------");
  
  useEffect( () => { 
    loadCommonConfig(setConfigLoaded);     
    console.log( "Loading Config ... ", isConfigLoaded);
    setName("");
    setLevel(0);
  }, []);


  return (
    <div 
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
       
      <h2>Connect Four</h2>
     
      {<Board 
        boardString={boardString} 
        setBoardString={setBoardString}
        name={name}
        level={level}
      />
      }
    </div>
  );
}

export default App;