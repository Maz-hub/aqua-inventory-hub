/**
 * Register Page
 * 
 * Renders the registration form using the reusable Form component.
 * On successful registration, redirects user to login page.
 */

import Form from "../components/Form";
// Reusable form component handling both login and registration


const Register = () => {
    return ( 
        <Form route="/api/user/register/" method="register" />
        // route: Django API endpoint for user registration
        // method: Tells Form component to display "Register" and handle registration logic
    );
}
 
export default Register;