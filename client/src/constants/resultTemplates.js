export const RESULT_TEMPLATES = [
  { id: 'template-01', code: '01', name: 'Laurel Classic', accent: 'from-blue-800 to-sky-500', surface: 'bg-white', ribbon: 'bg-blue-700', frame: 'border-amber-300', theme: 'light' },
  { id: 'template-02', code: '02', name: 'Neon Orbit', accent: 'from-slate-950 to-blue-700', surface: 'bg-slate-950 text-white', ribbon: 'bg-cyan-500', frame: 'border-cyan-300', theme: 'dark' },
  { id: 'template-03', code: '03', name: 'Royal Violet', accent: 'from-violet-800 to-fuchsia-500', surface: 'bg-white', ribbon: 'bg-violet-600', frame: 'border-violet-300', theme: 'light' },
  { id: 'template-04', code: '04', name: 'Teal Crest', accent: 'from-teal-800 to-cyan-500', surface: 'bg-white', ribbon: 'bg-teal-600', frame: 'border-teal-300', theme: 'light' },
  { id: 'template-05', code: '05', name: 'Golden Prestige', accent: 'from-slate-950 to-amber-500', surface: 'bg-slate-950 text-amber-100', ribbon: 'bg-amber-400 text-slate-950', frame: 'border-amber-400', theme: 'dark' },
  { id: 'template-06', code: '06', name: 'Orange Merit', accent: 'from-orange-800 to-amber-500', surface: 'bg-white', ribbon: 'bg-orange-500', frame: 'border-orange-300', theme: 'light' },
  { id: 'template-07', code: '07', name: 'Blue Ribbon', accent: 'from-blue-900 to-sky-500', surface: 'bg-white', ribbon: 'bg-blue-500', frame: 'border-blue-300', theme: 'light' },
  { id: 'template-08', code: '08', name: 'Green Scholar', accent: 'from-green-800 to-lime-500', surface: 'bg-white', ribbon: 'bg-green-600', frame: 'border-green-300', theme: 'light' },
  { id: 'template-09', code: '09', name: 'Maroon Honors', accent: 'from-rose-900 to-red-600', surface: 'bg-white', ribbon: 'bg-rose-700', frame: 'border-amber-300', theme: 'light' },
  { id: 'template-10', code: '10', name: 'Navy Shield', accent: 'from-blue-950 to-blue-600', surface: 'bg-white', ribbon: 'bg-blue-700', frame: 'border-blue-300', theme: 'light' },
];

const legacyMap = {
  classic: 'template-01',
  celebration: 'template-02',
  minimal: 'template-07',
};

export const normalizeResultTemplate = value => legacyMap[value] || value || 'template-01';

export const getResultTemplate = value =>
  RESULT_TEMPLATES.find(item => item.id === normalizeResultTemplate(value)) || RESULT_TEMPLATES[0];
