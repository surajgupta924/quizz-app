import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import api, { messageFrom } from '../../services/api';
import { setSession } from '../../redux/authSlice';

const initialForm = {
  name: '',
  college: '',
  dob: '',
  mobile: '',
  email: '',
};

const emailPattern = /^[^\s@]+@gmail\.com$/i;
const mobilePattern = /^[6-9]\d{9}$/;

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [readyForGoogle, setReadyForGoogle] = useState(false);
  const buttonRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '853043782431-aqt6s08th1uob7tcf41kha5f77m03r7b.apps.googleusercontent.com';

  const validateForm = useCallback(async () => {
    const values = Object.entries(form);
    const missing = values.find(([, value]) => !String(value || '').trim());
    if (missing) {
      await Swal.fire({
        icon: 'error',
        title: 'Registration details required',
        text: 'Please fill all fields before Google verification.',
        confirmButtonColor: '#e11d48',
      });
      return false;
    }
    if (!mobilePattern.test(form.mobile.trim())) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid mobile number',
        text: 'Mobile number must be 10 digits and start with 6, 7, 8, or 9.',
        confirmButtonColor: '#e11d48',
      });
      return false;
    }
    if (!emailPattern.test(form.email.trim())) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid email address',
        text: 'Enter a valid Gmail address before continuing.',
        confirmButtonColor: '#e11d48',
      });
      return false;
    }
    return true;
  }, [form]);

  const handleCredential = useCallback(async response => {
    if (!response.credential) return toast.error('Google did not return a sign-in credential');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/student/google', {
        credential: response.credential,
        ...form,
      });
      dispatch(setSession(data));
      await Swal.fire({
        icon: 'success',
        title: 'Registration complete',
        text: 'Your Google account has been verified successfully.',
        confirmButtonColor: '#6554e8',
      });
      navigate(location.state?.from?.pathname || '/student', { replace: true });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Registration failed',
        text: messageFrom(error),
        confirmButtonColor: '#e11d48',
      });
    } finally {
      setLoading(false);
    }
  }, [dispatch, form, location.state, navigate]);

  useEffect(() => {
    if (!clientId || !buttonRef.current || !readyForGoogle) return undefined;
    const renderButton = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;
      buttonRef.current.replaceChildren();
      window.google.accounts.id.initialize({ client_id: clientId, callback: handleCredential });
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        logo_alignment: 'left',
        width: 320,
      });
    };
    const script = document.getElementById('google-identity-services');
    if (window.google?.accounts?.id) renderButton();
    else script?.addEventListener('load', renderButton);
    return () => script?.removeEventListener('load', renderButton);
  }, [clientId, handleCredential, readyForGoogle]);

  const update = event => {
    const { name, value } = event.target;
    setReadyForGoogle(false);
    setForm(current => ({ ...current, [name]: value }));
  };

  const continueWithGoogle = async () => {
    const okay = await validateForm();
    if (!okay) return;
    setReadyForGoogle(true);
  };

  return <div>
    <p className="text-xs font-bold uppercase tracking-[.2em] text-primary-600">Student Registration</p>
    <h2 className="mt-2 text-3xl font-extrabold">Create your exam account</h2>
    <p className="mt-2 text-sm text-slate-500">Enter your details first, then verify the same email with Google authentication.</p>

    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <Field label="Student name" name="name" value={form.name} onChange={update} placeholder="Enter full name"/>
      <Field label="College name" name="college" value={form.college} onChange={update} placeholder="Enter college name"/>
      <Field label="Date of birth" name="dob" type="date" value={form.dob} onChange={update}/>
      <Field label="Mobile number" name="mobile" value={form.mobile} onChange={update} maxLength={10} placeholder="10-digit mobile"/>
      <div className="md:col-span-2">
        <Field label="Gmail address" name="email" type="email" value={form.email} onChange={update} placeholder="name@gmail.com"/>
      </div>
    </div>

    <div className="mt-6 rounded-2xl border border-slate-200 p-5 text-center dark:border-white/10">
      <p className="mb-4 text-sm text-slate-500">Click below only after all fields are filled correctly.</p>
      <button type="button" disabled={loading} onClick={continueWithGoogle} className="btn-primary w-full">
        {loading ? 'Verifying…' : readyForGoogle ? 'Details validated' : 'Validate details'}
      </button>
      {readyForGoogle && <div className="mt-4 flex justify-center">
        <div ref={buttonRef} className={loading ? 'pointer-events-none opacity-60' : ''}/>
      </div>}
      {!clientId && <p className="mt-3 text-sm font-semibold text-red-500">Google authentication is not configured.</p>}
    </div>

    <p className="mt-5 text-center text-xs text-slate-400">Already registered? <Link to="/login" className="font-bold text-primary-600">Go to sign in</Link></p>
  </div>;
}

function Field({ label, ...props }) {
  return <label>
    <span className="label">{label}</span>
    <input className="field" {...props}/>
  </label>;
}
