import { setImage } from "./image-client";
import { readStore, categories, profiles, safeLink } from './demo';
import { cloneTemplate, text, button, label } from './ui';
import { initContact } from './contact';
export function appendPublishedTalent(category:string){
  const state=readStore();
  const categoryName=categories.find(c=>c.slug===category)?.name;
  const visible=(name:string)=>category==='todos'||name===categoryName;
  const services=document.getElementById('servicesGrid')!,people=document.getElementById('autonomosList')!;
  // Existing cards and drawers remain the source for their design and behavior.
  for(const publication of state.publications.filter(j=>j.type==='service')){
    let card=services.querySelector<HTMLElement>('[data-id="'+CSS.escape(publication.id)+'"]');
    if(!visible(publication.category)||publication.status!=='active'){card?.remove();document.getElementById('drawer-service-'+publication.id)?.remove();continue;}
    const owner=state.accounts.find(a=>a.id===publication.ownerId);
    if(!card){
      card=cloneTemplate('newServiceTemplate');card.dataset.id=publication.id;
      services.append(card);
      const template=document.getElementById('newServiceDetailTemplate') as HTMLTemplateElement;
      const panel=template.content.querySelector('.service-detail-panel')!.cloneNode(true) as HTMLElement;
      panel.id='drawer-service-'+publication.id;panel.dataset.id=publication.id;
      text(panel,'.gallery-package-title',publication.title);text(panel,'.price-box-value',publication.salary);text(panel,'.delivery-time-val',publication.delivery);text(panel,'.drawer-author-name',publication.company);text(panel,'.drawer-author-meta',publication.city);text(panel,'.drawer-body-text',publication.description);
      const checks=panel.querySelector('.drawer-checklist')!;const example=checks.firstElementChild!.cloneNode(true) as HTMLElement;
      checks.replaceChildren(...publication.tasks.map(task=>{const el=example.cloneNode(true) as HTMLElement;el.lastElementChild!.textContent=task;return el;}));
      const contact=panel.querySelector<HTMLElement>('.contact-request')!;contact.dataset.recipient=publication.ownerId;contact.dataset.service=publication.id;delete contact.dataset.ready;
      label(contact.querySelector('[data-contact-open]'),'Consultar este paquete');
      const photo=panel.querySelector<HTMLImageElement>('.drawer-author-avatar')!;photo.hidden=!owner?.photo;if(owner?.photo)setImage(photo, owner.photo);
      document.getElementById('hiringDrawerScrollBody')!.append(panel);
    }
    card.dataset.title=publication.title.toLowerCase();card.dataset.city=publication.city;card.dataset.tags=(publication.category+' '+publication.tasks.join(' ')).toLowerCase();
    const detail=document.getElementById('drawer-service-'+publication.id);
    if(detail){text(detail,'.gallery-package-title',publication.title);text(detail,'.price-box-value',publication.salary);text(detail,'.delivery-time-val',publication.delivery);text(detail,'.drawer-author-name',publication.company);text(detail,'.drawer-author-meta',publication.city);text(detail,'.drawer-body-text',publication.description);const list=detail.querySelector('.drawer-checklist')!;const template=list.firstElementChild?.cloneNode(true) as HTMLElement;if(template)list.replaceChildren(...publication.tasks.map(task=>{const el=template.cloneNode(true) as HTMLElement;el.lastElementChild!.textContent=task;return el;}));}
    text(card,'.service-card-title',publication.title);text(card,'.service-card-desc',publication.description);text(card,'.price-value',publication.salary);text(card,'.delivery-badge',publication.delivery);text(card,'.service-author-name',publication.company);text(card,'.service-author-city',publication.city);
    const cover=card.querySelector<HTMLImageElement>('.service-cover-image');
    const categoryCover=categories.find(category=>category.name===publication.category||category.name.startsWith(publication.category))?.image;
    const serviceCover=cover?.dataset.servicePreview||categoryCover;
    if(cover&&serviceCover)setImage(cover, serviceCover);
    const avatar=card.querySelector<HTMLImageElement>('.service-author-avatar');if(avatar&&owner){avatar.hidden=!owner.photo;avatar.alt=owner.name;if(owner.photo)setImage(avatar, owner.photo);text(card,'.service-author-initials',owner.name.split(/\s+/).slice(0,2).map(part=>part[0]).join(''));}
  }
  for(const account of state.accounts.filter(a=>a.profession)){
    const source=profiles.find(profile=>profile.slug===account.profileSlug);
    const existing=source?people.querySelector<HTMLElement>('[data-name="'+CSS.escape(source.name.toLowerCase())+'"]'):null;
    if(!existing&&!visible(account.category||(account.id==='demo-valeria'?categories[0].name:'')))continue;
    const originalId=existing?.dataset.id;
    const card=existing||cloneTemplate('newAutonomoTemplate');card.dataset.id=account.id;card.dataset.name=account.name.toLowerCase();card.dataset.role=account.profession.toLowerCase();card.dataset.city=account.city;card.dataset.skills=account.skills.toLowerCase();
    text(card,'.autonomo-name',account.name);text(card,'.autonomo-role',account.profession);if(existing){const city=card.querySelector('.autonomo-city')!,icon=city.querySelector('svg'),rate=city.querySelector('.rate-badge');city.replaceChildren(...[icon,document.createTextNode(account.city+', Bolivia · '),rate].filter(Boolean) as Node[]);}else text(card,'.autonomo-city',account.city);text(card,'.autonomo-bio-preview',account.bio);
    if(!existing)card.querySelectorAll('.pro-tag,.footer-meta-item').forEach(el=>el.remove());
    const image=card.querySelector<HTMLImageElement>('.autonomo-avatar-img')!;image.hidden=!account.photo;image.alt=account.name;if(account.photo)setImage(image, account.photo);
    text(card,'.autonomo-initials',account.name.split(/\s+/).slice(0,2).map(part=>part[0]).join(''));
    const skills=card.querySelector('.autonomo-skills-chips')!;const chip=skills.firstElementChild!;
    skills.replaceChildren(...account.skills.split(',').filter(Boolean).slice(0,3).map(skill=>{const el=chip.cloneNode() as HTMLElement;el.textContent=skill.trim().replace(/^Adobe\s+/i,'');el.title=skill.trim();return el;}));
    const href='/perfiles/ver?id='+encodeURIComponent(account.id);
    const originalPanel=originalId?document.getElementById('drawer-autonomo-'+originalId):null;
    const panel=originalPanel||(document.getElementById('newServiceDetailTemplate') as HTMLTemplateElement).content.querySelector('.autonomo-detail-panel')!.cloneNode(true) as HTMLElement;
    panel.id='drawer-autonomo-'+account.id;panel.dataset.id=account.id;
    text(panel,'.drawer-name',account.name);text(panel,'.drawer-headline',account.profession+' · '+account.city);text(panel,'.drawer-body-text',account.bio);
    const cover=panel.querySelector<HTMLImageElement>('.drawer-cover-image');if(cover){cover.hidden=!source?.cover;setImage(cover,source?.cover,'profileCover');}
    const photo=panel.querySelector<HTMLImageElement>('.drawer-avatar-img')!;photo.hidden=!account.photo;if(account.photo)setImage(photo, account.photo);
    const badges=panel.querySelector('.drawer-meta-badges')!;if(!originalPanel){badges.replaceChildren();const badge=document.createElement('span');badge.className='drawer-meta-pill';badge.textContent='Comunicación por escrito';badges.append(badge);}
    const skillsList=panel.querySelector('.drawer-skills-chips')!;const skillTemplate=skillsList.firstElementChild!;skillsList.replaceChildren(...account.skills.split(',').filter(Boolean).map(value=>{const el=skillTemplate.cloneNode() as HTMLElement;el.textContent=value.trim();return el;}));
    const link=panel.querySelector<HTMLAnchorElement>('.drawer-actions-row a')!;link.href=href;
    const contact=panel.querySelector<HTMLElement>('.contact-request')!;contact.dataset.recipient=account.id;delete contact.dataset.ready;label(contact.querySelector('[data-contact-open]'),'Consultar disponibilidad');
    panel.querySelectorAll<HTMLElement>('.drawer-tab-btn').forEach(tab=>tab.dataset.panelId=account.id);
    const works=panel.querySelector<HTMLElement>('.drawer-portfolio-grid')!,reviews=panel.querySelector<HTMLElement>('.drawer-reviews-list')!;
    works.id='tabWorksContent-'+account.id;reviews.id='tabReviewsContent-'+account.id;
    if(!originalPanel||account.portfolio){
      works.replaceChildren();for(const line of account.portfolio.split('\n')){const[title,url]=line.split('|');const safe=safeLink((url||title||'').trim());if(!safe)continue;works.append(button(title.trim()||'Ver muestra',{href:safe,variant:'primary-line'}));}
      if(!works.children.length){const empty=document.createElement('p');empty.textContent='Sin muestras añadidas todavía.';works.append(empty);}
      reviews.replaceChildren();const empty=document.createElement('p');empty.textContent='Todavía no hay reseñas.';reviews.append(empty);
      const tabs=panel.querySelectorAll('.drawer-tab-btn');tabs[0].textContent='Muestras de trabajo';tabs[1].textContent='Reseñas';
    }
    if(!originalPanel)document.getElementById('hiringDrawerScrollBody')!.append(panel);
    if(!existing)people.prepend(card);
  }
  document.querySelectorAll<HTMLElement>('[data-mode-btn="servicios"] span').forEach(el=>el.textContent='Servicios ('+services.querySelectorAll('.service-card-item').length+')');
  document.querySelectorAll<HTMLElement>('[data-mode-btn="autonomos"] span').forEach(el=>el.textContent='Autónomos ('+people.querySelectorAll('.autonomo-card-item').length+')');
  initContact();
}
