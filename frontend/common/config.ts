// common/config.ts

import type { Dispatch, SetStateAction } from "react";

export let URL_BACKEND_HTTP = '';
export let URL_BACKEND_WS = '';
export let URL_PANEL = '';
export let URL_SUDOKU = '';
export let URL_CONNECT4 = '';
export let URL_BATTLESHIP = '';


function detectEnv(): 'Development' | 'Production' {
  return import.meta.env.MODE === 'production' ? 'Production' : 'Development';
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
  console.log(`Loaded environment: ${currentEnv}`);

  URL_BACKEND_HTTP = config.urlBackend[currentEnv].HTTP;
  URL_BACKEND_WS = config.urlBackend[currentEnv].WS;
  URL_PANEL = config.urlFrontend[currentEnv].panel;
  URL_SUDOKU = config.urlFrontend[currentEnv].sudoku;
  URL_CONNECT4 = config.urlFrontend[currentEnv].connect4;
  URL_BATTLESHIP = config.urlFrontend[currentEnv].battleship;

  setConfigLoaded(true);
}
