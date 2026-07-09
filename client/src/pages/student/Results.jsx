import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { HiOutlineArrowDownTray } from 'react-icons/hi2';
import api, { messageFrom } from '../../services/api';
import { ResultCertificate } from '../../components/resultTemplates';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import PageHeader from '../../components/PageHeader';

export default function Results() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const certificateRef = useRef(null);
  useEffect(() => {
    let active = true;
    setData(null); setError('');
    api.get(id ? `/results/${id}` : '/results/mine')
      .then(response => { if (active) setData(id ? { result: response.data.result, reviewItems: response.data.reviewItems || [] } : response.data.items); })
      .catch(requestError => { if (active) setError(messageFrom(requestError)); });
    return () => { active = false; };
  }, [id]);
  if (error) return <div className="card mx-auto max-w-xl text-center"><h2 className="text-xl font-extrabold">Result could not be opened</h2><p className="mt-2 text-sm text-slate-500">{error}</p><Link to="/student/results" className="btn-primary mt-6">Back to my results</Link></div>;
  if (!data) return <Loader/>;
  if (!id) return <ResultList items={Array.isArray(data) ? data : []}/>;

  const { result, reviewItems } = data;
  const download = async () => {
    if (!certificateRef.current) return;
    const canvas = await html2canvas(certificateRef.current, {
      scale: 4,
      backgroundColor: '#081428',
      useCORS: true,
      width: certificateRef.current.offsetWidth,
      height: certificateRef.current.offsetHeight,
    });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `result-${(result.student?.name || 'student').replace(/\s+/g, '-').toLowerCase()}-${(result.exam?.title || 'exam').replace(/\s+/g, '-').toLowerCase()}.png`;
    link.click();
  };

  return <>
    <PageHeader eyebrow="CodingClave Development LLP" title={`${result.exam.title} — Official Result`} text={`Institute assessment record · Submitted ${new Date(result.submittedAt).toLocaleString()}`} action={<button onClick={download} className="btn-primary"><HiOutlineArrowDownTray/>Download Result</button>}/>
    <div className="mx-auto max-w-5xl space-y-6">
      <ResultCertificate result={result} certificateRef={certificateRef}/>
      <ReviewSection items={reviewItems}/>
    </div>
  </>;
}

function ResultList({ items }) {
  return <><PageHeader eyebrow="Performance" title="My results" text="Official assessment records from CodingClave Development LLP."/><div className="card">{items.length ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr><th className="pb-3">Exam</th><th>Score</th><th>Percentage</th><th>Result</th><th>Date</th><th/></tr></thead><tbody>{items.map(result => <tr className="border-t" key={result._id}><td className="py-4 font-bold">{result.exam?.title || 'Archived exam'}<p className="text-xs font-normal text-slate-400">{result.exam?.subject || '—'}</p></td><td>{result.score}/{result.exam?.totalMarks ?? '—'}</td><td>{result.percentage}%</td><td><span className={`chip ${result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{result.passed ? 'Passed' : 'Failed'}</span></td><td>{new Date(result.submittedAt).toLocaleDateString()}</td><td><Link to={`/student/results/${result._id}`} className="inline-flex rounded-lg bg-primary-50 px-3 py-2 font-bold text-primary-700 hover:bg-primary-100">Open result</Link></td></tr>)}</tbody></table></div> : <EmptyState title="No results yet"/>}</div></>;
}

function ReviewSection({ items }) {
  return <section className="card">
    <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.25em] text-primary-600">Answer Review</p>
        <h2 className="mt-1 text-2xl font-extrabold">Wrong and skipped questions</h2>
      </div>
      <p className="text-sm text-slate-500">Review the correct answers for the questions you missed.</p>
    </div>
    {items?.length ? <div className="mt-6 space-y-4">
      {items.map((item, index) => <article key={item.questionId} className="rounded-3xl border border-slate-200 p-5 dark:border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-slate-400">Question {index + 1}</p>
            <h3 className="mt-2 text-lg font-bold leading-7">{item.text}</h3>
          </div>
          <span className={`chip ${item.isSkipped ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{item.isSkipped ? 'Skipped' : 'Wrong answer'}</span>
        </div>
        {item.image && <img src={item.image} alt="Question" className="mt-4 max-h-64 rounded-2xl object-contain"/>}
        <div className="mt-5 space-y-3">
          {item.options.map(option => {
            const isSelected = option.key === item.selected;
            const isCorrect = option.key === item.correctAnswer;
            return <div key={option.key} className={`rounded-2xl border p-4 ${isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : isSelected ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/5'}`}>
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white font-bold shadow-sm dark:bg-slate-950">{option.key}</span>
                <div className="flex-1">
                  <p className="font-medium">{option.text}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[.18em] text-slate-500">
                    {isCorrect ? 'Correct answer' : isSelected ? 'Your answer' : 'Option'}
                  </p>
                </div>
              </div>
            </div>;
          })}
        </div>
      </article>)}
    </div> : <EmptyState title="No incorrect questions" text="Great work. There are no wrong or skipped questions to review in this result."/>}
  </section>;
}
