import { readStore, writeStore, user, jobHref, dateLabel } from './demo';
import { button, cloneTemplate, text } from './ui';
export function initApplications() {
  const root=document.getElementById('applicationsWorkspace');
  if(!root||root.dataset.ready)return;
  root.dataset.ready='true';
  if(!user())return;
  const received=new URLSearchParams(location.search).get('tab')==='received';
  const selectedJob=new URLSearchParams(location.search).get('job');
  const list=document.getElementById('applicationList')!;
  text(root.closest('.account-capsule')!,'.account-heading h1',received?'Postulaciones recibidas':'Postulaciones enviadas');
  function render(){
    const state=readStore(),account=user(state)!;
    const applications=state.applications.filter(a=>{
      const job=state.publications.find(j=>j.id===a.jobId);
      return received ? job?.ownerId===account.id&&(!selectedJob||job.id===selectedJob) : a.applicantId===account.id;
    });
    list.replaceChildren();
    if(!applications.length){
      const p=document.createElement('p');p.textContent=received?'Todavía no has recibido postulaciones.':'Todavía no has enviado postulaciones.';
      list.append(p,button(received?'Ir a Publicar':'Buscar trabajo',{href:received?'/publicar':'/'}));return;
    }
    for(const app of applications){
      const job=state.publications.find(j=>j.id===app.jobId)!;
      const candidate=state.accounts.find(a=>a.id===app.applicantId);
      const item=cloneTemplate('applicationListTemplate');
      text(item,'.activity-title',job.title);
      text(item,'.activity-status',app.status);
      text(item,'.activity-meta',(received?(candidate?.name||'Persona de ejemplo'):job.company)+' · '+dateLabel(app.createdAt)+(app.cv?' · Archivo: '+app.cv:''));
      text(item,'.activity-message',app.message);
      const actions=item.querySelector('.activity-actions')!;
      actions.append(button('Ver oferta',{href:jobHref(job),variant:'primary-line'}));
      if(received){
        if(candidate)actions.append(button('Ver perfil',{href:'/perfiles/ver?id='+encodeURIComponent(candidate.id),variant:'primary-line'}));
        const label=document.createElement('label');label.textContent='Estado de la postulación';
        const select=document.createElement('select');select.dataset.applicationStatus=app.id;select.disabled=app.status==='Retirada';
        for(const status of ['Recibida','En revisión','Seleccionada','No seleccionada','Retirada']){const option=new Option(status,status);option.selected=status===app.status;select.add(option);}
        select.onchange=()=>{
          const current=readStore(),own=user(current);
          const target=current.applications.find(a=>a.id===app.id);
          const publication=current.publications.find(j=>j.id===target?.jobId);
          if(target&&publication?.ownerId===own?.id&&target.status!=='Retirada'){
            target.status=select.value as typeof target.status;writeStore(current);render();
          }
        };
        label.append(select);item.querySelector('.activity-extra')!.append(label);
      }else if(app.status!=='Retirada'){
        const withdraw=button('Retirar postulación',{variant:'primary-line',data:{withdraw:app.id}});
        withdraw.onclick=()=>{
          const current=readStore();const target=current.applications.find(a=>a.id===app.id&&a.applicantId===user(current)?.id);
          if(target){target.status='Retirada';writeStore(current);render();}
        };actions.append(withdraw);
      }
      list.append(item);
    }
  }
  render();
}
