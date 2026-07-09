import { BrandMark } from './Logo';
import { getResultTemplate, RESULT_TEMPLATES } from '../constants/resultTemplates';
import resultCenterLogo from '../assets/result-center-logo.png';

export function TemplateSelector({ value, onChange }) {
  return <div className="grid gap-4">
    {RESULT_TEMPLATES.map(template => {
      const active = template.id === value;
      return <button
        key={template.id}
        type="button"
        onClick={() => onChange(template.id)}
        className={`overflow-hidden rounded-[1.6rem] border text-left transition hover:-translate-y-0.5 ${active ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-slate-200 hover:border-primary-300 dark:border-white/10'}`}
      >
        <div className="bg-[#f7f8fc] p-4 dark:bg-[#0d0c1b]">
          <div className="mx-auto w-fit origin-top scale-[0.72]">
            <CertificateCard template={template} result={previewResult(template)}/>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">{template.code}</p>
            <p className="font-bold">{template.name}</p>
          </div>
          <span className={`chip ${active ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300'}`}>{active ? 'Selected' : 'Select'}</span>
        </div>
      </button>;
    })}
  </div>;
}

export function ResultCertificate({ result, certificateRef }) {
  const template = getResultTemplate(result.exam?.resultTemplate);
  return <div className="flex justify-center">
    <CertificateCard template={template} result={result} certificateRef={certificateRef}/>
  </div>;
}

function previewResult(template) {
  const base = {
    student: { name: 'Vivek Tiwari' },
    exam: { subject: 'Subject Name' },
    score: 74,
    totalMarks: 100,
    rank: 5,
  };
  return base;
}

function CertificateCard({ template, result, certificateRef }) {
  const dark = template.theme === 'dark';
  const textMain = dark ? 'text-white' : 'text-slate-900';
  const textMuted = dark ? 'text-white/80' : 'text-slate-500';
  const panel = dark ? 'bg-[#091323]' : 'bg-white';
  const name = result.student?.name || 'Student Name';
  const subject = result.exam?.subject || result.exam?.title || 'Subject Name';
  const marks = `${result.score ?? 0} / ${result.exam?.totalMarks ?? 100}`;
  const rank = rankLabel(result.rank);

  return <article ref={certificateRef} className={`relative w-[340px] overflow-hidden rounded-[18px] border shadow-2xl ${panel} ${dark ? 'border-[#d8a117]' : 'border-slate-200'}`}>
    <div className={`absolute inset-0 ${dark ? 'bg-[radial-gradient(circle_at_left,_rgba(242,180,52,0.15)_0,_rgba(242,180,52,0)_30%)]' : ''}`}/>
    <div className="absolute left-0 right-0 top-0 h-4 bg-[#f2b434]"/>
    <div className="absolute right-3 top-0 h-16 w-16 border-r-2 border-t-2 border-[#f2b434] opacity-80"/>
    <div className="absolute bottom-20 left-4 h-16 w-12 opacity-25">
      <div className="grid grid-cols-4 gap-[3px]">
        {Array.from({ length: 24 }).map((_, index) => <span key={index} className={`h-[3px] w-[3px] rounded-full ${index % 2 === 0 ? 'bg-[#f2b434]' : 'bg-transparent'}`}/>)}
      </div>
    </div>
    <div className="absolute right-0 top-24 bottom-28 w-20 opacity-80">
      <div className="absolute right-2 top-0 h-full w-px rotate-[27deg] bg-[#f2b434]"/>
      <div className="absolute right-7 top-2 h-full w-px rotate-[27deg] bg-[#f2b434]"/>
      <div className="absolute right-12 top-4 h-full w-px rotate-[27deg] bg-[#f2b434]"/>
    </div>
    <div className={`relative px-5 pb-4 pt-8 ${textMain}`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <BrandMark dark={dark}/>
          <div>
            <h2 className="text-[18px] font-black uppercase tracking-tight leading-5">Coding Clave</h2>
            <p className="text-[13px] font-bold uppercase leading-4">Development LLP</p>
            <p className={`text-[11px] ${textMuted}`}>Code. Create. Clave.</p>
          </div>
        </div>
        <span className={`rounded-md px-2.5 py-1 text-xs font-black ${dark ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-700'}`}>{template.code}</span>
      </div>

      <div className="mt-5 flex justify-center">
        <div className={`relative px-7 py-2 text-[15px] font-black uppercase tracking-wide text-white ${template.ribbon}`} style={{ clipPath: 'polygon(0 0, 100% 0, 94% 100%, 6% 100%)' }}>
          Quiz Test Result
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="relative grid h-32 w-32 place-items-center">
          <div className="absolute inset-0 rotate-45 border-[3px] border-[#f2b434]"/>
          <div className="absolute inset-[7px] rotate-45 border-2 border-[#f2b434]"/>
          <div className={`relative grid h-24 w-24 place-items-center overflow-hidden rounded-2xl ${dark ? 'bg-[#0b1424]' : 'bg-white'}`}>
            <img src={resultCenterLogo} alt="CodingClave result logo" className="h-20 w-20 object-contain"/>
          </div>
        </div>
      </div>

      <div className={`mt-7 space-y-3 text-[12px] ${dark ? 'text-white' : 'text-slate-800'}`}>
        <InfoRow icon="◧" label="Subject Name" value={subject}/>
        <InfoRow icon="◨" label="Student Name" value={name}/>
        <InfoRow icon="✦" label="Marks Obtained" value={marks}/>
        <InfoRow icon="♛" label="Rank" value={rank}/>
      </div>
    </div>
    <div className={`relative flex items-center justify-between px-5 py-3 text-[11px] font-bold ${dark ? 'bg-white/5 text-white/80' : 'bg-slate-50 text-slate-700'}`}>
      <span>www.codingclave.com</span>
      <Badge template={template} rank={rank}/>
    </div>
  </article>;
}

function InfoRow({ icon, label, value }) {
  return <div className="grid grid-cols-[18px_96px_10px_minmax(0,1fr)] items-start gap-2">
    <span className="grid h-4 w-4 place-items-center rounded-sm bg-current/10 text-[10px] font-black">{icon}</span>
    <span className="pt-0.5 font-semibold">{label}</span>
    <span className="pt-0.5">:</span>
    <span className="break-words pt-0.5 font-medium leading-5">{value}</span>
  </div>;
}

function Badge({ template, rank }) {
  const isGold = ['01', '05', '09'].includes(template.code);
  const bg = isGold ? 'bg-amber-400 text-amber-950' : 'bg-blue-600 text-white';
  const star = isGold ? '★' : '✪';
  return <div className={`grid h-14 w-14 place-items-center rounded-full border-[3px] border-[#d48c18] text-[11px] font-black shadow ${bg}`}>
    <span className="text-center leading-3">{star}<br/>{rank}</span>
  </div>;
}

function rankLabel(rank) {
  if (!rank) return 'N/A';
  const num = Number(rank);
  if (!Number.isFinite(num)) return String(rank);
  if (num % 100 >= 11 && num % 100 <= 13) return `${num}th`;
  if (num % 10 === 1) return `${num}st`;
  if (num % 10 === 2) return `${num}nd`;
  if (num % 10 === 3) return `${num}rd`;
  return `${num}th`;
}
