// common/config.ts

import type { Dispatch, SetStateAction } from "react";
import { sendGETRequest } from './restAPI';
import type { Locales } from './interfaces';

export let URL_BACKEND_HTTP = '';
export let URL_BACKEND_WS = '';
export let URL_PANEL = '';
export let URL_SUDOKU = '';
export let URL_CONNECT4 = '';
export let URL_BATTLESHIP = '';


let locales: Locales[] = [];


function detectEnv(): 'Development' | 'Production' {
  return import.meta.env.MODE === 'production' ? 'Production' : 'Development';
}


export const getTitle = (paramKey: string, lang: 'en' | 'de' | 'hr' | null = null): string => {
  //const currentLang = sessionStorage.getItem('currentLang') || 'en';
  const currentLang = lang || sessionStorage.getItem('currentLang') || 'en';
  const locale = locales.find( l => 
    l.paramKey == paramKey && l.language == currentLang );
  //if( paramKey == "panel.users")
    //console.log("Get title", paramKey, "->", locale, currentLang);
  return locale ? locale.paramValue : paramKey;
}

export async function loadCommonConfig(
  setConfigLoaded:  Dispatch<SetStateAction<boolean>>
): Promise<void> {
  const currentEnv = detectEnv();
/*
  let response = await fetch('subdomains.json');
  if (!response.ok) {
    throw new Error('Failed to load configuration subdomains.json');
  }
  const subdomains = await response.json(); */
  const response = await fetch('clientsettings.json');
  if (!response.ok) {
    throw new Error('Failed to load configuration clientsettings.json');
  }
  const config = await response.json();
  
  /*"BackendCsMySQL": {
    "devPort": 5003,
    "subDomain": "games" 
  }, */
  let backend = 'backendCsMySQL';
  backend = 'backendJavaMySQL';
  

  /* "urlBackend": {
      "Development": {
          "HTTP": "http://localhost:5003",
          "WS": "ws://localhost:5003/websocket"
      },
      "Production": {
          "HTTP": "https://games.barryonweb.com",
          "WS": "wss://games.barryonweb.com/websocket"
      }
    }, */

     //"HTTP": "http://localhost:5003",
     //"WS": "ws://localhost:5003/websocket"

  ////console.log(`Loaded environment: ${currentEnv}`);

  URL_BACKEND_HTTP = config.urlBackend[backend][currentEnv].HTTP;
  URL_BACKEND_WS = config.urlBackend[backend][currentEnv].WS;
  console.log("Backend URLs:", URL_BACKEND_HTTP, URL_BACKEND_WS);

  if( currentEnv === 'Development' ) {
    URL_PANEL = config.urlFrontend[currentEnv].panel;
    URL_SUDOKU = config.urlFrontend[currentEnv].sudoku;
    URL_CONNECT4 = config.urlFrontend[currentEnv].connect4;
    URL_BATTLESHIP = config.urlFrontend[currentEnv].battleship;
  } else {
    URL_PANEL = config.urlFrontend[backend][currentEnv].panel;
    URL_SUDOKU = config.urlFrontend[backend][currentEnv].sudoku;
    URL_CONNECT4 = config.urlFrontend[backend][currentEnv].connect4;
    URL_BATTLESHIP = config.urlFrontend[backend][currentEnv].battleship;
  }
  

  setConfigLoaded(true);
}

export async function getLocalization(): Promise<void> {
  return new Promise((resolve) => {
    sendGETRequest('api/localization/get', (jsonResp: any) => {
      handleGetLocalization(jsonResp);
      resolve(); // resolve the promise once locales are loaded
    });
  });
}


export  const handleGetLocalization = ( jsonResp: any ) => {    
  //console.log("Resp GET Locales:", jsonResp)
  locales = jsonResp.locales.map( (l: any) => ({
    paramKey: l.paramKey,
    paramValue: l.paramValue,
    language: l.language
  }) );
  //console.log("Locales stored:", locales);
}
