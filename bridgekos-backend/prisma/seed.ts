import { prisma } from '../src/utils/prisma.js';
import { hashPassword } from '../src/utils/password.js';
import { logger } from '../src/utils/logger.js';
import type {
  BoardingGender,
  BoardingStatus,
  Prisma,
  RoomStatus,
  SubscriptionPlan,
  VerificationStatus,
} from '../src/generated/prisma/client.js';

const OWNER_PASSWORD = process.env.OWNER_PASSWORD ?? 'Owner123!';

const FACILITY_POOL = [
  'WiFi',
  'AC',
  'Kamar Mandi',
  'Parkir',
  'Mesin Cuci',
  'Dapur',
  'Kasur',
  'TV',
  'Water Heater',
  'CCTV',
  'Lemari',
  'Meja Belajar',
];

const RULE_POOL = [
  'Tidak boleh membawa lawan jenis ke kamar',
  'Dilarang merokok di dalam kamar',
  'Jam malam pukul 22.00 WIB',
  'Tidak membawa hewan peliharaan',
  'Tamu wajib lapor ke pengelola',
  'Kunjungan dibatasi hingga pukul 21.00',
  'Dilarang membawa senjata tajam',
  'Menjaga kebersihan kamar mandi bersama',
];

interface OwnerSpec {
  email: string;
  fullName: string;
  businessName: string;
  whatsapp: string;
  verificationStatus: VerificationStatus;
  plan: SubscriptionPlan;
}

interface RoomSpec {
  roomNumber: string;
  floor: number;
  price: number;
  size: number;
  stock: number;
  status: RoomStatus;
  facilities: string[];
}

interface BoardingSpec {
  ownerIndex: number;
  name: string;
  category: string;
  gender: BoardingGender;
  address: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  description: string;
  rating: number;
  ratingCount: number;
  nearby: string[];
  rooms: RoomSpec[];
}

const OWNERS: OwnerSpec[] = [
  {
    email: 'owner1@bridgekos.id',
    fullName: 'Budi Santoso',
    businessName: 'Santoso Property',
    whatsapp: '6281234567801',
    verificationStatus: 'VERIFIED',
    plan: 'BUSINESS',
  },
  {
    email: 'owner2@bridgekos.id',
    fullName: 'Siti Rahayu',
    businessName: 'Rahayu Residence',
    whatsapp: '6281234567802',
    verificationStatus: 'VERIFIED',
    plan: 'STARTER',
  },
  {
    email: 'owner3@bridgekos.id',
    fullName: 'Agus Wijaya',
    businessName: 'Wijaya Boarding',
    whatsapp: '6281234567803',
    verificationStatus: 'VERIFIED',
    plan: 'BUSINESS',
  },
  {
    email: 'owner4@bridgekos.id',
    fullName: 'Dewi Lestari',
    businessName: 'Lestari Kost Group',
    whatsapp: '6281234567804',
    verificationStatus: 'VERIFIED',
    plan: 'PREMIUM',
  },
  {
    email: 'owner5@bridgekos.id',
    fullName: 'Rudi Hartono',
    businessName: 'Hartono Homestay',
    whatsapp: '6281234567805',
    verificationStatus: 'VERIFIED',
    plan: 'FREE',
  },
];

