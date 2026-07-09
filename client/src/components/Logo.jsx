import codingClaveLogo from '../assets/codingclave-logo.svg';

export function BrandMark({ size = 'md', dark = false }) {
  const sizes = {
    sm: 'h-9 w-9',
    md: 'h-11 w-11',
    lg: 'h-14 w-14',
  };
  return <img src={codingClaveLogo} alt="CodingClave logo" className={`${sizes[size]} ${dark ? '' : 'drop-shadow-sm'}`}/>;
}

export default function Logo({ compact = false }) {
  return <div className="flex items-center gap-3">
    <BrandMark/>
    {!compact && <div>
      <div className="text-lg font-extrabold tracking-tight leading-5">Coding Clave</div>
      <div className="text-base font-extrabold tracking-tight leading-5">Development LLP</div>
      <div className="text-[10px] font-semibold tracking-[.04em] text-slate-400">Code. Create. Clave.</div>
    </div>}
  </div>;
}
