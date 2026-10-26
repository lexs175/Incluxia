import { setImage } from "./image-client";
import { readStore, user, writeStore, safeLink, profiles, talents, dateLabel, serviceHref } from './demo';
import { cloneTemplate, label, text, list, managementAction } from './ui';

function renderAvatar(root: HTMLElement, photo: string, name: string) {
  const image = root.querySelector<HTMLImageElement>('.profile-avatar-img')!;
  const initial = root.querySelector<HTMLElement>('.profile-avatar-initial')!;
  initial.textContent = name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  const fallback = () => { image.hidden = true; setImage(image, undefined); initial.hidden = false; };
  image.onerror = fallback;
  if (photo) { setImage(image, photo); image.alt = 'Foto de ' + name; image.hidden = false; initial.hidden = true; }
  else fallback();
}

function renderCover(root: HTMLElement, source?: string) {
  const image = root.querySelector<HTMLImageElement>('.profile-cover-image');
  if (!image) return;
  image.onerror = () => { image.hidden = true; };
  image.hidden = !source;
  setImage(image, source, 'profileCover');
}

export function initProfile() {
  const root = document.getElementById('profileDetail'); if (!root || root.dataset.ready) return; root.dataset.ready = 'true';
  const own = root.dataset.own === 'true', dynamic = root.dataset.dynamic === 'true', state = readStore();
  function services(ownerId: string | null) {
    const current = readStore(), publications = current.publications.filter(p => p.ownerId === ownerId && p.type === 'service' && (own || p.status === 'active'));
    const section = document.getElementById('profileServicesSection')!, container = document.getElementById('profileServices')!;
    section.hidden = !own && !publications.length; container.replaceChildren();
    for (const publication of publications) { const el = cloneTemplate('profileServicesTemplate'); text(el, '.activity-title', publication.title); text(el, '.activity-meta', publication.salary + ' · ' + publication.delivery); text(el, '.activity-status', publication.status === 'active' ? 'Disponible' : publication.status === 'paused' ? 'Pausado' : 'Cerrado'); text(el, '.activity-message', publication.description); el.querySelector('.activity-actions')!.append(managementAction(own ? 'Administrar' : 'Ver servicio', { href: own ? '/publicar?tab=mine' : serviceHref(publication.id), variant: 'secondary' })); container.append(el); }
    if (own && !publications.length) { const p = document.createElement('p'); p.textContent = 'Todavía no ofreces servicios. Puedes crear uno desde Publicar.'; container.append(p); }
  }
  let id = own ? state.sessionId : new URLSearchParams(location.search).get('id');
  const linkedAccount = state.accounts.find(account => account.profileSlug && id === 'talent-' + profiles.find(profile => profile.slug === account.profileSlug)?.name);
  if (linkedAccount) id = linkedAccount.id;
  if (!own && !dynamic) {
    const source = profiles.find(p => p.slug === root.dataset.profileId);
    if (source) renderAvatar(root, source.photo, source.name);
    const linked = state.accounts.find(account => account.profileSlug === source?.slug);
    if (linked) id = linked.id; else { services(source ? 'talent-' + source.name : null); return; }
  }
  const account = state.accounts.find(a => a.id === id);
  const person = account ? { name: account.name, role: account.profession, city: account.city, avatar: account.photo, bio: account.bio, skills: account.skills.split(',').map(s => s.trim()).filter(Boolean), whatsapp: account.phone, portfolio: account.portfolio } : talents(state).find(p => p.id === id);
  if (!person) {
    const card = root.querySelector<HTMLElement>('.profile-hero-card')!, body = card.querySelector('.profile-hero-body')!, heading = body.querySelector('.profile-name')!;
    heading.textContent = 'Perfil no disponible'; body.replaceChildren(heading);
    const message = document.createElement('p'); message.textContent = 'No encontramos el perfil solicitado.'; body.append(message);
    card.replaceChildren(body); root.querySelector('.profile-stack')!.replaceChildren(card); root.setAttribute('aria-busy', 'false'); return;
  }
  const skillTemplate = root.querySelector('.skill-row-item')!.cloneNode(true) as HTMLElement;
  const experienceTemplate = root.querySelector('.experience-item')!.cloneNode(true) as HTMLElement;
  const educationTemplate = root.querySelector('.education-item')!.cloneNode(true) as HTMLElement;
  function render() {
    const current = readStore(), a = current.accounts.find(p => p.id === id);
    const original = a ? (profiles.find(profile => profile.slug === a.profileSlug) || (a.id === 'demo-valeria' ? profiles[0] : null)) : profiles.find(profile => profile.name === person!.name);
    const p = a ? { name: a.name, role: a.profession, city: a.city, avatar: a.photo, bio: a.bio, skills: a.skills.split(',').map(s => s.trim()).filter(Boolean), whatsapp: a.phone, portfolio: a.portfolio } : original ? { ...person!, role: original.role, city: original.city, avatar: original.photo, bio: original.about, skills: original.skills } : person!;
    text(root!, '.profile-name', p.name); text(root!, '.profile-headline-role', p.role || (own ? 'Completa tu profesión' : 'Profesional en Eco')); text(root!, '[data-profile-city]', p.city ? p.city + ', Bolivia' : own ? 'Añade tu ciudad' : 'Bolivia'); text(root!, '.profile-about-paragraph', p.bio || (own ? 'Añade una presentación sobre tu experiencia y el trabajo que realizas.' : 'Aún no añadió una presentación.'));
    text(root!, '.meta-status', original?.availability || 'Comunicación por escrito');
    renderAvatar(root!, p.avatar, p.name);
    renderCover(root!, original?.cover);
    const demoNote = root!.querySelector<HTMLElement>('[data-profile-demo]'); if (demoNote) demoNote.hidden = !original?.demo;
    const skillList = root!.querySelector('.skills-card-grid')!; skillList.replaceChildren(...p.skills.map(skill => { const el = skillTemplate.cloneNode(true) as HTMLElement; text(el, '.skill-title-name', skill); return el; }));
    if (!p.skills.length) { const empty = document.createElement('p'); empty.textContent = 'Sin habilidades añadidas todavía.'; skillList.append(empty); }
    text(root!, '.aptitudes-list-preview', p.skills.slice(0, 4).join(' · ') || (own ? 'Añade tus principales habilidades.' : 'Sin habilidades añadidas todavía.'));
    const defaultExperience = original?.experience.map(entry => entry.role + ' · ' + entry.company + ' · ' + entry.period + ' — ' + entry.highlights.join(' ')).join('\n');
    const defaultEducation = original?.education.map(entry => entry.degree + ' · ' + entry.institution + ' · ' + entry.year).join('\n');
    const experience = a?.experience !== undefined && a.experience !== defaultExperience ? a.experience.split('\n').filter(Boolean).map(role => ({ role, company: '', period: '', highlights: [] as string[] })) : original?.experience || [];
    const education = a?.education !== undefined && a.education !== defaultEducation ? a.education.split('\n').filter(Boolean).map(institution => ({ institution, degree: '', year: '' })) : original?.education || [];
    const experiences = root!.querySelector('.experience-list')!; experiences.replaceChildren(...experience.map((entry, index) => {
      const el = experienceTemplate.cloneNode(true) as HTMLElement; el.classList.toggle('has-divider', index < experience.length - 1);
      text(el, '.experience-role', entry.role); text(el, '.experience-company', entry.company); text(el, '.experience-period', entry.period);
      el.querySelector<HTMLElement>('.experience-company')!.hidden = !entry.company; el.querySelector<HTMLElement>('.experience-period')!.hidden = !entry.period;
      const highlights = el.querySelector<HTMLElement>('.experience-highlights')!, template = highlights.firstElementChild!;
      highlights.replaceChildren(...entry.highlights.map(value => { const item = template.cloneNode(true) as HTMLElement; text(item, 'span', value); return item; })); highlights.hidden = !entry.highlights.length;
      const badge = el.querySelector<HTMLElement>('.experience-aptitudes-badge')!; badge.hidden = !entry.company || !p.skills.length; text(badge, 'span', p.skills.slice(0, 3).join(', '));
      return el;
    }));
    if (!experience.length) { const p = document.createElement('p'); p.textContent = 'Sin experiencia añadida todavía.'; experiences.append(p); }
    const educations = root!.querySelector('.education-list')!; educations.replaceChildren(...education.map((entry, index) => { const el = educationTemplate.cloneNode(true) as HTMLElement; el.classList.toggle('has-divider', index < education.length - 1); text(el, '.education-institution', entry.institution); text(el, '.education-degree', entry.degree); text(el, '.education-year', entry.year); el.querySelector<HTMLElement>('.education-degree')!.hidden = !entry.degree; el.querySelector<HTMLElement>('.education-year')!.hidden = !entry.year; return el; }));
    if (!education.length) { const p = document.createElement('p'); p.textContent = 'Sin estudios añadidos todavía.'; educations.append(p); }
    list(root!.querySelector('.languages-grid'), a?.languages?.split('\n').filter(Boolean) || original?.languages || ['Comunicación por escrito'], 'span', 'language-pill-item');
    const portfolio = document.getElementById('profilePortfolio')!; portfolio.replaceChildren();
    for (const line of (p.portfolio || '').split('\n')) { const [title, url] = line.split('|').map(s => s.trim()); const href = safeLink(url || title); if (!href) continue; const link = document.createElement('a'); link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = url ? title : href; portfolio.append(link); }
    if (!portfolio.children.length && original?.projects?.length) {
      for (const project of original.projects) { const card = cloneTemplate('profileProjectTemplate'); text(card, '.profile-project-title', project.title); text(card, '.profile-project-category', project.category); portfolio.append(card); }
    }
    if (!portfolio.children.length) { const p = document.createElement('p'); p.textContent = 'Sin muestras añadidas todavía.'; portfolio.append(p); }
    const contact = root!.querySelector<HTMLElement>('.contact-request'); if (contact) contact.dataset.recipient = id || '';
    const email = root!.querySelector<HTMLAnchorElement>('#profileEmail'), address = a?.email || original?.contact.email; if (email) { email.hidden = !address; if (address) email.href = 'mailto:' + address; }
    const share = root!.querySelector<HTMLAnchorElement>('#profileShare'); if (share) share.href = 'https://wa.me/?text=' + encodeURIComponent('Perfil de ' + p.name + ' en Eco ' + location.href);
    if (own) {
      const received = current.inquiries.filter(i => i.recipientId === a?.id); const list = document.getElementById('profileInquiries')!; list.replaceChildren();
      for (const inquiry of received) { const item = cloneTemplate('profileInquiriesTemplate'); text(item, '.activity-title', current.accounts.find(p => p.id === inquiry.senderId)?.name || 'Persona'); text(item, '.activity-meta', dateLabel(inquiry.createdAt)); text(item, '.activity-message', inquiry.message); list.append(item); }
      if (!received.length) { const p = document.createElement('p'); p.textContent = 'Todavía no has recibido consultas.'; list.append(p); }
    }
    services(id || null);
    root!.setAttribute('aria-busy', 'false');
  }
  if (own && account) {
    const editor = document.getElementById('profileEditor')!, form = document.getElementById('profileForm') as HTMLFormElement;
    const keys = ['name', 'profession', 'city', 'phone', 'category', 'bio', 'skills', 'experience', 'education', 'languages', 'portfolio'] as const;
    function fill() { const a = user()!; for (const key of keys) { let value = a[key] || ''; if (a.id === 'demo-valeria' && a[key] === undefined) { if (key === 'experience') value = profiles[0].experience.map(e => e.role + ' · ' + e.company + ' · ' + e.period).join('\n'); if (key === 'education') value = profiles[0].education.map(e => e.degree + ' · ' + e.institution).join('\n'); if (key === 'languages') value = profiles[0].languages.join('\n'); } (form.elements.namedItem(key) as HTMLInputElement).value = value; } text(root!, '#profileCvName', a.cv ? 'Archivo guardado: ' + a.cv : 'No has añadido un currículum.'); }
    document.getElementById('editMyProfile')!.onclick = () => { fill(); editor.hidden = false; editor.scrollIntoView({ block: 'start' }); };
    document.getElementById('cancelProfileEdit')!.onclick = () => { editor.hidden = true; };
    form.onsubmit = e => { e.preventDefault(); if (!form.reportValidity()) return; const current = readStore(), a = user(current); if (!a) return; const data = new FormData(form); for (const key of keys) a[key] = String(data.get(key) || '').trim(); const file = (form.elements.namedItem('cvFile') as HTMLInputElement).files?.[0]; if (file) a.cv = file.name; try { writeStore(current); editor.hidden = true; render(); document.getElementById('editMyProfile')!.focus(); } catch { text(root!, '#profileFeedback', 'No se pudo guardar el perfil. Inténtalo otra vez.'); } };
  }
  render();
}
