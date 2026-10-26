import { readStore, writeStore, user, jobHref, dateLabel } from './demo';
import { managementAction, cloneTemplate, text } from './ui';

export function initApplications() {
  const root = document.getElementById('applicationsWorkspace');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  if (!user()) return;
  const received = new URLSearchParams(location.search).get('tab') === 'received';
  const selectedJob = new URLSearchParams(location.search).get('job');
  const list = document.getElementById('applicationList')!;
  const surface = root.closest('.account-capsule')!;
  text(surface, '.account-heading h1', received ? 'Postulaciones recibidas' : 'Postulaciones enviadas');
  text(surface, '.account-description', received
    ? 'Conoce a los candidatos y actualiza el estado de cada postulación.'
    : 'Consulta tus ofertas, el mensaje que enviaste y el estado de cada postulación.');
  root.querySelector('[data-application-tab="' + (received ? 'received' : 'sent') + '"]')!.setAttribute('aria-current', 'page');

  function render() {
    const state = readStore(), account = user(state)!;
    const sent = state.applications.filter(a => a.applicantId === account.id && state.publications.some(j => j.id === a.jobId));
    const incoming = state.applications.filter(a => state.publications.some(j => j.id === a.jobId && j.ownerId === account.id));
    text(root!, '[data-application-count="sent"]', String(sent.length));
    text(root!, '[data-application-count="received"]', String(incoming.length));
    const applications = received ? incoming.filter(a => !selectedJob || a.jobId === selectedJob) : sent;
    const publication = state.publications.find(j => j.id === selectedJob && j.ownerId === account.id);
    const context = root!.querySelector<HTMLElement>('#applicationsContext')!;
    context.hidden = !received || !publication;
    context.textContent = publication ? 'Para «' + publication.title + '» · ' + applications.length + (applications.length === 1 ? ' postulación' : ' postulaciones') : '';
    list.replaceChildren();
    if (!applications.length) {
      const empty = cloneTemplate('applicationEmptyTemplate');
      text(empty, '.application-empty-title', received ? 'Aún no recibiste postulaciones' : 'Aún no enviaste postulaciones');
      text(empty, '.application-empty-description', received
        ? 'Cuando alguien postule a tus publicaciones, podrás revisar su perfil y su mensaje aquí.'
        : 'Explora las ofertas y postula a las que encajen con tu experiencia. Aquí podrás seguir su estado.');
      empty.querySelector('.application-empty-action')!.append(managementAction(received ? 'Mis publicaciones' : 'Buscar trabajo', { href: received ? '/publicar?tab=mine' : '/', variant: 'primary' }));
      list.append(empty);
      return;
    }
    for (const app of applications) {
      const job = state.publications.find(j => j.id === app.jobId)!;
      const candidate = state.accounts.find(a => a.id === app.applicantId);
      const item = cloneTemplate('applicationListTemplate');
      item.dataset.status = app.status;
      item.dataset.applicationId = app.id;
      text(item, '.application-status', app.status);
      text(item, '.application-title', received ? candidate?.name || 'Candidato no disponible' : job.title);
      text(item, '.application-context', received ? 'Para «' + job.title + '»' : job.company);
      const location = received ? candidate?.city : [...new Set([job.city, job.modality].filter(Boolean))].join(' · ');
      text(item, '.application-location', location || '');
      item.querySelector<HTMLElement>('.application-location-item')!.hidden = !location;
      text(item, '.application-date', 'Enviada el ' + dateLabel(app.createdAt));
      text(item, '.application-file', app.cv ? 'Archivo: ' + app.cv : '');
      item.querySelector<HTMLElement>('.application-file-item')!.hidden = !app.cv;
      text(item, '.application-message-label', received ? 'Mensaje del candidato' : 'Tu mensaje');
      text(item, '.application-message', app.message);
      item.querySelector<HTMLElement>('.application-message-block')!.hidden = !app.message;
      const actions = item.querySelector('.application-actions')!;
      if (received && candidate) {
        actions.append(managementAction('Ver perfil', { href: '/postulaciones/perfil?id=' + encodeURIComponent(candidate.id), variant: 'primary' }));
      }
      actions.append(managementAction('Ver oferta', { href: jobHref(job), variant: received && candidate ? 'secondary' : 'primary' }));
      if (received) {
        const update = item.querySelector<HTMLElement>('.application-update')!;
        update.hidden = false;
        const label = document.createElement('label');
        label.textContent = 'Estado de la postulación';
        const select = document.createElement('select');
        select.dataset.applicationStatus = app.id;
        select.disabled = app.status === 'Retirada';
        const statuses = ['Recibida', 'En revisión', 'Seleccionada', 'No seleccionada'];
        if (app.status === 'Retirada') statuses.push('Retirada');
        for (const status of statuses) select.add(new Option(status, status, false, status === app.status));
        select.onchange = () => {
          const current = readStore(), own = user(current);
          const target = current.applications.find(a => a.id === app.id);
          const publication = current.publications.find(j => j.id === target?.jobId);
          if (target && publication?.ownerId === own?.id && target.status !== 'Retirada' && statuses.includes(select.value)) {
            target.status = select.value as typeof target.status;
            writeStore(current);
            render();
            text(root!, '#applicationsFeedback', 'Estado actualizado a «' + target.status + '».');
            list.querySelector<HTMLSelectElement>('[data-application-status="' + app.id + '"]')?.focus({ preventScroll: true });
          }
        };
        label.append(select);
        update.append(label);
      } else if (app.status !== 'Retirada') {
        const withdraw = managementAction('Retirar postulación', { variant: 'danger', data: { withdraw: app.id } });
        withdraw.onclick = () => {
          const current = readStore();
          const target = current.applications.find(a => a.id === app.id && a.applicantId === user(current)?.id);
          if (target) {
            target.status = 'Retirada';
            writeStore(current);
            render();
            text(root!, '#applicationsFeedback', 'Retiraste tu postulación. Puedes volver a consultar la oferta.');
            list.querySelector<HTMLElement>('[data-application-id="' + app.id + '"] .management-action')?.focus({ preventScroll: true });
          }
        };
        actions.append(withdraw);
      }
      list.append(item);
    }
  }
  render();
}
