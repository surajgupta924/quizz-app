import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { HiOutlinePencilSquare, HiOutlinePlus, HiOutlineQuestionMarkCircle, HiOutlineRocketLaunch, HiOutlineTrash } from 'react-icons/hi2';
import api, { messageFrom } from '../../services/api';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import PageHeader from '../../components/PageHeader';

export default function Exams() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/exams?limit=100');
      setItems(Array.isArray(data?.items) ? data.items.filter(Boolean) : []);
    } catch (requestError) {
      const message = messageFrom(requestError);
      setError(message);
      setItems([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async id => {
    const result = await Swal.fire({
      title: 'Delete this exam?', text: 'Questions will also be removed.', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#e11d48', confirmButtonText: 'Delete',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/exams/${id}`);
      toast.success('Exam deleted');
      await load();
    } catch (requestError) {
      toast.error(messageFrom(requestError));
    }
  };

  const deploy = async id => {
    try {
      const { data } = await api.post(`/exams/${id}/deploy`);
      if (navigator.clipboard && data?.link) await navigator.clipboard.writeText(data.link);
      await Swal.fire('Exam deployed', data?.link || 'The student exam link is ready.', 'success');
      await load();
    } catch (requestError) {
      toast.error(messageFrom(requestError));
    }
  };

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter(exam => `${exam?.title || ''} ${exam?.subject || ''}`.toLowerCase().includes(query));
  }, [items, search]);

  return <>
    <PageHeader eyebrow="Assessment studio" title="Exams" text="Create, schedule, deploy, and monitor every assessment." action={<Link className="btn-primary" to="/admin/exams/new"><HiOutlinePlus/>Create exam</Link>}/>
    <div className="card">
      <input className="field mb-5 max-w-md" placeholder="Search exams…" value={search} onChange={event => setSearch(event.target.value)}/>
      {loading ? <Loader/> : error ? <div className="py-10 text-center"><h3 className="font-bold text-rose-500">Could not load exams</h3><p className="mt-2 text-sm text-slate-500">{error}</p><button type="button" className="btn-primary mt-4" onClick={load}>Try again</button></div> : visible.length ? <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-400"><tr><th className="pb-3">Exam</th><th>Status</th><th>Questions</th><th>Duration</th><th>Starts</th><th className="text-right">Actions</th></tr></thead>
          <tbody>{visible.map(exam => <tr key={exam._id} className="border-t">
            <td className="py-4"><b>{exam.title || 'Untitled exam'}</b><p className="text-xs text-slate-400">{exam.subject || 'No subject'}</p></td>
            <td><span className={`chip ${exam.status === 'published' ? 'bg-emerald-100 text-emerald-700' : exam.status === 'closed' ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>{exam.status || 'draft'}</span></td>
            <td>{exam.questionCount ?? 0}</td><td>{exam.duration ?? 0} min</td>
            <td>{formatDate(exam.startAt)}</td>
            <td><div className="flex justify-end gap-1">
              <Link title="Questions and answers" className="btn-ghost p-2" to={`/admin/exams/${exam._id}/questions`}><HiOutlineQuestionMarkCircle/></Link>
              <Link title="Edit exam" className="btn-ghost p-2" to={`/admin/exams/${exam._id}/edit`}><HiOutlinePencilSquare/></Link>
              {exam.status !== 'published' && <button type="button" title="Deploy exam" className="btn-ghost p-2 text-emerald-600" onClick={() => deploy(exam._id)}><HiOutlineRocketLaunch/></button>}
              <button type="button" title="Delete exam" className="btn-ghost p-2 text-rose-500" onClick={() => remove(exam._id)}><HiOutlineTrash/></button>
            </div></td>
          </tr>)}</tbody>
        </table>
      </div> : <EmptyState title="No exams found" text="Create your first assessment to get started."/>}
    </div>
  </>;
}

function formatDate(value) {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Invalid schedule' : date.toLocaleString();
}
