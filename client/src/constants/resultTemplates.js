export const RESULT_TEMPLATES = [
  { id: 'template-01', code: '01', name: 'Blue Laurel', theme: 'light', header: 'bg-[#0f4b7a]', edge: 'bg-[#1d74a4]', ribbon: 'bg-[#1f4d8b]', accent: '#d5a328', medal: '#d8a117' },
  { id: 'template-02', code: '02', name: 'Dark Neon', theme: 'dark', header: 'bg-[#07183d]', edge: 'bg-[#0a3376]', ribbon: 'bg-[#01b8ec]', accent: '#5fd8ff', medal: '#c8941b' },
  { id: 'template-03', code: '03', name: 'Purple Seal', theme: 'light', header: 'bg-[#4a227d]', edge: 'bg-[#7a34ae]', ribbon: 'bg-[#7a35b8]', accent: '#7a35b8', medal: '#7a35b8' },
  { id: 'template-04', code: '04', name: 'Teal Crown', theme: 'light', header: 'bg-[#0f6770]', edge: 'bg-[#1497a6]', ribbon: 'bg-[#1a8f92]', accent: '#1f8d88', medal: '#1f8d88' },
  { id: 'template-05', code: '05', name: 'Gold Frame', theme: 'dark', header: 'bg-[#081428]', edge: 'bg-[#f2b434]', ribbon: 'bg-[#f4c63d]', accent: '#e2ad25', medal: '#f2b434' },
  { id: 'template-06', code: '06', name: 'Orange Ribbon', theme: 'light', header: 'bg-[#0b3a73]', edge: 'bg-[#f08b24]', ribbon: 'bg-[#f08b24]', accent: '#e9821b', medal: '#e9821b' },
  { id: 'template-07', code: '07', name: 'Blue Wave', theme: 'light', header: 'bg-[#0b3f7f]', edge: 'bg-[#2f8fe1]', ribbon: 'bg-[#258be2]', accent: '#2f8fe1', medal: '#1f5fa5' },
  { id: 'template-08', code: '08', name: 'Green Ribbon', theme: 'light', header: 'bg-[#0d4b34]', edge: 'bg-[#3f9b34]', ribbon: 'bg-[#469d39]', accent: '#4aa03a', medal: '#4aa03a' },
  { id: 'template-09', code: '09', name: 'Maroon Laurel', theme: 'light', header: 'bg-[#6a1224]', edge: 'bg-[#8f1f31]', ribbon: 'bg-[#7d1427]', accent: '#c89a1e', medal: '#d59a1f' },
  { id: 'template-10', code: '10', name: 'Royal Blue', theme: 'light', header: 'bg-[#0a3f8f]', edge: 'bg-[#225ec7]', ribbon: 'bg-[#1b50b2]', accent: '#215ac0', medal: '#215ac0' },
];

const legacyMap = {
  classic: 'template-01',
  celebration: 'template-02',
  minimal: 'template-07',
};

export const normalizeResultTemplate = value => legacyMap[value] || value || 'template-01';

export const getResultTemplate = value =>
  RESULT_TEMPLATES.find(item => item.id === normalizeResultTemplate(value)) || RESULT_TEMPLATES[0];
