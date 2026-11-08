// ═══════════════════════════════════════════════════
// CONFIGURATION FIREBASE
// ═══════════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyAVfyMf5vBDtLsdA5yAnoZLJFI_4KPxhRw",
  authDomain: "suivi-candidatures-460b1.firebaseapp.com",
  projectId: "suivi-candidatures-460b1",
  storageBucket: "suivi-candidatures-460b1.firebasestorage.app",
  messagingSenderId: "513717627643",
  appId: "1:513717627643:web:6c5f01001a8dffe375de5e"
};

// ═══════════════════════════════════════════════════
// CONNEXION GOOGLE + ESPACE PRIVÉ
// Chaque compte Google a son propre dossier : users/{uid}/...
// Les règles Firestore empêchent tout accès aux dossiers des autres.
// ═══════════════════════════════════════════════════

// Renvoie une collection rangée dans l'espace de l'utilisateur connecté
function userCol(name) {
  const uid = firebase.auth().currentUser.uid;
  return firebase.firestore().collection('users').doc(uid).collection(name);
}

let _authStarted = false;

// Affiche l'écran de connexion tant que personne n'est connecté,
// puis lance la page (onReady) une seule fois.
function requireAuth(onReady) {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      hideLoginScreen();
      addLogoutButton(user);
      if (!_authStarted) { _authStarted = true; onReady(user); }
    } else {
      if (_authStarted) { location.reload(); return; }
      showLoginScreen();
    }
  });
}

async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({prompt: 'select_account'});
  const msg = document.getElementById('login-msg');
  if (msg) msg.textContent = '';
  try {
    await firebase.auth().signInWithPopup(provider);
  } catch (e) {
    if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
      return firebase.auth().signInWithRedirect(provider);
    }
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return;
    console.error(e);
    if (msg) msg.textContent = e.code === 'auth/unauthorized-domain'
      ? "Ce site n'est pas autorisé dans Firebase (Authentication > Paramètres > Domaines autorisés)."
      : 'Connexion impossible : ' + (e.code || e.message);
  }
}

function showLoginScreen() {
  const loading = document.getElementById('loading-screen');
  if (loading) loading.style.display = 'none';
  if (document.getElementById('login-screen')) return;
  const div = document.createElement('div');
  div.id = 'login-screen';
  div.style.cssText = 'position:fixed;inset:0;background:#f5f4f1;z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;font-family:"Segoe UI",system-ui,-apple-system,sans-serif';
  div.innerHTML = `
    <div style="background:#fff;border-radius:14px;padding:2rem 1.8rem;max-width:340px;width:100%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.1)">
      <div style="font-size:1.05rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.4rem">Suivi de candidatures</div>
      <div style="color:#888;font-size:.82rem;margin-bottom:1.4rem">Connecte-toi pour retrouver tes données sur tous tes appareils.</div>
      <button onclick="signInWithGoogle()" style="width:100%;background:#1a1a1a;color:#fff;border:none;border-radius:8px;padding:.7rem 1rem;font-size:.9rem;font-weight:600;cursor:pointer">Se connecter avec Google</button>
      <div id="login-msg" style="color:#dc2626;font-size:.78rem;margin-top:.9rem;line-height:1.5"></div>
    </div>`;
  document.body.appendChild(div);
}

function hideLoginScreen() {
  const el = document.getElementById('login-screen');
  if (el) el.remove();
}

function addLogoutButton(user) {
  const nav = document.querySelector('nav');
  if (!nav || document.getElementById('logout-lnk')) return;
  const a = document.createElement('a');
  a.id = 'logout-lnk';
  a.href = '#';
  a.textContent = '⎋ Déconnexion';
  a.title = 'Connectée : ' + (user.email || '');
  a.style.marginLeft = 'auto';
  a.onclick = e => { e.preventDefault(); firebase.auth().signOut(); };
  nav.appendChild(a);
}
