import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./app.css";

// MSAL (Microsoft login) setup
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import api from "./api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

// Create the MSAL instance using our config
const msalInstance = new PublicClientApplication(msalConfig);

// MSAL v3+ requires explicit initialization before use
msalInstance.initialize().then(() => {
  // If Microsoft sign-in fails at any point, show the user a message on the
  // login page instead of leaving them stuck on a blank screen.
  const goToLoginWithError = (error) => {
    console.error(error);
    sessionStorage.setItem(
      "sso_error",
      "Microsoft sign-in failed. Please try again or use your username and password."
    );
    window.location.href = "/login";
  };

  // After initializing, check whether we've just been redirected back from
  // Microsoft's login page. If so, response will contain the login result.
  msalInstance
    .handleRedirectPromise()
    .then((response) => {
      if (response !== null) {
        // Send the Microsoft ID token to our backend to verify it and
        // get back our own app's JWT pair.
        api
          .post("/api/auth/microsoft/", {
            access_token: response.idToken,
          })
          .then((res) => {
            // Store our app's tokens the same way normal username/password login does.
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            // Send the browser to the home page now that we're logged in.
            window.location.href = "/";
          })
          .catch(goToLoginWithError);
      }
    })
    .catch(goToLoginWithError);

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      {/* MsalProvider makes Microsoft login available to the whole app */}
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </StrictMode>
  );
});