import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/services/auth.api';
import { getErrorMessage } from '@/lib/error';
import { ROUTES } from '@/constants/app';
import { toast } from 'sonner';

type VerifyState = 'loading' | 'success' | 'error';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [state, setState] = useState<VerifyState>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setState('error');
      setError('Token verifikasi tidak ditemukan pada URL.');
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => {
        if (!cancelled) {
          setState('success');
          toast.success('Email berhasil diverifikasi!');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState('error');
          setError(getErrorMessage(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="w-full max-w-md space-y-4 py-8 text-center">
      {state === 'loading' && (
        <>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Memverifikasi Email...</h1>
        </>
      )}
      {state === 'success' && (
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Email Terverifikasi</h1>
          <p className="text-sm text-muted-foreground">
            Akun Anda kini aktif. Silakan masuk untuk mulai menggunakan BridgeKos.
          </p>
          <Link to={ROUTES.login}>
            <Button className="w-full">Masuk</Button>
          </Link>
        </>
      )}
      {state === 'error' && (
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Verifikasi Gagal</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Link to={ROUTES.login}>
            <Button variant="outline" className="w-full">
              Ke Halaman Masuk
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}