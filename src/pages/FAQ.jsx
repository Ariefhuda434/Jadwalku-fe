import { useState } from 'react';
import Card from '../components/ui/Card';
import { ChevronDown, HelpCircle, BookOpen, User, Shield, Smartphone, MessageCircle } from 'lucide-react';

const faqData = [
  {
    kategori: 'Umum',
    icon: HelpCircle,
    items: [
      {
        q: 'Apa itu JadwalKu?',
        a: 'JadwalKu adalah aplikasi pengingat jadwal kuliah dan tugas yang dirancang khusus untuk membantu mahasiswa mengatur perkuliahan dengan lebih mudah dan terstruktur.',
      },
      {
        q: 'Apakah JadwalKu gratis?',
        a: 'Ya, JadwalKu gratis digunakan oleh seluruh mahasiswa. Cukup daftar dengan email Anda dan mulai atur jadwal kuliah serta tugas Anda.',
      },
      {
        q: 'Siapa yang membuat JadwalKu?',
        a: 'JadwalKu dikembangkan oleh tim pengembang sebagai bagian dari proyek pengembangan aplikasi web.',
      },
    ],
  },
  {
    kategori: 'Akun & Login',
    icon: User,
    items: [
      {
        q: 'Bagaimana cara mendaftar?',
        a: 'Klik "Daftar" di halaman login, isi username, email, dan password (minimal 6 karakter). Setelah berhasil, Anda akan diarahkan ke halaman login untuk masuk.',
      },
      {
        q: 'Saya lupa password, bagaimana?',
        a: 'Saat ini fitur reset password masih dalam pengembangan. Silakan hubungi admin untuk membantu mereset password Anda.',
      },
      {
        q: 'Apakah data saya aman?',
        a: 'Ya, password Anda dienkripsi menggunakan bcrypt sebelum disimpan. Token JWT digunakan untuk mengamankan sesi Anda.',
      },
    ],
  },
  {
    kategori: 'Jadwal Kuliah',
    icon: BookOpen,
    items: [
      {
        q: 'Bagaimana cara menambah jadwal kuliah?',
        a: 'Buka halaman Jadwal, klik tombol "+ Tambah Jadwal", lalu isi hari, mata kuliah, jam mulai, jam selesai, serta opsional ruang dan dosen.',
      },
      {
        q: 'Bisakah saya mengedit jadwal yang sudah dibuat?',
        a: 'Tentu. Klik ikon pensil pada jadwal yang ingin diedit, ubah data yang diperlukan, lalu klik "Simpan".',
      },
      {
        q: 'Bagaimana jika ada jadwal di hari yang sama?',
        a: 'Jadwal akan ditampilkan berurutan berdasarkan jam mulai. Anda bisa menambahkan banyak jadwal di hari yang sama.',
      },
      {
        q: 'Apa yang dimaksud dengan dosen dan ruang opsional?',
        a: 'Anda bisa mengosongkan field dosen dan ruang jika belum tahu. Field tersebut bisa diisi atau diedit kapan saja.',
      },
    ],
  },
  {
    kategori: 'Tugas',
    icon: MessageCircle,
    items: [
      {
        q: 'Bagaimana cara menambah tugas?',
        a: 'Buka halaman Tugas, klik "+ Tambah Tugas", isi judul, mata kuliah, deadline, prioritas, dan deskripsi jika perlu.',
      },
      {
        q: 'Apa arti prioritas tugas?',
        a: 'Prioritas tugas terdiri dari Rendah, Sedang, dan Tinggi. Gunakan prioritas tinggi untuk tugas yang mendesak, sedang untuk tugas biasa, dan rendah untuk tugas ringan.',
      },
      {
        q: 'Bagaimana cara menandai tugas selesai?',
        a: 'Klik lingkaran di sebelah kiri tugas untuk mengubah status dari "Aktif" menjadi "Selesai". Klik lagi untuk mengaktifkannya kembali.',
      },
      {
        q: 'Apa perbedaan tab Aktif dan Selesai?',
        a: 'Tab "Aktif" menampilkan tugas yang belum selesai, tab "Selesai" menampilkan tugas yang sudah ditandai selesai, dan "Semua" menampilkan keduanya.',
      },
    ],
  },
  {
    kategori: 'Dashboard & Kalender',
    icon: Smartphone,
    items: [
      {
        q: 'Apa yang ditampilkan di Dashboard?',
        a: 'Dashboard menampilkan jadwal hari ini, deadline tugas terdekat (7 hari ke depan), progress bar tugas, mini kalender, dan 3 deadline terdekat.',
      },
      {
        q: 'Bagaimana cara melihat jadwal di kalender?',
        a: 'Buka halaman Kalender, klik tanggal tertentu untuk melihat detail jadwal dan deadline tugas di tanggal tersebut.',
      },
      {
        q: 'Apa arti titik warna di kalender?',
        a: 'Titik biru menandakan ada jadwal kuliah, titik merah menandakan ada deadline tugas di tanggal tersebut.',
      },
    ],
  },
  {
    kategori: 'Notifikasi',
    icon: Shield,
    items: [
      {
        q: 'Bagaimana cara kerja notifikasi?',
        a: 'Sistem akan memberi notifikasi untuk jadwal hari ini dan deadline tugas besok. Notifikasi bisa dilihat dengan mengklik ikon lonceng di pojok kanan atas.',
      },
      {
        q: 'Apakah notifikasi dikirim secara real-time?',
        a: 'Notifikasi diperbarui secara periodik setiap 30 detik. Jumlah notifikasi belum dibaca akan muncul sebagai badge merah di ikon lonceng.',
      },
      {
        q: 'Bagaimana cara menandai notifikasi sudah dibaca?',
        a: 'Klik notifikasi untuk menandainya sudah dibaca, atau klik "Tandai semua dibaca" untuk menandai semua notifikasi.',
      },
    ],
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(index) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Frequently Asked Questions
        </h1>
        <p className="text-text-secondary mt-2 max-w-xl mx-auto">
          Temukan jawaban dari pertanyaan yang sering diajukan tentang JadwalKu.
          Dibuat oleh <span className="font-semibold text-primary">Tim Developer</span>.
        </p>
      </div>

      <div className="space-y-8">
        {faqData.map((kategori, ki) => {
          const KatIcon = kategori.icon;
          return (
            <div key={kategori.kategori}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary-bg flex items-center justify-center">
                  <KatIcon size={16} className="text-primary" />
                </div>
                <h2 className="font-heading font-semibold text-lg text-text-primary">
                  {kategori.kategori}
                </h2>
              </div>

              <Card className="divide-y divide-border overflow-hidden">
                {kategori.items.map((item, ii) => {
                  const globalIndex = `${ki}-${ii}`;
                  const isOpen = openIndex === globalIndex;

                  return (
                    <div key={ii}>
                      <button
                        onClick={() => toggle(globalIndex)}
                        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-bg-page/50 transition-colors"
                      >
                        <span className="font-medium text-text-primary text-sm">
                          {item.q}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-text-muted shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 animate-slide-up">
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card>
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-6 rounded-xl bg-primary-bg/50 border border-primary/20 text-center">
        <p className="text-sm text-text-secondary">
          Masih ada pertanyaan? Hubungi tim pengembang untuk bantuan lebih lanjut.
        </p>
      </div>
    </div>
  );
}
