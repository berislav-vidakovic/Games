import { sendGraphQLquery, getGraphQLurl } from './API';


export async function queryPing(){  
  const body = JSON.stringify({ query: "{ ping }"});
  console.log("Sending GraphQL ping query to: ", getGraphQLurl() );
  const json = await sendGraphQLquery(body);
  console.log( "GraphQL Ping response: ", json);
}

export async function queryPingDb(){  
  const body = JSON.stringify({ query: "{ pingDb }"});
  console.log("Sending GraphQL pingDB query to: ", getGraphQLurl() );

  const json = await sendGraphQLquery(body)
  console.log( "GraphQL PingDB response: ", json);
}


export async function queryGetAllUsers(){
  const body = JSON.stringify({ 
    query: `{ getAllUsers { id, techstack, users { userId, login, fullName, isOnline } } }` });

  const jsonData = await sendGraphQLquery(body);
  console.log( "GraphQL getAllUsers response: ", jsonData);   
  
  return jsonData.getAllUsers;
}


export async function queryGetLocalization(){
  const clientId = sessionStorage.getItem("myID");
  const query = `
    query {
      localizations(clientId: "${clientId}") {
        locales {
          paramKey
          paramValue
          language
        }
      }
    }
  `;
  const body = JSON.stringify({ query });
  
  const jsonData = await sendGraphQLquery(body);
  console.log( "GraphQL queryGetLocalization response: ", jsonData);   

  return jsonData.localizations;
}

// GraphQL mutation
export interface RegisterUserResponse {
  acknowledged: boolean;
  error?: string;
  user?: {
    userId: string;
    login: string;
    fullName: string;
  };
}
/* Schema on backend
type Mutation {
  registerUser( login: String!, fullName: String!, password: String!): RegisterUserPayload!
}

  */
export async function mutationRegisterUser(login: string,
  fullName: string, password: string): Promise<RegisterUserResponse> {
  const body = JSON.stringify({
    query: `
      mutation RegisterUser(
        $login: String!
        $fullName: String!
        $password: String!
        ) {
        registerUser(
          login: $login
          fullName: $fullName
          password: $password
          ) {
            acknowledged
            error
            user {
              userId
              login
              fullName
            }
        }
      }
    `,
    variables: { login, fullName, password }
  });

  console.log("*** Sending GraphQL mutation mutationRegisterUser with body:", body);
  const jsonData = await sendGraphQLquery(body);
  console.log("GraphQL registerUser response:", jsonData);
  // GraphQL always wraps data in 'data'
  return jsonData.registerUser;
}


// RefreshLogin mutation
/*schema on backend
  type Mutation {
    refreshToken(clientId: ID!, refreshToken: String!): RefreshTokenResponse!
  }
  type RefreshTokenResponse {
    accessToken: String!
    refreshToken: String!
    userId: Int!
    isOnline: Boolean!
    error: String
  }
*/ 
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  isOnline: boolean;
  error?: string | null;
}

/* REST call
  const refreshToken = sessionStorage.getItem("refreshToken");
  const body = JSON.stringify({ refreshToken } );
  console.log("POST sending: ", body );
  const resp : ApiResponse = await sendPOSTRequestAsync(POSTloginRefreshEndpoint, body );
  if( resp.status != StatusCodes.OK )
    return null;
  return resp.data; */

  
export async function mutationRefreshLogin(): Promise<RefreshTokenResponse> {
  const refreshToken = sessionStorage.getItem("refreshToken");
  const clientId = sessionStorage.getItem("myID");
  
  const query = `
    mutation RefreshToken($clientId: String!, $refreshToken: String) {
      refreshToken(clientId: $clientId, refreshToken: $refreshToken) {
        accessToken
        refreshToken
        userId
        isOnline
        error
      }
    }
  `;

  const variables = { clientId, refreshToken };
  const body = JSON.stringify({ query, variables });

  const jsonData = await sendGraphQLquery(body);
  console.log("GraphQL refreshToken response:", jsonData);

  // GraphQL always wraps data in 'data'
  return jsonData.refreshToken;
}


// generic function
