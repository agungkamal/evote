import type { ElectionPeriod, SchoolConfig, Committee } from '../types/index.ts';

interface ElectionStatsExport {
  totalVotes: number;
  totalDPT: number;
  turnoutPercentage: number;
  remainingDPT: number;
  categoryStats?: Array<{
    category: string;
    label: string;
    total: number;
    voted: number;
    remaining: number;
    turnout: number;
  }>;
  candidateResults: Array<{
    id: string;
    candidate_number: number;
    leader_name: string;
    vote_count: number;
    vote_percentage: number;
  }>;
}

export function exportBeritaAcaraToWord(
  activePeriod: ElectionPeriod,
  schoolConfig: SchoolConfig,
  stats: ElectionStatsExport,
  committees: Committee[],
  winningCandidate?: {
    candidate_number: number;
    leader_name: string;
    vote_count: number;
    vote_percentage: number;
  }
): void {
  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const baNumber = `BA.09/PEMILU-${schoolConfig.organization_type}/${activePeriod.year_label.replace('/', '-')}/${new Date().getFullYear()}`;
  const ketuaPanitia = committees[0]?.name || 'Rahmat Hidayat, S.Pd.';
  const skPanitia = committees[0]?.sk_number || 'SK.045/PAN-PEMILU/2026';

  const categoryRows = (stats.categoryStats || [])
    .map(
      (cat) => `
    <tr>
      <td style="padding: 6px 10px; border: 1px solid #333333; text-align: left;">${cat.label}</td>
      <td style="padding: 6px 10px; border: 1px solid #333333; text-align: right; font-family: 'Courier New', monospace;">${cat.total} Orang</td>
      <td style="padding: 6px 10px; border: 1px solid #333333; text-align: right; font-weight: bold; font-family: 'Courier New', monospace; color: #059669;">${cat.voted} Suara</td>
      <td style="padding: 6px 10px; border: 1px solid #333333; text-align: right; font-family: 'Courier New', monospace;">${cat.turnout}%</td>
    </tr>
  `
    )
    .join('');

  const candidateRows = (stats.candidateResults || [])
    .map(
      (cand) => `
    <tr>
      <td style="padding: 6px 10px; border: 1px solid #333333; text-align: center; font-weight: bold; font-family: 'Courier New', monospace;">
        #${cand.candidate_number.toString().padStart(2, '0')}
      </td>
      <td style="padding: 6px 10px; border: 1px solid #333333; text-align: left; font-weight: bold;">
        ${cand.leader_name}
      </td>
      <td style="padding: 6px 10px; border: 1px solid #333333; text-align: right; font-family: 'Courier New', monospace; font-weight: bold;">
        ${cand.vote_count} Suara
      </td>
      <td style="padding: 6px 10px; border: 1px solid #333333; text-align: right; font-family: 'Courier New', monospace; font-weight: bold;">
        ${cand.vote_percentage}%
      </td>
    </tr>
  `
    )
    .join('');

  const penetapanSection =
    winningCandidate && stats.totalVotes > 0
      ? `
    <div style="margin-top: 14pt; padding: 10pt; border: 1px solid #999999; background-color: #f8fafc; font-size: 11pt;">
      <p style="margin: 0 0 4pt 0; font-weight: bold; text-decoration: underline;">
        III. PENETAPAN CALON KETUA TERPILIH:
      </p>
      <p style="margin: 0; line-height: 1.45; text-align: justify;">
        Berdasarkan perolehan suara terbanyak di bilik suara digital, ditetapkan secara resmi bahwa 
        <strong>Calon No. #${winningCandidate.candidate_number} (${winningCandidate.leader_name})</strong> dengan perolehan 
        <strong>${winningCandidate.vote_count} suara (${winningCandidate.vote_percentage}%)</strong> 
        dinyatakan sah sebagai <strong>Ketua ${schoolConfig.organization_type} Terpilih Masa Bakti ${activePeriod.year_label}</strong>.
      </p>
    </div>
  `
      : '';

  const htmlContent = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Berita Acara Rekapitulasi E-Voting</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 595.3pt 841.9pt; /* Ukuran A4 */
      margin: 2.54cm 2.54cm 2.54cm 2.54cm;
      mso-header-margin: 36.0pt;
      mso-footer-margin: 36.0pt;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      color: #111827;
      line-height: 1.4;
      background: #ffffff;
    }
    h2, h3, h4, h5 {
      margin: 0;
      padding: 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 6pt;
      margin-bottom: 12pt;
    }
    .kop-table {
      width: 100%;
      border: none;
      margin-bottom: 0;
    }
    .kop-table td {
      border: none;
      padding: 2px 4px;
      text-align: center;
    }
    .kop-divider {
      border-top: 3px double #111827;
      margin-top: 8pt;
      margin-bottom: 16pt;
    }
  </style>
