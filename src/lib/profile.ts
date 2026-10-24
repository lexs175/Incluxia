import { readStore, user, writeStore, safeLink, profiles, talents, dateLabel, serviceHref } from './demo';
import { cloneTemplate, label, text, list, button } from './ui';
export function initProfile(){
  const root=document.getElementById('profileDetail');if(!root||root.dataset.ready)return;root.dataset.ready='true';
  const own=root.dataset.own==='true',dynamic=root.dataset.dynamic==='true',state=readStore();
  function services(ownerId:string|null){
    const current=readStore(),publications=current.publications.filter(p=>p.ownerId===ownerId&&p.type==='service'&&(own||p.status==='active'));
    const section=document.getElementById('profileServicesSection')!,container=document.getElementById('profileServices')!;
    section.hidden=!own&&!publications.length;container.replaceChildren();
    for(const publication of publications){const el=cloneTemplate('profileServicesTemplate');text(el,'.activity-title',publication.title);text(el,'.activity-meta',publication.salary+' · '+publication.delivery);text(el,'.activity-status',publication.status==='active'?'Disponible':publication.status==='paused'?'Pausado':'Cerrado');text(el,'.activity-message',publication.description);el.querySelector('.activity-actions')!.append(button(own?'Administrar':'Ver servicio',{href:own?'/publicar?tab=mine':serviceHref(publication.id),variant:'primary-line'}));container.append(el);}
    if(own&&!publications.length){const p=document.createElement('p');p.textContent='Todavía no ofreces servicios. Puedes crear uno desde Publicar.';container.append(p);}
  }
  let id=own?state.sessionId:new URLSearchParams(location.search).get('id');
  if(!own&&!dynamic){
    const source=profiles.find(p=>p.slug===root.dataset.profileId);
    if(source?.name===profiles[0].name&&state.accounts.find(a=>a.id==='demo-valeria'))id='demo-valeria';else{services(source?'talent-'+source.name:null);return;}
  }
  const account=state.accounts.find(a=>a.id===id);
  const person=account?{name:account.name,role:account.profession,city:account.city,avatar:account.photo,bio:account.bio,skills:account.skills.split(',').map(s=>s.trim()).filter(Boolean),whatsapp:account.phone,portfolio:account.portfolio}:talents(state).find(p=>p.id===id);
  if(!person){text(root,'.profile-name','Perfil no disponible');root.querySelector<HTMLElement>('.profile-stack')!.replaceChildren(root.querySelector('.profile-hero-card')!);root.setAttribute('aria-busy','false');return;}
  const skillTemplate=root.querySelector('.skill-row-item')!.cloneNode(true) as HTMLElement;
  const experienceTemplate=root.querySelector('.experience-item')!.cloneNode(true) as HTMLElement;
  const educationTemplate=root.querySelector('.education-item')!.cloneNode(true) as HTMLElement;
  function render(){
    const current=readStore(),a=current.accounts.find(p=>p.id===id);
    const p=a?{name:a.name,role:a.profession,city:a.city,avatar:a.photo,bio:a.bio,skills:a.skills.split(',').map(s=>s.trim()).filter(Boolean),whatsapp:a.phone,portfolio:a.portfolio}:person!;
    text(root!,'.profile-name',p.name);text(root!,'.profile-headline-role',p.role||'Completa tu profesión');text(root!,'[data-profile-city]',p.city+', Bolivia');text(root!,'.profile-about-paragraph',p.bio||'Añade una presentación sobre tu experiencia y el trabajo que realizas.');
    text(root!,'.meta-status','Comunicación por escrito');
    const image=root!.querySelector<HTMLImageElement>('.profile-avatar-img')!,initial=root!.querySelector<HTMLElement>('.profile-avatar-initial')!;
    image.hidden=!p.avatar;if(p.avatar){image.src=p.avatar;image.alt=p.name;}
    initial.hidden=!!p.avatar;initial.style.display=p.avatar?'none':'flex';initial.textContent=p.name.charAt(0).toUpperCase();
    const skillList=root!.querySelector('.skills-card-grid')!;skillList.replaceChildren(...p.skills.map(skill=>{const el=skillTemplate.cloneNode(true) as HTMLElement;text(el,'.skill-title-name',skill);text(el,'.skill-tag-check','Habilidad indicada en el perfil');return el;}));
    text(root!,'.aptitudes-list-preview',p.skills.slice(0,4).join(' · ')||'Añade tus principales habilidades.');
    const original=a?.id==='demo-valeria'?profiles[0]:null;
    const experience=a?.experience!==undefined?a.experience.split('\n').filter(Boolean):original?.experience.map(e=>e.role+' · '+e.company+' · '+e.period+'\n'+e.highlights.join(' '))||[];
    const education=a?.education!==undefined?a.education.split('\n').filter(Boolean):original?.education.map(e=>e.degree+' · '+e.institution+' · '+e.year)||[];
    const experiences=root!.querySelector('.experience-list')!;experiences.replaceChildren(...experience.map(value=>{const el=experienceTemplate.cloneNode(true) as HTMLElement;text(el,'.experience-role',value);el.querySelectorAll('.experience-company,.experience-period,.experience-highlights,.experience-aptitudes-badge').forEach(e=>e.remove());return el;}));
    if(!experience.length){const p=document.createElement('p');p.textContent='Sin experiencia añadida todavía.';experiences.append(p);}
    const educations=root!.querySelector('.education-list')!;educations.replaceChildren(...education.map(value=>{const el=educationTemplate.cloneNode(true) as HTMLElement;text(el,'.education-institution',value);el.querySelectorAll('.education-degree,.education-year').forEach(e=>e.remove());return el;}));
    if(!education.length){const p=document.createElement('p');p.textContent='Sin estudios añadidos todavía.';educations.append(p);}
    list(root!.querySelector('.languages-grid'),a?.languages?.split('\n').filter(Boolean)||original?.languages||['Comunicación por escrito'],'span','language-pill-item');
    const portfolio=document.getElementById('profilePortfolio')!;portfolio.replaceChildren();
    for(const line of (p.portfolio||'').split('\n')){const [title,url]=line.split('|').map(s=>s.trim());const href=safeLink(url||title);if(!href)continue;const link=document.createElement('a');link.href=href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=url?title:href;portfolio.append(link);}
    if(!portfolio.children.length){const p=document.createElement('p');p.textContent='Sin muestras añadidas todavía.';portfolio.append(p);}
    const contact=root!.querySelector<HTMLElement>('.contact-request');if(contact)contact.dataset.recipient=id||'';
    const email=root!.querySelector<HTMLAnchorElement>('#profileEmail');if(email){email.hidden=!a?.email;if(a?.email)email.href='mailto:'+a.email;}
    if(own){
      const received=current.inquiries.filter(i=>i.recipientId===a?.id);const list=document.getElementById('profileInquiries')!;list.replaceChildren();
      for(const inquiry of received){const item=cloneTemplate('profileInquiriesTemplate');text(item,'.activity-title',current.accounts.find(p=>p.id===inquiry.senderId)?.name||'Persona');text(item,'.activity-meta',dateLabel(inquiry.createdAt));text(item,'.activity-message',inquiry.message);list.append(item);}
      if(!received.length){const p=document.createElement('p');p.textContent='Todavía no has recibido consultas.';list.append(p);}
    }
    services(id||null);
    root!.setAttribute('aria-busy','false');
  }
  if(own&&account){
    const editor=document.getElementById('profileEditor')!,form=document.getElementById('profileForm') as HTMLFormElement;
    const keys=['name','profession','city','phone','category','bio','skills','experience','education','languages','portfolio'] as const;
    function fill(){const a=user()!;for(const key of keys){let value=a[key]||'';if(a.id==='demo-valeria'&&a[key]===undefined){if(key==='experience')value=profiles[0].experience.map(e=>e.role+' · '+e.company+' · '+e.period).join('\n');if(key==='education')value=profiles[0].education.map(e=>e.degree+' · '+e.institution).join('\n');if(key==='languages')value=profiles[0].languages.join('\n');}(form.elements.namedItem(key) as HTMLInputElement).value=value;}text(root!,'#profileCvName',a.cv?'Archivo guardado: '+a.cv:'No has añadido un currículum.');}
    document.getElementById('editMyProfile')!.onclick=()=>{fill();editor.hidden=false;editor.scrollIntoView({block:'start'});};
    document.getElementById('cancelProfileEdit')!.onclick=()=>{editor.hidden=true;};
    form.onsubmit=e=>{e.preventDefault();if(!form.reportValidity())return;const current=readStore(),a=user(current);if(!a)return;const data=new FormData(form);for(const key of keys)a[key]=String(data.get(key)||'').trim();const file=(form.elements.namedItem('cvFile') as HTMLInputElement).files?.[0];if(file)a.cv=file.name;try{writeStore(current);editor.hidden=true;render();document.getElementById('editMyProfile')!.focus();}catch{text(root!,'#profileFeedback','No se pudo guardar el perfil. Inténtalo otra vez.');}};
  }
  render();
}
