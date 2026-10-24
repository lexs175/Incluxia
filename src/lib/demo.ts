import sourceJobs from '../data/jobs.json';
import profiles from '../data/profiles.json';
import hiring from '../data/hiring.json';

export interface Account {
  id: string; name: string; email: string; phone: string; city: string;
  profession: string; bio: string; skills: string; company: string;
  portfolio: string; cv: string; photo: string;
  experience?: string; education?: string; languages?: string; category?: string;
}
export interface Publication {
  id: string; slug: string; ownerId: string; kind: 'company' | 'person' | 'service';
  type: 'employment' | 'project' | 'service'; title: string; company: string;
  city: string; modality: string; category: string; salary: string;
  description: string; tasks: string[]; requirements: string[];
  companyLogo?: string;
  delivery: string; status: 'active' | 'paused' | 'closed'; createdAt: string;
}
export interface Application {
  id: string; jobId: string; applicantId: string; message: string; cv: string;
  status: 'Recibida' | 'En revisión' | 'Seleccionada' | 'No seleccionada' | 'Retirada'; createdAt: string;
}
export interface Inquiry {
  id: string; senderId: string; recipientId: string; serviceId?: string;
  message: string; createdAt: string;
}
export interface Store {
  version: number; sessionId: string | null; accounts: Account[];
  publications: Publication[]; applications: Application[]; saved: Record<string, string[]>;
  inquiries: Inquiry[];
}
export const STORE_KEY = 'incluxia_demo_v1';
export const categories = hiring.categories.map(c => ({ slug: c.slug, name: c.name }));
export const dateLabel = (value: string) => new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short' }).format(new Date(value));
const exampleDate = '2026-10-22T14:00:00.000Z';
const baseProfile = profiles[0];
export const seedAccounts: Account[] = [
  { id: 'demo-valeria', name: baseProfile.name, email: 'valeria@ejemplo.test', phone: '59170000001', city: baseProfile.city, profession: baseProfile.role, bio: baseProfile.about, skills: baseProfile.skills.join(', '), company: 'Estudio Valeria', portfolio: '', cv: 'Portafolio-Valeria.pdf', photo: baseProfile.photo },
  { id: 'demo-equipo', name: 'Equipo de contratación', email: 'equipo@ejemplo.test', phone: '59170000002', city: 'Cochabamba', profession: 'Selección y proyectos', bio: 'Equipo de ejemplo para recorrer la contratación con comunicación escrita.', skills: 'Coordinación, Administración', company: 'Equipo de ejemplo', portfolio: '', cv: '', photo: '' },
];
export const seedJobs: Publication[] = sourceJobs.map((j, i) => ({
  id: `job-${j.id}`, slug: j.slug, ownerId: 'demo-equipo', kind: 'company', type: 'employment',
  title: j.title, company: j.company, city: j.city, modality: j.modality,
  category: j.department, salary: j.salary, description: j.description,
  tasks: j.functions, requirements: j.requirements.filter(r => !/carnet|SIPRUNPCD/i.test(r)),
  delivery: 'Acordar por escrito', status: 'active', createdAt: `2026-10-${22 - i}T14:00:00.000Z`,
}));
const extras: Partial<Publication>[] = [
  { id: 'job-catalogo', slug: 'diseno-catalogo-digital', ownerId: 'demo-valeria', kind: 'person', type: 'project', title: 'Diseño de un catálogo digital', company: 'Estudio Valeria', city: 'Remoto', modality: 'Remoto', category: 'Diseño Gráfico', salary: 'Bs. 850 / proyecto', description: 'Busco apoyo para diseñar un catálogo de doce páginas. Compartiré fotografías y textos organizados. Acordaremos las revisiones por escrito.', tasks: ['Organizar los contenidos y preparar una propuesta visual.', 'Entregar el archivo editable y un PDF para compartir.'], requirements: ['Experiencia en diseño editorial.', 'Una muestra de trabajo similar.'], delivery: '10 días' },
  { id: 'job-redes', slug: 'contenido-redes-sociales', title: 'Contenido para redes sociales', category: 'Redes Sociales', salary: 'Bs. 1.400 / mes', city: 'Santa Cruz', modality: 'Híbrido', description: 'Preparar piezas y textos breves para un calendario de publicaciones, con entregas y revisiones por chat.' },
  { id: 'job-subtitulos', slug: 'edicion-subtitulos', type: 'project', title: 'Edición y subtítulos para cuatro videos', category: 'Edición Audiovisual', salary: 'Bs. 600 / proyecto', city: 'Remoto', modality: 'Remoto', description: 'Editar cuatro videos cortos y entregar subtítulos revisados. Se facilitarán los archivos y las instrucciones por escrito.' },
  { id: 'job-asistente', slug: 'asistencia-administrativa', title: 'Asistencia administrativa', category: 'Administración', salary: 'Bs. 3.100 / mes', city: 'La Paz', modality: 'Presencial', description: 'Organizar documentos y actualizar reportes del equipo. Las tareas, consultas y prioridades se coordinan por escrito.' },
];
seedJobs.push(...extras.map((j, i) => ({ ownerId: 'demo-equipo', kind: 'company', type: 'employment', company: 'Organización de ejemplo', tasks: ['Coordinar las entregas por escrito.', 'Revisar los materiales y documentar los avances.'], requirements: ['Experiencia o muestras relacionadas con el trabajo.', 'Disponibilidad para la modalidad indicada.'], delivery: 'Acordar por escrito', status: 'active', createdAt: `2026-10-${18 - i}T14:00:00.000Z`, ...j } as Publication)));

