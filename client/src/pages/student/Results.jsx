import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HiOutlineArrowDownTray, HiOutlineCheckCircle, HiOutlineMinusCircle, HiOutlineTrophy, HiOutlineXCircle } from 'react-icons/hi2';
import api, { messageFrom } from '../../services/api';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import PageHeader from '../../components/PageHeader';

export default function Results() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setData(null); setError('');
    api.get(id ? `/results/${id}` : '/results/mine')
      .then(response => { if (active) setData(id ? response.data.result : response.data.items); })
      .catch(requestError => { if (active) setError(messageFrom(requestError)); });
    return () => { active = false; };
  }, [id]);
  if (error) return <div className="card mx-auto max-w-xl text-center"><h2 className="text-xl font-extrabold">Result could not be opened</h2><p className="mt-2 text-sm text-slate-500">{error}</p><Link to="/student/results" className="btn-primary mt-6">Back to my results</Link></div>;
  if (!data) return <Loader/>;
  if (!id) return <ResultList items={Array.isArray(data) ? data : []}/>;

  const result = data;
  const download = () => {
    const doc = new jsPDF();
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 34, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(19); doc.text('CODINGCLAVE DEVELOPMENT LLP', 14, 15);
    doc.setFontSize(10); doc.text('Software Development Company · Official Examination Result', 14, 24);
    doc.setTextColor(30, 41, 59); doc.setFontSize(14); doc.text(`${result.exam.title} — ${result.exam.subject}`, 14, 45);
    autoTable(doc, { startY: 52, head: [['Result detail', 'Value']], body: [
      ['Student', result.student?.name || 'Student'], ['Score', `${result.score} / ${result.exam.totalMarks}`],
      ['Percentage', `${result.percentage}%`], ['Correct', result.correct], ['Wrong', result.wrong],
      ['Not attempted', result.skipped], ['Rank', result.rank || '-'], ['Result', result.passed ? 'PASS' : 'FAIL'],
      ['Submitted', new Date(result.submittedAt).toLocaleString()],
    ] });
    doc.save(`result-${result.exam.title.replace(/\s+/g, '-')}.pdf`);
  };

  return <>
    <PageHeader eyebrow="Result published" title={result.exam.title} text={`Submitted ${new Date(result.submittedAt).toLocaleString()}`} action={<button onClick={download} className="btn-primary"><HiOutlineArrowDownTray/>Download PDF</button>}/>
    <div className="mx-auto max-w-4xl"><ResultTemplate result={result}/></div>
  </>;
}

