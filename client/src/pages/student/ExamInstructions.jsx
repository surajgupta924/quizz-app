import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineClock, HiOutlineShieldCheck, HiOutlineExclamationTriangle, HiOutlineArrowsPointingOut } from 'react-icons/hi2';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import api, { messageFrom } from '../../services/api';
import Loader from '../../components/Loader';

export default function ExamInstructions() {
  const { code } = useParams(), navigate = useNavigate();
  const [exam, setExam] = useState(null), [agree, setAgree] = useState(false), [loading, setLoading] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => { api.get(`/exams/code/${code}`).then(response => setExam(response.data.exam)).catch(error => toast.error(messageFrom(error))); }, [code]);
  useEffect(() => {
    if (!('BroadcastChannel' in window)) return undefined;
    const channel = new BroadcastChannel('codingclave-exam-tabs');
    channel.onmessage = event => { if (event.data?.type === 'presence-check') channel.postMessage({ type: 'instruction-tab-open' }); };
    channelRef.current = channel;
    return () => { channel.close(); channelRef.current = null; };
  }, []);

  const anotherExamTabIsOpen = () => new Promise(resolve => {
    const channel = channelRef.current;
    if (!channel) { resolve(false); return; }
    let found = false;
    const previous = channel.onmessage;
    channel.onmessage = event => {
      if (event.data?.type === 'exam-active' || event.data?.type === 'instruction-tab-open') found = true;
      previous?.(event);
    };
    channel.postMessage({ type: 'presence-check' });
    setTimeout(() => { channel.onmessage = previous; resolve(found); }, 500);
  });

  const start = async () => {
    setLoading(true);
    if (await anotherExamTabIsOpen()) {
      await Swal.fire({ icon: 'warning', title: 'Multiple exam tabs are open', text: 'Close every other CodingClave exam tab, then return here and start the exam.', confirmButtonText: 'I will close them', confirmButtonColor: '#d97706', allowOutsideClick: false });
      setLoading(false); return;
    }
    try {
      await document.documentElement.requestFullscreen?.();
      const { data } = await api.post(`/exams/attempts/start/${code}`);
      sessionStorage.setItem(`attempt:${data.attempt.id}`, JSON.stringify(data));
      navigate(`/exam-room/${data.attempt.id}`, { state: data, replace: true });
    } catch (error) { toast.error(messageFrom(error)); setLoading(false); }
  };

  if (!exam) return <Loader full/>;
  return <main className="min-h-screen bg-mesh px-4 py-10"><div className="mx-auto max-w-3xl"><div className="card p-7 sm:p-10"><span className="chip bg-primary-100 text-primary-700">Before you begin</span><h1 className="mt-4 text-3xl font-extrabold">{exam.title}</h1><p className="mt-2 text-slate-500">{exam.description}</p><div className="my-7 grid gap-3 sm:grid-cols-3"><Info icon={HiOutlineClock} title={`${exam.duration} minutes`} text="Fixed duration"/><Info icon={HiOutlineShieldCheck} title={`${exam.totalMarks} marks`} text={`Pass at ${exam.passingMarks}`}/><Info icon={HiOutlineArrowsPointingOut} title="Fullscreen" text="Required mode"/></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100"><div className="flex gap-3"><HiOutlineExclamationTriangle className="mt-1 shrink-0 text-xl"/><div><b>Exam integrity rules</b><ul className="mt-2 list-disc space-y-1 pl-4 text-sm"><li>Close all other CodingClave exam tabs before starting.</li><li>Do not change tabs, minimize, exit fullscreen, copy, paste, print, or open developer tools.</li><li>The first two violations show danger alerts. A third violation automatically submits the exam.</li><li>Your answers are saved locally during temporary connection loss.</li><li>Do not refresh or close the browser while the exam is active.</li></ul></div></div></div><label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border p-4"><input type="checkbox" checked={agree} onChange={event => setAgree(event.target.checked)} className="mt-1 h-5 w-5 accent-primary-600"/><span className="text-sm font-semibold">I have closed other exam tabs and agree to follow all examination rules.</span></label><button disabled={!agree || loading} onClick={start} className="btn-primary mt-5 w-full">{loading ? 'Checking secure room…' : 'Enter exam in fullscreen'}</button></div></div></main>;
}

function Info({ icon: Icon, title, text }) { return <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5"><Icon className="mb-2 text-2xl text-primary-600"/><b>{title}</b><p className="text-xs text-slate-400">{text}</p></div>; }