</head>
<body>
  <div class="Section1">
    
    <!-- KOP RESMI LEMBAGA -->
    <table class="kop-table">
      <tr>
        <td style="text-align: center;">
          <div style="font-size: 11pt; font-weight: bold; letter-spacing: 0.5pt; text-transform: uppercase;">
            PEMERINTAH DAERAH / KEMENTERIAN AGAMA
          </div>
          <div style="font-size: 14pt; font-weight: 900; letter-spacing: 0.5pt; text-transform: uppercase; margin-top: 2pt;">
            ${schoolConfig.school_name}
          </div>
          <div style="font-size: 10pt; color: #374151; margin-top: 2pt;">
            ${schoolConfig.school_address}
          </div>
          <div style="font-size: 10.5pt; font-weight: bold; margin-top: 3pt;">
            PANITIA PEMILIHAN KETUA ${schoolConfig.organization_type} MASA BAKTI ${activePeriod.year_label}
          </div>
        </td>
      </tr>
    </table>

    <div class="kop-divider"></div>

    <!-- JUDUL DOKUMEN -->
    <div style="text-align: center; margin-bottom: 14pt;">
      <h3 style="font-size: 12pt; font-weight: bold; text-decoration: underline; text-transform: uppercase; letter-spacing: 0.5pt;">
        BERITA ACARA REKAPITULASI HASIL PEMUNGUTAN SUARA
      </h3>
      <p style="font-size: 10pt; font-family: 'Courier New', monospace; color: #374151; margin: 3pt 0 0 0;">
        Nomor: ${baNumber}
      </p>
    </div>

    <!-- PEMBUKA -->
    <p style="text-align: justify; text-indent: 24pt; line-height: 1.5; margin-bottom: 12pt;">
      Pada hari ini, <strong>${currentDateFormatted}</strong>, telah dilaksanakan pemungutan dan penghitungan suara secara elektronik (E-Voting) dalam rangka Pemilihan Ketua ${schoolConfig.organization_type} ${schoolConfig.school_name} Masa Bakti ${activePeriod.year_label}. Pemilihan diselenggarakan berdasarkan asas Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil (LUBER JURDIL). Berdasarkan data rekapitulasi digital, diperoleh hasil akhir pemungutan suara sebagai berikut:
    </p>

    <!-- TABEL I: DATA PARTISIPASI -->
    <div style="margin-bottom: 10pt;">
      <p style="font-weight: bold; font-size: 11pt; margin: 0 0 4pt 0;">
        I. DATA PARTISIPASI PEMILIH TETAP (DPT)
      </p>
      <table>
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 7px 10px; border: 1px solid #333333; text-align: left; font-size: 10pt;">Kategori Pemilih</th>
            <th style="padding: 7px 10px; border: 1px solid #333333; text-align: right; width: 90pt; font-size: 10pt;">Jumlah DPT</th>
            <th style="padding: 7px 10px; border: 1px solid #333333; text-align: right; width: 100pt; font-size: 10pt;">Suara Masuk</th>
            <th style="padding: 7px 10px; border: 1px solid #333333; text-align: right; width: 80pt; font-size: 10pt;">Partisipasi</th>
          </tr>
        </thead>
        <tbody>
          ${categoryRows}
          <tr style="background-color: #f9fafb; font-weight: bold;">
            <td style="padding: 7px 10px; border: 1px solid #333333; text-align: left;">TOTAL DPT KESELURUHAN</td>
            <td style="padding: 7px 10px; border: 1px solid #333333; text-align: right; font-family: 'Courier New', monospace;">${stats.totalDPT} Orang</td>
            <td style="padding: 7px 10px; border: 1px solid #333333; text-align: right; font-family: 'Courier New', monospace; color: #059669;">${stats.totalVotes} Suara</td>
            <td style="padding: 7px 10px; border: 1px solid #333333; text-align: right; font-family: 'Courier New', monospace;">${stats.turnoutPercentage}%</td>
          </tr>
          <tr style="background-color: #ffffff;">
            <td colspan="2" style="padding: 6px 10px; border: 1px solid #333333; text-align: left; color: #4b5563;">
              Sisa Pemilih Tidak Menggunakan Hak Suara (Absen / Belum Hadir)
            </td>
            <td colspan="2" style="padding: 6px 10px; border: 1px solid #333333; text-align: right; font-weight: bold; font-family: 'Courier New', monospace; color: #b45309;">
              ${stats.remainingDPT} Orang
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TABEL II: HASIL PEROLEHAN SUARA -->
    <div style="margin-bottom: 10pt;">
      <p style="font-weight: bold; font-size: 11pt; margin: 0 0 4pt 0;">
        II. PEROLEHAN SUARA PASANGAN CALON KETUA
      </p>
      <table>
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 7px 10px; border: 1px solid #333333; text-align: center; width: 60pt; font-size: 10pt;">No Urut</th>
            <th style="padding: 7px 10px; border: 1px solid #333333; text-align: left; font-size: 10pt;">Nama Pasangan Calon</th>
            <th style="padding: 7px 10px; border: 1px solid #333333; text-align: right; width: 110pt; font-size: 10pt;">Perolehan Suara</th>
            <th style="padding: 7px 10px; border: 1px solid #333333; text-align: right; width: 90pt; font-size: 10pt;">Persentase</th>
          </tr>
        </thead>
        <tbody>
          ${candidateRows}
        </tbody>
      </table>
    </div>

    <!-- PENETAPAN -->
    ${penetapanSection}

    <!-- LEMBAR PENGESAHAN & TANDA TANGAN -->
    <div style="margin-top: 24pt; page-break-inside: avoid;">
      <table style="border: none; width: 100%; margin-top: 15pt;">
        <tr>
          <td style="border: none; width: 50%; text-align: center; vertical-align: top; padding: 0 10pt;">
            <p style="margin: 0 0 50pt 0;">Saksi Perwakilan MPK,</p>
            <p style="margin: 0; font-weight: bold; text-decoration: underline;">Bima Satrio</p>
            <p style="margin: 2pt 0 0 0; font-size: 9.5pt; color: #4b5563;">Ketua MPK Sekolah</p>
          </td>
          <td style="border: none; width: 50%; text-align: center; vertical-align: top; padding: 0 10pt;">
            <p style="margin: 0 0 50pt 0;">Ketua Panitia Pemilihan,</p>
            <p style="margin: 0; font-weight: bold; text-decoration: underline;">${ketuaPanitia}</p>
            <p style="margin: 2pt 0 0 0; font-size: 9.5pt; color: #4b5563;">${skPanitia}</p>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="border: none; text-align: center; vertical-align: top; padding-top: 30pt;">
            <p style="margin: 0;">Mengetahui & Menyetujui,</p>
            <p style="margin: 2pt 0 50pt 0; font-weight: bold;">Kepala ${schoolConfig.school_name}</p>
            <p style="margin: 0; font-weight: bold; font-size: 11pt; text-decoration: underline;">${schoolConfig.principal_name}</p>
            <p style="margin: 2pt 0 0 0; font-size: 9.5pt; color: #4b5563;">NIP. 19740512 199903 1 002</p>
          </td>
        </tr>
      </table>
    </div>

  </div>
</body>
</html>`;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeFilename = `Berita_Acara_Pemilihan_${schoolConfig.organization_type}_${activePeriod.year_label.replace('/', '-')}.doc`;
  link.download = safeFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
