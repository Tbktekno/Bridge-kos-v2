import { AxiosError } from 'axios';

interface FieldIssue {
  field: string;
  message: string;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string; errors?: FieldIssue[]; code?: string }
      | undefined;
    if (data?.errors?.length) {
      return data.errors.map((e) => e.message).join(', ');
    }
    if (data?.message) return data.message;
    if (!error.response) return 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan yang tidak diketahui.';
}