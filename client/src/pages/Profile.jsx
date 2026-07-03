import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api, { messageFrom } from '../services/api';
import { loadMe } from '../redux/authSlice';
import PageHeader from '../components/PageHeader';

export default function Profile() {
  const user = useSelector(state => state.auth.user), dispatch = useDispatch();
  const [form, setForm] = useState({ name: user.name, gender: user.gender, college: user.college || '', course: user.course || '', year: user.year || '' });
  const save = async event => {
    event.preventDefault();
    try { await api.patch('/auth/profile', form); dispatch(loadMe()); toast.success('Profile updated'); }
    catch (error) { toast.error(messageFrom(error)); }
  };
  return <><PageHeader eyebrow="Account" title="Profile" text="Your identity and sign-in are secured by Google."/><div className="grid gap-6 xl:grid-cols-3"><div className="card h-fit text-center">{user.avatar ? <img src={user.avatar} alt="" className="mx-auto h-24 w-24 rounded-3xl object-cover"/> : <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-primary-500 to-cyan text-4xl font-extrabold text-white">{user.name[0]}</div>}<h2 className="mt-4 text-xl font-bold">{user.name}</h2><p className="text-sm text-slate-500">{user.email}</p><span className="chip mt-3 bg-primary-100 text-primary-700 capitalize">{user.role}</span><p className="mt-4 text-xs text-slate-400">Authenticated with Google</p></div><form onSubmit={save} className="card grid gap-4 md:grid-cols-2 xl:col-span-2"><h3 className="font-bold md:col-span-2">Personal details</h3>{Object.entries(form).map(([key, value]) => <label key={key}><span className="label capitalize">{key}</span>{key === 'gender' ? <select className="field" value={value} onChange={event => setForm({ ...form, [key]: event.target.value })}>{['male', 'female', 'other', 'prefer-not-to-say'].map(option => <option key={option}>{option}</option>)}</select> : <input className="field" value={value} onChange={event => setForm({ ...form, [key]: event.target.value })}/>}</label>)}<div className="md:col-span-2"><button className="btn-primary">Save changes</button></div></form></div></>;
}
