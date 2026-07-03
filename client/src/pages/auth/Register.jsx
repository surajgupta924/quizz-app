import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { messageFrom } from '../../services/api';

const initial = { name: '', mobile: '', email: '', gender: '', college: '', course: '', year: '', password: '', confirmPassword: '', otp: '' };

export default function Register() {
  const [params] = useSearchParams();
  const role = params.get('role') === 'admin' ? 'admin' : 'student';
  const [form, setForm] = useState(initial);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = event => {
    const { name } = event.target;
    const value = name === 'mobile' ? event.target.value.replace(/\D/g, '').slice(0, 10) : event.target.value;
    setForm(current => ({ ...current, [name]: value }));
  };

  const request = async event => {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return toast.error('Mobile number must be 10 digits and start with 6, 7, 8, or 9');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/request-otp', { ...form, role });
      setStep(2);
      toast.success(data.devOtp ? `Development OTP: ${data.devOtp}` : data.message, { duration: 7000 });
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0]?.msg || messageFrom(error));
    } finally {
      setLoading(false);
    }
  };

  const submit = async event => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { ...form, role });
      toast.success('Account created. Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0]?.msg || messageFrom(error));
    } finally {
      setLoading(false);
    }
  };

  return <div>
    <p className="text-xs font-bold uppercase tracking-[.2em] text-primary-600">{role} onboarding</p>
    <h2 className="mt-2 text-3xl font-extrabold">Create your account</h2>
    <p className="mt-2 text-sm text-slate-500">{step === 1 ? 'Tell us a little about yourself.' : 'Enter the code sent to your email.'}</p>
    <form onSubmit={step === 1 ? request : submit} className="mt-6 grid gap-4 sm:grid-cols-2">
      {step === 1 ? <>
        <Field label="Full name" name="name" value={form.name} onChange={set}/>
        <Field label="Mobile number" name="mobile" type="tel" inputMode="numeric" minLength="10" maxLength="10" pattern="[6-9][0-9]{9}" title="Enter 10 digits starting with 6, 7, 8, or 9" placeholder="9876543210" value={form.mobile} onChange={set}/>
        <Field label="Email" name="email" type="email" value={form.email} onChange={set}/>
        <label><span className="label">Gender</span><select required className="field" name="gender" value={form.gender} onChange={set}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer-not-to-say">Prefer not to say</option></select></label>
        {role === 'student' && <><Field label="College" name="college" value={form.college} onChange={set}/><Field label="Course" name="course" value={form.course} onChange={set}/><Field label="Year" name="year" value={form.year} onChange={set}/></>}
        <Field label="Password" name="password" type="password" minLength="8" value={form.password} onChange={set}/>
        <Field label="Confirm password" name="confirmPassword" type="password" minLength="8" value={form.confirmPassword} onChange={set}/>
      </> : <div className="sm:col-span-2"><Field label="Email verification code" name="otp" inputMode="numeric" minLength="6" maxLength="6" pattern="[0-9]{6}" value={form.otp} onChange={set}/></div>}
      <button disabled={loading} className="btn-primary sm:col-span-2">{loading ? 'Please wait…' : step === 1 ? 'Send email verification code' : 'Verify & create account'}</button>
    </form>
    <p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link className="font-bold text-primary-600" to="/login">Sign in</Link></p>
  </div>;
}

function Field({ label, ...props }) {
  return <label><span className="label">{label}</span><input required className="field" {...props}/></label>;
}