export const seedServices: Publication[] = hiring.services.map((s, i) => ({
  id: s.id, slug: s.id, ownerId: s.author.name === baseProfile.name ? 'demo-valeria' : `talent-${s.author.name}`,
  kind: 'service', type: 'service', title: s.title, company: s.author.name, city: s.author.city,
  modality: 'Remoto', category: hiring.categories.find(c => c.slug === s.categorySlug)?.name || 'Servicios',
  salary: s.price, description: s.description, tasks: s.highlights, requirements: [],
  delivery: s.deliveryTime, status: 'active', createdAt: exampleDate,
}));

export function initialStore(): Store {
  return { version: 1, sessionId: null, accounts: structuredClone(seedAccounts), publications: structuredClone([...seedJobs, ...seedServices]),
    applications: [
      { id: 'application-example-sent', jobId: seedJobs[0].id, applicantId: 'demo-valeria', message: 'Comparto mi perfil para que puedan conocer mi experiencia. Podemos coordinar por escrito.', cv: 'Portafolio-Valeria.pdf', status: 'En revisión', createdAt: exampleDate },
      { id: 'application-example-received', jobId: 'job-catalogo', applicantId: 'demo-equipo', message: 'Me interesa colaborar con el catálogo. Puedo preparar una primera propuesta esta semana.', cv: 'Muestras-editoriales.pdf', status: 'Recibida', createdAt: exampleDate },
    ], saved: {}, inquiries: [], };
}
export function readStore(): Store {
  try {
    const value = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (value?.version === 1 && Array.isArray(value.accounts) && Array.isArray(value.publications) && Array.isArray(value.applications) && Array.isArray(value.inquiries) && value.saved) return value;
  } catch { /* Recover the demonstration, never execute stored text. */ }
  const state = initialStore();
  // Keep the session created by the original prototype when upgrading it.
  try {
    const legacy = JSON.parse(localStorage.getItem('incluxia_auth_user') || 'null');
    if (legacy?.name) {
      let account = state.accounts.find(a => a.name === legacy.name);
      if (!account) {
        account = { id: uid('account'), name: legacy.name, email: legacy.email || '', phone: legacy.phone || '', city: legacy.city || 'Cochabamba', profession: '', bio: '', skills: '', company: legacy.companyName || '', portfolio: '', cv: '', photo: '' };
        state.accounts.push(account);
      }
      state.sessionId = account.id;
    }
  } catch { /* An invalid old session must not block the page. */ }
  return state;
}
export function writeStore(value: Store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(value));
  const account = user(value);
  if (account) localStorage.setItem('incluxia_auth_user', JSON.stringify(account));
  else localStorage.removeItem('incluxia_auth_user');
  document.documentElement.dataset.session = value.sessionId ? 'member' : 'guest';
  window.dispatchEvent(new CustomEvent('incluxia:demo-changed'));
  window.dispatchEvent(new CustomEvent('incluxia:auth-changed', { detail: account }));
}
export const user = (state = readStore()) => state.accounts.find(a => a.id === state.sessionId) || null;
export const uid = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
export const jobHref = (job: Publication) => `/empleos/oferta?id=${encodeURIComponent(job.id)}`;
export const serviceHref = (id: string) => `/contratar/todos?mode=servicios&service=${encodeURIComponent(id)}`;
export const talentHref = (id: string) => `/perfiles/ver?id=${encodeURIComponent(id)}`;
export const lines = (value: FormDataEntryValue | null) => String(value || '').split('\n').map(s => s.trim()).filter(Boolean);
export function safePath(value: string | null, fallback = '/') {
  return value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : fallback;
}
export function safeLink(value: string) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
export function signIn(identifier: string) {
  const state = readStore(); const account = state.accounts.find(a => a.email.toLowerCase() === identifier.trim().toLowerCase() || (a.phone && a.phone.replace(/\D/g, '') === identifier.replace(/\D/g, '')));
  if (!account) throw new Error('No encontramos esa cuenta en este navegador. Crea una cuenta o prueba el ejemplo.');
  state.sessionId = account.id; writeStore(state); return account;
}
export function register(data: { name: string; email: string; phone: string; city: string }) {
  const state = readStore();
  if (state.accounts.some(a => a.email.toLowerCase() === data.email.toLowerCase())) throw new Error('Este correo ya tiene una cuenta en la demostración. Utiliza Ingresar.');
  if (state.accounts.some(a => a.phone && a.phone.replace(/\D/g,'') === data.phone.replace(/\D/g,''))) throw new Error('Este WhatsApp ya tiene una cuenta en la demostración. Utiliza Ingresar.');
  const account: Account = { ...data, id: uid('account'), profession: '', bio: '', skills: '', company: '', portfolio: '', cv: '', photo: '' };
  state.accounts.push(account); state.sessionId = account.id; writeStore(state); return account;
}
export function apply(jobId: string, message: string, cv: string) {
  const state = readStore(); const account = user(state); const job = state.publications.find(j => j.id === jobId);
  if (!account) throw new Error('Ingresa para postular.');
  if (!job || job.status !== 'active') throw new Error('Esta oferta ya no recibe postulaciones.');
  if (job.ownerId === account.id) throw new Error('Esta publicación es tuya. Puedes revisar sus candidatos en Postulaciones.');
  const existing = state.applications.find(a => a.applicantId === account.id && a.jobId === jobId);
  if (existing && existing.status !== 'Retirada') throw new Error('Ya postulaste a esta oferta. Puedes consultarla en Postulaciones.');
  if (existing) Object.assign(existing, { message, cv, status: 'Recibida', createdAt: new Date().toISOString() });
  else state.applications.push({ id: uid('application'), jobId, applicantId: account.id, message, cv, status: 'Recibida', createdAt: new Date().toISOString() });
  writeStore(state);
}
export function accountProfile(account: Account) {
  return { id: account.id, name: account.name, role: account.profession || 'Profesional en Incluxia', city: account.city, avatar: account.photo, bio: account.bio || 'Esta persona está preparando su presentación profesional.', skills: account.skills.split(',').map(s => s.trim()).filter(Boolean), whatsapp: account.phone, category: account.profession, portfolio: account.portfolio };
}
export function talents(state = readStore()) {
  const base = hiring.autonomos.map(p => ({ id: `talent-${p.name}`, name: p.name, role: p.role, city: p.city, avatar: p.avatar, bio: p.bio, skills: p.skills, whatsapp: p.whatsapp, category: hiring.categories.find(c => c.slug === p.categorySlug)?.name || '', portfolio: '' }));
  for (const account of state.accounts) {
    const duplicate = base.findIndex(p => p.name === account.name || (account.id === 'demo-valeria' && p.id === `talent-${baseProfile.name}`));
    if (duplicate >= 0) base.splice(duplicate, 1);
    if (account.profession || account.id === state.sessionId) base.unshift(accountProfile(account));
  }
  return base;
}
export function ownerFor(publication: Publication, state = readStore()) {
  return state.accounts.find(a => a.id === publication.ownerId) || talents(state).find(p => p.id === publication.ownerId);
}
export { profiles };