const BOARDINGS: BoardingSpec[] = [
  // ---------- Jakarta ----------
  {
    ownerIndex: 0,
    name: 'Kos Premium Kemang',
    category: 'Kos Premium',
    gender: 'CAMPUR',
    address: 'Jl. Kemang Raya No. 45, Bangka',
    province: 'DKI Jakarta',
    city: 'Jakarta',
    district: 'Mampang Prapatan',
    subdistrict: 'Bangka',
    postalCode: '12730',
    latitude: -6.2594,
    longitude: 106.8132,
    description:
      'Kos premium di jantung Kemang dengan akses dekat ke perkantoran SCBD, kafe, dan pusat kuliner. Kamar luas dengan furnitur lengkap, WiFi kencang, dan keamanan 24 jam.',
    rating: 4.8,
    ratingCount: 47,
    nearby: ['SCBD', 'Blok M Plaza', 'Kampus BINUS'],
    rooms: [
      { roomNumber: 'A1', floor: 1, price: 2_250_000, size: 16, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater'] },
      { roomNumber: 'A2', floor: 1, price: 2_250_000, size: 16, stock: 1, status: 'BOOKED', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater'] },
      { roomNumber: 'B1', floor: 2, price: 2_500_000, size: 20, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'TV'] },
    ],
  },
  {
    ownerIndex: 1,
    name: 'Kos Putri Melati Jakarta',
    category: 'Kos Putri',
    gender: 'PUTRI',
    address: 'Jl. Melati No. 12, Kebayoran Baru',
    province: 'DKI Jakarta',
    city: 'Jakarta',
    district: 'Kebayoran Baru',
    subdistrict: 'Melawai',
    postalCode: '12160',
    latitude: -6.2428,
    longitude: 106.8063,
    description:
      'Kos khusus putri yang aman dan nyaman, 10 menit dari Blok M. Lingkungan asri, dijaga satpam, dan CCTV di setiap lantai. Cocok untuk karyawati dan mahasiswi.',
    rating: 4.6,
    ratingCount: 33,
    nearby: ['Blok M Plaza', 'Stasiun MRT Blok M', 'Pasaraya'],
    rooms: [
      { roomNumber: '01', floor: 1, price: 1_800_000, size: 12, stock: 3, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'CCTV'] },
      { roomNumber: '02', floor: 1, price: 1_800_000, size: 12, stock: 1, status: 'BOOKED', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'CCTV'] },
      { roomNumber: '03', floor: 2, price: 2_000_000, size: 15, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'CCTV'] },
    ],
  },
  {
    ownerIndex: 2,
    name: 'Kost Alfa Kemanggisan',
    category: 'Kos Mahasiswa',
    gender: 'CAMPUR',
    address: 'Jl. Kemanggisan Ilir III No. 8, Palmerah',
    province: 'DKI Jakarta',
    city: 'Jakarta',
    district: 'Palmerah',
    subdistrict: 'Kemanggisan',
    postalCode: '11480',
    latitude: -6.1952,
    longitude: 106.7973,
    description:
      'Kost strategis di dekat BINUS Anggrek, cocok untuk mahasiswa. Fasilitas lengkap dengan dapur bersama, mesin cuci, dan area parkir luas. Harga bersahabat.',
    rating: 4.3,
    ratingCount: 58,
    nearby: ['BINUS Anggrek', 'Sentral Senayan', 'Mall Taman Anggrek'],
    rooms: [
      { roomNumber: 'K1', floor: 1, price: 1_300_000, size: 9, stock: 4, status: 'AVAILABLE', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'Dapur', 'Parkir'] },
      { roomNumber: 'K2', floor: 1, price: 1_300_000, size: 9, stock: 2, status: 'BOOKED', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'Dapur', 'Parkir'] },
      { roomNumber: 'K3', floor: 2, price: 1_500_000, size: 12, stock: 3, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Dapur', 'Parkir'] },
      { roomNumber: 'K4', floor: 2, price: 1_500_000, size: 12, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Dapur', 'Parkir'] },
    ],
  },
  {
    ownerIndex: 3,
    name: 'Kos Mewah SCBD Area',
    category: 'Kos Premium',
    gender: 'CAMPUR',
    address: 'Jl. Senopati No. 27, Kebayoran Baru',
    province: 'DKI Jakarta',
    city: 'Jakarta',
    district: 'Kebayoran Baru',
    subdistrict: 'Senopati',
    postalCode: '12190',
    latitude: -6.2274,
    longitude: 106.8073,
    description:
      'Kos mewah untuk eksekutif muda dengan interior modern, akses smart lock, gym area, dan laundry service. 5 menit dari pusat bisnis SCBD Sudirman.',
    rating: 4.9,
    ratingCount: 25,
    nearby: ['SCBD', 'Pacific Place', 'Senayan City'],
    rooms: [
      { roomNumber: 'EX-1', floor: 2, price: 3_500_000, size: 24, stock: 1, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'TV', 'CCTV'] },
      { roomNumber: 'EX-2', floor: 2, price: 3_500_000, size: 24, stock: 1, status: 'BOOKED', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'TV', 'CCTV'] },
      { roomNumber: 'EX-3', floor: 3, price: 4_000_000, size: 30, stock: 1, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'TV', 'CCTV', 'Mesin Cuci'] },
    ],
  },
  // ---------- Bandung ----------
  {
    ownerIndex: 0,
    name: 'Kos Bandung Dago Asri',
    category: 'Kos Mahasiswa',
    gender: 'CAMPUR',
    address: 'Jl. Dago Asri No. 21, Dago',
    province: 'Jawa Barat',
    city: 'Bandung',
    district: 'Coblong',
    subdistrict: 'Dago',
    postalCode: '40135',
    latitude: -6.8828,
    longitude: 107.6102,
    description:
      'Kos asri di kawasan Dago dengan udara sejuk dan pemandangan kota. Dekat ITB, kafe hits, dan pusat oleh-oleh. Fasilitas lengkap dengan taman depan.',
    rating: 4.5,
    ratingCount: 41,
    nearby: ['ITB', 'Dago Park', 'Jalan Braga'],
    rooms: [
      { roomNumber: 'D1', floor: 1, price: 1_600_000, size: 12, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Parkir'] },
      { roomNumber: 'D2', floor: 1, price: 1_600_000, size: 12, stock: 1, status: 'BOOKED', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Parkir'] },
      { roomNumber: 'D3', floor: 2, price: 1_800_000, size: 15, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Parkir'] },
      { roomNumber: 'D4', floor: 2, price: 1_800_000, size: 15, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Parkir'] },
    ],
  },
  {
    ownerIndex: 1,
    name: 'Kos Mahasiswa Setiabudi',
    category: 'Kos Mahasiswa',
    gender: 'CAMPUR',
    address: 'Jl. Setiabudi No. 102, Gegerkalong',
    province: 'Jawa Barat',
    city: 'Bandung',
    district: 'Sukasari',
    subdistrict: 'Gegerkalong',
    postalCode: '40152',
    latitude: -6.8725,
    longitude: 107.5795,
    description:
      'Kos favorit mahasiswa di koridor Setiabudi, dekat UPI, Unpar, dan Politeknik. Lingkungan ramai namun tenang, kantin murah, dan WiFi stabil.',
    rating: 4.2,
    ratingCount: 67,
    nearby: ['UPI', 'Unpar', 'Rumah Mode'],
    rooms: [
      { roomNumber: 'S1', floor: 1, price: 1_100_000, size: 9, stock: 5, status: 'AVAILABLE', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'Dapur'] },
      { roomNumber: 'S2', floor: 1, price: 1_100_000, size: 9, stock: 2, status: 'BOOKED', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'Dapur'] },
      { roomNumber: 'S3', floor: 2, price: 1_300_000, size: 12, stock: 3, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Dapur'] },
    ],
  },
  {
    ownerIndex: 2,
    name: 'Kos Putra Cihampelas',
    category: 'Kos Putra',
    gender: 'PUTRA',
    address: 'Jl. Cihampelas No. 50, Cipaganti',
    province: 'Jawa Barat',
    city: 'Bandung',
    district: 'Coblong',
    subdistrict: 'Cipaganti',
    postalCode: '40131',
    latitude: -6.8921,
    longitude: 107.6064,
    description:
      'Kos khusus putra di kawasan Cihampelas, dekat pusat perbelanjaan dan ITB. Cocok untuk mahasiswa aktif dengan fasilitas lengkap dan akses mudah.',
    rating: 4.1,
    ratingCount: 29,
    nearby: ['Cihampelas Walk', 'ITB', 'Rumah Sakit Santo Borromeus'],
    rooms: [
      { roomNumber: 'C1', floor: 1, price: 1_400_000, size: 10, stock: 3, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Parkir', 'CCTV'] },
      { roomNumber: 'C2', floor: 1, price: 1_400_000, size: 10, stock: 1, status: 'BOOKED', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Parkir', 'CCTV'] },
      { roomNumber: 'C3', floor: 2, price: 1_600_000, size: 13, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Parkir', 'CCTV'] },
    ],
  },
  // ---------- Surabaya ----------
  {
    ownerIndex: 3,
    name: 'Kos Eksklusif Rungkut',
    category: 'Kos Premium',
    gender: 'CAMPUR',
    address: 'Jl. Rungkut Asri No. 33, Rungkut',
    province: 'Jawa Timur',
    city: 'Surabaya',
    district: 'Rungkut',
    subdistrict: 'Rungkut Tengah',
    postalCode: '60293',
    latitude: -7.3302,
    longitude: 112.7786,
    description:
      'Kos eksklusif di Rungkut dengan desain modern minimalis. Dekat SIER, kawasan industri, dan jalan tol. Fasilitas premium untuk pekerja profesional.',
    rating: 4.7,
    ratingCount: 38,
    nearby: ['SIER', 'Ciputra World', 'Pakuwon Trade Center'],
    rooms: [
      { roomNumber: 'R1', floor: 1, price: 2_000_000, size: 15, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'CCTV'] },
      { roomNumber: 'R2', floor: 1, price: 2_000_000, size: 15, stock: 1, status: 'BOOKED', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'CCTV'] },
      { roomNumber: 'R3', floor: 2, price: 2_400_000, size: 20, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'CCTV', 'TV'] },
    ],
  },
  {
    ownerIndex: 4,
    name: 'Kos Putri Airlangga',
    category: 'Kos Putri',
    gender: 'PUTRI',
    address: 'Jl. Airlangga No. 18, Airlangga',
    province: 'Jawa Timur',
    city: 'Surabaya',
    district: 'Gubeng',
    subdistrict: 'Airlangga',
    postalCode: '60286',
    latitude: -7.2793,
    longitude: 112.7667,
    description:
      'Kos khusus putri di area kampus UNAIR, aman dan tenang. Lingkungan hijau, dapur bersama bersih, dan pengelola ramah. Favorit mahasiswi kesehatan.',
    rating: 4.4,
    ratingCount: 52,
    nearby: ['UNAIR', 'RS Dr. Soetomo', 'Tunjungan Plaza'],
    rooms: [
      { roomNumber: '01', floor: 1, price: 1_500_000, size: 10, stock: 3, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Dapur', 'CCTV'] },
      { roomNumber: '02', floor: 1, price: 1_500_000, size: 10, stock: 2, status: 'BOOKED', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Dapur', 'CCTV'] },
      { roomNumber: '03', floor: 2, price: 1_700_000, size: 12, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Dapur', 'CCTV'] },
    ],
  },
  {
    ownerIndex: 0,
    name: 'Kos Mawar Manyar',
    category: 'Kos Mahasiswa',
    gender: 'CAMPUR',
    address: 'Jl. Manyar Kertoarjo No. 7, Manyar Sabrangan',
    province: 'Jawa Timur',
    city: 'Surabaya',
    district: 'Gubeng',
    subdistrict: 'Manyar Sabrangan',
    postalCode: '60284',
    latitude: -7.2697,
    longitude: 112.7633,
    description:
      'Kos nyaman di Manyar, strategis untuk mahasiswa ITS dan pekerja di kawasan MERR. Fasilitas lengkap, parkir luas, dan suasana kekeluargaan.',
    rating: 4.0,
    ratingCount: 44,
    nearby: ['ITS', 'MERR', 'Royal Plaza'],
    rooms: [
      { roomNumber: 'M1', floor: 1, price: 1_200_000, size: 9, stock: 4, status: 'AVAILABLE', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'Parkir', 'Mesin Cuci'] },
      { roomNumber: 'M2', floor: 1, price: 1_200_000, size: 9, stock: 2, status: 'BOOKED', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'Parkir', 'Mesin Cuci'] },
      { roomNumber: 'M3', floor: 2, price: 1_400_000, size: 11, stock: 3, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Parkir', 'Mesin Cuci'] },
    ],
  },
  // ---------- Yogyakarta ----------
  {
    ownerIndex: 1,
    name: 'Kos Jogja UGM Residence',
    category: 'Kos Mahasiswa',
    gender: 'CAMPUR',
    address: 'Jl. Kaliurang KM 4.5 No. 66, Caturtunggal',
    province: 'DI Yogyakarta',
    city: 'Yogyakarta',
    district: 'Depok',
    subdistrict: 'Caturtunggal',
    postalCode: '55281',
    latitude: -7.7636,
    longitude: 110.4064,
    description:
      'Kos premium di jantung kawasan kampus UGM. Ber-AC, WiFi fiber, dan fasilitas lengkap. 5 menit jalan kaki ke Fakultas Teknik dan pusat kegiatan mahasiswa.',
    rating: 4.6,
    ratingCount: 73,
    nearby: ['UGM', 'Safir Square', 'Gadjah Mada University'],
    rooms: [
      { roomNumber: 'G1', floor: 1, price: 1_750_000, size: 12, stock: 3, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'CCTV'] },
      { roomNumber: 'G2', floor: 1, price: 1_750_000, size: 12, stock: 1, status: 'BOOKED', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'CCTV'] },
      { roomNumber: 'G3', floor: 2, price: 1_950_000, size: 15, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'CCTV'] },
      { roomNumber: 'G4', floor: 2, price: 1_950_000, size: 15, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'CCTV'] },
    ],
  },
  {
    ownerIndex: 2,
    name: 'Kos Putri Kaliurang',
    category: 'Kos Putri',
    gender: 'PUTRI',
    address: 'Jl. Kaliurang KM 5 No. 12, Sleman',
    province: 'DI Yogyakarta',
    city: 'Yogyakarta',
    district: 'Depok',
    subdistrict: 'Karangmalang',
    postalCode: '55281',
    latitude: -7.7548,
    longitude: 110.4029,
    description:
      'Kos khusus putri dengan lingkungan asri dan aman. Dekat UNY, UGM, dan kampus lain di ring road utara. Tersedia kamar mandi dalam dan luar.',
    rating: 4.3,
    ratingCount: 36,
    nearby: ['UNY', 'UGM', 'Jogja City Mall'],
    rooms: [
      { roomNumber: 'P1', floor: 1, price: 1_400_000, size: 10, stock: 3, status: 'AVAILABLE', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'Dapur', 'CCTV'] },
      { roomNumber: 'P2', floor: 1, price: 1_400_000, size: 10, stock: 2, status: 'BOOKED', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'Dapur', 'CCTV'] },
      { roomNumber: 'P3', floor: 2, price: 1_600_000, size: 13, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Dapur', 'CCTV'] },
    ],
  },
  {
    ownerIndex: 3,
    name: 'Kos Premium Seturan',
    category: 'Kos Premium',
    gender: 'CAMPUR',
    address: 'Jl. Seturan Raya No. 21, Depok',
    province: 'DI Yogyakarta',
    city: 'Yogyakarta',
    district: 'Depok',
    subdistrict: 'Caturtunggal',
    postalCode: '55281',
    latitude: -7.7712,
    longitude: 110.4182,
    description:
      'Kos premium di Seturan, kawasan kos paling dicari di Jogja. Interior modern, perabot baru, dan fasilitas lengkap. Dekat UII, UPN, dan JNM.',
    rating: 4.7,
    ratingCount: 89,
    nearby: ['UII', 'UPN Veteran', 'Jogja National Museum'],
    rooms: [
      { roomNumber: 'S1', floor: 1, price: 2_000_000, size: 14, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'CCTV'] },
      { roomNumber: 'S2', floor: 1, price: 2_000_000, size: 14, stock: 1, status: 'BOOKED', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'CCTV'] },
      { roomNumber: 'S3', floor: 2, price: 2_300_000, size: 18, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'CCTV', 'TV'] },
    ],
  },
  {
    ownerIndex: 4,
    name: 'Kos Kampus Gadjah Mada',
    category: 'Kos Mahasiswa',
    gender: 'PUTRA',
    address: 'Jl. Kaliurang KM 4 No. 88, Senolowo',
    province: 'DI Yogyakarta',
    city: 'Yogyakarta',
    district: 'Depok',
    subdistrict: 'Caturtunggal',
    postalCode: '55281',
    latitude: -7.7657,
    longitude: 110.4082,
    description:
      'Kos khusus putra paling dekat dengan kampus UGM. Harga terjangkau untuk mahasiswa, fasilitas dasar lengkap, dan suasananya kondusif untuk belajar.',
    rating: 4.0,
    ratingCount: 61,
    nearby: ['UGM', 'GSP UGM', 'Wisma MM UGM'],
    rooms: [
      { roomNumber: 'A1', floor: 1, price: 950_000, size: 8, stock: 5, status: 'AVAILABLE', facilities: ['WiFi', 'Kamar Mandi', 'Kasur'] },
      { roomNumber: 'A2', floor: 1, price: 950_000, size: 8, stock: 3, status: 'BOOKED', facilities: ['WiFi', 'Kamar Mandi', 'Kasur'] },
      { roomNumber: 'A3', floor: 2, price: 1_100_000, size: 10, stock: 4, status: 'AVAILABLE', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'Lemari'] },
    ],
  },
  // ---------- Semarang ----------
  {
    ownerIndex: 0,
    name: 'Kos Tembalang Campus',
    category: 'Kos Mahasiswa',
    gender: 'CAMPUR',
    address: 'Jl. Tembalang Raya No. 14, Tembalang',
    province: 'Jawa Tengah',
    city: 'Semarang',
    district: 'Tembalang',
    subdistrict: 'Tembalang',
    postalCode: '50275',
    latitude: -7.0573,
    longitude: 110.4371,
    description:
      'Kos di kawasan kampus UNDIP Tembalang. Sangat cocok untuk mahasiswa dengan harga bersahabat, WiFi kencang, dan lingkungan yang tenang.',
    rating: 4.2,
    ratingCount: 55,
    nearby: ['UNDIP', 'Java Supermall', 'Gedung Serba Guna'],
    rooms: [
      { roomNumber: 'T1', floor: 1, price: 1_000_000, size: 9, stock: 4, status: 'AVAILABLE', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'Parkir'] },
      { roomNumber: 'T2', floor: 1, price: 1_000_000, size: 9, stock: 2, status: 'BOOKED', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'Parkir'] },
      { roomNumber: 'T3', floor: 2, price: 1_250_000, size: 12, stock: 3, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Parkir'] },
    ],
  },
  {
    ownerIndex: 1,
    name: 'Kos Putra Pandanaran',
    category: 'Kos Putra',
    gender: 'PUTRA',
    address: 'Jl. Pandanaran No. 40, Mugassari',
    province: 'Jawa Tengah',
    city: 'Semarang',
    district: 'Semarang Selatan',
    subdistrict: 'Mugassari',
    postalCode: '50249',
    latitude: -6.9981,
    longitude: 110.4258,
    description:
      'Kos khusus putra di jantung kota Semarang, dekat Tugu Muda dan pusat bisnis. Cocok untuk karyawan dan mahasiswa yang menginginkan akses mudah.',
    rating: 4.1,
    ratingCount: 27,
    nearby: ['Tugu Muda', 'DP Mall', 'Stasiun Tawang'],
    rooms: [
      { roomNumber: 'P1', floor: 1, price: 1_350_000, size: 10, stock: 3, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'CCTV'] },
      { roomNumber: 'P2', floor: 1, price: 1_350_000, size: 10, stock: 1, status: 'BOOKED', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'CCTV'] },
      { roomNumber: 'P3', floor: 2, price: 1_500_000, size: 13, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'CCTV'] },
    ],
  },
  {
    ownerIndex: 2,
    name: 'Kos Nyaman Simpang Lima',
    category: 'Kos Mahasiswa',
    gender: 'CAMPUR',
    address: 'Jl. Simpang Lima No. 3, Pleburan',
    province: 'Jawa Tengah',
    city: 'Semarang',
    district: 'Semarang Selatan',
    subdistrict: 'Pleburan',
    postalCode: '50241',
    latitude: -6.9914,
    longitude: 110.4229,
    description:
      'Kos nyaman di pusat kota dekat Simpang Lima. Dekat kampus, mall, dan kuliner. Fasilitas lengkap dengan dapur dan ruang bersama yang luas.',
    rating: 4.3,
    ratingCount: 32,
    nearby: ['Simpang Lima', 'Citraland Mall', 'Universitas Katolik Soegijapranata'],
    rooms: [
      { roomNumber: 'N1', floor: 1, price: 1_450_000, size: 10, stock: 3, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Dapur', 'Parkir'] },
      { roomNumber: 'N2', floor: 1, price: 1_450_000, size: 10, stock: 1, status: 'BOOKED', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Dapur', 'Parkir'] },
      { roomNumber: 'N3', floor: 2, price: 1_650_000, size: 13, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Dapur', 'Parkir'] },
    ],
  },
  // ---------- Malang ----------
  {
    ownerIndex: 3,
    name: 'Kos Mahasiswa UB Malang',
    category: 'Kos Mahasiswa',
    gender: 'CAMPUR',
    address: 'Jl. Veteran No. 24, Ketawanggede',
    province: 'Jawa Timur',
    city: 'Malang',
    district: 'Lowokwaru',
    subdistrict: 'Ketawanggede',
    postalCode: '65145',
    latitude: -7.9506,
    longitude: 112.6145,
    description:
      'Kos strategis di kawasan kampus Universitas Brawijaya. Dekat Fakultas Kedokteran dan Teknik, dengan harga ramah mahasiswa dan fasilitas lengkap.',
    rating: 4.4,
    ratingCount: 48,
    nearby: ['Universitas Brawijaya', 'UB Hospital', 'Dieng Plaza'],
    rooms: [
      { roomNumber: 'V1', floor: 1, price: 1_200_000, size: 9, stock: 4, status: 'AVAILABLE', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'Dapur', 'Mesin Cuci'] },
      { roomNumber: 'V2', floor: 1, price: 1_200_000, size: 9, stock: 2, status: 'BOOKED', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'Dapur', 'Mesin Cuci'] },
      { roomNumber: 'V3', floor: 2, price: 1_400_000, size: 12, stock: 3, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Dapur', 'Mesin Cuci'] },
    ],
  },
  {
    ownerIndex: 4,
    name: 'Kos Putri Soekarno Hatta',
    category: 'Kos Putri',
    gender: 'PUTRI',
    address: 'Jl. Soekarno Hatta No. 88, Jatimulyo',
    province: 'Jawa Timur',
    city: 'Malang',
    district: 'Lowokwaru',
    subdistrict: 'Jatimulyo',
    postalCode: '65141',
    latitude: -7.9404,
    longitude: 112.6224,
    description:
      'Kos khusus putri di kawasan Soekarno Hatta, dekat UIN Malang dan Universitas Negeri Malang. Aman, bersih, dan pengelola sangat ramah.',
    rating: 4.5,
    ratingCount: 39,
    nearby: ['UIN Malang', 'Universitas Negeri Malang', 'Malang Town Square'],
    rooms: [
      { roomNumber: 'K1', floor: 1, price: 1_300_000, size: 9, stock: 3, status: 'AVAILABLE', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'CCTV', 'Dapur'] },
      { roomNumber: 'K2', floor: 1, price: 1_300_000, size: 9, stock: 1, status: 'BOOKED', facilities: ['WiFi', 'Kamar Mandi', 'Kasur', 'CCTV', 'Dapur'] },
      { roomNumber: 'K3', floor: 2, price: 1_500_000, size: 12, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'CCTV', 'Dapur'] },
    ],
  },
  {
    ownerIndex: 0,
    name: 'Kos Eksklusif Ijen Boulevard',
    category: 'Kos Premium',
    gender: 'CAMPUR',
    address: 'Jl. Ijen Boulevard No. 15, Gading Kasri',
    province: 'Jawa Timur',
    city: 'Malang',
    district: 'Klojen',
    subdistrict: 'Gading Kasri',
    postalCode: '65115',
    latitude: -7.9657,
    longitude: 112.6194,
    description:
      'Kos eksklusif di kawasan elite Ijen Boulevard dengan arsitektur klasik dan taman indah. Nyaman untuk profesional dan mahasiswa pascasarjana.',
    rating: 4.8,
    ratingCount: 22,
    nearby: ['Kawasan Ijen', 'Toko Oen', 'Kajoetangan Heritage'],
    rooms: [
      { roomNumber: 'I1', floor: 1, price: 2_200_000, size: 16, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'CCTV'] },
      { roomNumber: 'I2', floor: 1, price: 2_200_000, size: 16, stock: 1, status: 'BOOKED', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'CCTV'] },
      { roomNumber: 'I3', floor: 2, price: 2_600_000, size: 22, stock: 2, status: 'AVAILABLE', facilities: ['WiFi', 'AC', 'Kamar Mandi', 'Kasur', 'Lemari', 'Meja Belajar', 'Water Heater', 'CCTV', 'TV'] },
    ],
  },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function pickFacilities(rng: number): string[] {
  const count = 4 + (rng % 5);
  const picked: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (rng + i * 7) % FACILITY_POOL.length;
    if (!picked.includes(FACILITY_POOL[idx])) picked.push(FACILITY_POOL[idx]);
  }
  return picked;
}

