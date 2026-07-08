import { HiOutlineCheckCircle, HiOutlineMinusCircle, HiOutlineTrophy, HiOutlineXCircle } from 'react-icons/hi2';
import { getResultTemplate, RESULT_TEMPLATES } from '../constants/resultTemplates';

export function TemplateSelector({ value, onChange }) {
  return <div className="grid gap-4 lg:grid-cols-2">
    {RESULT_TEMPLATES.map(template => {
      const active = template.id === value;
      return <button
        key={template.id}
        type="button"
        onClick={() => onChange(template.id)}
        className={`overflow-hidden rounded-[1.6rem] border text-left transition hover:-translate-y-0.5 ${active ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-slate-200 hover:border-primary-300 dark:border-white/10'}`}
      >
        <TemplatePreview template={template}/>
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
  const layout = Number(template.code);

  if ([2, 5].includes(layout)) return <DarkTemplate result={result} template={template}/>;
  if ([1, 9].includes(layout)) return <LaurelTemplate result={result} template={template}/>;
  if ([7, 10].includes(layout)) return <ShieldTemplate result={result} template={template}/>;
  if ([3, 4, 6, 8].includes(layout)) return <RibbonTemplate result={result} template={template}/>;
  return <SimpleTemplate result={result} template={template}/>;
}

function TemplatePreview({ template }) {
  const dark = template.theme === 'dark';
  return <div className={`p-4 ${dark ? 'bg-slate-950 text-white' : 'bg-white text-slate-800'}`}>
    <div className={`rounded-[1.2rem] border ${dark ? 'border-white/10 bg-white/5' : 'border-slate-200'} p-3`}>
      <div className={`rounded-lg bg-gradient-to-r ${template.accent} px-3 py-2 text-white`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.25em]">CODING CLAVE</span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-black ${dark ? 'bg-white/15' : 'bg-white/20'}`}>{template.code}</span>
        </div>
        <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${template.ribbon}`}>QUIZ TEST RESULT</div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className={`grid h-14 w-14 place-items-center rounded-full border-4 ${template.frame}`}>
          <span className="text-xl font-black">C</span>
        </div>
        <div className="flex-1 space-y-2">
          <div className={`h-2 rounded ${dark ? 'bg-white/20' : 'bg-slate-200'}`}/>
          <div className={`h-2 w-4/5 rounded ${dark ? 'bg-white/15' : 'bg-slate-100'}`}/>
          <div className={`h-2 w-3/5 rounded ${dark ? 'bg-white/10' : 'bg-slate-100'}`}/>
        </div>
      </div>
    </div>
  </div>;
}

function CertificateShell({ result, template, dark = false, children }) {
  return <article className={`overflow-hidden rounded-[2rem] border shadow-2xl ${dark ? 'border-white/10 bg-slate-950 text-white shadow-slate-900/30' : 'border-slate-200 bg-white shadow-primary-500/10 dark:border-white/10 dark:bg-[#15132b]'}`}>
    <header className={`bg-gradient-to-r ${template.accent} px-6 py-7 text-white sm:px-8`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/75">CodingClave Development LLP</p>
          <h2 className="mt-2 text-2xl font-black">Quiz Test Result</h2>
          <p className="mt-1 text-sm text-white/75">{result.exam?.title} · {result.exam?.subject}</p>
        </div>
        <div className="rounded-2xl bg-white/15 px-4 py-3 text-right">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">Template</p>
          <p className="text-xl font-black">{template.code}</p>
        </div>
      </div>
    </header>
    {children}
  </article>;
}

function LaurelTemplate({ result, template }) {
  return <CertificateShell result={result} template={template}>
    <div className="p-6 sm:p-8">
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Student</p>
          <h3 className="mt-2 text-3xl font-black">{result.student?.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{result.student?.college || 'CodingClave Candidate'}</p>
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
            <p className="text-sm font-semibold text-amber-700">Certificate summary</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <InfoLine label="Score" value={`${result.score} / ${result.exam?.totalMarks}`}/>
              <InfoLine label="Percentage" value={`${result.percentage}%`}/>
              <InfoLine label="Correct" value={result.correct}/>
              <InfoLine label="Wrong" value={result.wrong}/>
            </div>
          </div>
        </div>
        <div className="rounded-[1.8rem] border border-primary-100 bg-slate-50 p-6 text-center dark:bg-white/5">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-[10px] border-amber-300 bg-white text-4xl font-black text-primary-700 shadow-lg">C</div>
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Rank</p>
          <p className="mt-1 text-5xl font-black text-primary-700 dark:text-primary-300">#{result.rank || '—'}</p>
          <ResultChip passed={result.passed}/>
        </div>
      </div>
      <FooterStamp result={result}/>
    </div>
  </CertificateShell>;
}

function DarkTemplate({ result, template }) {
  return <CertificateShell result={result} template={template} dark>
    <div className="p-6 sm:p-8">
      <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/60">{result.passed ? 'Achievement unlocked' : 'Performance report'}</p>
        <p className="mt-4 text-6xl font-black">{result.percentage}%</p>
        <p className="mt-2 text-white/70">{result.student?.name} · {result.score}/{result.exam?.totalMarks} marks</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          <DarkMetric label="Correct" value={result.correct}/>
          <DarkMetric label="Wrong" value={result.wrong}/>
          <DarkMetric label="Skipped" value={result.skipped}/>
          <DarkMetric label="Rank" value={`#${result.rank || '—'}`}/>
        </div>
      </div>
      <p className="mt-5 text-center text-xs text-white/45">Submitted {new Date(result.submittedAt).toLocaleString()}</p>
    </div>
  </CertificateShell>;
}

function RibbonTemplate({ result, template }) {
  return <CertificateShell result={result} template={template}>
    <div className="p-6 sm:p-8">
      <div className="flex flex-col items-start justify-between gap-5 border-b pb-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Official record</p>
          <h3 className="mt-2 text-3xl font-black">{result.student?.name}</h3>
        </div>
        <span className={`rounded-full px-5 py-2 text-sm font-bold ${result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{result.passed ? 'PASSED' : 'FAILED'}</span>
      </div>
      <div className="grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={HiOutlineCheckCircle} label="Correct" value={result.correct} color="text-emerald-500"/>
        <Metric icon={HiOutlineXCircle} label="Wrong" value={result.wrong} color="text-rose-500"/>
        <Metric icon={HiOutlineMinusCircle} label="Skipped" value={result.skipped} color="text-amber-500"/>
        <Metric icon={HiOutlineTrophy} label="Rank" value={`#${result.rank || '—'}`} color="text-primary-500"/>
      </div>
      <div className="rounded-[1.6rem] bg-slate-50 p-5 dark:bg-white/5">
        <div className="grid gap-4 sm:grid-cols-3">
          <InfoLine label="Score" value={`${result.score} / ${result.exam?.totalMarks}`}/>
          <InfoLine label="Percentage" value={`${result.percentage}%`}/>
          <InfoLine label="Submitted" value={new Date(result.submittedAt).toLocaleDateString()}/>
        </div>
      </div>
    </div>
  </CertificateShell>;
}

function ShieldTemplate({ result, template }) {
  return <CertificateShell result={result} template={template}>
    <div className="p-6 sm:p-8">
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="rounded-[1.8rem] border border-primary-100 bg-primary-50/70 p-6 text-center dark:bg-primary-500/10">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] border-4 border-primary-500 bg-white text-4xl font-black text-primary-700 shadow-lg dark:bg-slate-950">C</div>
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Score</p>
          <p className="mt-1 text-4xl font-black text-primary-700 dark:text-primary-300">{result.score}</p>
          <p className="text-sm text-slate-500">out of {result.exam?.totalMarks}</p>
        </div>
        <div>
          <h3 className="text-3xl font-black">{result.student?.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{result.exam?.subject}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoLine label="Percentage" value={`${result.percentage}%`}/>
            <InfoLine label="Rank" value={`#${result.rank || '—'}`}/>
            <InfoLine label="Correct answers" value={result.correct}/>
            <InfoLine label="Wrong answers" value={result.wrong}/>
          </div>
          <FooterStamp result={result}/>
        </div>
      </div>
    </div>
  </CertificateShell>;
}

function SimpleTemplate({ result, template }) {
  return <CertificateShell result={result} template={template}>
    <div className="p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <InfoLine label="Student" value={result.student?.name}/>
        <InfoLine label="Score" value={`${result.score}/${result.exam?.totalMarks}`}/>
        <InfoLine label="Percentage" value={`${result.percentage}%`}/>
      </div>
      <FooterStamp result={result}/>
    </div>
  </CertificateShell>;
}

function InfoLine({ label, value }) {
  return <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-1 text-lg font-bold">{value || '—'}</p>
  </div>;
}

function ResultChip({ passed }) {
  return <span className={`mt-5 inline-flex rounded-full px-4 py-2 text-sm font-bold ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{passed ? 'PASSED' : 'FAILED'}</span>;
}

function DarkMetric({ label, value }) {
  return <div className="rounded-2xl bg-white/10 p-4">
    <p className="text-2xl font-black">{value}</p>
    <p className="text-xs uppercase tracking-[0.2em] text-white/60">{label}</p>
  </div>;
}

function Metric({ icon: Icon, label, value, color }) {
  return <div className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-white/5">
    <Icon className={`mx-auto text-3xl ${color}`}/>
    <p className="mt-2 text-2xl font-extrabold">{value}</p>
    <p className="text-xs text-slate-400">{label}</p>
  </div>;
}

function FooterStamp({ result }) {
  return <footer className="mt-6 border-t pt-5 text-xs text-slate-400">
    Issued by CodingClave Development LLP · {new Date(result.submittedAt).toLocaleString()}
  </footer>;
}
