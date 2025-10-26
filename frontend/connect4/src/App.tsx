import connect4Img from '../assets/connect4.png';
import './App.css';
import "@common/style.css";
import { loadCommonConfig } from '@common/config';
import { useState, useEffect } from 'react';



function App() {
  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  
  useEffect( () => { 
    loadCommonConfig(setConfigLoaded);     
  }, []);


  return (
    <div className="app-container">
      <h1>Connect Four</h1>
      <div className="buttons-container">
        <button onClick={() => {
            if( !isConfigLoaded )
              console.log("Config not loaded");
            else  
              console.log("Connect 4 is under construction");
          }
        }>
          <img src={connect4Img} alt="Connect 4" />
        </button>        
      </div>
    </div>
  );
}

export default App;
