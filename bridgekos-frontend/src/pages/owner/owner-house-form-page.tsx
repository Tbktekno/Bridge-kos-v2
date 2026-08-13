import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MapPin, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PageHeader, LoadingState } from '@/components/common/states';
import { boardingHouseApi } from '@/services/boarding-house.api';
import { getErrorMessage } from '@/lib/error';
import { ROUTES } from '@/constants/app';
import { toast } from 'sonner';

const FACILITY_OPTIONS = [
  'WiFi',
  'AC',
  'Kamar Mandi Dalam',
  'Kamar Mandi Luar',
  'Parkir Motor',
  'Parkir Mobil',
  'Mesin Cuci',
  'Dapur',
  'Kasur',
  'Lemari',
  'Meja',
  'TV',
  'Air Panas',
  'Listrik',
];

const schema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  category: z.string().optional(),
  gender: z.enum(['COED', 'MALE', 'FEMALE']).optional(),
  description: z.string().max(3000, 'Maksimal 3000 karakter').optional(),
  address: z.string().min(5, 'Alamat lengkap diperlukan'),
  province: z.string().min(2, 'Provinsi diperlukan'),
  city: z.string().min(2, 'Kota diperlukan'),
  district: z.string().min(2, 'Kecamatan diperlukan'),
  subdistrict: z.string().min(2, 'Kelurahan diperlukan'),
  postalCode: z.string().optional(),
  googleMapsUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  facilities: z.array(z.string()).default([]),
  rules: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof schema>;

export function OwnerHouseFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      category: 'KOST',
      gender: 'COED',
      description: '',
      address: '',
      province: '',
      city: '',
      district: '',
      subdistrict: '',
      postalCode: '',
      googleMapsUrl: '',
      facilities: [],
      rules: [],
    },
  });

  // load edit data if in edit mode
  useEffect(() => {
    if (isEdit && loadingEdit) {
      boardingHouseApi
        .detailOwner(id as string)
        .then((house) => {
          form.reset({
            name: house.name,
            category: house.category ?? 'KOST',
            gender: house.gender ?? 'COED',
            description: house.description ?? '',
            address: house.address ?? '',
            province: house.province ?? '',
            city: house.city ?? '',
            district: house.district ?? '',
            subdistrict: house.subdistrict ?? '',
            postalCode: house.postalCode ?? '',
            googleMapsUrl: house.googleMapsUrl ?? '',
            facilities: house.facilities?.map((f) => f.name) ?? [],
            rules: house.rules ?? [],
          });
          setFacilities(house.facilities?.map((f) => f.name) ?? []);
          setRules(house.rules ?? []);
          setLoadingEdit(false);
        })
        .catch((err) => {
          toast.error(getErrorMessage(err));
          setLoadingEdit(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const [ruleInput, setRuleInput] = useState('');
  const [rules, setRules] = useState<string[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);

  const syncFacilities = (values: string[]) => {
    setFacilities(values);
    form.setValue('facilities', values);
  };

  const addRule = () => {
    const rule = ruleInput.trim();
    if (!rule) return;
    const next = [...rules, rule];
    setRules(next);
    form.setValue('rules', next);
    setRuleInput('');
  };

  const removeRule = (index: number) => {
    const next = rules.filter((_, i) => i !== index);
    setRules(next);
    form.setValue('rules', next);
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (isEdit) {
        await boardingHouseApi.update(id as string, {
          ...values,
          facilities: values.facilities,
          rules: values.rules,
          googleMapsUrl: values.googleMapsUrl || undefined,
          category: values.category || undefined,
        });
        toast.success('Kos berhasil diperbarui.');
      } else {
        await boardingHouseApi.create({
          ...values,
          facilities: values.facilities,
          rules: values.rules,
          googleMapsUrl: values.googleMapsUrl || undefined,
          category: values.category || undefined,
        });
        toast.success('Kos berhasil didaftarkan. Menunggu persetujuan admin.');
      }
      navigate(ROUTES.owner.houses);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loadingEdit) return <LoadingState label="Memuat data kos..." />;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={isEdit ? 'Edit Kos' : 'Daftarkan Kos Baru'}
        description="Isi informasi lengkap agar kos mudah ditemukan pencari."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Umum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kos *</FormLabel>
                    <FormControl>
                      <Input placeholder="mis. Kos Griya Melati" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-wrap gap-2"
                      >
                        {['KOST', 'APARTEMEN', 'KONTRAKAN', 'CAMPURAN'].map((category) => (
                          <Label
                            key={category}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                          >
                            <RadioGroupItem value={category} />
                            {category}
                          </Label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Khusus Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-wrap gap-2"
                      >
                        {[
                          { value: 'COED', label: 'Campur' },
                          { value: 'MALE', label: 'Putra' },
                          { value: 'FEMALE', label: 'Putri' },
                        ].map((g) => (
                          <Label
                            key={g.value}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                          >
                            <RadioGroupItem value={g.value} />
                            {g.label}
                          </Label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Jelaskan suasana kos, lingkungan sekitar, dan keunggulan lainnya..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Lokasi
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Alamat Lengkap *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jalan, nomor, RT/RW, kelurahan..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provinsi *</FormLabel>
                    <FormControl>
                      <Input placeholder="DKI Jakarta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kota / Kabupaten *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jakarta Selatan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kecamatan *</FormLabel>
                    <FormControl>
                      <Input placeholder="Tebet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subdistrict"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kelurahan *</FormLabel>
                    <FormControl>
                      <Input placeholder="Menteng Dalam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Pos</FormLabel>
                    <FormControl>
                      <Input placeholder="12870" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="googleMapsUrl"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Link Google Maps (opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://maps.app.goo.gl/..." {...field} />
                    </FormControl>
                    <FormDescription>Bagikan tautan lokasi agar mudah ditemukan.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fasilitas &amp; Peraturan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Fasilitas</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {FACILITY_OPTIONS.map((f) => (
                    <label
                      key={f}
                      className="flex cursor-pointer items-center gap-2 rounded border p-2 text-sm has-[:checked]:border-primary"
                    >
                      <Checkbox
                        checked={facilities.includes(f)}
                        onCheckedChange={(c) => {
                          const next = c ? [...facilities, f] : facilities.filter((x) => x !== f);
                          syncFacilities(next);
                        }}
                      />
                      {f}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Peraturan Kos</Label>
                <div className="flex gap-2">
                  <Input
                    value={ruleInput}
                    onChange={(e) => setRuleInput(e.target.value)}
                    placeholder="mis. Tidak membawa tamu setelah jam 22.00"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRule();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addRule}>
                    Tambah
                  </Button>
                </div>
                {rules.length > 0 && (
                  <ul className="space-y-1 pt-2">
                    {rules.map((rule, i) => (
                      <li key={`${rule}-${i}`} className="flex items-center justify-between rounded bg-muted px-3 py-2 text-sm">
                        <span>{rule}</span>
                        <button type="button" onClick={() => removeRule(i)} className="text-xs text-destructive hover:underline">
                          Hapus
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t">
              <Button type="submit" className="w-full" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Daftarkan Kos'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}