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


export const getTitle = (paramKey: string): string => {
  const currentLang = sessionStorage.getItem('currentLang') || 'en';
  const locale = locales.find( l => 
    l.paramKey == paramKey && l.language == currentLang );
  console.log("Get title", paramKey, "->", locale);
  return locale ? locale.paramValue : paramKey;
}

export async function loadCommonConfig(
  setConfigLoaded:  Dispatch<SetStateAction<boolean>>
): Promise<void> {
  const currentEnv = detectEnv();

  const response = await fetch('clientsettings.json');
  if (!response.ok) {
    throw new Error('Failed to load configuration');
  }

  const config = await response.json();
  ////console.log(`Loaded environment: ${currentEnv}`);

  URL_BACKEND_HTTP = config.urlBackend[currentEnv].HTTP;
  URL_BACKEND_WS = config.urlBackend[currentEnv].WS;
  URL_PANEL = config.urlFrontend[currentEnv].panel;
  URL_SUDOKU = config.urlFrontend[currentEnv].sudoku;
  URL_CONNECT4 = config.urlFrontend[currentEnv].connect4;
  URL_BATTLESHIP = config.urlFrontend[currentEnv].battleship;

  setConfigLoaded(true);
}

export async function getLocalization() {
    sendGETRequest('api/localization/get', handleGetLocalization);
    //console.log("GET localization sent...");
} 

export  const handleGetLocalization = ( jsonResp: any ) => {    
  console.log("GET Locales:", jsonResp)
  locales = jsonResp.locales.map( (l: any) => ({
    paramKey: l.paramKey,
    paramValue: l.paramValue,
    language: l.language
  }) );
  console.log("Locales stored:", locales);
}
