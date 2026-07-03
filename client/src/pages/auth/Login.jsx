import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineArrowRight, HiOutlineEnvelope, HiOutlineShieldCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api, { messageFrom } from '../../services/api';
import { setSession } from '../../redux/authSlice';

export default function Login() {
  const [role, setRole] = useState('student');
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch(), navigate = useNavigate(), location = useLocation();
  const request = async event => { event.preventDefault(); setLoading(true); try { const { data } = await api.post('/auth/login/request-otp', { role, email }); setStep(2); toast.success(data.devOtp ? `Development OTP: ${data.devOtp}` : data.message, { duration: 7000 }); } catch (error) { toast.error(messageFrom(error)); } finally { setLoading(false); } };
  const verify = async event => { event.preventDefault(); setLoading(true); try { const { data } = await api.post('/auth/login/verify-otp', { role, email, otp }); dispatch(setSession(data)); toast.success('Welcome back!'); navigate(location.state?.from?.pathname || `/${role}`, { replace: true }); } catch (error) { toast.error(messageFrom(error)); } finally { setLoading(false); } };
  return <div><p className="text-xs font-bold uppercase tracking-[.2em] text-primary-600">Welcome back</p><h2 className="mt-2 text-3xl font-extrabold">Sign in to continue</h2><p className="mt-2 text-sm text-slate-500">Passwordless and protected by an email one-time code.</p><div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-white/5">{['student', 'admin'].map(item => <button key={item} type="button" onClick={() => { setRole(item); setStep(1); setEmail(''); setOtp(''); }} className={`rounded-lg py-2.5 text-sm font-bold capitalize transition ${role === item ? 'bg-white text-primary-700 shadow dark:bg-white/10 dark:text-white' : 'text-slate-400'}`}>{item}</button>)}</div><AnimatePresence mode="wait"><motion.form key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} onSubmit={step === 1 ? request : verify} className="mt-6 space-y-4">{step === 1 ? <div><label className="label">Email address</label><div className="relative"><HiOutlineEnvelope className="absolute left-4 top-3.5 text-xl text-slate-400"/><input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="field pl-12" placeholder={role === 'admin' ? 'admin@example.com' : 'student@example.com'}/></div></div> : <div><label className="label">6-digit verification code</label><div className="relative"><HiOutlineShieldCheck className="absolute left-4 top-3.5 text-xl text-slate-400"/><input autoFocus required inputMode="numeric" maxLength="6" value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, ''))} className="field pl-12 tracking-[.45em]" placeholder="000000"/></div><button type="button" onClick={() => setStep(1)} className="mt-2 text-xs font-semibold text-primary-600">Change email</button></div>}<button disabled={loading} className="btn-primary w-full">{loading ? 'Please wait…' : step === 1 ? 'Send email OTP' : 'Verify & sign in'}<HiOutlineArrowRight/></button></motion.form></AnimatePresence><p className="mt-6 text-center text-sm text-slate-500">New here? <Link className="font-bold text-primary-600" to={`/register?role=${role}`}>Create account</Link></p></div>;
}
