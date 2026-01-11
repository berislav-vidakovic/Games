// common/config.ts

import type { Dispatch, SetStateAction } from "react";
import { queryPing, queryPingDb } from './graphQL';
import { getLocalizationAPI, setApiOption } from './hubAPI';

import type { Locales } from './interfaces';

export const URL_BACKEND_HTTP =
  window.__ENV__?.BACKEND_HTTP_URL || getDefaultHttpUrl();

export const URL_BACKEND_WS =
  window.__ENV__?.BACKEND_WS_URL || getDefaultWsUrl();

declare global {
  interface Window {
    __ENV__?: {
      BACKEND_HTTP_URL?: string;
      BACKEND_WS_URL?: string;
    };
  }
}

function getDefaultHttpUrl(): string {
  const { protocol, host } = window.location;
  return `${protocol}//${host}`;
}

function getDefaultWsUrl(): string {
  const WS_PROTOCOL = window.location.protocol === "https:" ? "wss" : "ws";
  return `${WS_PROTOCOL}://${window.location.host}/websocket`;  
}

export let URL_PANEL = 'http://localhost:5174/panel';
export let URL_SUDOKU = 'http://localhost:5175/';
export let URL_CONNECT4 = 'http://localhost:5176/';
export let URL_MEMORY = 'http://localhost:5177/';

const apiDesign : 'REST' | 'GraphQL' = 'REST';  

let locales: Locales[] = [];

export const getTitle = (paramKey: string, lang: 'en' | 'de' | 'hr' | null = null): string => {
  //const currentLang = sessionStorage.getItem('currentLang') || 'en';
  const currentLang = lang || sessionStorage.getItem('currentLang') || 'en';
  let locale = locales.find( l => 
    l.paramKey == paramKey && l.language == currentLang );
  if( !locale && currentLang != 'en' ) // at least 'en' key has to be defined
    locale = locales.find( l => 
      l.paramKey == paramKey && l.language == 'en' );
  // return key if 'en' not found
  return locale ? locale.paramValue : paramKey;
}

export async function loadCommonConfig(
  setConfigLoaded:  Dispatch<SetStateAction<boolean>>  
): Promise<void> {
  
  //let backend = 'backendJavaMySQL';  
  setApiOption(apiDesign);
  
  if( import.meta.env.PROD ) {// Production
    console.log("***Production environment detected***");
    URL_PANEL = URL_BACKEND_HTTP + "/panel/";
    URL_SUDOKU = URL_BACKEND_HTTP + "/sudoku/"; 
    URL_CONNECT4 =  URL_BACKEND_HTTP + "/connect4/";
    URL_MEMORY =  URL_BACKEND_HTTP + "/memory/";
  }
  console.log("URL_PANEL=", URL_PANEL);
  console.log("URL_SUDOKU=", URL_SUDOKU);


  // GraphQL healthcheck 
  await queryPing();
  await queryPingDb();

  setConfigLoaded(true);
}

export async function getLocalization() {
  const jsonResp = await getLocalizationAPI();
  //console.log("Resp GET Locales:", jsonResp)
  locales = jsonResp.locales.map( (l: any) => ({
    paramKey: l.paramKey,
    paramValue: l.paramValue,
    language: l.language
  }) );
  //console.log("Locales stored:", locales);
} 