function pickRules(rng: number): string[] {
  const count = 3 + (rng % 3);
  const picked: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (rng + i * 5) % RULE_POOL.length;
    if (!picked.includes(RULE_POOL[idx])) picked.push(RULE_POOL[idx]);
  }
  return picked;
}

async function seedAdmin(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@bridgekos.id';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const adminName = process.env.ADMIN_NAME ?? 'BridgeKos Admin';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    logger.info(`Admin already exists: ${adminEmail}`);
    return;
  }

  const passwordHash = await hashPassword(adminPassword);
  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      fullName: adminName,
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });
  logger.info(`Admin created: ${adminEmail} (${adminPassword})`);
}

async function seedBoardingHouses(): Promise<void> {
  const existingCount = await prisma.boardingHouse.count();
  if (existingCount > 0) {
    logger.info(`Boarding houses already seeded (${existingCount}); skipping`);
    return;
  }

  // 1. Create owners
  const ownerIds: string[] = [];
  const passwordHash = await hashPassword(OWNER_PASSWORD);

  for (const [i, spec] of OWNERS.entries()) {
    const user = await prisma.user.create({
      data: {
        email: spec.email,
        passwordHash,
        fullName: spec.fullName,
        role: 'OWNER',
        isEmailVerified: true,
        phone: `+62${spec.whatsapp.slice(1)}`,
        status: 'ACTIVE',
      },
    });

    const owner = await prisma.owner.create({
      data: {
        userId: user.id,
        businessName: spec.businessName,
        whatsappNumber: spec.whatsapp,
        verificationStatus: spec.verificationStatus,
        verifiedAt: spec.verificationStatus === 'VERIFIED' ? new Date() : null,
      },
    });

    const now = new Date();
    await prisma.subscription.create({
      data: {
        ownerId: owner.id,
        plan: spec.plan,
        billingCycle: 'MONTHLY',
        price: spec.plan === 'FREE' ? 0 : 149_000,
        status: 'ACTIVE',
        startsAt: now,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
      },
    });

    ownerIds.push(owner.id);
    logger.info(`Owner created: ${spec.businessName} (${spec.email} / ${OWNER_PASSWORD})`);
  }

  // 2. Create boarding houses with images and rooms
  let houseIndex = 0;
  for (const [i, spec] of BOARDINGS.entries()) {
    const slug = slugify(spec.name);
    const rng = (i * 13) % 97;
    const now = new Date();

    const house = await prisma.boardingHouse.create({
      data: {
        ownerId: ownerIds[spec.ownerIndex],
        name: spec.name,
        slug,
        description: spec.description,
        category: spec.category,
        gender: spec.gender,
        address: spec.address,
        province: spec.province,
        city: spec.city,
        district: spec.district,
        subdistrict: spec.subdistrict,
        postalCode: spec.postalCode,
        latitude: spec.latitude,
        longitude: spec.longitude,
        googleMapsUrl: `https://maps.google.com/?q=${spec.latitude},${spec.longitude}`,
        thumbnail: `https://picsum.photos/seed/bk-${slug}/800/600`,
        facilities: pickFacilities(rng),
        rules: pickRules(rng),
        nearbyPlaces: spec.nearby,
        operationalHours: { checkIn: '13:00', checkOut: '12:00' },
        status: 'PUBLISHED',
        rating: spec.rating,
        ratingCount: spec.ratingCount,
        publishedAt: now,
      },
    });

    await prisma.boardingImage.createMany({
      data: [
        { boardingHouseId: house.id, url: `https://picsum.photos/seed/bk-${slug}-1/800/600`, isThumbnail: true, order: 1 },
        { boardingHouseId: house.id, url: `https://picsum.photos/seed/bk-${slug}-2/800/600`, isThumbnail: false, order: 2 },
        { boardingHouseId: house.id, url: `https://picsum.photos/seed/bk-${slug}-3/800/600`, isThumbnail: false, order: 3 },
        { boardingHouseId: house.id, url: `https://picsum.photos/seed/bk-${slug}-4/800/600`, isThumbnail: false, order: 4 },
      ],
    });

    for (const room of spec.rooms) {
      await prisma.room.create({
        data: {
          boardingHouseId: house.id,
          roomNumber: room.roomNumber,
          floor: room.floor,
          price: room.price,
          size: room.size,
          stock: room.stock,
          description: `Kamar ${room.roomNumber} - lantai ${room.floor}, luas ${room.size} m2`,
          facilities: room.facilities,
          status: room.status,
        },
      });
    }

    houseIndex += 1;
  }

  logger.info(`Seeded ${houseIndex} boarding houses with owners, images, and rooms`);
}

async function main(): Promise<void> {
  await seedAdmin();
  await seedBoardingHouses();
}

main()
  .catch((err) => {
    logger.error({ err }, 'Seed failed');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
