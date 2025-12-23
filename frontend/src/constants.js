// localStorage key names for JWT authentication tokens
// Used consistently across the app to store/retrieve tokens from browser storage

export const ACCESS_TOKEN = "access"
// Short-lived token (30 min) - sent with every API request for authentication

export const REFRESH_TOKEN = "refresh"
// Long-lived token (1 day) - used to obtain new access tokens without re-login