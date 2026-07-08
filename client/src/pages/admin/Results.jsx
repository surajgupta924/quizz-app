import { useCallback, useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { HiOutlineArrowDownTray, HiOutlineTrash } from 'react-icons/hi2';
import api, { messageFrom, notifyError } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

export default function AdminResults() {
  const [items, setItems] = useState([]);
  const [passed, setPassed] = useState('');

  const load = useCallback(() => {
    api.get(`/admin/results?limit=200${passed ? `&passed=${passed}` : ''}`)
      .then(response => setItems(response.data.items))
      .catch(notifyError);
  }, [passed]);

  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => items.map(result => ({
    Student: result.student?.name,
    Mobile: result.student?.mobile,
    Email: result.student?.email,
    Exam: result.exam?.title,
    Score: result.score,
    Correct: result.correct,
    Wrong: result.wrong,
    Skipped: result.skipped,
    Percentage: result.percentage,
    Rank: result.rank,
    'Time (sec)': result.timeTaken,
    Submitted: new Date(result.submittedAt).toLocaleString(),
  })), [items]);

  const csv = () => {
    const keys = Object.keys(rows[0] || {});
    const escape = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const body = [keys.map(escape).join(','), ...rows.map(row => keys.map(key => escape(row[key])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', body], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'examination-results.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const pdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text('Examination Results', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Student', 'Exam', 'Score', 'Correct', 'Wrong', 'Skipped', '%', 'Rank']],
      body: rows.map(row => [row.Student, row.Exam, row.Score, row.Correct, row.Wrong, row.Skipped, row.Percentage, row.Rank]),
    });
    doc.save('examination-results.pdf');
  };

  const remove = async item => {
    const result = await Swal.fire({
      title: 'Delete completed exam record?',
      text: `This will remove ${item.student?.name || 'the student'}'s submitted result for ${item.exam?.title || 'this exam'}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete record',
      confirmButtonColor: '#e11d48',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/admin/results/${item._id}`);
      await Swal.fire({ icon: 'success', title: 'Deleted', text: 'Completed exam record removed successfully.', confirmButtonColor: '#6554e8' });
      load();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Delete failed', text: messageFrom(error), confirmButtonColor: '#e11d48' });
    }
  };

  return <>
    <PageHeader eyebrow="Insights" title="Results panel" text="Review, filter, export, or delete completed exam records." action={<div className="flex gap-2"><button onClick={csv} className="btn-ghost"><HiOutlineArrowDownTray/>CSV / Excel</button><button onClick={pdf} className="btn-primary"><HiOutlineArrowDownTray/>PDF</button></div>}/>
    <div className="card">
      <select value={passed} onChange={event => setPassed(event.target.value)} className="field mb-5 max-w-xs">
        <option value="">All outcomes</option>
        <option value="true">Passed</option>
        <option value="false">Failed</option>
      </select>
      {items.length ? <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-400">
            <tr>
              <th className="pb-3">Student</th>
              <th>Exam</th>
              <th>Score</th>
              <th>Correct</th>
              <th>Wrong</th>
              <th>Skipped</th>
              <th>Percentage</th>
              <th>Rank</th>
              <th>Submitted</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => <tr key={item._id} className="border-t">
              <td className="py-4"><b>{item.student?.name}</b><p className="text-xs text-slate-400">{item.student?.mobile}</p></td>
              <td>{item.exam?.title}</td>
              <td>{item.score}/{item.exam?.totalMarks}</td>
              <td className="text-emerald-500">{item.correct}</td>
              <td className="text-rose-500">{item.wrong}</td>
              <td>{item.skipped}</td>
              <td><span className={`chip ${item.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{item.percentage}%</span></td>
              <td>#{item.rank}</td>
              <td>{new Date(item.submittedAt).toLocaleString()}</td>
              <td className="text-right">
                <button type="button" className="btn-ghost p-2 text-rose-500" onClick={() => remove(item)} title="Delete completed exam record">
                  <HiOutlineTrash/>
                </button>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div> : <EmptyState title="No results found"/>}
    </div>
  </>;
}
