import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  Eye,
  EyeOff,
  KeyRound,
  Landmark,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Store,
  UserPlus,
} from 'lucide-react';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRegister } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/error';
import { ROUTES } from '@/constants/app';

const schema = z
  .object({
    fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    phone: z
      .string()
      .regex(/^[0-9+\-\s]{9,16}$/, 'Nomor HP tidak valid')
      .optional()
      .or(z.literal('')),
    password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

const HIGHLIGHTS = [
  {
    icon: <Building2 className="h-4 w-4" />,
    title: 'Dashboard lengkap',
    description: 'Kelola kos, kamar, dan slot ketersediaan dalam satu tempat.',
  },
  {
    icon: <CalendarCheck className="h-4 w-4" />,
    title: 'Booking slot real-time',
    description: 'Terima booking dengan slot terkunci otomatis, bebas dobel sewa.',
  },
  {
    icon: <Landmark className="h-4 w-4" />,
    title: 'Pembayaran terverifikasi',
    description: 'Pantau DP dan pembayaran penyewa secara transparan.',
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: 'Jangkauan luas',
    description: 'Tampilkan kosmu ke ribuan pencari kos di seluruh Indonesia.',
  },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    register.mutate(
      { ...values, phone: values.phone || undefined, role: 'OWNER' },
      {
        onSuccess: () => {
          toast.success('Akun pemilik kos berhasil dibuat. Silakan masuk.');
          navigate(ROUTES.login);
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
        },
      },
    );
  };

  return (
    <div className="flex min-h-svh w-full flex-col lg:flex-row">
      <section className="relative hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between overflow-hidden bg-gradient-to-br from-primary/15 via-background to-background border-r p-10 xl:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">BridgeKos</span>
        </div>

        <div className="relative space-y-8">
          <div className="space-y-4">
            <Badge
              variant="outline"
              className="gap-1.5 border-primary/30 bg-primary/5 text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Platform kos modern untuk mahasiswa &amp; pekerja
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Kelola kosmu, <span className="text-primary">jangkau lebih banyak penyewa</span>
            </h1>
            <p className="max-w-md text-muted-foreground">
              Buat akun pemilik kos dan pasang kos kamu — kelola kamar, booking, dan pembayaran
              dalam satu dashboard.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.title}
                className="flex items-start gap-3 rounded-xl border bg-card/70 p-4 backdrop-blur-sm"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {h.icon}
                </span>
                <div>
                  <p className="text-sm font-medium">{h.title}</p>
                  <p className="text-xs text-muted-foreground">{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BadgeCheck className="h-4 w-4 text-success" /> Terverifikasi
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Aman
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4 text-secondary" /> Kontak WhatsApp
          </span>
        </div>
      </section>

      <main className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold tracking-tight">BridgeKos</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Daftar sebagai Pemilik Kos</h2>
            <p className="text-sm text-muted-foreground">
              Buat akun owner gratis dan mulai pasang kos kamu hari ini.
            </p>
          </div>

          {form.formState.isSubmitting === false && register.isError && (
            <Alert variant="destructive" className="mt-6">
              <AlertDescription>{getErrorMessage(register.error)}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Anda" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="nama@email.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="0812xxxxxxx" autoComplete="tel" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nomor yang tampil ke penyewa untuk dihubungi.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kata Sandi</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Minimal 6 karakter"
                          autoComplete="new-password"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={
                            showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
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
                      <div className="relative">
                        <Input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Ulangi kata sandi"
                          autoComplete="new-password"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={
                            showConfirm ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
                          }
                        >
                          {showConfirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={register.isPending}>
                {register.isPending ? 'Memproses...' : 'Daftar sebagai Pemilik'}
                {!register.isPending && <UserPlus className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </Form>

          <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            atau lanjut dengan
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="mt-4 w-full" asChild>
            <Link to={ROUTES.login}>
              <KeyRound className="mr-2 h-4 w-4" /> Sudah punya akun? Masuk
            </Link>
          </Button>

          <div className="mt-8 rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Store className="h-4 w-4 text-primary" />
              Ingin mulai mencari kos?
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Jelajahi ribuan kos terverifikasi dan temukan hunian impianmu sekarang.
            </p>
            <Button size="sm" variant="ghost" className="mt-3" asChild>
              <Link to={ROUTES.home}>
                Jelajahi Kos <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
