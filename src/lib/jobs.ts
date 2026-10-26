import { setImage } from "./image-client";
import { readStore, jobHref, dateLabel, type Publication } from './demo';
import { cloneTemplate, text } from './ui';
import { amountValue, locationLabel, paymentInfo, publisherInfo } from './job-presentation';

let events: AbortController | undefined;

export function initJobs() {
  const root = document.getElementById('jobsMasterExplorer');
  if (!root || root.dataset.ready || document.documentElement.dataset.session !== 'member') return;
  root.dataset.ready = 'true';
  events?.abort();
  events = new AbortController();
  const signal = events.signal;
  const state = readStore();
  const search = document.getElementById('jobSearch') as HTMLInputElement;
  const filters = document.getElementById('jobFilterForm') as HTMLFormElement;
  const grid = document.getElementById('jobGrid')!;
  const sort = document.getElementById('jobSort') as HTMLSelectElement;
  const more = document.getElementById('jobsMore')!;
  const panel = document.getElementById('jobFilters')!;
  const toggle = document.getElementById('toggleJobFilters') as HTMLButtonElement;
  const params = new URLSearchParams(location.search);
  let limit = Math.max(24, Math.min(1000, Number(params.get('shown')) || 24));
  search.value = params.get('q') || '';
  sort.value = params.get('sort') === 'oldest' ? 'oldest' : 'recent';
  for (const el of filters.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[name]')) el.value = params.get(el.name) || '';
  const category = filters.elements.namedItem('category') as HTMLSelectElement;
  for (const value of [...new Set(state.publications.filter(job => job.type !== 'service').map(job => job.category))]) {
    if (!Array.from(category.options).some(option => option.value === value)) category.add(new Option(value, value));
  }
  category.value = params.get('category') || '';

  function card(job: Publication) {
    const el = cloneTemplate('jobCardTemplate');
    const publisher = publisherInfo(job, state.accounts);
    const payment = paymentInfo(job.salary);
    el.dataset.jobId = job.id;
    el.dataset.publisherKind = job.kind;
    text(el, '.job-title a', job.title);
    text(el, '.company-name', publisher.name);
    text(el, '.publisher-initials', publisher.initials);
    text(el, '.job-location span', locationLabel(job));
    text(el, '.budget-amount', payment.amount);
    text(el, '.budget-period', payment.period);
    text(el, '.posted-time', dateLabel(job.createdAt));
    el.querySelector('time')?.setAttribute('datetime', job.createdAt);
    const photo = el.querySelector<HTMLImageElement>('.publisher-photo')!;
    const initials = el.querySelector<HTMLElement>('.publisher-initials')!;
    photo.hidden = !publisher.image;
    initials.hidden = !!publisher.image;
    photo.onerror = () => { photo.hidden = true; initials.hidden = false; setImage(photo, undefined); };
    if (publisher.image) setImage(photo, publisher.image);
    else setImage(photo, undefined);
    el.querySelectorAll<HTMLAnchorElement>('a').forEach(anchor => anchor.href = jobHref(job));
    return el;
  }

  function render() {
    const data = new FormData(filters);
    const query = search.value.trim().toLocaleLowerCase('es');
    const value = (key: string) => String(data.get(key) || '');
    const results = state.publications.filter(job => {
      if (job.type === 'service' || job.status !== 'active') return false;
      const amount = amountValue(job.salary);
      return (!query || [job.title, job.company, job.category].join(' ').toLocaleLowerCase('es').includes(query))
        && (!value('city') || job.city === value('city') || (value('city') === 'Remoto' && job.modality === 'Remoto'))
        && (!value('modality') || job.modality === value('modality'))
        && (!value('type') || job.type === value('type'))
        && (!value('category') || job.category === value('category'))
        && (!value('min') || (amount > 0 && amount >= Number(value('min'))))
        && (!value('max') || (amount > 0 && amount <= Number(value('max'))));
    }).sort((a, b) => {
      const order = Date.parse(b.createdAt) - Date.parse(a.createdAt);
      return sort.value === 'oldest' ? -order : order;
    });
    grid.replaceChildren(...results.slice(0, limit).map(card));
    document.getElementById('jobsEmpty')!.hidden = results.length > 0;
    more.hidden = results.length <= limit;
    text(document, '#jobResultCount', results.length === 1 ? '1 oferta' : results.length + ' ofertas');
    const activeFilters = [...data.values()].filter(Boolean).length;
    text(toggle, 'span', activeFilters ? 'Filtros (' + activeFilters + ')' : 'Filtros');
    root!.querySelectorAll<HTMLButtonElement>('[data-job-type]').forEach(button => button.setAttribute('aria-pressed', String((button.dataset.jobType || '') === value('type'))));
    root!.querySelectorAll<HTMLButtonElement>('[data-job-category]').forEach(button => button.setAttribute('aria-pressed', String((button.dataset.jobCategory || '') === value('category'))));
    const url = new URL(location.href);
    url.search = '';
    if (query) url.searchParams.set('q', search.value.trim());
    for (const [key, value] of data) if (value) url.searchParams.set(key, String(value));
    if (sort.value === 'oldest') url.searchParams.set('sort', 'oldest');
    if (limit > 24) url.searchParams.set('shown', String(limit));
    history.replaceState(null, '', url);
    sessionStorage.setItem('incluxia_jobs_return', url.pathname + url.search);
  }

  function setFiltersOpen(open: boolean, persist = true) {
    const hadFocus = panel.contains(document.activeElement);
    root!.dataset.filtersOpen = String(open);
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (persist) sessionStorage.setItem('incluxia_job_filters_open', String(open));
    if (!open && hadFocus) toggle.focus();
  }

  const update = () => { limit = 24; render(); };
  search.addEventListener('input', update, { signal });
  filters.addEventListener('input', update, { signal });
  sort.addEventListener('change', update, { signal });
  filters.onsubmit = event => event.preventDefault();
  root.querySelectorAll('[data-reset-jobs]').forEach(button => button.addEventListener('click', () => {
    filters.reset();
    search.value = '';
    update();
  }, { signal }));
  document.getElementById('loadMoreJobs')!.addEventListener('click', () => { limit += 24; render(); }, { signal });
  toggle.addEventListener('click', () => setFiltersOpen(root!.dataset.filtersOpen !== 'true'), { signal });
  document.getElementById('applyJobFilters')!.addEventListener('click', () => setFiltersOpen(false), { signal });
  root.querySelectorAll<HTMLButtonElement>('[data-job-type]').forEach(button => button.addEventListener('click', () => {
    (filters.elements.namedItem('type') as HTMLInputElement).value = button.dataset.jobType || '';
    update();
  }, { signal }));
  root.querySelectorAll<HTMLButtonElement>('[data-job-category]').forEach(button => button.addEventListener('click', () => {
    category.value = button.dataset.jobCategory || '';
    update();
  }, { signal }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && root!.dataset.filtersOpen === 'true') setFiltersOpen(false);
  }, { signal });
  document.addEventListener('astro:before-swap', () => setFiltersOpen(false, false), { once: true, signal });
  grid.addEventListener('click', event => {
    const target = event.target as HTMLElement;
    if (target.closest('a,button,input')) return;
    target.closest('article')?.querySelector<HTMLAnchorElement>('.job-title a')?.click();
  }, { signal });
  setFiltersOpen(sessionStorage.getItem('incluxia_job_filters_open') === 'true', false);
  render();
}
