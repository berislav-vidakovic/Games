import { URL_BACKEND_HTTP } from './config';
import { StatusCodes } from "http-status-codes"

export const getGraphQLurl = () => URL_BACKEND_HTTP + "/graphql";

// REST API -----------------------------------------------------------
export interface ApiResponse {
  status: number;
  data: any; // parsed JSON or null
}

export async function sendGETRequestAsync(endpoint: string): Promise<ApiResponse> {
  const getUrl =
    `${URL_BACKEND_HTTP}/${endpoint}` +
    `?id=${sessionStorage.getItem("myID")}`;

  const response = await fetch(getUrl, {
    headers: {
      "Authorization": "Bearer " + sessionStorage.getItem("accessToken"),
      "Content-Type": "application/json"
    },
  });

  // Parse body if there is content
  const data = response.status !== StatusCodes.NO_CONTENT // 204
             ? await response.json() 
             : null;

  // Return both status and data
  return { status: response.status, data };
}

export async function sendPOSTRequestAsync(
  endpoint: string,
  msgBody: string
): Promise<ApiResponse> {

  const postUrl =
    `${URL_BACKEND_HTTP}/${endpoint}` +
    `?id=${sessionStorage.getItem("myID")}`;

  const response = await fetch(postUrl, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + sessionStorage.getItem("accessToken"),
      "Content-Type": "application/json"
    },
    body: msgBody,
  });

  const data  = response.status !== StatusCodes.NO_CONTENT // 204
              ? await response.json() 
              : null;
  
  if( response.status === StatusCodes.BAD_REQUEST ||
      response.status === StatusCodes.NOT_FOUND ||
      response.status === StatusCodes.CONFLICT 
  ) 
    console.log("POST returned Error:", data );

  return { status: response.status, data };
}


// GrapghQL API -----------------------------------------------------------
export async function sendGraphQLquery(body: string){
  const res = await fetch( getGraphQLurl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });  
  const json = await res.json();
  return json.data;
}


