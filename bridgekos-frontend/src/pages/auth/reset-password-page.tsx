import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { authApi } from '@/services/auth.api';
import { getErrorMessage } from '@/lib/error';
import { ROUTES } from '@/constants/app';
import { toast } from 'sonner';

const schema = z
  .object({
    token: z.string().min(1, 'Token tidak valid'),
    password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { token, password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await authApi.resetPassword(values.token, values.password);
      setDone(true);
      toast.success('Kata sandi berhasil diubah. Silakan masuk.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="w-full max-w-md space-y-4 py-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Berhasil!</h1>
        <p className="text-sm text-muted-foreground">Kata sandi Anda telah diperbarui.</p>
        <Link to={ROUTES.login}>
          <Button className="w-full">Masuk Sekarang</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Atur Ulang Kata Sandi</h1>
        <p className="text-sm text-muted-foreground">Buat kata sandi baru untuk akun Anda.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>Token</FormLabel>
                <FormControl>
                  <Input type="hidden" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kata Sandi Baru</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={show ? 'text' : 'password'}
                      placeholder="Minimal 6 karakter"
                      autoComplete="new-password"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Tampilkan kata sandi"
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi Kata Sandi</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Ulangi kata sandi" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Kata Sandi'}
          </Button>
        </form>
      </Form>

      <Link to={ROUTES.login} className="block text-center text-sm text-primary hover:underline">
        Kembali ke halaman masuk
      </Link>
    </div>
  );
}