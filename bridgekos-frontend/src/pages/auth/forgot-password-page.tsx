import { useState } from 'react';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MailCheck } from 'lucide-react';
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

const schema = z.object({
  email: z.string().email('Email tidak valid'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const message = await authApi.forgotPassword(values.email);
      setSent(true);
      toast.success(message || 'Tautan reset kata sandi telah dikirim ke email Anda.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md space-y-4 py-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Cek Email Anda</h1>
        <p className="text-sm text-muted-foreground">
          Jika email terdaftar, kami telah mengirimkan tautan untuk mengatur ulang kata sandi. Buka
          tautan tersebut dalam 30 menit.
        </p>
        <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
          Kirim ulang
        </Button>
        <Link to={ROUTES.login} className="block text-sm text-primary hover:underline">
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Lupa Kata Sandi</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan email terdaftar, kami akan kirim tautan reset.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="nama@email.com" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
          </Button>
        </form>
      </Form>

      <Link to={ROUTES.login} className="block text-center text-sm text-primary hover:underline">
        Kembali ke halaman masuk
      </Link>
    </div>
  );
}