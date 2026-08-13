import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  LogIn,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  UserSearch,
} from 'lucide-react';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useLogin } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/error';
import { ROUTES } from '@/constants/app';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
});

type FormValues = z.infer<typeof schema>;

const HIGHLIGHTS = [
  {
    icon: <UserSearch className="h-4 w-4" />,
    title: 'Ribuan kos pilihan',
    description: 'Cari & bandingkan kos berdasarkan lokasi, harga, dan fasilitas.',
  },
  {
    icon: <CalendarCheck className="h-4 w-4" />,
    title: 'Booking slot real-time',
    description: 'Kamar yang tampil pasti tersedia, bebas dobel booking.',
  },
  {
    icon: <Landmark className="h-4 w-4" />,
    title: 'DP ringan ke owner',
    description: 'Transfer langsung ke pemilik, transparan tanpa perantara.',
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: 'Kos terverifikasi',
    description: 'Setiap kos dimoderasi agar kamu dapat infonya secara jujur.',
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const from = (location.state as { from?: string } | null)?.from;

  const onSubmit = (values: FormValues) => {
    login.mutate(values, {
      onSuccess: (result) => {
        const dashboards = {
          OWNER: ROUTES.owner.dashboard,
          ADMIN: ROUTES.admin.dashboard,
          TENANT: ROUTES.tenant.dashboard,
        } as const;
        navigate(from ?? dashboards[result.user.role], { replace: true });
      },
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    });
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
              Kelola &amp; temukan kos <span className="text-primary">tanpa ribet</span>
            </h1>
            <p className="max-w-md text-muted-foreground">
              Satu akun untuk mengakses semuanya — cari kos, kelola booking, pantau pembayaran, dan
              nilai pengalaman nginapmu.
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
            <h2 className="text-2xl font-bold tracking-tight">Selamat datang kembali</h2>
            <p className="text-sm text-muted-foreground">
              Masuk untuk mengelola kos, booking, dan pembayaran Anda.
            </p>
          </div>

          {form.formState.isSubmitting === false && login.isError && (
            <Alert variant="destructive" className="mt-6">
              <AlertDescription>{getErrorMessage(login.error)}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Kata Sandi</FormLabel>
                      <Link
                        to={ROUTES.forgotPassword}
                        className="text-xs text-primary hover:underline"
                      >
                        Lupa kata sandi?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="current-password"
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
              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending ? 'Memproses...' : 'Masuk'}
                {!login.isPending && <LogIn className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </Form>

          <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            atau lanjut dengan
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="mt-4 w-full" asChild>
            <Link to={ROUTES.register}>
              <KeyRound className="mr-2 h-4 w-4" /> Belum punya akun? Daftar sekarang
            </Link>
          </Button>

          <div className="mt-8 rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Star className="h-4 w-4 text-primary" />
              Pemilik kos? Nikmati dashboard khusus owner
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Pasang kos, kelola kamar &amp; slot, terima booking, dan pantau laporan dari satu
              tempat.
            </p>
            <Button size="sm" variant="ghost" className="mt-3" asChild>
              <Link to={ROUTES.register}>
                Daftar sebagai owner <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
