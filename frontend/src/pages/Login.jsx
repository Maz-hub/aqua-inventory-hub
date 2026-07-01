/**
 * Login Page
 *
 * Renders the login form using the reusable Form component.
 * On successful login, stores JWT tokens and redirects to home page.
 */

import { useState, useEffect } from "react";
import Form from "../components/Form";

const Login = () => {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('session_expired')) {
      setSessionExpired(true);
      sessionStorage.removeItem('session_expired');
    }
  }, []);

  return (
    <Form
      route="/api/token/"
      method="login"
      notice={sessionExpired ? "Your session has expired. Please log in again." : null}
    />
  );
};

export default Login;
