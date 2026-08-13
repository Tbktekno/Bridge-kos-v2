import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { BedDouble, DoorOpen, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/common/states';
import { useBoardingHouses, useRooms } from '@/hooks/use-entities';
import { roomApi } from '@/services/boarding-house.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(1, 'Nama kamar wajib diisi'),
  price: z.coerce.number().min(1, 'Harga harus lebih dari 0'),
  deposit: z.coerce.number().min(0).optional(),
  capacity: z.coerce.number().min(1).optional(),
  availableSlots: z.coerce.number().min(0).optional(),
  type: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function OwnerRoomsPage() {
  const queryClient = useQueryClient();
  const { data: housesData } = useBoardingHouses({ limit: 100, status: 'APPROVED' });
  const houses = housesData?.items ?? [];
  const [selectedHouse, setSelectedHouse] = useState<string | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { data: rooms = [], isLoading, isError, error, refetch } = useRooms(selectedHouse);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', price: 0, deposit: 0, capacity: 1, availableSlots: 1, type: '' },
  });

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      roomApi.create({
        boardingHouseId: selectedHouse as string,
        name: values.name,
        price: values.price,
        deposit: values.deposit,
        capacity: values.capacity,
        availableSlots: values.availableSlots,
      }),
    onSuccess: () => {
      toast.success('Kamar ditambahkan.');
      setDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomApi.remove(id),
    onSuccess: () => {
      toast.success('Kamar dihapus.');
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const submitCreate = (values: FormValues) => {
    if (!selectedHouse) return;
    createMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kamar"
        description="Kelola kamar untuk setiap kos Anda."
        actions={
          <Button onClick={() => setDialogOpen(true)} disabled={!selectedHouse}>
            <DoorOpen className="mr-2 h-4 w-4" /> Tambah Kamar
          </Button>
        }
      />

      <div className="flex max-w-md items-center gap-2">
        <Label htmlFor="house-select" className="whitespace-nowrap text-sm">
          Pilih Kos:
        </Label>
        <Select value={selectedHouse} onValueChange={setSelectedHouse}>
          <SelectTrigger id="house-select">
            <SelectValue placeholder="— Pilih kos terlebih dahulu —" />
          </SelectTrigger>
          <SelectContent>
            {houses.map((house) => (
              <SelectItem key={house.id} value={house.id}>
                {house.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedHouse ? (
        <EmptyState
          title="Pilih kos terlebih dahulu"
          description="Kamar dikelompokkan berdasarkan kos. Pilih salah satu dari dropdown di atas."
        />
      ) : isLoading ? (
        <LoadingState label="Memuat kamar..." />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : rooms.length === 0 ? (
        <EmptyState
          title="Belum ada kamar"
          description="Tambahkan kamar untuk kos yang dipilih."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <DoorOpen className="mr-2 h-4 w-4" /> Tambah Kamar
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{room.name}</span>
                  </div>
                  <Badge variant={room.availableSlots ? 'success' : 'destructive'}>
                    {room.availableSlots ? `${room.availableSlots} slot` : 'Penuh'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harga</span>
                  <span className="font-semibold">{formatCurrency(room.price)}</span>
                </div>
                {room.deposit ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deposit</span>
                    <span>{formatCurrency(room.deposit)}</span>
                  </div>
                ) : null}
                {room.capacity ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kapasitas</span>
                    <span>{room.capacity} orang</span>
                  </div>
                ) : null}
                <Button
                  className="w-full"
                  variant="destructive"
                  size="sm"
                  onClick={() => setPendingDelete(room.id)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Hapus
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kamar</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitCreate)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kamar</FormLabel>
                    <FormControl>
                      <Input placeholder="mis. Kamar 1A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe (opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="mis. Kamar Tidur, Studio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga / Bulan (Rp)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="750000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit / Bulan (Rp)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="500000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kapasitas (orang)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availableSlots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slot Tersedia</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Menyimpan...' : 'Simpan Kamar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kamar?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete)}
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}