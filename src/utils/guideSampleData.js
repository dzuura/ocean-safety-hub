/**
 * Sample Data untuk Guide Module
 * Data contoh panduan keselamatan berlayar
 */

const sampleGuides = [
  {
    title: "Periksa Pelampung Keselamatan",
    description: "Pastikan semua pelampung keselamatan dalam kondisi baik dan mudah dijangkau. Periksa tali pengikat, kondisi bahan, dan pastikan ukuran sesuai dengan penumpang. Setiap penumpang harus memiliki pelampung yang sesuai.",
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500",
    video_url: "https://www.youtube.com/watch?v=sample_life_jacket",
    category: "safety",
    priority: 1,
    estimated_time_minutes: 5,
    conditions: {
      trip_purposes: ["fishing", "transport", "recreation", "emergency"],
      boat_types: ["perahu_kecil", "kapal_nelayan", "kapal_besar"],
      duration_ranges: ["short", "medium", "long"],
      passenger_ranges: ["solo", "small", "medium", "large"]
    },
    is_mandatory: true,
    tags: ["keselamatan", "pelampung", "wajib", "penumpang"]
  },
  {
    title: "Periksa Kondisi Mesin Kapal",
    description: "Lakukan pemeriksaan menyeluruh pada mesin kapal sebelum berlayar. Periksa oli mesin, air radiator, bahan bakar, dan pastikan tidak ada kebocoran. Test starter dan idle mesin untuk memastikan performa optimal.",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
    video_url: "https://www.youtube.com/watch?v=sample_engine_check",
    category: "safety",
    priority: 2,
    estimated_time_minutes: 15,
    conditions: {
      trip_purposes: ["fishing", "transport", "recreation"],
      boat_types: ["kapal_nelayan", "kapal_besar"],
      duration_ranges: ["medium", "long"],
      passenger_ranges: ["small", "medium", "large"]
    },
    is_mandatory: true,
    tags: ["mesin", "perawatan", "wajib", "kapal"]
  },
  {
    title: "Siapkan Alat Komunikasi Darurat",
    description: "Pastikan radio komunikasi, HP waterproof, atau alat komunikasi darurat lainnya dalam kondisi baik dan baterai penuh. Simpan nomor penting seperti SAR, Syahbandar, dan keluarga.",
    image_url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=500",
    video_url: "https://www.youtube.com/watch?v=sample_communication",
    category: "emergency",
    priority: 1,
    estimated_time_minutes: 10,
    conditions: {
      trip_purposes: ["fishing", "transport", "recreation", "emergency"],
      boat_types: ["perahu_kecil", "kapal_nelayan", "kapal_besar"],
      duration_ranges: ["medium", "long"],
      passenger_ranges: ["solo", "small", "medium", "large"]
    },
    is_mandatory: true,
    tags: ["komunikasi", "darurat", "radio", "hp"]
  },
  {
    title: "Periksa Peralatan Navigasi",
    description: "Pastikan kompas, GPS, dan peta laut dalam kondisi baik. Kalibrasi kompas dan pastikan GPS mendapat sinyal yang baik. Siapkan peta cadangan dan tandai rute perjalanan.",
    image_url: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=500",
    video_url: "https://www.youtube.com/watch?v=sample_navigation",
    category: "navigation",
    priority: 2,
    estimated_time_minutes: 8,
    conditions: {
      trip_purposes: ["fishing", "transport", "recreation"],
      boat_types: ["kapal_nelayan", "kapal_besar"],
      duration_ranges: ["medium", "long"],
      passenger_ranges: ["solo", "small", "medium", "large"]
    },
    is_mandatory: false,
    tags: ["navigasi", "kompas", "gps", "peta"]
  },
  {
    title: "Siapkan P3K dan Obat-obatan",
    description: "Pastikan kotak P3K lengkap dengan perban, antiseptik, obat sakit kepala, obat mabuk laut, dan obat-obatan pribadi. Periksa tanggal kedaluwarsa semua obat.",
    image_url: "https://images.unsplash.com/photo-1603398938795-de4b8e3b8b3b?w=500",
    video_url: "https://www.youtube.com/watch?v=sample_first_aid",
    category: "safety",
    priority: 3,
    estimated_time_minutes: 5,
    conditions: {
      trip_purposes: ["fishing", "transport", "recreation"],
      boat_types: ["perahu_kecil", "kapal_nelayan", "kapal_besar"],
      duration_ranges: ["medium", "long"],
      passenger_ranges: ["small", "medium", "large"]
    },
    is_mandatory: false,
    tags: ["p3k", "obat", "kesehatan", "darurat"]
  },
  {
    title: "Periksa Kondisi Cuaca Terkini",
    description: "Cek prakiraan cuaca dari BMKG atau aplikasi cuaca terpercaya. Perhatikan kecepatan angin, tinggi gelombang, dan kemungkinan hujan. Tunda perjalanan jika cuaca buruk.",
    image_url: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=500",
    video_url: "https://www.youtube.com/watch?v=sample_weather_check",
    category: "general",
    priority: 1,
    estimated_time_minutes: 3,
    conditions: {
      trip_purposes: ["fishing", "transport", "recreation", "emergency"],
      boat_types: ["perahu_kecil", "kapal_nelayan", "kapal_besar"],
      duration_ranges: ["short", "medium", "long"],
      passenger_ranges: ["solo", "small", "medium", "large"]
    },
    is_mandatory: true,
    tags: ["cuaca", "bmkg", "gelombang", "angin"]
  },
  {
    title: "Siapkan Makanan dan Air Minum",
    description: "Bawa makanan dan air minum yang cukup untuk perjalanan plus cadangan. Pastikan air minum bersih dan makanan tidak mudah basi. Bawa termos untuk air panas jika diperlukan.",
    image_url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500",
    video_url: "https://www.youtube.com/watch?v=sample_food_water",
    category: "general",
    priority: 4,
    estimated_time_minutes: 10,
    conditions: {
      trip_purposes: ["fishing", "transport", "recreation"],
      boat_types: ["perahu_kecil", "kapal_nelayan", "kapal_besar"],
      duration_ranges: ["medium", "long"],
      passenger_ranges: ["solo", "small", "medium", "large"]
    },
    is_mandatory: false,
    tags: ["makanan", "air", "bekal", "perjalanan"]
  },
  {
    title: "Periksa Sistem Kelistrikan",
    description: "Pastikan sistem kelistrikan kapal berfungsi dengan baik. Periksa lampu navigasi, lampu sorot, dan sistem pengisian baterai. Bawa baterai cadangan jika diperlukan.",
    image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500",
    video_url: "https://www.youtube.com/watch?v=sample_electrical",
    category: "safety",
    priority: 3,
    estimated_time_minutes: 7,
    conditions: {
      trip_purposes: ["fishing", "transport", "recreation"],
      boat_types: ["kapal_nelayan", "kapal_besar"],
      duration_ranges: ["medium", "long"],
      passenger_ranges: ["small", "medium", "large"]
    },
    is_mandatory: false,
    tags: ["listrik", "lampu", "baterai", "navigasi"]
  },
  {
    title: "Informasikan Rencana Perjalanan",
    description: "Beritahu keluarga atau teman tentang rencana perjalanan, rute yang akan dilalui, dan perkiraan waktu kembali. Berikan nomor kontak yang bisa dihubungi dalam keadaan darurat.",
    image_url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=500",
    video_url: "https://www.youtube.com/watch?v=sample_trip_plan",
    category: "general",
    priority: 2,
    estimated_time_minutes: 5,
    conditions: {
      trip_purposes: ["fishing", "transport", "recreation"],
      boat_types: ["perahu_kecil", "kapal_nelayan", "kapal_besar"],
      duration_ranges: ["medium", "long"],
      passenger_ranges: ["solo", "small", "medium", "large"]
    },
    is_mandatory: true,
    tags: ["rencana", "keluarga", "kontak", "darurat"]
  },
  {
    title: "Periksa Alat Pemadam Kebakaran",
    description: "Pastikan alat pemadam api dalam kondisi baik dan mudah dijangkau. Periksa tekanan tabung dan tanggal kedaluwarsa. Pastikan semua crew tahu cara menggunakannya.",
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500",
    video_url: "https://www.youtube.com/watch?v=sample_fire_extinguisher",
    category: "emergency",
    priority: 2,
    estimated_time_minutes: 5,
    conditions: {
      trip_purposes: ["fishing", "transport", "recreation"],
      boat_types: ["kapal_nelayan", "kapal_besar"],
      duration_ranges: ["medium", "long"],
      passenger_ranges: ["small", "medium", "large"]
    },
    is_mandatory: false,
    tags: ["pemadam", "kebakaran", "darurat", "keselamatan"]
  }
];

