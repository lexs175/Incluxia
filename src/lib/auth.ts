import { register, signIn, safePath } from './demo';

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
  let scrollPosition = { left: 0, top: 0 };
  let background: [HTMLElement, boolean][] = [];
  const value = (id: string) => {
    const field = document.getElementById(id) as HTMLInputElement;
    return field.hasAttribute('data-password-input') ? field.value : field.value.trim();
  };
  function alert(message = '', tone: 'error' | 'info' = 'error') {
    const container = document.getElementById('authAlert')!;
    document.getElementById('authAlertText')!.textContent = message;
    container.hidden = !message;
    container.classList.toggle('auth-alert--error', tone === 'error');
    container.classList.toggle('auth-alert--info', tone === 'info');
    container.setAttribute('role', tone === 'error' ? 'alert' : 'status');
    container.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');
  }
  function fieldError(field: HTMLInputElement | HTMLSelectElement, message = '') {
    const id = field.id + 'Error';
    let error = document.getElementById(id);
    if (!error) {
      error = document.createElement('p'); error.id = id; error.className = 'auth-field-error';
      field.closest('.form-group')!.append(error);
      field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), id].filter(Boolean).join(' '));
    }
    error.textContent = message; error.hidden = !message;
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }
  function validationMessage(field: HTMLInputElement | HTMLSelectElement) {
    if (field.required && !field.value.trim()) {
      if (field.id === 'regFullName') return 'Escribe tu nombre y apellido.';
      if (field.hasAttribute('data-password-input')) return 'Escribe tu contraseña.';
      return 'Escribe tu correo electrónico.';
    }
    if (field.validity.typeMismatch) return 'Escribe un correo válido, por ejemplo nombre@correo.com.';
    if (field.id === 'regPassword' && field.value.length < 8) return 'Usa una contraseña de al menos 8 caracteres.';
    return '';
  }
  function validate(form: HTMLFormElement) {
    const fields = [...form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input,select')];
    let first: HTMLInputElement | HTMLSelectElement | undefined;
    fields.forEach(field => {
      const message = validationMessage(field); fieldError(field, message);
      if (message) first ??= field;
    });
    if (first) {
      alert('Revisa los campos indicados para continuar.');
      first.focus({ preventScroll: true }); first.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      return false;
    }
    alert(); return true;
  }
  function tab(mode: string) {
    maskPasswords();
    const isLogin = mode === 'login';
    login.hidden = !isLogin;
    registration.hidden = isLogin;
    wrapper!.setAttribute('aria-labelledby', isLogin ? 'loginPanelTitle' : 'registerPanelTitle');
    wrapper!.setAttribute('aria-describedby', isLogin ? 'loginPanelDescription' : 'registerPanelDescription');
    for (const [id, selected] of [['tabLoginBtn', isLogin], ['tabRegisterBtn', !isLogin]] as const) {
      const btn = document.getElementById(id)!;
      btn.classList.toggle('active', selected); btn.setAttribute('aria-selected', String(selected));
      btn.tabIndex = selected ? 0 : -1;
    }
    alert();
  }
  function close(restoreFocus = true) {
    if (!wrapper!.classList.contains('open')) return;
    maskPasswords();
    wrapper!.classList.remove('open'); wrapper!.setAttribute('aria-hidden', 'true');
    wrapper!.inert = true;
    document.documentElement.classList.remove('modal-open'); document.body.classList.remove('modal-open');
    background.forEach(([element, inert]) => { element.inert = inert; }); background = [];
    window.scrollTo({ ...scrollPosition, behavior: 'instant' });
    if (restoreFocus) {
      const target = previousFocus?.isConnected && previousFocus.getClientRects().length ? previousFocus : document.getElementById('mobileMenuBtn');
      target?.focus({ preventScroll: true });
    }
  }
  function open(mode = 'login', destination = location.pathname + location.search + location.hash) {
    previousFocus = document.activeElement as HTMLElement;
    scrollPosition = { left: window.scrollX, top: window.scrollY };
    next = safePath(destination);
    wrapper!.classList.add('open'); wrapper!.setAttribute('aria-hidden', 'false');
    wrapper!.inert = false;
    document.documentElement.classList.add('modal-open'); document.body.classList.add('modal-open');
    background = [...document.querySelectorAll<HTMLElement>('body > header, body > main, body > footer, .skip-to-content')].map(element => [element, element.inert]);
    background.forEach(([element]) => { element.inert = true; });
    tab(mode);
    const capsule = wrapper!.querySelector<HTMLElement>('.auth-modal-capsule')!;
    capsule.scrollTop = 0;
    document.getElementById(mode === 'register' ? 'registerPanelTitle' : 'loginPanelTitle')?.focus({ preventScroll: true });
  }
  function finish() { close(false); window.location.assign(next); }
  document.addEventListener('click', e => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-auth-trigger]');
    if (!target) return;
    e.preventDefault();
    const destination = target.dataset.authNext;
    open(target.dataset.authTrigger, destination && destination === location.pathname ? location.pathname + location.search + location.hash : destination);
  }, { signal });
  document.getElementById('authCloseBtn')!.onclick = () => close();
  document.getElementById('authBackdrop')!.onclick = () => close();
  document.getElementById('tabLoginBtn')!.onclick = () => tab('login');
  document.getElementById('tabRegisterBtn')!.onclick = () => tab('register');
  function passwordVisibility(control: HTMLElement, visible: boolean) {
    const field = document.getElementById(control.dataset.passwordToggle!) as HTMLInputElement;
    field.type = visible ? 'text' : 'password';
    control.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
    control.setAttribute('aria-pressed', String(visible));
    control.querySelector<HTMLElement>('[data-password-show]')!.hidden = visible;
    control.querySelector<HTMLElement>('[data-password-hide]')!.hidden = !visible;
  }
  function maskPasswords() {
    wrapper!.querySelectorAll<HTMLElement>('[data-password-toggle]').forEach(control => passwordVisibility(control, false));
  }
  wrapper.querySelectorAll<HTMLElement>('[data-password-toggle]').forEach(control => {
    control.onclick = () => passwordVisibility(control, control.getAttribute('aria-pressed') !== 'true');
  });
  wrapper.addEventListener('input', e => {
    const field = e.target as HTMLInputElement;
    if (field.hasAttribute('aria-invalid')) fieldError(field, validationMessage(field));
  }, { signal });
  wrapper.querySelector('.auth-tabs')!.addEventListener('keydown', (event: Event) => {
    const e = event as KeyboardEvent;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const isLogin = e.key === 'Home' || (e.key !== 'End' && document.activeElement?.id !== 'tabLoginBtn');
    tab(isLogin ? 'login' : 'register');
    document.getElementById(isLogin ? 'tabLoginBtn' : 'tabRegisterBtn')!.focus({ preventScroll: true });
  }, { signal });
  document.getElementById('loginForm')!.onsubmit = e => {
    e.preventDefault();
    if (!validate(e.currentTarget as HTMLFormElement)) return;
    try {
      signIn(value('loginIdentifier')); finish();
    } catch (error) {
      const message = error instanceof DOMException ? 'No se pudo guardar la sesión. Revisa el almacenamiento del navegador e inténtalo otra vez.' : (error as Error).message;
      alert(message);
      if (error instanceof DOMException) { document.getElementById('authAlert')!.focus({ preventScroll: true }); }
      else { const field = document.getElementById('loginIdentifier') as HTMLInputElement; fieldError(field, message); field.focus({ preventScroll: true }); }
    }
  };
  document.getElementById('registerForm')!.onsubmit = e => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    if (!validate(form)) return;
    try {
      register({ name: value('regFullName'), email: value('regEmail').toLowerCase() });
      finish();
    } catch (error) {
      const message = error instanceof DOMException ? 'No se pudo guardar tu cuenta. Revisa el almacenamiento del navegador e inténtalo otra vez.' : (error as Error).message;
      alert(message);
      const id = /correo/.test(message) ? 'regEmail' : null;
      if (id) { const field = document.getElementById(id) as HTMLInputElement; fieldError(field, message); field.focus({ preventScroll: true }); field.scrollIntoView({ block: 'nearest', behavior: 'instant' }); }
      else document.getElementById('authAlert')!.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  };
  function example(email: string) {
    try { signIn(email); finish(); }
    catch { alert('No se pudo abrir el ejemplo. Revisa el almacenamiento del navegador e inténtalo otra vez.'); }
  }
  document.getElementById('btnDemoCandidate')!.onclick = () => example('valeria@ejemplo.test');
  // The prototype simulates the Google shortcut with the populated example account.
  wrapper.querySelectorAll<HTMLElement>('[data-auth-google]').forEach(button => {
    button.onclick = () => example('valeria@ejemplo.test');
  });
  document.addEventListener('keydown', e => {
    if (!wrapper.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const elements = [...wrapper.querySelectorAll<HTMLElement>('button,a[href],input,select,textarea')].filter(el => !el.hasAttribute('disabled') && el.tabIndex >= 0 && el.getClientRects().length > 0);
      const first = elements[0], last = elements.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      else if (e.shiftKey && document.activeElement?.getAttribute('tabindex') === '-1') { e.preventDefault(); last?.focus(); }
    }
  }, { signal });
  document.addEventListener('astro:before-swap', () => close(false), { once: true, signal });
}
