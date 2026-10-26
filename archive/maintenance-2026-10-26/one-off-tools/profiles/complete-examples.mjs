import fs from 'node:fs';
const profilePath='src/data/profiles.json',hiringPath='src/data/hiring.json';
const profiles=JSON.parse(fs.readFileSync(profilePath,'utf8')),hiring=JSON.parse(fs.readFileSync(hiringPath,'utf8'));
fs.writeFileSync('artifacts/profiles/examples-before.json',JSON.stringify({profiles,hiring},null,2));

// Both placeholders pointed at photos already assigned to named people.
// Keep the established Diego identity and its portrait across the examples.
const renamed=new Set(['Marcelo Paz Céspedes','Diego Siles Gutiérrez']);
for(const person of hiring.autonomos){
  if(renamed.has(person.name)){person.name='Diego Siles Montaño';person.avatar='/images/profiles/diego-siles.jpg';}
}
for(const service of hiring.services){
  if(renamed.has(service.author.name)){service.author.name='Diego Siles Montaño';service.author.avatar='/images/profiles/diego-siles.jpg';}
}
const training={
 'diseno-grafico':'Diseño gráfico y producción de piezas digitales',
 'sistemas-ti':'Soporte técnico y mantenimiento de sistemas',
 'contabilidad-finanzas':'Registro contable y manejo de hojas de cálculo',
 'digitacion-datos':'Digitación y organización de archivos digitales',
 'redes-sociales':'Creación y gestión de contenidos digitales',
 'desarrollo-web':'Desarrollo de sitios web y diseño adaptable',
 'ilustracion-arte':'Ilustración y producción de gráficos vectoriales',
 'edicion-video':'Edición de video y subtitulado',
};
for(const name of new Set(hiring.autonomos.map(person=>person.name))){
 const entries=hiring.autonomos.filter(person=>person.name===name),person=entries[0];
 let profile=profiles.find(profile=>profile.name===name);
 if(!profile){
  profile={id:String(profiles.length+1),slug:person.slug,name,role:person.role,city:person.city,photo:person.avatar,tagline:person.bio.split('. ')[0]+'.',availability:'Disponible',about:person.bio,
   skills:[...new Set(entries.flatMap(entry=>entry.skills))],languages:['Español escrito','Coordinación por chat y correo'],
   experience:[{company:'Proyectos independientes',role:person.role,period:person.experienceYears+' de experiencia',highlights:entries.flatMap(entry=>entry.portfolio.map(project=>project.title)).slice(0,5)}],
   education:[{institution:'Formación técnica',degree:training[person.categorySlug],year:'Actualización profesional'}],
   contact:{whatsapp:person.whatsapp,email:person.slug.split('-').slice(0,2).join('.')+'@ejemplo.test'}};
  profiles.push(profile);
 }
 profile.demo=true;
 profile.projects=[...new Map(entries.flatMap(entry=>entry.portfolio).map(project=>[project.title,{title:project.title,category:project.category}])).values()];
 // Existing full profiles are the authority for names and portraits.
 for(const entry of entries)entry.avatar=profile.photo;
 for(const service of hiring.services.filter(service=>service.author.name===name))service.author.avatar=profile.photo;
}
fs.writeFileSync(profilePath,JSON.stringify(profiles,null,2)+'\n');
fs.writeFileSync(hiringPath,JSON.stringify(hiring,null,2)+'\n');
console.log(JSON.stringify({profiles:profiles.length,withPhoto:profiles.filter(p=>p.photo).length,withExperience:profiles.filter(p=>p.experience.length).length,withEducation:profiles.filter(p=>p.education.length).length,withProjects:profiles.filter(p=>p.projects?.length).length},null,2));
