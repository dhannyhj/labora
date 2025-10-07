# CONTRIBUTING

Terima kasih sudah membuka repo ini. Catatan: proyek ini dikembangkan secara individu oleh `dhannyhj`. Saat ini tidak ada kontributor lain.

Jika di masa depan kamu atau orang lain ingin berkontribusi, berikut aturan singkat dan langkah setup supaya lingkungan Git dan Git LFS bekerja mulus.

## Aturan singkat
- Ini repo solo — perubahan besar pada riwayat (history) mungkin dilakukan oleh pemilik. Jika ada perubahan riwayat, disarankan untuk clone ulang repo.
- Jangan commit file environment (`.env`) atau kredensial.

## Persiapan Git dan Git LFS (Windows / PowerShell)
1. Install Git LFS (jika belum):

```powershell
choco install git-lfs -y   # jika menggunakan Chocolatey
# atau ikuti https://git-lfs.com/
```

2. Inisialisasi LFS di repo:

```powershell
git lfs install
```

3. Jika ada file besar baru (.psd, .pdf, .png), tandai pola tersebut di .gitattributes atau jalankan:

```powershell
git lfs track "*.psd" "*.pdf" "*.png"
git add .gitattributes
git commit -m "chore: track binaries with git-lfs"
```

4. Tambahkan dan push file seperti biasa. LFS akan meng-handle upload objek besar.

## Jika kamu sudah memiliki clone lama sebelum migrasi LFS / rewrite history
Karena repo ini adalah solo dan saya telah melakukan migrasi LFS, lakukan langkah ini untuk menyamakan state lokal:

```powershell
git lfs install
git fetch --all
git reset --hard origin/main
git lfs pull
```

Peringatan: `reset --hard` akan menghapus perubahan lokal yang belum dikomit. Jika kamu punya pekerjaan lokal, stash atau commit terlebih dahulu.

## Kontak & informasi
- Pemilik: `dhannyhj`
- Email: `dhannyhj@gmail.com`

Jika mau, hubungi pemilik untuk akses atau pertanyaan lebih lanjut.
