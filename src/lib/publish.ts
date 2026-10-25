import { readStore, user, writeStore, uid, jobHref, serviceHref, dateLabel, type Publication } from './demo';
import { button, cloneTemplate, text } from './ui';
export function initPublish(){
  const root=document.getElementById('publishWorkspace');if(!root||root.dataset.ready)return;root.dataset.ready='true';
  const account=user(),form=document.getElementById('publishJobForm') as HTMLFormElement;
  const gate=document.getElementById('publishAuthGate')!;
  gate.style.display=account?'none':'flex';if(!account)return;
  const fields=document.getElementById('publishFormWrapper')!,mine=document.getElementById('myPublications')!,preview=document.getElementById('publicationPreview')!,success=document.getElementById('publishSuccessBox')!;
  const kind=document.getElementById('publicationKind') as HTMLInputElement;
  const kindOptions=[...root.querySelectorAll<HTMLInputElement>('[data-publication-kind]')];
  const get=(id:string)=>(document.getElementById(id) as HTMLInputElement).value.trim();
  const set=(id:string,value:string)=>{(document.getElementById(id) as HTMLInputElement).value=value;};
  let editing:string|null=null,draft:Publication|null=null;
  function show(view:'form'|'mine'|'preview'|'success'){
    fields.style.display=view==='form'?'block':'none';mine.hidden=view!=='mine';preview.hidden=view!=='preview';success.style.display=view==='success'?'flex':'none';
    const destination=new URL(location.href);
    if(view==='mine')destination.searchParams.set('tab','mine');else destination.searchParams.delete('tab');
    history.replaceState(history.state,'',destination);
    document.dispatchEvent(new Event('incluxia:view-changed'));
    if(view==='mine')renderMine();
  }
  function kindChanged(){
    const service=kind.value==='service',company=kind.value==='company';
    kindOptions.forEach(option=>{option.checked=option.value===kind.value;});
    document.getElementById('jobTypeToggle')!.hidden=service||kind.value==='person';
    text(root!,'#publicationKindHelp',company?'Publicas a nombre de una organización.':service?'Este servicio aparecerá en Contratar, dentro de su especialidad.':'Publicas un encargo a tu nombre.');
    const input=document.getElementById('jobCompany') as HTMLInputElement;
    input.readOnly=!company;if(!company)input.value=account!.name;else if(!editing)input.value=account!.company;
    text(root!,'#budgetLabelText',service?'Precio del servicio (Bs.)':get('jobTypeInput')==='fixed'&&company?'Sueldo mensual (Bs.)':'Presupuesto del proyecto (Bs.)');
  }
  function reset(){editing=null;draft=null;form.reset();kind.value='company';set('jobCompany',account!.company);set('jobWhatsapp',account!.phone);kindChanged();show('form');}
  document.getElementById('viewMyPublished')!.onclick=()=>show('mine');
  document.getElementById('btnPublishAnother')!.onclick=reset;
  kindOptions.forEach(option=>{option.onchange=()=>{if(option.checked){kind.value=option.value;kindChanged();}};});
  function type(value:string){set('jobTypeInput',value);kindChanged();}
  document.getElementById('jobTypeInput')!.onchange=kindChanged;
  function item(publication:Publication,template='publicationListTemplate'){
    const el=cloneTemplate(template);
    text(el,'.activity-title',publication.title);
    text(el,'.activity-status',({active:'Activa',paused:'Pausada',closed:'Cerrada'})[publication.status]+' · '+({company:'Como empresa',person:'Como persona',service:'Servicio'})[publication.kind]);
    text(el,'.activity-meta',publication.company+' · '+publication.salary+' · '+publication.city+' · '+publication.modality+' · '+publication.delivery);
    text(el,'.activity-message',publication.description+'\n\n'+publication.tasks.join('\n'));
    return el;
  }
  form.onsubmit=e=>{
    e.preventDefault();if(!form.reportValidity())return;
    const state=readStore(),owner=user(state);if(!owner)return;
    const before=state.publications.find(j=>j.id===editing&&j.ownerId===owner.id);
    draft={id:before?.id||uid('publication'),slug:before?.slug||uid('oferta'),ownerId:owner.id,kind:kind.value as Publication['kind'],type:kind.value==='service'?'service':kind.value==='person'||get('jobTypeInput')!=='fixed'?'project':'employment',title:get('jobTitle'),company:get('jobCompany'),city:get('jobCity')==='100% Remoto'?'Remoto':get('jobCity'),modality:get('jobModality'),category:get('jobCategory'),salary:(/^Bs\./i.test(get('jobBudget'))?'':'Bs. ')+get('jobBudget')+(kind.value==='service'||get('jobTypeInput')!=='fixed'||kind.value==='person'?' / proyecto':' / mes'),description:get('jobDescription'),tasks:get('jobTasks').split('\n').map(s=>s.trim()).filter(Boolean),requirements:get('jobRequirements').split('\n').map(s=>s.trim()).filter(Boolean),delivery:get('jobDelivery'),status:before?.status||'active',createdAt:before?.createdAt||new Date().toISOString()};
    document.getElementById('previewList')!.replaceChildren(item(draft,'previewListTemplate'));show('preview');
    preview.scrollIntoView({block:'start'});
  };
  document.getElementById('editPublicationPreview')!.onclick=()=>show('form');
  document.getElementById('confirmPublication')!.onclick=()=>{
    if(!draft)return;const state=readStore(),owner=user(state);if(!owner||owner.id!==draft.ownerId)return;
    const index=state.publications.findIndex(j=>j.id===draft!.id&&j.ownerId===owner.id);
    if(index>=0)state.publications[index]=draft;else state.publications.unshift(draft);
    owner.phone=get('jobWhatsapp');if(draft.kind==='company')owner.company=draft.company;
    try{writeStore(state);}catch{document.getElementById('publicationFeedback')!.textContent='No se pudo guardar. Revisa el almacenamiento del navegador e inténtalo de nuevo.';return;}
    (document.getElementById('viewPublished') as HTMLAnchorElement).href=draft.type==='service'?serviceHref(draft.id):jobHref(draft);
    text(root!,'#successSummaryText','“'+draft.title+'” quedó guardada en esta demostración. Puedes verla y administrarla en Mis publicaciones.');show('success');
  };
  function renderMine(){
    const state=readStore(),owner=user(state)!;const list=document.getElementById('publicationList')!;list.replaceChildren();
    const publications=state.publications.filter(j=>j.ownerId===owner.id);
    if(!publications.length){const p=document.createElement('p');p.textContent='Todavía no tienes publicaciones. Crea una para empezar.';list.append(p);return;}
    for(const publication of publications){
      const el=item(publication),actions=el.querySelector('.activity-actions')!;
      actions.append(button('Ver publicación',{href:publication.type==='service'?serviceHref(publication.id):jobHref(publication),variant:'primary-line'}));
      const edit=button('Editar',{variant:'primary-line'});edit.onclick=()=>{
        editing=publication.id;kind.value=publication.kind;
        for(const [id,value] of Object.entries({jobTitle:publication.title,jobCategory:publication.category,jobCity:publication.city==='Remoto'?'100% Remoto':publication.city,jobModality:publication.modality,jobBudget:publication.salary.replace(/^Bs\.\s*/,'').replace(/\s*\/\s*(mes|proyecto)$/,''),jobDescription:publication.description,jobCompany:publication.company,jobWhatsapp:owner.phone,jobTasks:publication.tasks.join('\n'),jobRequirements:publication.requirements.join('\n'),jobDelivery:publication.delivery}))set(id,value);
        type(publication.type==='employment'?'fixed':'freelance');show('form');fields.scrollIntoView({block:'start'});
      };actions.append(edit);
      for(const [title,status] of (publication.status==='active'?[['Pausar','paused'],['Cerrar','closed']]:[['Activar','active']]) as [string,Publication['status']][]){
        const control=button(title,{variant:'primary-line'});control.onclick=()=>{const current=readStore(),target=current.publications.find(j=>j.id===publication.id&&j.ownerId===user(current)?.id);if(target){target.status=status;writeStore(current);renderMine();}};actions.append(control);
      }
      if(publication.type!=='service'){
        const count=state.applications.filter(a=>a.jobId===publication.id&&a.status!=='Retirada').length;
        actions.append(button('Ver postulaciones ('+count+')',{href:'/postulaciones?tab=received&job='+encodeURIComponent(publication.id),variant:'primary-line'}));
      }else{
        const inquiries=state.inquiries.filter(i=>i.serviceId===publication.id);
        const extra=el.querySelector('.activity-extra')!;const title=document.createElement('p');title.textContent='Consultas recibidas: '+inquiries.length;extra.append(title);
        for(const inquiry of inquiries){const p=document.createElement('p');p.textContent=(state.accounts.find(a=>a.id===inquiry.senderId)?.name||'Persona')+' · '+dateLabel(inquiry.createdAt)+'\n'+inquiry.message;extra.append(p);}
      }
      list.append(el);
    }
  }
  set('jobCompany',account.company);set('jobWhatsapp',account.phone);
  const requestedKind=new URLSearchParams(location.search).get('kind');
  if(requestedKind&&['company','person','service'].includes(requestedKind))kind.value=requestedKind;
  document.getElementById('jobCity')!.onchange=()=>{if(get('jobCity')==='100% Remoto')set('jobModality','Remoto');};
  kindChanged();
  show(new URLSearchParams(location.search).get('tab')==='mine'?'mine':'form');
}
