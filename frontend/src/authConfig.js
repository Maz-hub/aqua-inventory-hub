export const msalConfig = {
  auth: {
    clientId: "0ff4224e-676d-4fc2-bbd4-fb24be9ea072",        // Application ID from EVOK
    authority: "https://login.microsoftonline.com/787590cd-c785-4721-b131-553eb2e1b9d6", // Tenant ID from EVOK
    redirectUri: window.location.origin,   // redirect mode sends users back to the app itself
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read"],   // basic profile + email
};