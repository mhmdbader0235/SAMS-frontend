import Keycloak from 'keycloak-js';

const KEYCLOAK_CONFIG = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8000',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'SAMS',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'frontend',
};

const keycloak = new Keycloak(KEYCLOAK_CONFIG);

/**
 * Redirects the user to Keycloak SSO authentication, optionally pre-filling the email address.
 * 
 * @param {string|null} loginHintEmail - Optional email address to pre-fill on the Keycloak login screen.
 */
export function redirectToGoogle(loginHintEmail = null) {
  const { url: kcUrl, realm, clientId } = KEYCLOAK_CONFIG;
  const redirectUri = `${window.location.origin}/auth`;
  const emailToUse = loginHintEmail || sessionStorage.getItem('pending_invite_email');
  
  const fallbackRedirect = () => {
    let targetUrl = `${kcUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid`;
    if (emailToUse) {
      targetUrl += `&login_hint=${encodeURIComponent(emailToUse)}`;
    }
    window.location.href = targetUrl;
  };

  if (keycloak) {
    const loginOptions = { redirectUri };
    if (emailToUse) {
      loginOptions.loginHint = emailToUse;
    }
    keycloak.login(loginOptions).catch((err) => {
      console.warn('[Keycloak] SDK login failed, using direct OIDC redirect fallback:', err);
      fallbackRedirect();
    });
  } else {
    fallbackRedirect();
  }
}

export default keycloak;
