import { HiOutlineCheckCircle, HiOutlineMinusCircle, HiOutlineTrophy, HiOutlineXCircle } from 'react-icons/hi2';
import { getResultTemplate, RESULT_TEMPLATES } from '../constants/resultTemplates';

export function TemplateSelector({ value, onChange }) {
  return <div className="grid gap-4 xl:grid-cols-2">
    {RESULT_TEMPLATES.map(template => {
      const active = template.id === value;
      return <button
        key={template.id}
        type="button"
        onClick={() => onChange(template.id)}
        className={`overflow-hidden rounded-[1.6rem] border text-left transition hover:-translate-y-0.5 ${active ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-slate-200 hover:border-primary-300 dark:border-white/10'}`}
      >
        <div className="bg-[#f7f8fc] p-4 dark:bg-[#0d0c1b]">
          <div className="mx-auto origin-top scale-[0.72]">
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

export function ResultCertificate({ result }) {
  const template = getResultTemplate(result.exam?.resultTemplate);
  return <div className="flex justify-center">
    <CertificateCard template={template} result={result}/>
  </div>;
}

function previewResult(template) {
  const base = {
    student: { name: 'Student Name', college: 'Your College Name' },
    exam: { subject: 'Subject Name' },
    score: 86,
    percentage: 86,
    rank: rankLabel(template.code),
    correct: 18,
    wrong: 2,
    skipped: 0,
  };
  return base;
}

function CertificateCard({ template, result }) {
  const dark = template.theme === 'dark';
  const textMain = dark ? 'text-white' : 'text-slate-900';
  const textMuted = dark ? 'text-white/70' : 'text-slate-500';
  const panel = dark ? 'bg-[#091323]' : 'bg-white';
  const rankTone = dark ? 'text-amber-300' : 'text-slate-700';
  const qrTone = dark ? 'border-white/20 bg-white text-slate-900' : 'border-slate-300 bg-white text-slate-900';
  const iconFrame = dark ? 'border-white/30 bg-white/10' : 'border-slate-200 bg-white';
  const name = result.student?.name || 'Student Name';
  const college = result.student?.college || 'Registered Student';
  const subject = result.exam?.subject || result.exam?.title || 'Subject Name';
  const marks = `${result.score ?? 0} / ${result.exam?.totalMarks ?? 100}`;
  const rank = rankLabel(result.rank);

  return <article className={`relative w-full max-w-[340px] overflow-hidden rounded-[18px] border shadow-2xl ${panel} ${dark ? 'border-white/10' : 'border-slate-200'}`}>
    <div className={`h-4 ${template.edge}`}/>
    <div className={`px-5 pb-4 pt-4 ${textMain}`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className={`grid h-11 w-11 place-items-center rounded-full border-4 text-lg font-black ${iconFrame}`} style={{ color: template.accent, borderColor: template.accent }}>
            C
          </div>
          <div>
            <h2 className="text-[18px] font-black uppercase tracking-tight leading-5">Coding Clave</h2>
            <p className="text-[13px] font-bold uppercase leading-4">Development LLP</p>
            <p className={`text-[11px] ${textMuted}`}>Code. Create. Clave.</p>
          </div>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-black ${dark ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-700'}`}>{template.code}</span>
      </div>

      <div className="mt-4 flex justify-center">
        <div className={`relative px-6 py-2 text-[15px] font-black uppercase tracking-wide text-white ${template.ribbon}`} style={{ clipPath: 'polygon(0 0, 100% 0, 94% 100%, 6% 100%)' }}>
          Quiz Test Result
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <div className={`relative grid h-28 w-28 place-items-center rounded-full border-[7px] ${dark ? 'bg-[#0f1f37]' : 'bg-white'}`} style={{ borderColor: template.accent }}>
          <div className={`grid h-20 w-20 place-items-center rounded-full border-[7px] ${dark ? 'bg-white text-slate-900' : 'bg-[#0f2147] text-white'}`} style={{ borderColor: dark ? '#d9dee7' : '#e6ebf3' }}>
            <span className="text-4xl font-black">C</span>
          </div>
          {(template.code === '01' || template.code === '09') && <>
            <span className="absolute -left-8 top-5 text-4xl" style={{ color: template.medal }}>❦</span>
            <span className="absolute -right-8 top-5 text-4xl" style={{ color: template.medal }}>❦</span>
          </>}
        </div>
      </div>

      <div className={`mt-5 space-y-2.5 text-[12px] ${dark ? 'text-white' : 'text-slate-800'}`}>
        <InfoRow icon="◧" label="Subject Name" value={subject}/>
        <InfoRow icon="◨" label="Student Name" value={name}/>
        <InfoRow icon="✦" label="Marks Obtained" value={marks}/>
        <InfoRow icon="♛" label="Rank" value={rank}/>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="flex-1">
          <div className={`h-px ${dark ? 'bg-white/20' : 'bg-slate-300'}`}/>
          <p className={`mt-2 text-[10px] italic ${textMuted}`}>Authorized Signatory</p>
          <p className={`mt-1 text-[10px] ${textMuted}`}>{college}</p>
        </div>
        <div className={`grid h-16 w-16 grid-cols-5 gap-[2px] rounded border p-1 ${qrTone}`}>
          {Array.from({ length: 25 }).map((_, index) => <span key={index} className={`${qrDot(index) ? 'bg-slate-900' : 'bg-transparent'}`}/>)}
        </div>
      </div>
    </div>
    <div className={`flex items-center justify-between px-5 py-3 text-[11px] font-bold ${dark ? 'bg-white/5 text-white/80' : 'bg-slate-50 text-slate-700'}`}>
      <span>www.codingclave.com</span>
      <Badge template={template} rank={rank}/>
    </div>
  </article>;
}

function InfoRow({ icon, label, value }) {
  return <div className="grid grid-cols-[18px_88px_12px_1fr] items-center gap-2">
    <span className="grid h-4 w-4 place-items-center rounded-sm bg-current/10 text-[10px] font-black">{icon}</span>
    <span className="font-semibold">{label}</span>
    <span>:</span>
    <span className="truncate font-medium">{value}</span>
  </div>;
}

function Badge({ template, rank }) {
  const isGold = ['01', '05', '09'].includes(template.code);
  const bg = isGold ? 'bg-amber-400 text-amber-950' : 'bg-blue-600 text-white';
  const star = isGold ? '★' : '✪';
  return <div className={`grid h-12 w-12 place-items-center rounded-full text-[11px] font-black shadow ${bg}`}>
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

function qrDot(index) {
  const filled = new Set([0, 1, 2, 5, 7, 9, 10, 11, 14, 15, 17, 18, 20, 22, 23, 24]);
  return filled.has(index);
}
