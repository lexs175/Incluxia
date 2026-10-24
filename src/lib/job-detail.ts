import { readStore, user, apply, safePath, dateLabel } from './demo';
import { label, list, text } from './ui';
export function initJobDetail() {
  const root = document.getElementById('jobDetail');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const state = readStore(), account = user(state);
  const id = new URLSearchParams(location.search).get('id') || root.dataset.jobId;
  const job = state.publications.find(j=>j.id===id && j.type!=='service');
  const back = document.getElementById('backToJobs') as HTMLAnchorElement;
  back.href = safePath(sessionStorage.getItem('incluxia_jobs_return'));
  if (!account) { root.setAttribute('aria-busy','false'); return; }
  const form = document.getElementById('jobApplyForm') as HTMLFormElement;
  const open = document.getElementById('openApplication') as HTMLButtonElement;
  const feedback = document.getElementById('applicationState')!;
  if (!job) {
    text(root,'.job-main-title','Esta oferta ya no está disponible');
    root.querySelector<HTMLElement>('.job-layout-grid')!.hidden = true;
    root.setAttribute('aria-busy','false'); return;
  }
  document.title = job.title+' | Incluxia';
  text(root,'.job-main-title',job.title);
  root.querySelectorAll('[data-job-company]').forEach(el=>el.textContent=job.company);
  root.querySelectorAll('[data-job-city]').forEach(el=>el.textContent=job.city);
  text(root,'[data-job-modality]',job.modality);
  text(root,'[data-job-date]','Publicado el '+dateLabel(job.createdAt));
  text(root,'[data-job-description]',job.description);
  text(root,'[data-job-delivery]',job.delivery);
  text(root,'[data-job-salary]',job.salary);
  list(document.getElementById('jobTasks'),job.tasks);
  list(document.getElementById('jobRequirements'),job.requirements);
  for (const [id,value] of [['applicantName',account.name],['applicantPhone',account.phone],['applicantCity',account.city]]) {
    const input=document.getElementById(id) as HTMLInputElement|HTMLSelectElement;
    if(input instanceof HTMLSelectElement&&!Array.from(input.options).some(o=>o.value===value))input.add(new Option(value,value));
    input.value=value;
  }
  const file = document.getElementById('applicantCv') as HTMLInputElement;
  text(root,'#cvFileName',account.cv || 'Seleccionar archivo (opcional)');
  file.onchange=()=>text(root,'#cvFileName',file.files?.[0]?.name || account.cv || 'Seleccionar archivo (opcional)');
  function sync() {
    const current = readStore();
    const applied = current.applications.find(a=>a.jobId===job!.id && a.applicantId===account!.id && a.status!=='Retirada');
    const own=job!.ownerId===account!.id;
    open.disabled=!!applied||own||job!.status!=='active';
    label(open,applied?'Ya postulaste':own?'Esta oferta es tuya':job!.status!=='active'?'Oferta cerrada':'Postular a esta oferta');
    feedback.textContent=applied?'Tu postulación está '+applied.status.toLowerCase()+'.':own?'Consulta a los candidatos en Postulaciones.':job!.status!=='active'?'Esta oferta no está recibiendo postulaciones.':'';
    (document.getElementById('viewMyApplications') as HTMLElement).hidden=!applied&&!own;
  }
  open.onclick=()=>{form.hidden=false;open.hidden=true;(document.getElementById('applicantNote') as HTMLTextAreaElement).focus();};
  form.onsubmit=e=>{
    e.preventDefault();
    try {
      apply(job.id,(document.getElementById('applicantNote') as HTMLTextAreaElement).value.trim(),file.files?.[0]?.name||account.cv);
      form.hidden=true;open.hidden=false;
      document.getElementById('applySuccessMsg')!.style.display='flex';sync();
    }catch(error){feedback.textContent=(error as Error).message;}
  };
  sync(); root.setAttribute('aria-busy','false');
}
