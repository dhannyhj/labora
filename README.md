# Labora — Clinical Laboratory Information System (workspace)

Short repo workspace to organize project artifacts and bootstrap a NestJS API.

Quick structure

- `docs/` — project docs, plans and exported system summaries
- `sql/` — database schemas and migration SQL
- `assets/images/` — raster images (png)
- `assets/design/` — design sources (psd)
- `src/` — minimal NestJS app scaffold (start here for API)

Getting started (local, development)

1. Install dependencies

```powershell
# from workspace root
npm install
```

2. Run in development (uses ts-node)

```powershell
npm run start:dev
```

3. Build and run

```powershell
npm run build
npm start
```

Notes
- This repository currently stores documentation and SQL artifacts. The `src/` folder contains a very small NestJS bootstrap to get started.
- Large binary assets (PDF/PSD) are configured via `.gitattributes` to use Git LFS; please install Git LFS locally if you plan to store large files.
Note: Proyek ini dikembangkan secara individu oleh dhannyhj.

Catatan singkat:
- Repo ini dikembangkan sendiri (solo). Tidak ada contributor lain saat ini.
- Git LFS sudah diaktifkan untuk file besar (PDF, PSD, PNG). Pastikan `git lfs` terpasang di mesin lokal.

Next steps I can do for you
- Expand the NestJS project with full module structure (auth, patients, orders, etc.)
- Initialize Git LFS and migrate large files
- Add CI workflow and basic tests

Lihat `CONTRIBUTING.md` untuk instruksi singkat penggunaan Git LFS dan pengaturan lokal.
