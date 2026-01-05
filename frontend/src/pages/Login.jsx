/**
 * Login Page
 * 
 * Renders the login form using the reusable Form component.
 * On successful login, stores JWT tokens and redirects to home page.
 */

import Form from "../components/Form";
// Reusable form component handling both login and registration


const Login = () => {
  return (
    <>
      <Form route="/api/token/" method="login" />
      {/* route: Django API endpoint for obtaining JWT tokens */}
      {/* method: Tells Form component to display "Login" and handle authentication */}
    </>
  );
};

export default Login;