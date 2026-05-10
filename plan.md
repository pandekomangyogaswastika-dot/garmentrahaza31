# Development Plan — Perbaikan 6 Isu P0 (UI/UX + Workflow Validations)

## 1) Objectives
- Menyelesaikan 6 isu P0 pada modul Order Produksi & Production Wizard tanpa regresi.
- Memindahkan setup borongan (piece-rate) ke Production Wizard agar alur Order → WO → LineBoard → Packing lebih konsisten.
- Menegakkan validasi backend: Order tidak boleh `completed` sebelum produksi mencapai `PACKING`.
- Menstabilkan UX input angka (hilangkan leading zero) dan dropdown (hindari overlap/clipping).

---

## 2) Implementation Steps

### Phase 1 — Core Workflow POC (isolasi & hardening)
**Core yang paling riskan:** validasi completion + sinkronisasi status produksi berbasis progres proses.

**User stories (POC)**
1. Sebagai admin, saya ingin mencoba menutup Order dan ditolak jika belum ada output/progress sampai PACKING.
2. Sebagai admin, saya ingin Order bisa `completed` saat minimal 1 WO sudah mencapai PACKING.
3. Sebagai admin, saya ingin pesan error jelas (alasan penolakan completion).
4. Sebagai admin, saya ingin endpoint status tetap kompatibel dengan UI saat ini.
5. Sebagai admin, saya ingin aturan ini teruji dengan data demo (seed) tanpa langkah manual rumit.

**Langkah**
- Websearch singkat best-practice: “manufacturing order completion gating by final operation / packing output validation”.
- Buat skrip uji Python kecil (di `/app/scripts/`) untuk:
  - Seed demo.
  - Ambil 1 order + WO.
  - Coba transition `in_production -> completed` (expect 400).
  - Simulasikan event output PACKING pada WO (atau update progress sesuai data model), lalu retry (expect 200).
- Implement backend guard di `POST /api/rahaza/orders/{oid}/status` saat `new_status == completed`:
  - Query WOs milik order.
  - Tentukan “mencapai PACKING” via salah satu sumber data yang tersedia (prioritas):
    1) WIP events process_code == PACKING untuk WO tsb, qty>0, atau
    2) field status/progress WO bila sudah ada, atau
    3) ledger produksi lain yang sudah dipakai di LineBoard.
  - Jika tidak ada bukti mencapai PACKING → `HTTP 400` dengan detail.

**Exit criteria POC**
- Skrip uji POC PASS 100% dan menunjukkan blocking + allow sesuai aturan.

---

### Phase 2 — V1 App Development (fix 6 isu P0)

#### Issue 1 — Customer Inline Creation (Wizard + Order modal)
**User stories**
1. Sebagai user, saya bisa memilih customer dari dropdown.
2. Sebagai user, saya bisa klik “Tambah Customer Baru…” dari dropdown tanpa pindah halaman.
3. Sebagai user, saya bisa isi form customer sesuai master customer dan langsung terpilih.
4. Sebagai user, saya dapat error validasi yang jelas bila code/name kosong atau code duplikat.
5. Sebagai user, daftar customer otomatis refresh setelah create.

**Implementasi**
- Buat reusable component `CustomerCombobox` + `InlineCustomerCreateForm` (mengacu field di `RahazaCustomersModule.jsx`).
- Integrasikan ke:
  - `ProductionWizardModule.jsx` Step 1 (customer select).
  - `RahazaOrdersModule.jsx` modal create/edit order.
- Gunakan `POST /api/rahaza/customers` untuk create; setelah sukses set `customer_id` baru.

#### Issue 2 — UI overlap saat memilih dropdown (Wizard)
**User stories**
1. Sebagai user, dropdown/combobox tidak tertutup container saat dibuka.
2. Sebagai user, list hasil pencarian tetap bisa discroll.
3. Sebagai user, klik di luar menutup dropdown.
4. Sebagai user, dropdown tampil di atas elemen lain (z-index benar).
5. Sebagai user, UI konsisten di resolusi kecil dan besar.

**Implementasi**
- Audit elemen dropdown di wizard (model/material/customer) untuk:
  - `overflow: hidden` pada parent container,
  - `z-index` pada menu,
  - gunakan portal/popover (jika sudah ada komponen shadcn Popover/Command).
- Perbaiki CSS class (minimal change) agar tidak clipping.

#### Issue 3 — Hide “Generate WO” jika WO sudah ada
**User stories**
1. Sebagai user, saya tidak melihat tombol Generate WO jika `wo_count > 0`.
2. Sebagai user, detail order juga menyembunyikan tombol yang sama.
3. Sebagai user, saya tetap bisa melihat jumlah WO di kolom WO.
4. Sebagai user, tidak ada peluang klik ganda generate.
5. Sebagai user, UI konsisten di list dan detail.

**Implementasi**
- Di `RahazaOrdersModule.jsx`:
  - Row actions: render tombol generate hanya jika `wo_count === 0`.
  - Detail modal: sama.

