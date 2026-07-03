import { useCallback, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import api from '../services/api';

export default function useExamGuard({ attemptId, onAutoSubmit, enabled = true }) {
  const busy = useRef(false);

  const warn = useCallback(async reason => {
    if (!enabled || busy.current) return;
    busy.current = true;
    try {
      const { data } = await api.post(`/exams/attempts/${attemptId}/warning`, { reason });
      if (data.autoSubmit) {
        await Swal.fire({
          icon: 'error',
          title: 'Third violation detected',
          text: 'Your exam is being submitted automatically.',
          timer: 1800,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
        onAutoSubmit('violation');
        return;
      }
      await Swal.fire({
        icon: 'error',
        title: data.warnings === 1 ? 'Danger warning 1 of 2' : 'Final warning 2 of 2',
        text: `${reason} A third violation will automatically submit your exam.`,
        confirmButtonText: 'I understand',
        confirmButtonColor: '#dc2626',
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
    } finally {
      busy.current = false;
    }
  }, [attemptId, enabled, onAutoSubmit]);

  useEffect(() => {
    if (!enabled) return undefined;
    const channel = 'BroadcastChannel' in window ? new BroadcastChannel('codingclave-exam-tabs') : null;
    if (channel) channel.onmessage = event => { if (event.data?.type === 'presence-check') channel.postMessage({ type: 'exam-active' }); };
    const prevent = event => event.preventDefault();
    const keys = event => {
      const key = event.key.toLowerCase();
      if (event.key === 'F12' || (event.ctrlKey && ['c', 'v', 'x', 'a', 'p', 's', 'u'].includes(key)) || (event.ctrlKey && event.shiftKey && ['i', 'c', 'j'].includes(key))) {
        event.preventDefault(); warn(`Restricted shortcut detected (${event.key}).`);
      }
    };
    const visibility = () => { if (document.hidden) warn('You switched away from the examination tab.'); };
    const blur = () => setTimeout(() => { if (!document.hasFocus() && !document.hidden) warn('The exam window lost focus.'); }, 200);
    const fullscreen = () => { if (!document.fullscreenElement) warn('Fullscreen mode was exited.'); };
    const back = () => { history.pushState(null, '', location.href); warn('Browser back navigation is disabled during the exam.'); };
    history.pushState(null, '', location.href);
    document.addEventListener('contextmenu', prevent); document.addEventListener('copy', prevent);
    document.addEventListener('cut', prevent); document.addEventListener('paste', prevent);
    document.addEventListener('selectstart', prevent); document.addEventListener('keydown', keys);
    document.addEventListener('visibilitychange', visibility); document.addEventListener('fullscreenchange', fullscreen);
    window.addEventListener('blur', blur); window.addEventListener('popstate', back);
    return () => {
      channel?.close();
      document.removeEventListener('contextmenu', prevent); document.removeEventListener('copy', prevent);
      document.removeEventListener('cut', prevent); document.removeEventListener('paste', prevent);
      document.removeEventListener('selectstart', prevent); document.removeEventListener('keydown', keys);
      document.removeEventListener('visibilitychange', visibility); document.removeEventListener('fullscreenchange', fullscreen);
      window.removeEventListener('blur', blur); window.removeEventListener('popstate', back);
    };
  }, [enabled, warn]);
}
