import fs from 'node:fs';
const target = 'artifacts/generated-services/sistemas-ti/v1';
const installer = fs.readFileSync('artifacts/generated-services/diseno-grafico/v2/install.mjs', 'utf8')
  .replaceAll('generated-services/diseno-grafico/v2', 'generated-services/sistemas-ti/v1')
  .replaceAll('services/diseno-grafico', 'services/sistemas-ti').replaceAll('-v2', '-v1');
fs.writeFileSync(target + '/install.mjs', installer, { flag: 'wx' });
const verification = fs.readFileSync('artifacts/generated-services/diseno-grafico/v2/verify.mjs', 'utf8')
  .replaceAll('generated-services/diseno-grafico/v2', 'generated-services/sistemas-ti/v1')
  .replaceAll('diseno-grafico', 'sistemas-ti')
  .replaceAll("fill('packaging')", "fill('redes')")
  .replaceAll('selected[2].previewImage', 'selected[1].previewImage')
  .replaceAll("publication.id === 'serv-1'", "publication.id === 'serv-5'")
  .replaceAll('current.categories[0].image', "current.categories.find(category => category.slug === 'sistemas-ti').image");
fs.writeFileSync(target + '/verify.mjs', verification, { flag: 'wx' });
console.log('Prepared installer and focused browser verification for four IT services.');
