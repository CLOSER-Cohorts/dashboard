'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';

export default function Loading(props) {
  const router = useRouter();

  useEffect(() => {
    const start = () => props.setLoading(true);
    const end = () => props.setLoading(false);

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', end);
    router.events.on('routeChangeError', end);

    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', end);
      router.events.off('routeChangeError', end);
    };
  }, [router]);

  return props.loading ? <Box sx={{ p: 3, width: 1 }}>Loading data...</Box> : null;
}
