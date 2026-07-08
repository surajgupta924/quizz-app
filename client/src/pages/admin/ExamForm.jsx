import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { messageFrom } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { TemplateSelector } from '../../components/resultTemplates';
import { normalizeResultTemplate } from '../../constants/resultTemplates';

const toLocalInput = value => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const initialSchedule = () => {
  const start = new Date(Date.now() + 60 * 60000);
  start.setMinutes(Math.ceil(start.getMinutes() / 5) * 5, 0, 0);
  return { startAt: toLocalInput(start) };
};

const createEmptyExam = () => ({
  title: '', description: '', subject: '', duration: 60,
  ...initialSchedule(),
  passingMarks: 40, totalMarks: 100, negativeMarking: false, status: 'scheduled', resultTemplate: 'template-01',
});

export default function ExamForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(createEmptyExam);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/exams/${id}`).then(({ data }) => {
      setForm({
        ...data.exam,
        startAt: toLocalInput(data.exam.startAt),
        resultTemplate: normalizeResultTemplate(data.exam.resultTemplate),
      });
    }).catch(error => toast.error(messageFrom(error)));
  }, [id]);

  const set = event => {
    const { name, type, checked, value } = event.target;
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async event => {
    event.preventDefault();
    const start = new Date(form.startAt);
    if (Number.isNaN(start.getTime())) return toast.error('Select a valid start time');
    if (Number(form.passingMarks) > Number(form.totalMarks)) return toast.error('Passing marks cannot exceed total marks');

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        subject: form.subject,
        duration: Number(form.duration),
        startAt: start.toISOString(),
        passingMarks: Number(form.passingMarks),
        totalMarks: Number(form.totalMarks),
        negativeMarking: form.negativeMarking,
        status: form.status,
        resultTemplate: form.resultTemplate,
      };
      if (id) {
        await api.patch(`/exams/${id}`, payload);
        toast.success('Exam updated');
        navigate(`/admin/exams/${id}/questions`);
      } else {
        const { data } = await api.post('/exams', payload);
        toast.success('Exam saved. Now add its questions and answers.');
        navigate(`/admin/exams/${data.exam._id}/questions`);
      }
    } catch (error) {
      const fieldError = error.response?.data?.errors?.[0]?.msg;
      toast.error(fieldError || messageFrom(error));
    } finally {
      setLoading(false);
    }
  };

  const calculatedEnd = form.startAt && Number(form.duration) > 0
    ? new Date(new Date(form.startAt).getTime() + Number(form.duration) * 60000)
    : null;

  return <>
    <PageHeader eyebrow="Exam builder" title={id ? 'Edit exam' : 'Schedule a new exam'} text="Set the rules and schedule. Questions can be added after saving."/>
    <form onSubmit={submit} className="card grid gap-5 md:grid-cols-2">
      <Field label="Exam title" name="title" value={form.title} onChange={set}/>
      <Field label="Subject" name="subject" value={form.subject} onChange={set}/>
      <label className="md:col-span-2"><span className="label">Description</span><textarea className="field min-h-28" name="description" value={form.description} onChange={set}/></label>
      <Field label="Duration (minutes)" type="number" min="1" max="1440" name="duration" value={form.duration} onChange={set}/>
      <label><span className="label">Status</span><select className="field" name="status" value={form.status} onChange={set}>{['draft', 'scheduled', 'published', 'closed'].map(value => <option key={value} value={value}>{value}</option>)}</select></label>
      <Field label="Start date & time" type="datetime-local" name="startAt" value={form.startAt} onChange={set}/>
      <label><span className="label">Automatic closing time</span><div className="field flex items-center bg-slate-50 text-slate-600 dark:bg-white/5">{calculatedEnd && !Number.isNaN(calculatedEnd.getTime()) ? calculatedEnd.toLocaleString() : 'Select start time and duration'}</div><p className="mt-1 text-xs text-slate-400">The student link disables automatically at this time.</p></label>
      <Field label="Passing marks" type="number" min="0" name="passingMarks" value={form.passingMarks} onChange={set}/>
      <Field label="Total marks" type="number" min="1" name="totalMarks" value={form.totalMarks} onChange={set}/>
      <div className="md:col-span-2">
        <span className="label">Student result template</span>
        <TemplateSelector value={normalizeResultTemplate(form.resultTemplate)} onChange={value => setForm(current => ({ ...current, resultTemplate: value }))}/>
        <p className="mt-2 text-xs text-slate-400">The student result page will use the selected certificate design.</p>
      </div>
      <label className="flex items-center gap-3 rounded-xl border p-4 md:col-span-2"><input type="checkbox" name="negativeMarking" checked={form.negativeMarking} onChange={set} className="h-5 w-5 accent-primary-600"/><span><b>Enable negative marking</b><p className="text-xs text-slate-500">Deduct configured marks for incorrect answers.</p></span></label>
      <div className="flex justify-end gap-3 md:col-span-2"><button type="button" className="btn-ghost" onClick={() => navigate(-1)}>Cancel</button><button disabled={loading} className="btn-primary">{loading ? 'Saving…' : id ? 'Save changes' : 'Schedule exam'}</button></div>
    </form>
  </>;
}

function Field({ label, ...props }) {
  return <label><span className="label">{label}</span><input required className="field" {...props}/></label>;
}
