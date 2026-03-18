/**
 * utils/normalize.js
 * Normalisasi field penduduk — handle API yang mengembalikan
 * huruf kecil (nik) maupun huruf besar (NIK)
 */
export function normPenduduk(p) {
  if (!p) return p;
  return {
    NIK       : p.NIK       || p.nik       || '',
    NOKK      : p.NOKK      || p.nokk      || '',
    NMKK      : p.NMKK      || p.nmkk      || '',
    NAMA      : p.NAMA      || p.nama      || '',
    JK        : p.JK        || p.jk        || '',
    TMP_LAHIR : p.TMP_LAHIR || p.tmp_lahir || '',
    TGL_LAHIR : p.TGL_LAHIR || p.tgl_lahir || '',
    GDR       : p.GDR       || p.gdr       || '',
    AGAMA     : p.AGAMA     || p.agama     || '',
    ST_KAWIN  : p.ST_KAWIN  || p.st_kawin  || '',
    SHDRT     : p.SHDRT     || p.shdrt     || '',
    PDDKN     : p.PDDKN     || p.pddkn     || '',
    PKRJAAN   : p.PKRJAAN   || p.pkrjaan   || '',
    IBU       : p.IBU       || p.ibu       || '',
    AYAH      : p.AYAH      || p.ayah      || '',
    DUSUN     : p.DUSUN     || p.dusun     || '',
    RT        : p.RT        || p.rt        || '',
    RW        : p.RW        || p.rw        || '',
  };
}

export function normPendudukList(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(normPenduduk);
}