const sampleTripScenarios = [
  {
    name: "Nelayan Pagi - Perahu Kecil",
    trip_info: {
      trip_purpose: "fishing",
      duration_minutes: 180,
      passenger_count: 2,
      boat_type: "perahu_kecil",
      weather_condition: "calm",
      urgency_level: "normal"
    },
    expected_guides: 6 // Guides yang seharusnya muncul
  },
  {
    name: "Transport Antar Pulau - Kapal Nelayan",
    trip_info: {
      trip_purpose: "transport",
      duration_minutes: 480,
      passenger_count: 8,
      boat_type: "kapal_nelayan",
      weather_condition: "moderate",
      urgency_level: "normal"
    },
    expected_guides: 9
  },
  {
    name: "Rekreasi Keluarga - Kapal Besar",
    trip_info: {
      trip_purpose: "recreation",
      duration_minutes: 360,
      passenger_count: 15,
      boat_type: "kapal_besar",
      weather_condition: "calm",
      urgency_level: "low"
    },
    expected_guides: 8
  },
  {
    name: "Darurat SAR - Kapal Besar",
    trip_info: {
      trip_purpose: "emergency",
      duration_minutes: 120,
      passenger_count: 6,
      boat_type: "kapal_besar",
      weather_condition: "rough",
      urgency_level: "critical"
    },
    expected_guides: 4
  }
];

module.exports = {
  sampleGuides,
  sampleTripScenarios
};
