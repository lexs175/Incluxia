import { user,readStore,writeStore,uid } from './demo';
export function initContact(){
  document.querySelectorAll<HTMLElement>('.contact-request').forEach(root=>{
    if(root.dataset.ready)return;root.dataset.ready='true';
    const form=root.querySelector('form')!,open=root.querySelector<HTMLButtonElement>('[data-contact-open]')!,feedback=root.querySelector<HTMLElement>('[role=status]')!;
    open.onclick=()=>{
      if(!user()){window.dispatchEvent(new CustomEvent('incluxia:request-login'));document.querySelector<HTMLElement>('[data-auth-trigger=login]')?.click();return;}
      if(root.dataset.recipient===user()?.id){feedback.textContent='Este es tu perfil o servicio. Puedes administrarlo desde tu cuenta.';return;}
      form.hidden=false;form.querySelector('textarea')!.focus();
    };
    form.onsubmit=e=>{
      e.preventDefault();const state=readStore(),sender=user(state),recipient=root.dataset.recipient;
      if(!sender||!recipient||sender.id===recipient){feedback.textContent='No se pudo completar esta consulta.';return;}
      const service = root.dataset.service && state.publications.find(p=>p.id===root.dataset.service);
      if(service && service.status!=='active'){feedback.textContent='Este servicio ya no está disponible para consultas.';return;}
      const message=String(new FormData(form).get('message')||'').trim();if(!message)return;
      state.inquiries.push({id:uid('inquiry'),senderId:sender.id,recipientId:recipient,serviceId:root.dataset.service||undefined,message,createdAt:new Date().toISOString()});
      try{writeStore(state);form.reset();form.hidden=true;feedback.textContent='Consulta guardada en esta demostración.';}catch{feedback.textContent='No se pudo guardar. Revisa el almacenamiento de tu navegador e inténtalo otra vez.';}
    };
  });
}
