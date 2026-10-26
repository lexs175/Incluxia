export function text(root: ParentNode, selector: string, value: string) {
  const el = root.querySelector<HTMLElement>(selector);
  if (!el) return;
  // Headings are split by the site's GSAP animation. Update their source too.
  if (el.dataset.origHtml) { delete el.dataset.origHtml; delete el.dataset.animated; }
  el.textContent = value;
  if (el.matches('h1,h2,h3')) el.setAttribute('aria-label', value);
}
export function label(button: Element | null, value: string) {
  if (!button) return;
  const inner = button.querySelector('.btn-text-label');
  if (inner) inner.textContent = value;
  button.setAttribute('aria-label', value);
}
export function cloneTemplate<T extends HTMLElement = HTMLElement>(id: string): T {
  const template = document.getElementById(id) as HTMLTemplateElement;
  return template.content.firstElementChild!.cloneNode(true) as T;
}
// All generated actions clone the actual Astro button, including its scoped CSS.
export function button(value: string, options: {href?: string; variant?: 'primary'|'primary-line'|'secondary'; size?: 'sm'|'md'; disabled?: boolean; data?: Record<string,string>} = {}) {
  const el = cloneTemplate(`button-${options.href ? 'link' : 'control'}-${options.variant || 'primary'}-${options.size || 'sm'}`);
  label(el, value);
  if (options.href) el.setAttribute('href', options.href);
  if (options.disabled) (el as HTMLButtonElement).disabled = true;
  for (const [name, val] of Object.entries(options.data || {})) el.setAttribute(`data-${name}`, val);
  return el;
}
export function list(root: Element | null, values: string[], tag = 'li', className = '') {
  if (!root) return;
  root.replaceChildren(...values.map(value => { const el = document.createElement(tag); el.className = className; el.textContent = value; return el; }));
}

// Task controls have their own quiet hierarchy; expandable CTAs stay opt-in.
export function managementAction(value: string, options: {
  href?: string;
  variant?: 'primary'|'secondary'|'ghost'|'quiet'|'link'|'danger'|'icon';
  size?: 'sm'|'md'|'lg';
  data?: Record<string,string>;
} = {}) {
  const control = options.href ? document.createElement('a') : document.createElement('button');
  const variantClass = 'management-action--' + (options.variant || 'quiet');
  const sizeClass = options.size ? 'management-action--' + options.size : '';
  control.className = ['management-action', variantClass, sizeClass].filter(Boolean).join(' ');
  control.textContent = value;
  if (options.href) (control as HTMLAnchorElement).href = options.href;
  else (control as HTMLButtonElement).type = 'button';
  for (const [name, val] of Object.entries(options.data || {})) control.setAttribute('data-' + name, val);
  return control;
}
