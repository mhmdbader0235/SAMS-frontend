import Keycloak from 'keycloak-js';

const KEYCLOAK_CONFIG = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8000',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'SAMS',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'frontend',
};

const keycloak = new Keycloak(KEYCLOAK_CONFIG);

/**
 * The OIDC scope every login must request.
 *
 * `organization:*` is the wildcard form, and the wildcard is required rather than
 * cosmetic. With a bare `organization` scope Keycloak emits the claim ONLY for a
 * user who belongs to exactly one organization: at zero or two-plus memberships the
 * mapper writes null and the claim is dropped from the token entirely. So a parent
 * with children at two schools would silently arrive with no organization claim at
 * all. `organization:*` always returns the full array.
 *
 * Verified against Keycloak 26.7 -- two-org user: `organization` -> claim absent,
 * `organization:*` -> ['tenant_a','tenant_b']. A user in zero organizations still
 * gets HTTP 200 with the claim simply absent, so requesting this is safe for users
 * who have not been migrated into an organization yet.
 *
 * Set as the default scope on keycloak.init() in main.js, which makes it apply to
 * every login()/register() that does not override it. Keep this the single
 * definition -- a second hard-coded scope string is how the two drift apart.
 */
export const KEYCLOAK_SCOPE = 'openid organization:*';

/**
 * The Keycloak identity-provider alias each button routes to. Both must exist
 * under Realm Settings -> Identity Providers in Keycloak (see SAMS-realm.json's
 * `identityProviders` block for Google) or `idpHint` just names a broker that
 * doesn't exist and Keycloak falls back to showing its own login form -- which
 * is indistinguishable from clicking "Single Sign-On" today, and was exactly
 * the bug: both buttons used to call this same function with no hint at all.
 *
 * SSO_IDP_HINT is intentionally not hard-coded to a provider name (there is no
 * single "SSO" product -- it's whatever SAML/OIDC broker a given deployment
 * wires up, e.g. "azure-ad" or "okta"). Leave it unset until a real broker
 * alias is configured in Keycloak for this tenant; the SSO button then behaves
 * exactly as it does today (generic Keycloak login), which is the honest
 * behavior for "not configured yet" rather than a fake distinct flow.
 */
export const GOOGLE_IDP_HINT = 'google';
export const SSO_IDP_HINT = import.meta.env.VITE_SSO_IDP_HINT || null;

/**
 * Redirects the user to Keycloak authentication, optionally pre-filling the
 * email address and optionally forcing a specific identity-provider broker
 * (skipping Keycloak's own login form entirely and going straight to that
 * provider, e.g. Google's account picker).
 *
 * @param {string|null} loginHintEmail - Optional email address to pre-fill on the Keycloak login screen.
 * @param {string|null} idpHint - Optional identity-provider alias (e.g. GOOGLE_IDP_HINT) to route straight to that broker.
 */
export function redirectToKeycloak(loginHintEmail = null, idpHint = null) {
  const { url: kcUrl, realm, clientId } = KEYCLOAK_CONFIG;
  const redirectUri = `${window.location.origin}/auth`;
  const emailToUse = loginHintEmail || sessionStorage.getItem('pending_invite_email');

  const fallbackRedirect = () => {
    // This path bypasses the SDK entirely, so it does NOT inherit the default
    // scope set on keycloak.init() -- it has to carry KEYCLOAK_SCOPE itself or a
    // user who falls back to it logs in without an organization claim.
    let targetUrl = `${kcUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(KEYCLOAK_SCOPE)}`;
    if (emailToUse) {
      targetUrl += `&login_hint=${encodeURIComponent(emailToUse)}`;
    }
    if (idpHint) {
      targetUrl += `&kc_idp_hint=${encodeURIComponent(idpHint)}`;
    }
    window.location.href = targetUrl;
  };

  if (keycloak) {
    const loginOptions = { redirectUri };
    if (emailToUse) {
      loginOptions.loginHint = emailToUse;
    }
    if (idpHint) {
      loginOptions.idpHint = idpHint;
    }
    keycloak.login(loginOptions).catch((err) => {
      console.warn('[Keycloak] SDK login failed, using direct OIDC redirect fallback:', err);
      fallbackRedirect();
    });
  } else {
    fallbackRedirect();
  }
}

/**
 * @deprecated Use redirectToKeycloak(email, GOOGLE_IDP_HINT) so the intent is
 * explicit at the call site. Kept as a thin wrapper so nothing importing the
 * old name breaks.
 */
export function redirectToGoogle(loginHintEmail = null) {
  return redirectToKeycloak(loginHintEmail, GOOGLE_IDP_HINT);
}

export default keycloak;
