-- ============================================================
-- Migration: Tanda Tangan Elektronik (TTE)
-- Jalankan: mysql -u root -p db_sudimoro < migrate_tte.sql
-- ============================================================

-- ── Dokumen TTE ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tte_dokumen (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  kode            VARCHAR(30)  NOT NULL UNIQUE,  -- TTE-20250001
  judul           VARCHAR(255) NOT NULL,
  jenis           VARCHAR(80),                   -- surat_keterangan, sk_kepala_desa, dll
  nik_pemohon     VARCHAR(16),
  nama_pemohon    VARCHAR(150),
  catatan         TEXT,

  -- File
  file_asli       VARCHAR(500) NOT NULL,          -- path file PDF asli
  file_final      VARCHAR(500),                   -- path PDF sudah TTD semua
  download_url    VARCHAR(500),

  -- Status alur
  status          ENUM('menunggu','proses_ketua','proses_sekretaris','selesai','ditolak') DEFAULT 'menunggu',

  -- Penandatangan 1 (Ketua)
  penandatangan1_id    INT,
  penandatangan1_nama  VARCHAR(150),
  penandatangan1_at    DATETIME,
  penandatangan1_note  VARCHAR(255),

  -- Penandatangan 2 (Sekretaris)
  penandatangan2_id    INT,
  penandatangan2_nama  VARCHAR(150),
  penandatangan2_at    DATETIME,
  penandatangan2_note  VARCHAR(255),

  -- Penolakan
  ditolak_by      INT,
  ditolak_note    VARCHAR(255),
  ditolak_at      DATETIME,

  -- QR verifikasi
  qr_token        VARCHAR(40) UNIQUE,
  qr_base64       LONGTEXT,
  verify_url      VARCHAR(500),

  created_by      INT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_status (status),
  INDEX idx_nik (nik_pemohon),
  INDEX idx_kode (kode)
);

-- ── Log Aktivitas TTE ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tte_log (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  dokumen_id  INT NOT NULL,
  admin_id    INT,
  admin_nama  VARCHAR(150),
  aksi        ENUM('upload','approve_ketua','approve_sekretaris','tolak','download') NOT NULL,
  catatan     VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dokumen (dokumen_id)
);

-- ── Pengaturan Tanda Tangan ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tte_config (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  peran           ENUM('ketua','sekretaris') NOT NULL UNIQUE,
  nama_jabatan    VARCHAR(100),
  nama_pejabat    VARCHAR(150),
  nip             VARCHAR(30),
  ttd_image       LONGTEXT,   -- base64 PNG tanda tangan
  stempel_image   LONGTEXT,   -- base64 PNG stempel (opsional)
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO tte_config (peran, nama_jabatan, nama_pejabat) VALUES
('ketua',      'Kepala Desa',     'H. Suparman, S.IP'),
('sekretaris', 'Sekretaris Desa', 'Drs. Ahmad Fauzi');
