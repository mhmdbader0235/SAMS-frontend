import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import keycloak, { redirectToGoogle, KEYCLOAK_SCOPE } from './keycloak';
import { useAuthStore } from './store';
import './index.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

let isMounted = false;
function mountApp() {
  if (!isMounted) {
    isMounted = true;
    app.mount('#app');
  }
}

// Timeout fallback after 1.5s to ensure UI loads instantly
const timeoutId = setTimeout(() => {
  mountApp();
}, 1500);

const params = new URLSearchParams(window.location.search);
const urlInvite = params.get('invite_code');
const autoGoogle = params.get('auto_google');
const targetEmail = params.get('email') || params.get('target_email');

if (urlInvite) sessionStorage.setItem('pending_invite_code', urlInvite);
if (targetEmail) sessionStorage.setItem('pending_invite_email', targetEmail);

// `scope` here is the DEFAULT scope for every login()/register() the adapter
// performs, including the silent check-sso above -- so the organization claim is
// requested on every path without each call site repeating it. keycloak-js
// documents it as overridden only when a login() passes its own `scope`, so do not
// add one at those call sites (AuthView.vue) or it will silently drop
// `organization:*` and the token will come back with no organization claim.
keycloak.init({ onLoad: 'check-sso', checkLoginIframe: false, pkceMethod: 'S256', scope: KEYCLOAK_SCOPE })
  .then(async (authenticated) => {
    clearTimeout(timeoutId);
    console.log(authenticated ? "User Authenticated via Keycloak" : "Not Logged In");
    if (authenticated) {
      const authStore = useAuthStore(pinia);
      const pendingInvite = sessionStorage.getItem('pending_invite_code');
      if (pendingInvite && keycloak.tokenParsed) {
        try {
          const storedTenant = sessionStorage.getItem('pending_invite_tenant') || 'tenant_a';
          const storedRole = sessionStorage.getItem('pending_invite_role') || 'student';
          await authStore.register({
            email: keycloak.tokenParsed.email || sessionStorage.getItem('pending_invite_email') || '',
            password: 'google_sso_dummy_password',
            tenant_id: storedTenant,
            role: storedRole,
            name: keycloak.tokenParsed.name || '',
            first_name: keycloak.tokenParsed.given_name || '',
            last_name: keycloak.tokenParsed.family_name || '',
            invite_code: pendingInvite
          });
          sessionStorage.removeItem('pending_invite_code');
          sessionStorage.removeItem('pending_invite_email');
          sessionStorage.removeItem('pending_invite_tenant');
          sessionStorage.removeItem('pending_invite_role');
        } catch (err) {
          console.warn("Failed to auto-register with invite code in main.js after SSO:", err);
        }
      }
      try {
        await authStore.fetchMe();
        if (window.location.pathname === '/auth') {
          router.push('/');
        }
      } catch (err) {
        console.warn('Could not fetch user profile for Keycloak user:', err);
      }
    } else if (autoGoogle === 'true') {
      // NOTE: a bare invite_code alone must NOT force this redirect — this
      // Keycloak realm has no Google/external IdP configured, so bouncing a
      // brand-new invitee here is a dead end (Keycloak's own login form asks
      // for a password that doesn't exist yet for an account that was never
      // created). AuthView.vue's own onMounted already handles a bare
      // invite_code by showing the app's normal invite-aware registration
      // form, where the invitee sets their own password.
      let storedEmail = targetEmail || sessionStorage.getItem('pending_invite_email');
      if (urlInvite) {
        try {
          const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:9080';
          const res = await fetch(`${apiHost}/api/v1/auth/invitations/${encodeURIComponent(urlInvite)}`);
          if (res.ok) {
            const data = await res.json();
            if (data) {
              if (data.target_email) {
                storedEmail = data.target_email;
                sessionStorage.setItem('pending_invite_email', storedEmail);
              }
              if (data.tenant_id) sessionStorage.setItem('pending_invite_tenant', data.tenant_id);
              if (data.role) sessionStorage.setItem('pending_invite_role', data.role);
            }
          }
        } catch (e) {
          console.warn('Could not pre-fetch invitation details before Google redirect:', e);
        }
      }
      redirectToGoogle(storedEmail);
      return;
    }
    mountApp();
  })
  .catch((err) => {
    clearTimeout(timeoutId);
    console.error("Keycloak connection error:", err);
    mountApp();
  });

