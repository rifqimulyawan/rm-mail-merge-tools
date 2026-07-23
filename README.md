# RM Mail Merge Tools

Add-in Mail Merge untuk Microsoft Word. Split, convert, compress, dan combine PDF langsung dari Task Pane Word.

Dikembangkan oleh **RM Digital** — [rmdigital.co.id](https://rmdigital.co.id)

---

## Fitur

**Mail Merge** — Merge data dari Excel/CSV ke template Word dengan satu klik

**Batch Convert** — Convert multiple DOCX to PDF sekaligus

**PDF Combine** — Gabungkan multiple PDF menjadi satu file

**PDF Compress** — Kompres ukuran PDF untuk pengiriman email

**Filename prefix/suffix** — Custom naming untuk output files

**Remove blank fields** — Hapus field kosong otomatis saat merge

**Guide popup** — Panduan penggunaan built-in di dalam add-in

**Settings panel** — Konfigurasi output directory, naming, dan behavior

---

## Install

### Cara mudah — Installer (.exe / .pkg)

Download installer dari [halaman Releases](https://github.com/rifqimulyawan/rm-mail-merge-tools/releases), lalu:

1. Jalankan installer
2. Restart Microsoft Word
3. Buka **Insert > My Add-ins**
4. Cari **RM Mail Merge Tools** di tab Developer Add-ins, atau klik **Upload My Add-in** dan pilih `manifest.xml`

Tidak perlu Node.js, tidak perlu technical knowledge. Web app di-host di server, installer hanya mendaftarkan manifest ke Word.

---

## Build macOS Installer

macOS `.pkg` installer di-build otomatis via GitHub Actions setiap push tag `v*`:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Atau trigger manual dari tab **Actions** di GitHub. Download `.pkg` dari halaman Actions > Artifacts.

---

## Lisensi

© RM Digital — All rights reserved

## Pengembang

**RM Digital** — [rmdigital.co.id](https://rmdigital.co.id)
