import { readStore, user, apply, safePath, dateLabel } from './demo';
import { label, list, text } from './ui';
export function initJobDetail() {
  const root = document.getElementById('jobDetail');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const state = readStore(), account = user(state);
  const id = new URLSearchParams(location.search).get('id') || root.dataset.jobId;
  const job = state.publications.find(j => j.id === id && j.type !== 'service');
  const back = document.getElementById('backToJobs') as HTMLAnchorElement;
  back.href = safePath(sessionStorage.getItem('incluxia_jobs_return'));
  if (!account) { root.setAttribute('aria-busy', 'false'); return; }
  const form = document.getElementById('jobApplyForm') as HTMLFormElement;
  const open = document.getElementById('openApplication') as HTMLButtonElement;
  const feedback = document.getElementById('applicationState')!;
  if (!job) {
    text(root, '.job-main-title', 'Esta oferta ya no está disponible');
    root.querySelector<HTMLElement>('.job-layout-grid')!.hidden = true;
    root.setAttribute('aria-busy', 'false'); return;
  }
  document.title = job.title + ' | Eco';
  text(root, '.job-main-title', job.title);
  root.querySelectorAll('[data-job-company]').forEach(el => el.textContent = job.company);
  root.querySelectorAll('[data-job-city]').forEach(el => el.textContent = job.city);
  text(root, '[data-job-modality]', job.modality);
  text(root, '[data-job-date]', 'Publicado el ' + dateLabel(job.createdAt));
  text(root, '[data-job-description]', job.description);
  text(root, '[data-job-delivery]', job.delivery);
  text(root, '[data-job-salary]', job.salary);
  list(document.getElementById('jobTasks'), job.tasks);
  list(document.getElementById('jobRequirements'), job.requirements);
  for (const [id, value] of [['applicantName', account.name], ['applicantPhone', account.phone], ['applicantCity', account.city]]) {
    const input = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
    if (input instanceof HTMLSelectElement && !Array.from(input.options).some(o => o.value === value)) input.add(new Option(value, value));
    input.value = value;
  }
  const file = document.getElementById('applicantCv') as HTMLInputElement;
  text(root, '#cvFileName', account.cv || 'Seleccionar archivo (opcional)');
  file.onchange = () => text(root, '#cvFileName', file.files?.[0]?.name || account.cv || 'Seleccionar archivo (opcional)');
  function sync() {
    const current = readStore();
    const applied = current.applications.find(a => a.jobId === job!.id && a.applicantId === account!.id && a.status !== 'Retirada');
    const own = job!.ownerId === account!.id;
    const viewLink = document.getElementById('viewMyApplications') as HTMLElement | null;
    open.disabled = !!applied || own || job!.status !== 'active';
    if (applied) {
      text(root, '.apply-card-title', 'Tu postulación');
      text(root, '.apply-card-desc', 'Ya te postulaste a este puesto. El equipo de contratación revisará tu perfil y datos.');
      label(open, 'Ya postulaste');
      feedback.textContent = 'Estado de tu postulación: ' + applied.status;
      if (viewLink) {
        viewLink.hidden = false;
        const linkSpan = viewLink.querySelector('span');
        if (linkSpan) linkSpan.textContent = 'Ver en Mis postulaciones';
      }
    } else if (own) {
      text(root, '.apply-card-title', 'Tu publicación');
      text(root, '.apply-card-desc', 'Tú publicaste esta oferta de empleo desde tu cuenta.');
      label(open, 'Esta oferta es tuya');
      feedback.textContent = 'Consulta a los candidatos en Postulaciones.';
      if (viewLink) {
        viewLink.hidden = false;
        const linkSpan = viewLink.querySelector('span');
        if (linkSpan) linkSpan.textContent = 'Ver postulaciones recibidas';
      }
    } else if (job!.status !== 'active') {
      text(root, '.apply-card-title', 'Oferta cerrada');
      text(root, '.apply-card-desc', 'Esta vacante ya no está recibiendo postulaciones.');
      label(open, 'Oferta cerrada');
      feedback.textContent = 'Esta oferta no está recibiendo postulaciones.';
      if (viewLink) viewLink.hidden = true;
    } else {
      text(root, '.apply-card-title', 'Postular a este puesto');
      text(root, '.apply-card-desc', 'Revisa los requisitos antes de confirmar. Tu postulación y perfil se enviarán directamente al equipo de selección.');
      label(open, 'Postular a esta oferta');
      feedback.textContent = '';
      if (viewLink) viewLink.hidden = true;
    }
  }
  open.onclick = () => { form.hidden = false; open.hidden = true; (document.getElementById('applicantNote') as HTMLTextAreaElement).focus(); };
  form.onsubmit = e => {
    e.preventDefault();
    try {
      apply(job.id, (document.getElementById('applicantNote') as HTMLTextAreaElement).value.trim(), file.files?.[0]?.name || account.cv);
      form.hidden = true; open.hidden = false;
      document.getElementById('applySuccessMsg')!.style.display = 'flex'; sync();
    } catch (error) { feedback.textContent = (error as Error).message; }
  };
  sync(); root.setAttribute('aria-busy', 'false');
}
