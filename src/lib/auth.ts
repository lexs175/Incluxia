import { readStore, register, signIn, safePath, user } from './demo';

let events: AbortController | undefined;
export function initAuth() {
  const wrapper = document.getElementById('authModalWrapper');
  if (!wrapper) return;
  events?.abort(); events = new AbortController();
  const signal = events.signal;
  const login = document.getElementById('loginPanel')!;
  const registration = document.getElementById('registerPanel')!;
  let next = '/';
  let previousFocus: HTMLElement | null = null;
  const value = (id: string) => (document.getElementById(id) as HTMLInputElement).value.trim();
  function alert(message = '') {
    document.getElementById('authAlertText')!.textContent = message;
    document.getElementById('authAlert')!.style.display = message ? 'flex' : 'none';
  }
  function tab(mode: string) {
    const isLogin = mode === 'login';
    login.style.display = isLogin ? 'block' : 'none';
    registration.style.display = isLogin ? 'none' : 'block';
    for (const [id, selected] of [['tabLoginBtn', isLogin], ['tabRegisterBtn', !isLogin]] as const) {
      const btn = document.getElementById(id)!;
      btn.classList.toggle('active', selected); btn.setAttribute('aria-selected', String(selected));
    }
    alert();
  }
  function close() {
    wrapper!.classList.remove('open'); wrapper!.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('modal-open'); document.body.classList.remove('modal-open');
    document.documentElement.style.overflow = ''; document.body.style.overflow = '';
    previousFocus?.focus();
  }
  function open(mode = 'login', destination = '/') {
    previousFocus = document.activeElement as HTMLElement;
    next = safePath(destination);
    wrapper!.classList.add('open'); wrapper!.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('modal-open'); document.body.classList.add('modal-open');
    document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden';
    tab(mode);
    (document.getElementById(mode === 'register' ? 'regFullName' : 'loginIdentifier') as HTMLInputElement)?.focus();
  }
  function finish() { close(); window.location.assign(next); }
  document.addEventListener('click', e => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-auth-trigger]');
    if (!target) return;
    e.preventDefault();
    const destination = target.dataset.authNext;
    open(target.dataset.authTrigger, destination && destination === location.pathname ? location.pathname + location.search : destination || '/');
  }, { signal });
  document.getElementById('authCloseBtn')!.onclick = close;
  document.getElementById('authBackdrop')!.onclick = close;
  document.getElementById('tabLoginBtn')!.onclick = () => tab('login');
  document.getElementById('tabRegisterBtn')!.onclick = () => tab('register');
  document.getElementById('toggleLoginPass')!.onclick = () => {
    const input = document.getElementById('loginPassword') as HTMLInputElement;
    input.type = input.type === 'password' ? 'text' : 'password';
  };
  document.getElementById('btnForgotPassword')!.onclick = () => alert('Esta es una simulación local. Puedes ingresar con tu correo o WhatsApp y cualquier PIN de prueba de 4 caracteres.');
  document.getElementById('loginForm')!.onsubmit = e => {
    e.preventDefault();
    try {
      if (!value('loginIdentifier') || value('loginPassword').length < 4) throw Error('Ingresa tu correo o WhatsApp y un PIN de prueba de al menos 4 caracteres.');
      signIn(value('loginIdentifier')); finish();
    } catch (error) { alert((error as Error).message); }
  };
  document.getElementById('registerForm')!.onsubmit = e => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    if (!form.reportValidity()) return;
    try {
      if (!value('regFullName') || !value('regWhatsApp')) throw Error('Completa tu nombre y WhatsApp.');
      if (value('regPassword').length < 4) throw Error('El PIN de prueba debe tener al menos 4 caracteres.');
      register({ name: value('regFullName'), email: value('regEmail').toLowerCase(), phone: value('regWhatsApp'), city: value('regCity') });
      finish();
    } catch (error) { alert((error as Error).message); }
  };
  document.getElementById('btnDemoCandidate')!.onclick = () => { signIn('valeria@ejemplo.test'); finish(); };
  document.getElementById('btnDemoCompany')!.onclick = () => { signIn('equipo@ejemplo.test'); finish(); };
  document.addEventListener('keydown', e => {
    if (!wrapper.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const elements = [...wrapper.querySelectorAll<HTMLElement>('button,a,input,select,textarea')].filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
      const first = elements[0], last = elements.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  }, { signal });
  document.addEventListener('astro:before-swap', close, { once: true, signal });
}