#### Issue 4 — Pindahkan setup borongan ke Production Wizard
**User stories**
1. Sebagai user, saya set rate borongan saat membuat order via wizard.
2. Sebagai user, rate prefilled dari payroll profile seperti sebelumnya.
3. Sebagai user, saya bisa copy rate baris pertama ke semua item.
4. Sebagai user, rate tersimpan di order/WO saat wizard submit.
5. Sebagai user, tombol setup borongan terpisah di Order Production tidak diperlukan lagi.

**Implementasi**
- Ambil logika rate setup modal dari `RahazaOrdersModule.jsx` dan pindahkan sebagai Step baru atau sub-section di Step 3 wizard (sebelum konfirmasi).
- Backend:
  - Update `rahaza_wizard.py` (start-production) agar menerima `item_rates/process_rates` dan meneruskan ke pembuatan WO.
  - Pastikan kompatibel dengan endpoint existing `/generate-work-orders` (tidak break).
- UI:
  - Wizard: tampilkan matrix rate hanya jika user memilih “Set borongan sekarang (recommended)” (default ON).

#### Issue 5 — Number inputs leading zero
**User stories**
1. Sebagai user, input “01” otomatis menjadi “1”.
2. Sebagai user, perubahan terjadi saat blur atau saat submit.
3. Sebagai user, tidak ada kehilangan nilai valid.
4. Sebagai user, perilaku konsisten di semua input qty/rate.
5. Sebagai user, input tetap mendukung kosong saat mengetik.

**Implementasi**
- Patch `LusinPcsInput.jsx`:
  - Normalisasi di `onBlur`/`onChange` (string → parseInt/parseFloat → string) dengan guard empty.
- Audit input number lain yang raw (wizard qty, order qty, rate cell) dan terapkan helper `normalizeNumberInput(value, {int/float})`.

#### Issue 6 — Validasi completion Order (backend)
**User stories**
1. Sebagai admin, saya tidak bisa menyelesaikan order jika belum ada progress sampai PACKING.
2. Sebagai admin, saya bisa menyelesaikan order setelah minimal 1 WO mencapai PACKING.
3. Sebagai admin, saya mendapat pesan alasan blok (mis. “Belum ada output PACKING”).
4. Sebagai admin, aturan berlaku baik dari UI maupun direct API.
5. Sebagai admin, perubahan ini tidak merusak transisi status lain.

**Implementasi**
- Implement guard final di `rahaza_orders.py` transition endpoint saat `new_status == completed` menggunakan hasil POC.

---

### Phase 2 Closeout — Testing 1 (E2E V1)
- Jalankan `testing_agent_v3` untuk:
  - Wizard: create order (customer inline), set rate, preview, submit.
  - Orders module: hide generate button, create/edit order modal + customer inline.
  - Leading zero behavior pada qty/rate.
  - Backend completion gate: coba complete sebelum PACKING (fail), setelah PACKING (pass).

---

### Phase 3 — Stabilization & Regression Sweep
**User stories**
1. Sebagai user, semua modul terkait produksi tetap bisa dipakai seperti sebelumnya.
2. Sebagai user, tidak ada error console besar saat wizard dipakai.
3. Sebagai admin, saya bisa generate WO via wizard tanpa duplikasi.
4. Sebagai admin, status order/WO konsisten di list/detail.
5. Sebagai user, UI dropdown tetap rapi di halaman lain.

**Langkah**
- Rapikan duplikasi logic (rate setup) agar hanya 1 sumber.
- Tambah test report baru `/app/test_reports/iteration_4.json`.
- Quick manual smoke: LineBoard upload foto, packing output, inventory update (jika terpengaruh).

---

## 3) Next Actions
1. Implement POC backend completion gate + skrip uji minimal.
2. Tambah inline customer creation component dan pasang di Wizard + Orders modal.
3. Fix z-index/overflow dropdown overlap di wizard.
4. Hide Generate WO jika `wo_count > 0` (list + detail).
5. Pindahkan rate setup ke wizard dan wiring ke backend start-production.
6. Fix leading zero via `LusinPcsInput` + helper normalisasi.
7. Jalankan `testing_agent_v3` dan perbaiki temuan sampai PASS.

---

## 4) Success Criteria
- (Issue 1) Customer bisa dibuat inline (wizard & order modal) dan langsung terpilih.
- (Issue 2) Dropdown wizard tidak clipping/overlap; scroll & click-outside OK.
- (Issue 3) Tombol Generate WO tidak muncul jika WO sudah ada (list & detail).
- (Issue 4) Setup borongan berada di wizard dan tersimpan/terpakai saat pembuatan WO.
- (Issue 5) Input angka tidak menyimpan leading zero (konsisten di form terkait).
- (Issue 6) Backend menolak completion order sebelum PACKING dan mengizinkan setelahnya.
- `testing_agent_v3` lulus dan tidak ada regresi di flow Order → WO → LineBoard → Packing.
