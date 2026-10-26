import fs from 'node:fs';
import path from 'node:path';

// Keep circles for people, status marks and circular icon controls.
const circular=new Map(Object.entries({
  'src/components/contratar/AutonomoCard.astro':['.autonomo-avatar-img'],
  'src/components/contratar/HiringDrawer.astro':['.drawer-avatar-wrap','.drawer-author-avatar'],
  'src/components/contratar/ServiceCard.astro':['.service-author-avatar'],
  'src/components/empleos/JobDetail.astro':['.status-pulse-green','.apply-success-alert .success-icon'],
  'src/components/empleos/OfferCard.astro':['.publisher-avatar'],
  'src/components/layout/Header.astro':['.nav-link::after','.user-avatar-dot','.header-logout-btn','.mobile-avatar','.header-profile-avatar-wrap','.header-profile-img','.header-profile-status-dot','.mobile-drawer-profile-img'],
  'src/components/layout/WhatsAppFAB.astro':['.whatsapp-fab'],
  'src/components/perfiles/ProfileDetail.astro':['.profile-avatar-container','.status-indicator','.profile-avatar-initial'],
  'src/components/ui/AuthModal.astro':['.auth-modal-close','.success-icon-badge','.user-avatar-circle'],
  'src/pages/contratar/[category].astro':['.category-radio-circle'],
  'src/pages/publicar.astro':['.auth-gate-icon-box','.success-icon-badge'],
  'src/styles/global.css':['::-webkit-scrollbar-thumb'],
}));
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const report=[];
for(const file of walk('src').filter(file=>/\.(astro|css)$/.test(file))){
  const key=file.replaceAll('\\','/'),before=fs.readFileSync(file,'utf8');
  function normalize(css){
    return css.replace(/([^{}]+)\{([^{}]*)\}/g,(rule,heading,body)=>{
      const selector=heading.replace(/\/\*[\s\S]*?\*\//g,'').trim();
      const keepCircle=circular.get(key)?.includes(selector);
      const normalized=body.replace(/border-radius:\s*([^;]+);/g,(declaration,value)=>{
        if(!/var\(--radius-|50%/.test(value))return declaration;
        if(keepCircle)return 'border-radius: var(--radius-full);';
        return 'border-radius: '+value.replace(/var\(--radius-(?:xs|sm|lg|xl|2xl|3xl|full)\)/g,'var(--radius-md)')+';';
      });
      return heading+'{'+normalized+'}';
    });
  }
  let after=file.endsWith('.astro')?before.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g,(_,open,css,close)=>open+normalize(css)+close):normalize(before);
  if(key==='src/components/empleos/OfferCard.astro')after=after.replace(' --btn-radius: var(--radius-xs);','');
  if(key==='src/components/home/HomeHero.astro')after=after.replace('border-radius: var(--radius-md) var(--radius-md) 0 0;','border-radius: var(--radius-md);');
  if(before!==after){
    const oldLines=before.split(/\r?\n/),newLines=after.split(/\r?\n/);
    report.push({file:key,changes:oldLines.flatMap((line,index)=>line===newLines[index]?[]:[{line:index+1,before:line.trim(),after:newLines[index]?.trim()}])});
    fs.writeFileSync(file,after);
  }
}
fs.writeFileSync('artifacts/radius/changes.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({files:report.length,declarations:report.reduce((count,item)=>count+item.changes.length,0),paths:report.map(item=>item.file)},null,2));
