import os
import jwt

# Our organization's Azure AD tenant ID. Only tokens issued by this tenant should be trusted —
# this is what restricts login to World Aquatics staff instead of any Microsoft account holder.
MICROSOFT_TENANT_ID = os.environ.get('MICROSOFT_TENANT_ID')

# Microsoft publishes the public keys used to sign its tokens at this URL.
# Using the tenant-specific endpoint (instead of /common/) means we only ever fetch
# signing keys for our own tenant, not for every Microsoft tenant in existence.
MICROSOFT_JWKS_URL = f"https://login.microsoftonline.com/{MICROSOFT_TENANT_ID}/discovery/v2.0/keys"


def verify_microsoft_token(token):
    # Set up a client that knows how to fetch and cache Microsoft's public signing keys.
    jwks_client = jwt.PyJWKClient(MICROSOFT_JWKS_URL)

    # Look at the token's header to find out which specific key was used to sign it,
    # then fetch that key from Microsoft.
    signing_key = jwks_client.get_signing_key_from_jwt(token)

    # The token's audience should match our app's Client ID (registered in Azure),
    # confirming the token was issued for this application specifically.
    client_id = os.environ.get('MICROSOFT_CLIENT_ID')

    # Decode the token and verify its signature using the matching public key,
    # and confirm it was issued for our app by checking the audience.
    payload = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        audience=client_id,
        options={"verify_aud": True},
    )

    # Belt-and-braces tenant check: even though we fetched keys from our tenant's
    # JWKS endpoint, explicitly confirm the token's own "tid" (tenant ID) claim
    # matches our tenant. This guards against trusting tokens from any other
    # tenant if the app registration is ever reconfigured to be multi-tenant.
    if payload.get('tid') != MICROSOFT_TENANT_ID:
        raise ValueError('Token from untrusted tenant')

    # If we get here, the token is valid, from our tenant, and payload contains
    # the user's info from Microsoft.
    return payload
