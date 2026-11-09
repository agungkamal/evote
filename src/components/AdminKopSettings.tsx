import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Link2,
  AlertCircle,
  Sparkles,
  Printer,
  Trash2,
  Eye,
} from 'lucide-react';
import type { SchoolConfig } from '../types/index.ts';
import { votingStore } from '../services/storage.ts';

interface AdminKopSettingsProps {
  schoolConfig: SchoolConfig;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
  onRequestConfirm: (config: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }) => void;
}

export const AdminKopSettings: React.FC<AdminKopSettingsProps> = ({
  schoolConfig,
  onShowToast,
  onRequestConfirm,
}) => {
  const [kopUrl, setKopUrl] = useState(schoolConfig.kop_url || '');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setKopUrl(schoolConfig.kop_url || '');
  }, [schoolConfig.kop_url]);

  // Generate crisp, standardized vector KOP SVG for SMKS PGRI 2 PALIMANAN
  const generateOfficialTemplateKop = (name: string, addr: string) => {
    const sName = (name || 'SMKS PGRI 2 PALIMANAN').toUpperCase();
    const sAddr = addr || 'Jl. KH. Agus Salim No. 35 Palimanan, Cirebon, Jawa Barat 45161';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 170" width="1000" height="170">
      <rect width="1000" height="170" fill="#ffffff"/>
      <!-- Left Crest Emblem: YPLP PGRI -->
      <g transform="translate(45, 12)">
        <circle cx="48" cy="48" r="44" fill="#0f172a" stroke="#047857" stroke-width="3"/>
        <circle cx="48" cy="48" r="36" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
        <path d="M48 20 L55 36 L73 38 L60 51 L64 69 L48 60 L32 69 L36 51 L23 38 L41 36 Z" fill="#dc2626"/>
        <circle cx="48" cy="48" r="13" fill="#0f172a"/>
        <path d="M43 46 L46 41 L50 41 L53 46 L51 55 L45 55 Z" fill="#f59e0b"/>
        <text x="48" y="74" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#0f172a" text-anchor="middle">YPLP-PGRI</text>
      </g>
      <!-- Right Crest Emblem: OSIS E-Voting -->
      <g transform="translate(860, 12)">
        <circle cx="48" cy="48" r="44" fill="#0f172a" stroke="#2563eb" stroke-width="3"/>
        <circle cx="48" cy="48" r="36" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
        <polygon points="48,22 59,40 80,43 65,57 69,77 48,67 27,77 31,57 16,43 37,40" fill="#2563eb"/>
        <text x="48" y="53" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">${schoolConfig.organization_type}</text>
      </g>
      <!-- Official School Letterhead Typography -->
      <text x="500" y="28" font-family="Arial, sans-serif" font-size="13.5" font-weight="bold" fill="#0f172a" text-anchor="middle" letter-spacing="1">YAYASAN PEMBINA LEMBAGA PENDIDIKAN DASAR DAN MENENGAH (YPLP-DM) PGRI</text>
      <text x="500" y="62" font-family="Arial, sans-serif" font-size="26" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="1.5">${sName}</text>
      <text x="500" y="86" font-family="Arial, sans-serif" font-size="11.5" font-weight="bold" fill="#047857" text-anchor="middle">STATUS: TERAKREDITASI "A" · NSS: 322021703004 · NPSN: 20214815</text>
      <text x="500" y="105" font-family="Arial, sans-serif" font-size="10.5" fill="#334155" text-anchor="middle">${sAddr}</text>
      <text x="500" y="122" font-family="Arial, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">Website: smkpgri2palimanan.sch.id · Email: info@smkpgri2palimanan.sch.id · Telp: (0231) 341852</text>
      <!-- Formal Government/School Double Border Line -->
      <line x1="25" y1="145" x2="975" y2="145" stroke="#0f172a" stroke-width="3"/>
      <line x1="25" y1="151" x2="975" y2="151" stroke="#0f172a" stroke-width="1"/>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const processImageFile = (file: File) => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Mohon pilih berkas gambar yang valid (PNG, JPG, JPEG, WebP, atau SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran gambar maksimal 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setKopUrl(dataUrl);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Gagal membaca file gambar KOP.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = (customUrl?: string) => {
    const finalKop = customUrl !== undefined ? customUrl : kopUrl;
    votingStore.updateSchoolConfig({
      kop_url: finalKop,
    });
    setKopUrl(finalKop);
    setSuccessMsg('KOP Resmi Sekolah berhasil disimpan dan diterapkan pada seluruh dokumen!');
    onShowToast('success', 'KOP Sekolah berhasil diperbarui.');
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const handleResetKop = () => {
    onRequestConfirm({
      title: 'Hapus KOP Sekolah',
      message: 'Hapus berkas KOP surat dan kembali menggunakan susunan teks standar?',
      confirmLabel: 'Hapus KOP',
      cancelLabel: 'Batal',
      variant: 'warning',
      onConfirm: () => {
        setKopUrl('');
        votingStore.updateSchoolConfig({ kop_url: '' });
        setSuccessMsg('KOP Sekolah telah dinonaktifkan (kembali ke format standar teks).');
        onShowToast('info', 'KOP Sekolah dikembalikan ke teks standar.');
        setTimeout(() => setSuccessMsg(''), 4500);
      },
    });
  };

  const handleApplyPresetTemplate = () => {
    const defaultSvgKop = generateOfficialTemplateKop(schoolConfig.school_name, schoolConfig.school_address);
    setKopUrl(defaultSvgKop);
    handleSave(defaultSvgKop);
  };

  const handleApplyUrlInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setKopUrl(urlInput.trim());
    setUrlInput('');
    onShowToast('info', 'Pratinjau KOP diperbarui dari tautan URL. Jangan lupa klik "Simpan & Terapkan KOP Sekolah".');
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base">
              Upload KOP Surat / KOP Resmi Sekolah
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
              Dokumen Resmi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Unggah gambar KOP resmi sekolah atau madrasah. Gambar ini otomatis dipasang pada bagian atas lembar <strong>Daftar Kehadiran Pemilih</strong> dan <strong>Berita Acara Rekapitulasi Hasil Pemungutan Suara</strong> saat dicetak atau diekspor ke PDF.
          </p>
        </div>

        <button
          type="button"
          onClick={handleApplyPresetTemplate}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer active:scale-95"
          title="Gunakan format template KOP resmi SMKS PGRI 2 PALIMANAN"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Gunakan Template Otomatis</span>
        </button>
      </div>

      {/* Notification Feedback */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Uploader */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-purple-600" />
              <span>Unggah File KOP Sekolah</span>
            </h4>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-50/60 scale-[1.01]'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <FileText className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Tarik &amp; lepas gambar KOP ke sini, atau
                </p>
                <label className="inline-block px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                  <span>Pilih Berkas Komputer</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processImageFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-[10px] text-slate-400 mt-3">
                Format: PNG, JPG, JPEG, WebP, SVG (Maks. 5 MB) · Rekomendasi: Banner rasio 5:1 atau 1200x240 piksel
              </p>
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleApplyUrlInput} className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Atau Tempel Tautan Gambar URL KOP:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://domain.sch.id/kop-surat.png"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => handleSave()}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan &amp; Terapkan KOP Sekolah</span>
              </button>

              {kopUrl && (
                <button
                  type="button"
                  onClick={handleResetKop}
                  className="w-full py-2 px-3 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus KOP / Kembali ke Format Standar Teks</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live A4 Document Preview */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-600" />
              <span>Pratinjau KOP Pada Dokumen Kertas A4</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">
              {kopUrl ? 'KOP Gambar Aktif' : 'Format Teks Standar'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-8 shadow-sm space-y-4">
            {kopUrl ? (
              <div className="w-full border-b-2 border-slate-900 pb-3">
                <img
                  src={kopUrl}
                  alt="KOP Resmi Sekolah"
                  className="w-full max-h-40 object-contain mx-auto"
                  onError={() => {
                    setErrorMsg('Gambar KOP tidak dapat dimuat. Pastikan URL atau file valid.');
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4 border-b-2 border-slate-900 pb-4 text-center">
                {schoolConfig.logo_url && (
                  <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                    <img
                      src={schoolConfig.logo_url}
                      alt="Logo Lembaga"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="text-center space-y-0.5">
                  <h5 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">
                    YAYASAN PENDIDIKAN / PEMERINTAH DAERAH
                  </h5>
                  <h4 className="text-base font-black uppercase text-slate-900">
                    {schoolConfig.school_name}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {schoolConfig.school_address}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-700">
                    PANITIA PEMILIHAN KETUA {schoolConfig.organization_type}
                  </p>
                </div>
              </div>
            )}

            {/* Dummy Mock Document Content Beneath */}
            <div className="space-y-3 opacity-75 pointer-events-none select-none text-xs text-slate-600">
              <div className="text-center py-2 space-y-0.5 border-b border-dashed border-slate-200">
                <h5 className="font-extrabold uppercase underline text-slate-900 text-xs">
                  DAFTAR KEHADIRAN PEMILIH / BERITA ACARA RESMI
                </h5>
                <p className="text-[10px] text-slate-500 font-mono">
                  Dokumen Sah Penyelenggaraan Pemilihan Ketua {schoolConfig.organization_type} Digital
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>Nama Lembaga: <strong>{schoolConfig.school_name}</strong></span>
                  <span>Status KOP: <strong className={kopUrl ? 'text-emerald-700' : 'text-slate-700'}>{kopUrl ? 'KOP Gambar Khusus' : 'Standar Teks'}</strong></span>
                </div>
                <p className="text-slate-500 text-[10px]">
                  KOP di atas akan tercetak dengan proporsi presisi pada setiap lembar A4 Daftar Kehadiran Pemilih &amp; Berita Acara.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
