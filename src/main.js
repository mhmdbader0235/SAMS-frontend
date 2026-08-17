import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import keycloak, { redirectToGoogle } from './keycloak';
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

keycloak.init({ onLoad: 'check-sso', checkLoginIframe: false, pkceMethod: 'S256' })
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
    } else if (urlInvite || autoGoogle === 'true') {
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

