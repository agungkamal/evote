import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Printer,
  RefreshCw,
  UserCheck,
  GraduationCap,
  Briefcase,
  BookOpen,
  RotateCcw,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';
import type { ElectionPeriod, SchoolConfig, Student, Committee } from '../types/index.ts';
import { votingStore } from '../services/storage.ts';

interface AdminAttendanceListProps {
  activePeriod: ElectionPeriod;
  schoolConfig: SchoolConfig;
  committees?: Committee[];
}

export const AdminAttendanceList: React.FC<AdminAttendanceListProps> = ({
  activePeriod,
  schoolConfig,
  committees = [],
}) => {
  // Reactive subscription to storage so voting events in real-time immediately update attendance
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsub = votingStore.subscribe(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  const allStudents = votingStore.getStudents(activePeriod.id);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VOTED' | 'NOT_VOTED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'SISWA' | 'GURU' | 'TATA_USAHA'>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'nisn_asc' | 'time_desc'>('name_asc');

  // Distinct classes / units
  const classList = Array.from(new Set(allStudents.map((s) => s.class_name))).filter(Boolean).sort();

  // Filtered attendance list
  const filteredStudents = allStudents.filter((std) => {
    // Status
    if (statusFilter === 'VOTED' && !std.has_voted) return false;
    if (statusFilter === 'NOT_VOTED' && std.has_voted) return false;

    // Category
    const vType = std.voter_type || 'SISWA';
    if (categoryFilter !== 'ALL' && vType !== categoryFilter) return false;

    // Class
    if (classFilter !== 'ALL' && std.class_name !== classFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = std.name.toLowerCase().includes(q);
      const matchNisn = std.nisn.toLowerCase().includes(q);
      const matchClass = std.class_name.toLowerCase().includes(q);
      if (!matchName && !matchNisn && !matchClass) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'id');
    if (sortBy === 'name_desc') return b.name.localeCompare(a.name, 'id');
    if (sortBy === 'nisn_asc') return a.nisn.localeCompare(b.nisn, 'id', { numeric: true });
    if (sortBy === 'time_desc') {
      const timeA = a.voted_at ? new Date(a.voted_at).getTime() : 0;
      const timeB = b.voted_at ? new Date(b.voted_at).getTime() : 0;
      return timeB - timeA;
    }
    return 0;
  });

  // Attendance metrics
  const totalDpt = allStudents.length;
  const votedCount = allStudents.filter((s) => s.has_voted).length;
  const notVotedCount = totalDpt - votedCount;
  const turnoutPct = totalDpt > 0 ? ((votedCount / totalDpt) * 100).toFixed(1) : '0';

  // Per category metrics
  const siswaTotal = allStudents.filter((s) => (s.voter_type || 'SISWA') === 'SISWA').length;
  const siswaVoted = allStudents.filter((s) => (s.voter_type || 'SISWA') === 'SISWA' && s.has_voted).length;

  const guruTotal = allStudents.filter((s) => s.voter_type === 'GURU').length;
  const guruVoted = allStudents.filter((s) => s.voter_type === 'GURU' && s.has_voted).length;

  const tuTotal = allStudents.filter((s) => s.voter_type === 'TATA_USAHA').length;
  const tuVoted = allStudents.filter((s) => s.voter_type === 'TATA_USAHA' && s.has_voted).length;

  // Print Handler
  const handlePrintAttendance = () => {
    window.print();
  };

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setClassFilter('ALL');
    setSearchQuery('');
    setSortBy('name_asc');
  };

  const ketuaPanitia = committees.find((c) => c.role === 'Ketua Panitia') || committees[0];

  return (
    <div className="space-y-6">
      
      {/* 1. Header Toolbar (Hidden When Printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base">
              Daftar Kehadiran Pemilih (Presensi E-Voting)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Realtime Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Data kehadiran otomatis tersinkronisasi saat pemilih (Siswa, Dewan Guru, dan Staf TU) memberikan suara sah di Bilik Suara Digital. Siap diekspor ke PDF / dicetak sebagai dokumen presensi legal.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrintAttendance}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            title="Cetak atau Simpan sebagai PDF (A4)"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Cetak / Ekspor PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* 2. Key Statistics Cards (Hidden When Printing) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Total DPT Terdaftar</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            {totalDpt} <span className="text-xs font-normal text-slate-500">Pemilih</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Siswa, Guru &amp; Staf TU</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
            <span>Sudah Hadir &amp; Memilih</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-700">
            {votedCount} <span className="text-xs font-bold text-emerald-600">({turnoutPct}%)</span>
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-0.5">Hak suara sah tercatat</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
            <span>Belum Hadir / Memilih</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-700">
            {notVotedCount} <span className="text-xs font-bold text-amber-600">({totalDpt > 0 ? ((notVotedCount / totalDpt) * 100).toFixed(1) : 0}%)</span>
          </div>
          <p className="text-[11px] text-amber-700/80 mt-0.5">Menunggu giliran presensi</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-semibold">Partisipasi per Kategori</span>
          <div className="space-y-1 mt-1 text-[11px]">
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-blue-600" /> Siswa:</span>
              <span className="font-mono font-bold">{siswaVoted}/{siswaTotal} ({siswaTotal > 0 ? Math.round((siswaVoted / siswaTotal) * 100) : 0}%)</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3 text-purple-600" /> Guru:</span>
              <span className="font-mono font-bold">{guruVoted}/{guruTotal} ({guruTotal > 0 ? Math.round((guruVoted / guruTotal) * 100) : 0}%)</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-teal-600" /> Staf TU:</span>
              <span className="font-mono font-bold">{tuVoted}/{tuTotal} ({tuTotal > 0 ? Math.round((tuVoted / tuTotal) * 100) : 0}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Interactive Filters Bar (Hidden When Printing) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 no-print">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pemilih, NOMOR INDUK PEMILIH, atau kelas..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
              >
                <option value="ALL">Semua Kehadiran ({totalDpt})</option>
                <option value="VOTED">Hadir / Sudah Memilih ({votedCount})</option>
                <option value="NOT_VOTED">Belum Hadir ({notVotedCount})</option>
              </select>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold text-slate-700"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="SISWA">Siswa Pemilih</option>
              <option value="GURU">Dewan Guru</option>
              <option value="TATA_USAHA">Staf Tata Usaha</option>
            </select>

            {/* Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold text-slate-700"
            >
              <option value="ALL">Semua Rombel / Jabatan</option>
              {classList.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold text-slate-700"
            >
              <option value="name_asc">Urut: Nama (A - Z)</option>
              <option value="name_desc">Urut: Nama (Z - A)</option>
              <option value="nisn_asc">Urut: Nomor Induk</option>
              <option value="time_desc">Urut: Waktu Kehadiran Terbaru</option>
            </select>

            {(statusFilter !== 'ALL' || categoryFilter !== 'ALL' || classFilter !== 'ALL' || searchQuery.trim()) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset semua filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Menampilkan <strong>{filteredStudents.length}</strong> dari total {totalDpt} data pemilih
          </span>
          <span className="font-mono">
            {activePeriod.year_label} · Sesi: {activePeriod.voting_session_status}
          </span>
        </div>
      </div>

      {/* 4. Interactive Table View on Screen (Hidden in Print) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs no-print">
        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200 text-[11px] sticky top-0 z-10 shadow-2xs">
              <tr>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4">NOMOR INDUK PEMILIH</th>
                <th className="py-3 px-4">Nama Pemilih</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-4">Kelas / Jabatan</th>
                <th className="py-3 px-3 text-center">Status Kehadiran</th>
                <th className="py-3 px-4">Waktu Presensi</th>
                <th className="py-3 px-4 text-center">Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada data pemilih yang sesuai dengan kombinasi filter atau pencarian saat ini.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, idx) => {
                  const vType = std.voter_type || 'SISWA';
                  const isHadir = std.has_voted;

                  return (
                    <tr
                      key={std.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isHadir ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-center text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{std.nisn}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{std.name}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            vType === 'GURU'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : vType === 'TATA_USAHA'
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {vType === 'GURU' ? <GraduationCap className="w-3 h-3" /> : vType === 'TATA_USAHA' ? <Briefcase className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                          {vType === 'GURU' ? 'Guru' : vType === 'TATA_USAHA' ? 'Staf TU' : 'Siswa'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-700">{std.class_name}</td>
                      <td className="py-2.5 px-3 text-center">
                        {isHadir ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>HADIR</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Belum Hadir</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">
                        {std.voted_at ? (
                          <span>
                            {new Date(std.voted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {isHadir ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold">
                            TPS-DIGITAL
                          </span>
                        ) : (
                          <span className="inline-block w-12 border-b border-dashed border-slate-300" />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          5. PRINTABLE ATTENDANCE SHEET (A4 PDF EXPORT FORMAT)
          Visible on screen as a preview document and fully rendered during window.print()
         ========================================================================= */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-10 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full">
        
        {/* KOP RESMI SEKOLAH */}
        {schoolConfig.kop_url ? (
          <div className="w-full pb-2 mb-2">
            <img
              src={schoolConfig.kop_url}
              alt="KOP Resmi Sekolah"
              className="w-full max-h-40 object-contain mx-auto"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-6 border-b-2 border-slate-900 pb-4 mb-2">
            {schoolConfig.logo_url && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                <img
                  src={schoolConfig.logo_url}
                  alt="Logo Lembaga"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="text-center space-y-1">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
                PEMERINTAH DAERAH / YAYASAN PENDIDIKAN
              </h2>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900">
                {schoolConfig.school_name}
              </h3>
              <p className="text-xs text-slate-600">
                {schoolConfig.school_address}
              </p>
              <p className="text-xs font-semibold text-slate-800">
                PANITIA PEMILIHAN KETUA {schoolConfig.organization_type} MASA BAKTI {activePeriod.year_label}
              </p>
            </div>
          </div>
        )}

        {/* Document Title Header */}
        <div className="text-center space-y-1 py-1">
          <h3 className="font-black text-base sm:text-lg uppercase tracking-wider text-slate-900 underline">
            DAFTAR KEHADIRAN PEMILIH TETAP (PRESENSI E-VOTING)
          </h3>
          <p className="text-xs text-slate-700 font-bold uppercase">
            PEMILIHAN KETUA {schoolConfig.organization_type} MASA BAKTI {activePeriod.year_label}
          </p>
        </div>

        {/* Metadata & Rekapitulasi Ringkas */}
        <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/70 text-xs text-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:bg-white print:border-black print:rounded-none">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Satuan Pendidikan</span>
            <strong>{schoolConfig.school_name}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Filter Rombel / Kategori</span>
            <strong>
              {classFilter === 'ALL' ? 'Semua Kelas' : classFilter} ({categoryFilter === 'ALL' ? 'Semua DPT' : categoryFilter})
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Waktu Unduh / Cetak</span>
            <span className="font-mono">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date().toLocaleTimeString('id-ID')} WIB</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Rekap Presensi</span>
            <span className="font-mono font-bold">
              Hadir: {votedCount} / {totalDpt} ({turnoutPct}%)
            </span>
          </div>
        </div>

        {/* Attendance Official Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-slate-400 print:text-[10px]">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px] border-b border-slate-400 print:bg-slate-200">
                <th className="border border-slate-400 p-2 w-8 text-center">No</th>
                <th className="border border-slate-400 p-2 w-32">NOMOR INDUK PEMILIH</th>
                <th className="border border-slate-400 p-2">Nama Lengkap Pemilih</th>
                <th className="border border-slate-400 p-2 w-20">Kategori</th>
                <th className="border border-slate-400 p-2 w-28">Kelas / Jabatan</th>
                <th className="border border-slate-400 p-2 w-24 text-center">Status</th>
                <th className="border border-slate-400 p-2 w-28 text-center">Waktu Presensi</th>
                <th className="border border-slate-400 p-2 w-28 text-center">Tanda Tangan / Paraf</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center border border-slate-400 text-slate-500">
                    Tidak ada data pemilih.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, idx) => {
                  const isVoted = std.has_voted;
                  const vType = std.voter_type || 'SISWA';
                  const isEven = idx % 2 === 0;

                  return (
                    <tr
                      key={std.id}
                      className={`break-inside-avoid ${isEven ? 'bg-white' : 'bg-slate-50 print:bg-white'}`}
                    >
                      <td className="border border-slate-400 p-2 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-400 p-2 font-mono font-bold text-slate-900">
                        {std.nisn}
                      </td>
                      <td className="border border-slate-400 p-2 font-semibold text-slate-900">
                        {std.name}
                      </td>
                      <td className="border border-slate-400 p-2 text-[10px] uppercase font-bold text-slate-700">
                        {vType === 'GURU' ? 'Guru' : vType === 'TATA_USAHA' ? 'Staf TU' : 'Siswa'}
                      </td>
                      <td className="border border-slate-400 p-2 text-slate-700 font-medium">
                        {std.class_name}
                      </td>
                      <td className="border border-slate-400 p-2 text-center font-bold">
                        {isVoted ? (
                          <span className="text-emerald-700 uppercase">HADIR</span>
                        ) : (
                          <span className="text-slate-400 uppercase">BELUM</span>
                        )}
                      </td>
                      <td className="border border-slate-400 p-2 text-center font-mono text-[10px]">
                        {std.voted_at ? (
                          <span>{new Date(std.voted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="border border-slate-400 p-2 text-center">
                        {isVoted ? (
                          <span className="font-mono text-[9px] font-bold text-emerald-800 uppercase block tracking-tighter">
                            ✓ VERIFIKASI TPS
                          </span>
                        ) : (
                          <div className="flex items-center justify-between text-[9px] text-slate-400 px-1">
                            <span>{idx + 1}.</span>
                            <span className="text-slate-300">...........</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Lembar Tanda Tangan Pengesahan (Signature Block) */}
        <div className="pt-6 grid grid-cols-2 gap-8 text-xs text-slate-900 break-inside-avoid">
          <div className="space-y-16">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala Sekolah {schoolConfig.school_name}</p>
            </div>
            <div>
              <p className="font-bold underline text-sm">{schoolConfig.principal_name || 'Drs. H. Mulyadi, M.Pd.'}</p>
              <p className="text-[11px] text-slate-600">NIP. 19740512 199903 1 002</p>
            </div>
          </div>

          <div className="space-y-16 text-right">
            <div>
              <p>Palimanan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold">Ketua Panitia Pemilihan,</p>
            </div>
            <div>
              <p className="font-bold underline text-sm">{ketuaPanitia?.name || 'Rahmat Hidayat, S.Pd.'}</p>
              <p className="text-[11px] text-slate-600">{ketuaPanitia?.sk_number || 'SK.045/PAN-PEMILU/2026'}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
