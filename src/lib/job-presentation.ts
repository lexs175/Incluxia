import type { Account, Publication } from './demo';

export function amountValue(value: string) {
  const raw = value.match(/\d[\d.,]*/)?.[0] || '';
  return Number(raw.replace(/[.,](?=\d{3}(?:[.,]|$))/g, '').replace(',', '.'));
}

export function paymentInfo(value: string) {
  const amounts = value.match(/\d[\d.,]*/g);
  if (!amounts?.length) return { amount: value || 'A convenir', period: '' };
  const format = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 });
  const amount = amounts.slice(0, 2).map(item => format.format(amountValue(item))).join('–');
  const period = /proyecto/i.test(value) ? 'por proyecto' : /mes/i.test(value) ? 'al mes' : /hora/i.test(value) ? 'por hora' : '';
  return { amount: `Bs ${amount}`, period };
}

export function publisherInfo(job: Publication, accounts: Account[]) {
  const owner = accounts.find(account => account.id === job.ownerId);
  const name = job.company || owner?.name || 'Quien publica';
  const image = job.companyLogo || (job.kind === 'person' ? owner?.photo : '') || '';
  const safeImage = /^(?:\/(?!\/)|https?:\/\/|data:image\/(?:png|jpe?g|webp);base64,)/i.test(image) ? image : '';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toLocaleUpperCase('es');
  return { name, image: safeImage, initials };
}

export function locationLabel(job: Publication) {
  return job.city === job.modality ? job.city : `${job.city} · ${job.modality}`;
}
