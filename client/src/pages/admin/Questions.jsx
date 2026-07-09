import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineClipboard, HiOutlinePencilSquare, HiOutlinePlus, HiOutlineRocketLaunch, HiOutlineTrash } from 'react-icons/hi2';
import api, { messageFrom } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

const createBlank = () => ({
  type: 'mcq', text: '',
  options: [{ key: 'A', text: '' }, { key: 'B', text: '' }, { key: 'C', text: '' }, { key: 'D', text: '' }],
  correctAnswer: 'A', marks: 1, negativeMarks: 0, difficulty: 'medium',
});

export default function Questions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [items, setItems] = useState([]);
  const [forms, setForms] = useState([createBlank()]);
  const [show, setShow] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [examLink, setExamLink] = useState('');

  const load = async () => {
    try {
      const [examResponse, questionResponse] = await Promise.all([
        api.get(`/exams/${id}`),
        api.get(`/exams/${id}/questions`),
      ]);
      setExam(examResponse.data.exam);
      setItems(questionResponse.data.items);
      if (examResponse.data.exam.status === 'published') {
        setExamLink(`${window.location.origin}/exam/${examResponse.data.exam.code}`);
      }
    } catch (error) {
      toast.error(messageFrom(error));
    }
  };

  useEffect(() => { load(); }, [id]);

  const submit = async event => {
    event.preventDefault();
    const payload = forms.map(item => ({
      ...item,
      text: item.text.trim(),
      options: item.options.map(option => ({ ...option, text: option.text.trim() })),
      marks: Number(item.marks),
      negativeMarks: Number(item.negativeMarks),
    }));

    if (payload.some(item => !item.text)) return toast.error('Enter each question before saving');
    if (payload.some(item => item.options.some(option => !option.text))) return toast.error('Fill all options for every question');

    setSaving(true);
    try {
      await api.post(`/exams/${id}/questions/bulk`, { questions: payload });
      toast.success(`${payload.length} question${payload.length === 1 ? '' : 's'} saved successfully`);
      setForms([createBlank()]);
      setShow(false);
      await load();
    } catch (error) {
      toast.error(messageFrom(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async questionId => {
    const result = await Swal.fire({ title: 'Delete question?', icon: 'warning', showCancelButton: true });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/exams/questions/${questionId}`);
      toast.success('Question deleted');
      await load();
    } catch (error) {
      toast.error(messageFrom(error));
    }
  };

  const deploy = async () => {
    if (!items.length) return toast.error('Add at least one question before deployment');
    setDeploying(true);
    try {
      const { data } = await api.post(`/exams/${id}/deploy`);
      setExam(data.exam);
      setExamLink(data.link);
      await navigator.clipboard?.writeText(data.link).catch(() => {});
      toast.success('Exam deployed and student link copied');
    } catch (error) {
      toast.error(messageFrom(error));
    } finally {
      setDeploying(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard?.writeText(examLink);
    toast.success('Student link copied');
  };

  const updateForm = (formIndex, key, value) => {
    setForms(current => current.map((form, index) => index === formIndex ? { ...form, [key]: value } : form));
  };

  const updateOption = (formIndex, optionIndex, text) => {
    setForms(current => current.map((form, index) => index === formIndex ? {
      ...form,
      options: form.options.map((option, idx) => idx === optionIndex ? { ...option, text } : option),
    } : form));
  };

  const addQuestionForm = () => {
    setForms(current => [...current, createBlank()]);
    setShow(true);
  };

  const removeQuestionForm = formIndex => {
    setForms(current => current.length === 1 ? [createBlank()] : current.filter((_, index) => index !== formIndex));
  };

  const marks = items.reduce((sum, question) => sum + Number(question.marks || 0), 0);

  return <>
    <PageHeader
      eyebrow="Exam builder"
      title={exam?.title || 'Questions and answers'}
      text="Add questions, choose each correct answer, save your work, then deploy a secure student link."
      action={<Link className="btn-ghost" to={`/admin/exams/${id}/edit`}><HiOutlinePencilSquare/>Edit exam settings</Link>}
    />

    {exam && <div className="card mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Summary label="Status" value={exam.status}/>
      <Summary label="Duration" value={`${exam.duration} minutes`}/>
      <Summary label="Questions" value={items.length}/>
      <Summary label="Question marks" value={marks}/>
    </div>}

    {examLink && <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
      <div className="flex items-start gap-3"><HiOutlineCheck className="mt-0.5 text-2xl text-emerald-600"/><div className="min-w-0 flex-1"><h3 className="font-bold text-emerald-800 dark:text-emerald-300">Exam deployed successfully</h3><p className="mt-1 text-sm text-slate-500">Share this link with students. It will open only during the scheduled exam window.</p><div className="mt-3 flex gap-2"><input readOnly value={examLink} className="field min-w-0 flex-1 bg-white"/><button type="button" onClick={copyLink} className="btn-primary shrink-0"><HiOutlineClipboard/>Copy link</button></div></div></div>
    </div>}

    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-bold">{items.length} question{items.length === 1 ? '' : 's'}</h2>
      <div className="flex gap-2">
        <button type="button" onClick={() => setShow(current => !current)} className="btn-ghost">{show ? 'Close form' : 'Open form'}</button>
        <button type="button" onClick={addQuestionForm} className="btn-primary"><HiOutlinePlus/>Add another question</button>
      </div>
    </div>

    {show && <form onSubmit={submit} className="card mb-6 grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <h3 className="text-lg font-bold">Add multiple questions at once</h3>
        <p className="mt-1 text-sm text-slate-500">Create as many questions as you want here, then save them all together in one click.</p>
      </div>
      {forms.map((form, formIndex) => <div key={formIndex} className="md:col-span-2 rounded-2xl border p-4 dark:border-white/10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h4 className="font-bold">Question {formIndex + 1}</h4>
          <button type="button" className="btn-ghost p-2 text-rose-500" onClick={() => removeQuestionForm(formIndex)} title="Remove this draft question">
            <HiOutlineTrash/>
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2"><span className="label">Question</span><textarea required className="field min-h-24" value={form.text} onChange={event => updateForm(formIndex, 'text', event.target.value)} placeholder="Enter the question"/></label>
          {form.options.map((option, optionIndex) => <label key={option.key}><span className="label">Option {option.key}</span><input required className="field" value={option.text} onChange={event => updateOption(formIndex, optionIndex, event.target.value)} placeholder={`Answer option ${option.key}`}/></label>)}
          <label><span className="label">Correct answer</span><select className="field" value={form.correctAnswer} onChange={event => updateForm(formIndex, 'correctAnswer', event.target.value)}>{form.options.map(option => <option key={option.key} value={option.key}>{option.key}. {option.text || `Option ${option.key}`}</option>)}</select></label>
          <label><span className="label">Difficulty</span><select className="field" value={form.difficulty} onChange={event => updateForm(formIndex, 'difficulty', event.target.value)}>{['easy', 'medium', 'hard'].map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <label><span className="label">Marks</span><input required type="number" min="0.25" step="0.25" className="field" value={form.marks} onChange={event => updateForm(formIndex, 'marks', event.target.value)}/></label>
          <label><span className="label">Negative marks</span><input required type="number" min="0" step="0.25" className="field" value={form.negativeMarks} onChange={event => updateForm(formIndex, 'negativeMarks', event.target.value)}/></label>
        </div>
      </div>)}
      <div className="flex gap-3 md:col-span-2">
        <button type="button" onClick={addQuestionForm} className="btn-ghost"><HiOutlinePlus/>Add one more</button>
        <button disabled={saving} className="btn-primary">{saving ? 'Saving…' : `Save ${forms.length} question${forms.length === 1 ? '' : 's'}`}</button>
      </div>
    </form>}

    <div className="space-y-3">{items.length ? items.map((question, index) => <div key={question._id} className="card flex gap-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-100 font-bold text-primary-700">{index + 1}</span>
      <div className="flex-1"><p className="font-semibold">{question.text}</p><div className="mt-2 flex flex-wrap gap-2">{question.options.map(option => <span key={option.key} className={`chip ${option.key === question.correctAnswer ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 dark:bg-white/5'}`}>{option.key}. {option.text}</span>)}</div><p className="mt-3 text-xs text-slate-400">{question.marks} mark · {question.difficulty}{question.negativeMarks ? ` · -${question.negativeMarks} negative` : ''}</p></div>
      <button type="button" aria-label="Delete question" className="btn-ghost self-start p-2 text-rose-500" onClick={() => remove(question._id)}><HiOutlineTrash/></button>
    </div>) : <div className="card"><EmptyState title="No questions yet" text="Add the first question and select its correct answer above."/></div>}</div>

    <div className="sticky bottom-0 z-10 mt-6 flex flex-wrap justify-end gap-3 border-t bg-[#f7f7fc]/95 py-4 backdrop-blur dark:bg-[#0d0c1b]/95">
      <button type="button" className="btn-ghost" onClick={() => navigate('/admin/exams')}>Save draft</button>
      <button type="button" disabled={deploying || !items.length} className="btn-primary" onClick={deploy}><HiOutlineRocketLaunch/>{deploying ? 'Deploying…' : examLink ? 'Redeploy exam' : 'Deploy exam'}</button>
    </div>
  </>;
}

function Summary({ label, value }) {
  return <div><p className="text-xs uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 font-bold capitalize">{value}</p></div>;
}
