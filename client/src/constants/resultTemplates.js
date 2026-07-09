export const RESULT_TEMPLATES = [
  { id: 'template-05', code: '05', name: 'Gold Frame', theme: 'dark', header: 'bg-[#081428]', edge: 'bg-[#f2b434]', ribbon: 'bg-[#f4c63d]', accent: '#e2ad25', medal: '#f2b434' },
];

const legacyMap = {
  classic: 'template-05',
  celebration: 'template-05',
  minimal: 'template-05',
};

export const normalizeResultTemplate = value => legacyMap[value] || 'template-05';

export const getResultTemplate = value =>
  RESULT_TEMPLATES.find(item => item.id === normalizeResultTemplate(value)) || RESULT_TEMPLATES[0];
