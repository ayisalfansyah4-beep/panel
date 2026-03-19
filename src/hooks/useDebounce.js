import { useRef, useCallback, useEffect } from 'react';

export function useDebounce(fn, delay) {
  // Simpan fn terbaru di ref agar callback selalu memanggil versi terkini
  const fnRef = useRef(fn);
  useEffect(() => { fnRef.current = fn; });

  const timerRef = useRef(null);

  return useCallback((...args) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fnRef.current(...args), delay);
  }, [delay]); // hanya delay yang perlu jadi dep — fn ditangani via ref
}