function ResultList({ items }) {
  return <><PageHeader eyebrow="Performance" title="My results" text="Official assessment records from CodingClave Development LLP."/><div className="card">{items.length ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr><th className="pb-3">Exam</th><th>Score</th><th>Percentage</th><th>Result</th><th>Date</th><th/></tr></thead><tbody>{items.map(result => <tr className="border-t" key={result._id}><td className="py-4 font-bold">{result.exam?.title || 'Archived exam'}<p className="text-xs font-normal text-slate-400">{result.exam?.subject || '—'}</p></td><td>{result.score}/{result.exam?.totalMarks ?? '—'}</td><td>{result.percentage}%</td><td><span className={`chip ${result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{result.passed ? 'Passed' : 'Failed'}</span></td><td>{new Date(result.submittedAt).toLocaleDateString()}</td><td><Link to={`/student/results/${result._id}`} className="inline-flex rounded-lg bg-primary-50 px-3 py-2 font-bold text-primary-700 hover:bg-primary-100">Open result</Link></td></tr>)}</tbody></table></div> : <EmptyState title="No results yet"/>}</div></>;
}

function ResultTemplate({ result }) {
  return <CompanyResult result={result}/>;
}

function CompanyResult({ result }) {
  return <article className="overflow-hidden rounded-[2rem] border border-primary-100 bg-white shadow-2xl shadow-primary-500/10 dark:border-white/10 dark:bg-[#15132b]">
    <header className="bg-gradient-to-r from-indigo-950 via-primary-700 to-cyan p-7 text-white sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[.28em] text-white/70">Official assessment record</p>
      <h2 className="mt-3 text-2xl font-black sm:text-3xl">CodingClave Development LLP</h2>
      <p className="mt-1 text-sm text-white/75">Software Development Company</p>
    </header>
    <div className="p-6 sm:p-10">
      <div className="flex flex-col justify-between gap-5 border-b pb-7 sm:flex-row sm:items-start">
        <div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Candidate</p><h3 className="mt-2 text-2xl font-extrabold">{result.student?.name || 'Student'}</h3><p className="mt-1 text-sm text-slate-500">{result.exam.title} · {result.exam.subject}</p></div>
        <span className={`chip self-start px-5 py-2.5 text-sm ${result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{result.passed ? 'PASSED' : 'NOT PASSED'}</span>
      </div>
      <div className="grid gap-5 py-8 sm:grid-cols-2"><div className="rounded-2xl bg-primary-50 p-5 dark:bg-primary-500/10"><p className="text-sm text-slate-500">Final score</p><p className="mt-1 text-5xl font-black text-primary-700 dark:text-primary-300">{result.score}<span className="text-xl text-slate-400"> / {result.exam.totalMarks}</span></p></div><div className="rounded-2xl bg-slate-50 p-5 dark:bg-white/5"><p className="text-sm text-slate-500">Percentage</p><p className="mt-1 text-5xl font-black">{result.percentage}%</p></div></div>
      <Metrics result={result}/>
      <footer className="mt-2 border-t pt-5 text-xs text-slate-400">Issued by CodingClave Development LLP · {new Date(result.submittedAt).toLocaleString()}</footer>
    </div>
  </article>;
}

function ClassicResult({ result }) {
  return <div className="card overflow-hidden p-0"><ResultHero result={result} className={result.passed ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-coral'}/><Metrics result={result}/></div>;
}

function CelebrationResult({ result }) {
  return <div className="overflow-hidden rounded-[2rem] border bg-gradient-to-br from-indigo-950 via-primary-700 to-violet-500 p-1 shadow-2xl shadow-primary-500/20"><div className="rounded-[1.8rem] bg-white/10 p-8 text-center text-white backdrop-blur sm:p-12"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-amber-300 text-indigo-950 shadow-xl"><HiOutlineTrophy className="text-5xl"/></div><p className="mt-6 text-sm font-bold uppercase tracking-[.3em]">{result.passed ? 'Outstanding achievement' : 'Your progress continues'}</p><p className="mt-4 text-7xl font-black">{result.percentage}%</p><h2 className="mt-3 text-2xl font-bold">{result.student?.name}</h2><p className="mt-1 text-white/70">{result.exam.title} · {result.score}/{result.exam.totalMarks} marks</p><div className="mt-8 grid gap-3 sm:grid-cols-4"><GlassMetric label="Correct" value={result.correct}/><GlassMetric label="Wrong" value={result.wrong}/><GlassMetric label="Skipped" value={result.skipped}/><GlassMetric label="Rank" value={`#${result.rank || '—'}`}/></div></div></div>;
}

function MinimalResult({ result }) {
  return <div className="rounded-2xl border bg-white p-7 shadow-sm dark:bg-[#15132b] sm:p-10"><div className="flex flex-col justify-between gap-6 border-b pb-7 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-slate-400">Official score report</p><h2 className="mt-2 text-2xl font-extrabold">{result.student?.name || 'Student'}</h2><p className="text-sm text-slate-500">{result.exam.title} · {result.exam.subject}</p></div><span className={`chip self-start px-4 py-2 ${result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{result.passed ? 'PASS' : 'FAIL'}</span></div><div className="grid gap-8 py-8 sm:grid-cols-2"><div><p className="text-sm text-slate-400">Final score</p><p className="mt-1 text-5xl font-black">{result.score}<span className="text-xl text-slate-400"> / {result.exam.totalMarks}</span></p></div><div><p className="text-sm text-slate-400">Percentage</p><p className="mt-1 text-5xl font-black">{result.percentage}%</p></div></div><div className="grid grid-cols-2 gap-3 border-t pt-6 sm:grid-cols-4"><PlainMetric label="Correct" value={result.correct}/><PlainMetric label="Wrong" value={result.wrong}/><PlainMetric label="Skipped" value={result.skipped}/><PlainMetric label="Rank" value={`#${result.rank || '—'}`}/></div></div>;
}

function ResultHero({ result, className }) {
  return <div className={`p-8 text-center text-white ${className}`}><HiOutlineTrophy className="mx-auto text-5xl"/><p className="mt-2 text-sm font-bold uppercase tracking-[.25em]">{result.passed ? 'Congratulations, you passed' : 'Keep learning, keep growing'}</p><p className="mt-3 text-6xl font-extrabold">{result.percentage}%</p><p>{result.score} out of {result.exam.totalMarks} marks</p></div>;
}

function Metrics({ result }) {
  return <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={HiOutlineCheckCircle} label="Correct" value={result.correct} color="text-emerald-500"/><Metric icon={HiOutlineXCircle} label="Wrong" value={result.wrong} color="text-rose-500"/><Metric icon={HiOutlineMinusCircle} label="Skipped" value={result.skipped} color="text-amber-500"/><Metric icon={HiOutlineTrophy} label="Rank" value={`#${result.rank || '—'}`} color="text-primary-500"/></div>;
}

function Metric({ icon: Icon, label, value, color }) { return <div className="rounded-2xl bg-slate-50 p-4 text-center dark:bg-white/5"><Icon className={`mx-auto text-3xl ${color}`}/><p className="mt-2 text-2xl font-extrabold">{value}</p><p className="text-xs text-slate-400">{label}</p></div>; }
function GlassMetric({ label, value }) { return <div className="rounded-2xl bg-white/10 p-4"><p className="text-2xl font-black">{value}</p><p className="text-xs uppercase tracking-wider text-white/60">{label}</p></div>; }
function PlainMetric({ label, value }) { return <div><p className="text-xl font-bold">{value}</p><p className="text-xs text-slate-400">{label}</p></div>; }
