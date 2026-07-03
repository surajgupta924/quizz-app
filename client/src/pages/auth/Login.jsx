import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HiOutlineShieldCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api, { messageFrom } from '../../services/api';
import { setSession } from '../../redux/authSlice';

export default function Login() {
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef(null);
  const dispatch = useDispatch(), navigate = useNavigate(), location = useLocation();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '853043782431-aqt6s08th1uob7tcf41kha5f77m03r7b.apps.googleusercontent.com';

  const handleCredential = useCallback(async response => {
    if (!response.credential) return toast.error('Google did not return a sign-in credential');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', { credential: response.credential, role });
      dispatch(setSession(data));
      toast.success('Signed in with Google');
      navigate(location.state?.from?.pathname || `/${data.user.role}`, { replace: true });
    } catch (error) {
      toast.error(messageFrom(error));
    } finally {
      setLoading(false);
    }
  }, [dispatch, location.state, navigate, role]);

  useEffect(() => {
    if (!clientId || !buttonRef.current) return undefined;
    const renderButton = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;
      buttonRef.current.replaceChildren();
      window.google.accounts.id.initialize({ client_id: clientId, callback: handleCredential });
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard', theme: 'outline', size: 'large', shape: 'pill',
        text: 'continue_with', logo_alignment: 'left', width: 320,
      });
    };
    const script = document.getElementById('google-identity-services');
    if (window.google?.accounts?.id) renderButton();
    else script?.addEventListener('load', renderButton);
    return () => script?.removeEventListener('load', renderButton);
  }, [clientId, handleCredential]);

  return <div>
    <p className="text-xs font-bold uppercase tracking-[.2em] text-primary-600">Welcome</p>
    <h2 className="mt-2 text-3xl font-extrabold">Continue with Google</h2>
    <p className="mt-2 text-sm text-slate-500">One secure Google account for registration and sign-in.</p>
    <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
      {['student', 'admin'].map(item => <button key={item} type="button" disabled={loading} onClick={() => setRole(item)} className={`rounded-lg py-2.5 text-sm font-bold capitalize transition ${role === item ? 'bg-white text-primary-700 shadow dark:bg-white/10 dark:text-white' : 'text-slate-400'}`}>{item}</button>)}
    </div>
    <div className="mt-6 rounded-2xl border border-slate-200 p-5 text-center dark:border-white/10">
      <HiOutlineShieldCheck className="mx-auto mb-3 text-3xl text-primary-600"/>
      <p className="mb-4 text-sm text-slate-500">You are continuing as <b className="capitalize text-slate-700 dark:text-slate-200">{role}</b>.</p>
      {clientId ? <div ref={buttonRef} className={`flex min-h-10 justify-center ${loading ? 'pointer-events-none opacity-60' : ''}`}/> : <p className="text-sm font-semibold text-red-500">Google authentication is not configured.</p>}
    </div>
    <p className="mt-5 text-center text-xs text-slate-400">New Google accounts are created automatically. Only the first administrator can claim the admin role.</p>
  </div>;
}
