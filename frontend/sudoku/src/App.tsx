// App.tsx
import Board from "./Board";
import { addGameAPI, getSudokuBoardsAPI, setNameAPI, setTestedOkAPI, updateSolutionAPI } from '@common/hubAPI';
import { loadCommonConfig } from '@common/config';
import { useEffect, useState } from "react";

function App() {
  const [isConfigLoaded, setConfigLoaded] = useState<boolean>(false);
  const [areBoardsLoaded, setBoardsLoaded] = useState<boolean>(false);
  const [boardString, setBoardString] = useState<string>("");
  const [solution, setSolution] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [level, setLevel] = useState<number>(0);
  const [testedOK, setTested] = useState<boolean>(false);
  const [adminMode, setAdminMode] = useState<boolean>(true);
  const [selectedGameIdx, setSelectedGameIdx] = useState<number | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [startTimer, setStartTimer] = useState(false);  
  
  useEffect( () => { 
    loadCommonConfig(setConfigLoaded);     
    const params = new URLSearchParams(window.location.search);
    console.log( "Params: userId=", params.get('userId') );
  }, []);

  const doGetBoard = async() => {
    const res = await getSudokuBoardsAPI(); 
    handleInit(res);
  }

  useEffect( () => { if( isConfigLoaded){      
      doGetBoard();
    }
  }, [isConfigLoaded]);


  interface Game {
    board: string,
    solution: string, 
    name: string, 
    level: number,
    testedOK: boolean
  } 

  const handleInit = ( jsonResp: any ) => {    
    console.log("Boards  : ", jsonResp );
    if( !jsonResp )
      return;
    sessionStorage.setItem("myID", jsonResp.clientId );
    if( jsonResp.boards.length ){
      const games : Game[] = [];
      for( let i = 0; i < jsonResp.boards.length; i++ ){
        const b = jsonResp.boards[i];
        games.push({
          board: b.board,
          solution: b.solution,
          name: b.name,
          level: b.level,
          testedOK: b.testedOK
        });
      }
      setGames(games);
      //console.log(games);
      console.log("GAME count: ",  games.length);
    }
    setBoardsLoaded(true);
  }

  const setCurrentGame = (idx: number) => {
    setBoardString(games[idx].board);
    setSolution(games[idx].solution);
    setName(games[idx].name);
    setLevel(games[idx].level);
    setTested( games[idx].testedOK);

  }

  useEffect(() => {
    if (games.length > 0 && selectedGameIdx === null) {
      setSelectedGameIdx(0);
      setCurrentGame(0);
    }
  }, [games]);

  const createEmptyBoard = () => {
    setBoardString("0".repeat(81));
    setSolution("0".repeat(81)); // Or also empty for now
    setName("New Game");
    setLevel(1);
    setBoardsLoaded(true);
  };

  const handleSetName = (jsonResp: any ) => {
    if(jsonResp){
      const game = games.find(g=>g.board == jsonResp.board);
      if( game ) {
        game.name = jsonResp.name;
        setGames([...games]);   // Trigger list refresh
        console.log("Board name updated: ", jsonResp);
      }
      else  
        console.log("Error - board not found", jsonResp);
    }
    else
      console.log("Error encountered - no valid Response for SetName ");
  }

  const handleSolution = (jsonResp: any) => {
    if( jsonResp )
    {
      const game: Game = {
        board: jsonResp.board,
        solution: jsonResp.solution,
        name: jsonResp.name,
        testedOK: false,
        level: 2
      };
      games.push(game);
      console.log("Board solution updated: ", jsonResp);
    }
    else
      console.log("Error encountered: ", jsonResp);
  }

  const handleAddGame = (jsonResp: any) => {
    if( jsonResp ) {
      console.log("Added new game: ", jsonResp);
      sessionStorage.setItem("currentGameAdding", boardString );
    }
    else
      console.log("Error encountered: ", jsonResp);
  }
  
  const handleTestedOK = ( jsonResp: any ) => {
    console.log("Tested OK response: ", jsonResp );
    if( jsonResp ){
      const game = games.find(g=>g.board == jsonResp.board);
      if( game ) {
        game.testedOK = true;        
        setGames([...games]);   // Trigger list refresh
        setTested(true);        // Update current game UI                      
        console.log("Tested OK updated: ", jsonResp);
      }
      else  
        console.log("Error - board not found", jsonResp);
    }
    else
      console.log("Error encountered: ", jsonResp);
  }

  return (
    <div 
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "16px",
        backgroundColor: "#f8f9fa",
      }}>
      
      { adminMode && (
      <div 
        className="auth-buttons"
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >      

      <div style={{ display: "flex", gap: "4px", justifyContent: "center", alignItems: "center" }}>
        <button
          onClick={()=>{
            setStartTimer(false); 
            setAdminMode(true);
            createEmptyBoard();
          }}
        >
          Clear
        </button>
        
        <button
         onClick={()=>{                          
              console.log(boardString); 
              (async() => { // IIFE
                console.log("Adding game...");
                const res = await addGameAPI( boardString, name ); 
                handleAddGame(res);
              })();
            }
          }   
        >
          Add game
        </button>

         {(<button
          disabled={false} //{boardString.includes("0")}}
          onClick={()=>{                          
              console.log(boardString); 
              const board = sessionStorage.getItem("currentGameAdding" );
              (async() => { // IIFE
                const res = await updateSolutionAPI( board as string, boardString ); 
                handleSolution(res);
              })();
            }
          }          
        >
          Solution
        </button>)        
        }
        </div>


          {
          <div style={{ width: "100%", marginTop: "8px" }}>
            <button
              onClick={()=>{                          
                  console.log(boardString, name, games[selectedGameIdx as number].name); 
                  (async() => { // IIFE
                    const res = await setNameAPI( boardString, name ); 
                    handleSetName(res);
                  })();
                }
              }            
            >Set Name</button>

            <input 
              type="text" 
              style={{ width: "30%", boxSizing: "border-box", marginLeft: "6px" }} 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Game name"
            />

            <button
              onClick={ ()=>{                          
                  console.log(boardString, name, games[selectedGameIdx as number].name);                   
                  (async() => { // Async Immediately Invoked Function Expression (IIFE)
                    const res = await setTestedOkAPI( boardString ); 
                    handleTestedOK(res);
                  })();
                }
              }  
            >Tested OK</button>
          </div>
          }
      </div>
      )}
      
      <h2>Sudoku</h2>
      <div className="auth-buttons">
        <button
          onClick={() => {
            console.log("selGame=", selectedGameIdx);
            setCurrentGame(selectedGameIdx as number);
            setAdminMode(false);
            setStartTimer(true);
          }}
        >
          Start
        </button>    

        <button
          onClick={()=>{
            //if( startTimer || adminMode ) return;
            if( startTimer  ) return;
            let idx:number = (selectedGameIdx as number+1) % games.length;
            console.log(selectedGameIdx, idx, games.length);
            setSelectedGameIdx(idx);
            setCurrentGame(idx);
          } }
        >
          Next
        </button>     
        <button
          onClick={()=> {
            if( !adminMode )
              setStartTimer(false); 
              setBoardsLoaded(false);
              doGetBoard();
            //setRestartTimerFlag(!restartTimerFlag);
          } }
        >
          New game
        </button>    
      </div>
     
      {areBoardsLoaded && boardString.length === 81 && solution.length === 81 && 
      <Board 
        key={boardString}  // forces component to remount whenever board string changes
        boardString={boardString} 
        setBoardString={setBoardString}
        solutionString={solution} 
        name={name}
        level={level}
        testedOK={testedOK}
        adminMode={adminMode}
        startTimer={startTimer}
        setStartTimer={setStartTimer}
      />
      }
    </div>
  );
}
export default App;
