import type { Dispatch, SetStateAction } from "react";


// common/config.ts
export let URL_BACKEND_HTTP = '';
export let URL_BACKEND_WS = '';
export let URL_FRONTEND_PANEL = '';
export let URL_FRONTEND_SUDOKU = '';
export let URL_FRONTEND_CONNECT4 = '';
export let URL_FRONTEND_BATTLESHIP = '';


/**
 * Detects environment without depending on Vite.
 * Works in both dev and production builds.
 */
function detectEnv(): 'Development' | 'Production' {
  return import.meta.env.MODE === 'production' ? 'Production' : 'Development';
}

/**
 * Loads clientsettings.json and sets backend URLs.
 * Should be called once on app startup.
 */
export async function loadCommonConfig(
  setConfigLoaded:  Dispatch<SetStateAction<boolean>>
): Promise<void> {
  const currentEnv = detectEnv();

  // The URL here is relative to the frontend root
  // In dev, Vite will serve /common as ../common
  const response = await fetch('clientsettings.json');
  if (!response.ok) {
    throw new Error('Failed to load configuration');
  }

  const config = await response.json();
  console.log(`Loaded environment: ${currentEnv}`);

  URL_BACKEND_HTTP = config.urlBackend[currentEnv].HTTP;
  URL_BACKEND_WS = config.urlBackend[currentEnv].WS;
  setConfigLoaded(true);
}
