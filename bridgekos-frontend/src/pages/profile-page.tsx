import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { KeyRound, Save, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PageHeader, LoadingState } from '@/components/common/states';
import { userApi, authApi } from '@/services/auth.api';
import { getErrorMessage } from '@/lib/error';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

const profileSchema = z.object({
  fullName: z.string().min(3, 'Nama minimal 3 karakter'),
  phone: z.string().regex(/^[0-9+\-\s]{9,16}$/, 'Nomor HP tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Kata sandi saat ini diperlukan'),
    newPassword: z.string().min(6, 'Kata sandi baru minimal 6 karakter'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Konfirmasi tidak cocok',
    path: ['confirmPassword'],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', phone: '', address: '', gender: undefined },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    userApi
      .getMe()
      .then((profile) => {
        profileForm.reset({
          fullName: profile.fullName,
          phone: profile.phone ?? '',
          address: profile.address ?? '',
          gender: profile.gender ?? undefined,
        });
        setUser({ ...user!, ...profile });
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoadingProfile(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSaveProfile = async (values: ProfileValues) => {
    setSaving(true);
    try {
      await userApi.updateMe(values);
      toast.success('Profil diperbarui.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (values: PasswordValues) => {
    setChanging(true);
    try {
      await authApi.changePassword(values.currentPassword, values.newPassword);
      toast.success('Kata sandi berhasil diubah.');
      passwordForm.reset();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setChanging(false);
    }
  };

  if (loadingProfile) return <LoadingState label="Memuat profil..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Saya"
        description={`Terdaftar sebagai ${user?.role === 'OWNER' ? 'Pemilik Kos' : user?.role === 'ADMIN' ? 'Admin' : 'Penyewa'} · ${user?.email ?? ''}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-4 w-4" /> Informasi Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="0812xxxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Kelamin (opsional)</FormLabel>
                      <FormControl>
                        <Input placeholder="MALE / FEMALE" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Input placeholder="Alamat lengkap" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" /> {saving ? 'Menyimpan...' : 'Simpan Profil'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Ubah Kata Sandi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kata Sandi Saat Ini</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kata Sandi Baru</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Minimal 6 karakter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Kata Sandi Baru</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Ulangi kata sandi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={changing}>
                  <KeyRound className="mr-2 h-4 w-4" />{' '}
                  {changing ? 'Mengubah...' : 'Ubah Kata Sandi'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}