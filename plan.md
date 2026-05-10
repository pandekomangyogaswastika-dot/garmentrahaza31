# 📋 PLAN: PT Rahaza ERP — Migration + Stabilization + Production Flow Redesign (UI/Payroll Integrated)

**Updated:** 2026-05-09  
**Scope:** Full ERP re-migrated from GitHub repo (pandekomangyogaswastika-dot/garmentrahaza28) into Emergent runtime (`/app`). Stability fixes applied (portal navigation + payroll + seed alignment). **Production Flow Redesign (Phase 5) delivered** and extended with a UX integration layer: **Dashboard → LineBoard drilldown & actionability** (bottleneck-to-PO attribution + faster input).  
**NEW focus:** (1) Rework flow fixes for **WO/PO-based** production (bundle system deprecated for ops) and (2) replace **Bundle Traceability** with **WO Traceability**.

**Constraints:** Keep `MONGO_URL` + `REACT_APP_BACKEND_URL` unchanged. JWT secret stored in `/app/backend/.env`. Use provided `EMERGENT_LLM_KEY`. No unrelated feature expansion (Finance/Notifications/DSS later).

---

## 1) Objectives

1. **Migration (Done):** Replace Emergent template app with full PT Rahaza ERP codebase (backend + frontend) and make it run end-to-end.
2. **Stability (Done):** Ensure core ERP flows work post-migration (auth, seed/reset, portals, navigation).
3. **Phase A (Done):** Warehouse UX Improvements (U1–U8) delivered and verified.
4. **Phase B (Done):** Style Master 2.0 delivered (size chart + costing).
5. **Phase C (Done):** UI Polish delivered.
6. **Phase 5 (Delivered):** **Production Flow Redesign** (per-PO employee-first LineBoard, strict sequential blocking, sewing sub-steps, lusin+pcs input, payroll-integrated WO rates).
7. **Dashboard→LineBoard UX Bridge (Done):** Operational drilldown: bottleneck→top PO, expandable WIP breakdown, +Input routes to LineBoard, urgent deadline display.
8. **Sprint Rework WO/PO (Implemented; E2E pending):** QC fail → rework handling **WO-first**, visible on LineBoard, and enforceable on WO completion.
9. **Sprint Traceability (Done; data validation pending):** **Bundle Tracking replaced with WO Traceability** (Penelusuran WO) using WO/PO + WIP events.
10. **Current objective:** Finish **end-to-end validation** (backend + frontend) untuk Rework + Traceability, lalu harden UI (QC/Rework modals) dan pastikan analytics benar-benar event-based.
11. **Remaining roadmap:** Finance Enhancement (Phase 6), Notification Stack (Phase 7), Decision Support Dashboards (Phase 8) — later.

---

## Session 2026-05-09 Status — Re-migration + Bug Fixes ✅ COMPLETE

### Fixed Issues (Sesi ini)
1. ✅ **Migration**: Re-migrated full ERP from repo → `/app`.
2. ✅ **Dependencies**:
   - Frontend: `framer-motion`, `html5-qrcode`, `xlsx`
   - Backend: `matplotlib`, `pillow`, `reportlab`, `qrcode`, `openpyxl`, `PyPDF2`
3. ✅ **Environment**: `JWT_SECRET` + `EMERGENT_LLM_KEY` configured.
4. ✅ **Payroll bug (EMP-J001/J002)**:
   - Seed: `LINE-B` changed `RAJUT → SEWING_S1`
   - Seed: `pcs_process_rates` added for sewing (S1=300/pcs, S2=250/pcs, S3=200/pcs)
   - Verified: EMP-J001/EMP-J002 gross pay became positive and realistic.
5. ✅ **Portal navigation reliability**: PortalSelector `Masuk` changed to proper `<button>` with `data-testid="portal-masuk-btn-{portal.id}"`.
6. ✅ **Dashboard→LineBoard improvements** shipped + iteration_8 100% pass.

### Newly Completed (Sesi ini)
7. ✅ **Replace “Penelusuran Bundle” → “Penelusuran WO” (Replace Completely)**
   - Frontend: new module **Penelusuran WO** with filters, progress per proses, pending rework badge, due date, detail modal.
   - Backend: new endpoints for list + detail traceability.
   - Navigation: sidebar menu label updated to “Penelusuran WO”; module registry remapped.

### Remaining Work (Next sessions)
- 🔥 **Rework Flow E2E** testing + finish UI workflows (QC modal + Rework modal + analytics endpoints swap).
- 🔥 **WO Traceability data validation**: endpoint currently returns 0 (need verify DB fields / mapping).
- Phase 6/7/8 features later (user: “nanti”).

---

## Phase 1 — Core POC (Isolation): Migration “Boot-to-Healthy” POC ✅ COMPLETE

*(No changes; retained as-is.)*

---

## Phase 2 — V1 App Development: Phase A Warehouse UX Improvements (U1–U8) ✅ COMPLETE

*(No changes; retained as-is.)*

---

## Phase 3 — Adding More Features: Phase B Style Master 2.0 ✅ COMPLETE

*(No changes; retained as-is.)*

---

## Phase 4 — Phase C UI Polish (Combobox + Tooltips + Smart Defaults + Mobile Audit) ✅ COMPLETE

*(No changes; retained as-is.)*

---

## Phase 4.5 — System Review & Close Incomplete Processes ✅ COMPLETE

*(No changes; retained as-is.)*

---

## Phase 5 — Production Flow Redesign (Per-PO Board + Lusin Input + Payroll-Integrated Rates) ✅ DELIVERED

> User goal: simplify production UX and enforce real process constraints without regressions.

### Key Decisions Confirmed by User
- Board scope: **per PO**; inside board show **WO rows**.
- Assignments: **employee-first** per PO + process.
- Sequential gating: **strict block**.
- Sewing: **3 sub-process sequential** in 1 visual group.
- Rates: **per WO** and payroll uses WO rates.
- Unit input: **lusin + pcs** stored as pcs.

### Deliverables (P1–P9)
Defined in: `/app/memory/PRODUCTION_FLOW_REDESIGN_PLAN.md`.

### Regression/Integration Guards
- Seed + login + portal smoke.
- Warehouse core flows remain OK.
- HR/Payroll remains OK.
- Analytics modules still load.

---

## Sprint — Dashboard → LineBoard Integration Improvements ✅ COMPLETE

### Problem Statement (Gap Analysis)
Production Dashboard Overview was global aggregate across all POs. It showed bottleneck but did not explain which PO caused it or provide fast action.

### Implemented Deliverables (D1–D4)
- ✅ **D1 Backend:** `GET /api/rahaza/wip/summary-per-po` (per-process per-PO breakdown, top_wip_po, urgent_po)
- ✅ **D2 Frontend:** ProductionDashboardOverview refactor (expandable rows, urgent banner, +Input routes to LineBoard)
- ✅ **D3 Frontend:** LineBoard preselect via sessionStorage + column highlight hint
- ✅ **D4 Testing:** iteration_8 100% passing

### Success Criteria
- ✅ Bottleneck click opens LineBoard on correct PO.
- ✅ Expand row shows top PO list with deadline + jump.
- ✅ +Input routes to LineBoard.

---

## Sprint — Rework Flow Fixes (WO/PO-Based, No Bundle) ✅ IMPLEMENTED (E2E Pending)

### Context / Clarification
- Sistem **bundle** masih ada di codebase, tapi **deprecated untuk operasi**.
- Rework yang aktif sekarang adalah **event-only** di `rahaza_wip_events`:
  - QC: `qc_pass`, `qc_fail` via `POST /api/rahaza/execution/qc-event`
  - Rework: `rework_pass`, `rework_fail` via `POST /api/rahaza/execution/rework-event`
- Semua rework harus **berbasis WO/PO** (bukan bundles).

### Problem Statement (Gaps G1–G5) — STATUS
- ✅ **G1:** QC + Rework integrated to LineBoard (minimal: QC column + pending badge / action)
- ✅ **G2:** `/execution/qc-event` no longer requires `line_id`
- ✅ **G3:** WO completion guard is event-based
- ✅ **G4:** pending rework badge available via LineBoard board payload and shown at QC column level
- ⚠️ **G5:** ReworkAnalytics bundle dependency: partially addressed (UI copy updated), but backend endpoints may still need full event-based summary wiring depending on `rahaza_rework.py` implementation.

### User Stories — STATUS
1. ✅ (Backend ready) QC pass/fail bisa diinput via endpoint WO-first.
2. ✅ (Backend ready) Rework event WO-first + qty_in validation.
3. ✅ WO tidak bisa completed jika pending rework masih ada (guard enforced at status transition).
4. ✅ Pending rework terlihat di LineBoard (badge appears when pending > 0).
5. ⚠️ Rework Analytics menampilkan KPI benar dari event data: requires endpoint verification/update.
6. ⚠️ QC/Rework input via UI (modal) masih placeholder toast.

### Deliverables (R1–R6) — IMPLEMENTATION SUMMARY

#### R1 — Backend: QC event accept WO directly (no line required) ✅ DONE
- File: `/app/backend/routes/rahaza_execution.py`
- Change:
  - `line_id` optional; `work_order_id` required (or resolvable via `line_assignment_id`).
  - Event enriched with `order_id` (from WO) and keeps backward compatibility.

#### R2 — Backend: Rework event enforce pending bounds per WO ✅ DONE
- File: `/app/backend/routes/rahaza_execution.py`
- Change:
  - `line_id` optional; `work_order_id` required.
  - Validates `qty_in` <= pending rework (qc_fail - rework_pass - rework_fail) per WO.

#### R3 — Backend: WO completion guard (event-based) ✅ DONE
- New endpoint:
  - `GET /api/rahaza/execution/work-order/{wo_id}/rework-guard`
- Enforced on WO completion:
  - File: `/app/backend/routes/rahaza_work_orders.py`
  - Blocks transition to `completed` if pending rework > 0.
  - Keeps legacy bundle-based guard as fallback compatibility.

#### R4 — Backend: LineBoard board aggregation includes QC/Rework state per WO ✅ DONE
- File: `/app/backend/routes/rahaza_lineboard.py`
- Change:
  - `GET /api/rahaza/lineboard/board/{order_id}` includes per WO row:
    - `qc_pass_qty`, `qc_fail_qty`, `rework_pass_qty`, `rework_fail_qty`, `pending_rework_pcs`

#### R5 — Frontend: LineBoard QC + Pending badge ✅ DONE (Minimal UX)
- File: `/app/frontend/src/components/erp/LineBoardModule.jsx`
- Change:
  - Added `QCCol` component used for QC process.
  - Shows pending rework badge (aggregate across WOs) and “Proses Rework” action link.
  - Note: action currently uses placeholder toast; QC/Rework modals still need to be implemented.

#### R6 — Frontend: ReworkAnalyticsModule event-based messaging ✅ DONE (Partial)
- File: `/app/frontend/src/components/erp/ReworkAnalyticsModule.jsx`
- Change:
  - Updated module text/copy to reflect event-based enforcement.
  - Requires verification that `/api/rahaza/rework/summary` and `/api/rahaza/rework/open` are event-based; otherwise update backend + frontend.

### Revised Implementation Steps (Next)
1. **E2E Flow Validation (P0):**
   - Create QC fail event for a WO → verify `pending_rework_pcs` increases.
   - Submit rework_pass/rework_fail within bounds → verify pending decreases.
   - Attempt to complete WO with pending > 0 → verify blocked with 409.
2. **Finish UI Actions (P0):**
   - Implement QC modal (pass/fail input) from QC column.
   - Implement Rework modal (qty_in/out/fail) from QC column; enforce `qty_in` bound error display.
   - Ensure new interactive elements have `data-testid`.
3. **Analytics Endpoint Hardening (P1):**
   - Update `/api/rahaza/rework/summary` and `/api/rahaza/rework/open` to aggregate from `rahaza_wip_events` grouped by `work_order_id`.
4. **Testing & Regression (P0):**
   - Backend curl tests for qc-event/rework-event/guard/lineboard payload.
   - Frontend manual test and E2E via `testing_agent_v3`.

### Success Criteria (Updated)
- ✅ Lineboard board payload includes WO-level QC/Rework aggregates.
- ✅ Backend rejects rework qty_in beyond pending.
- ✅ WO completion blocked when pending rework exists.
- ⚠️ QC/Rework input directly from LineBoard UI (modals) — not yet implemented.
- ⚠️ ReworkAnalytics shows consistent KPI from event data — endpoint verification pending.

---

## Sprint — Traceability Replacement: “Penelusuran WO” (Replace Bundle Tracking) ✅ UI Done (Data Validation Pending)

### Problem Statement
Sistem formal sudah meninggalkan tracking **Bundle**. Namun UI “Penelusuran Bundle” masih ada dan membingungkan operasional. Dibutuhkan **Penelusuran WO** yang:
- Berbasis WO/PO
- Mengambil progress dari `rahaza_wip_events`
- Menampilkan pending rework
- Punya search + filter lengkap

### Deliverables — STATUS

#### T1 — Backend: WO Traceability List ✅ DONE
- Endpoint baru: `GET /api/rahaza/work-orders/traceability`
- Filter:
  - `status` (draft/released/in_production/completed/cancelled)
  - `has_pending_rework` (true)
  - `urgent` (true; due within 3 days)
  - `q` (search: wo_number, order_number_snapshot, model_name)
- Output per item:
  - Header WO (WO#, order, model, size, qty, status, priority, due date)
  - `process_progress` (per process)
  - `pending_rework_pcs`
  - `progress_pct` + `current_process`

#### T2 — Backend: WO Detail Trace ✅ DONE
- Endpoint baru: `GET /api/rahaza/work-orders/{wid}/detail-trace`
- Output:
  - WO header
  - timeline per process
  - QC/Rework summary
  - raw events list
  - material reservations + employee assignments snapshot

#### T3 — Frontend: Module “Penelusuran WO” ✅ DONE
- File baru: `/app/frontend/src/components/erp/RahazaWOTraceabilityModule.jsx`
- UI:
  - stats cards (Total WO, In Production, Completed, Has Rework)
  - search + filter (status, pending rework, urgent)
  - table columns lengkap + badge pending rework
  - detail modal (timeline + QC/Rework summary)
  - `data-testid` untuk elemen utama

#### T4 — Navigation/Routing replacement ✅ DONE
- `PortalShell.jsx`: label menu diganti menjadi **Penelusuran WO**
- `moduleRegistry.js`: `prod-bundles` diarahkan ke `RahazaWOTraceabilityModule` (bundle legacy dipindahkan ke `prod-bundles-legacy`).

### Known Issue / Next Fix (P0)
- ⚠️ Endpoint traceability saat ini mengembalikan `total=0` meskipun WO ada di endpoint lama `/api/rahaza/work-orders`.

**Hipotesis penyebab:**
1. Data WO tidak menyimpan `model_name`/`size_name` langsung (endpoint traceability mencari di field tersebut),
2. Ada perbedaan DB (nama database di runtime) atau schema mismatch,
3. Query filter/serialization di endpoint baru perlu disesuaikan (join ke models/sizes/orders untuk label).

### Revised Implementation Steps (Next)
1. **Data mapping audit (P0):**
   - Inspect dokumen `rahaza_work_orders` di Mongo: pastikan field yang dipakai (`order_number_snapshot`, `model_name`, `size_name`, `target_end_date`) memang ada.
2. **Fix traceability list join (P0):**
   - Jika field label tidak tersimpan, lakukan enrichment di endpoint:
     - join ke `rahaza_models`, `rahaza_sizes`, `rahaza_orders` untuk menampilkan `model_name`, `size_name`, `order_number`.
3. **Frontend resilience (P1):**
   - Jika field tidak ada, tampilkan fallback (e.g. model_id/size_id) dan jangan gagal.
4. **Testing (P0):**
   - Screenshot module menampilkan minimal beberapa baris WO dan detail modal berfungsi.

### Success Criteria
- Menu “Penelusuran WO” menampilkan data WO nyata (bukan 0) dan detail modal berjalan.
- Search + filter menghasilkan hasil yang benar.

---

## Phase 6 — Finance Enhancement ⏸️ LATER
*(unchanged)*

---

## Phase 7 — WhatsApp/Telegram Notification Stack ⏸️ LATER
*(unchanged)*

---

## Phase 8 — Decision Support Dashboards 🔜 LATER
*(unchanged)*

---

## Reference Docs
- Production redesign master plan: `/app/memory/PRODUCTION_FLOW_REDESIGN_PLAN.md`
- Testing log: `/app/test_result.md`
- Test reports: `/app/test_reports/iteration_7.json`, `/app/test_reports/iteration_8.json`

---

## Phase 9 — Comprehensive Business/State/Trigger Logic Audit & Fix ✅ COMPLETE (historical)

*(Retained for record; no changes required for this update.)*

---

## Session 2026-05-09 (Phase 2a/2b/2c) - COMPLETE

### Completed
- Phase 2a: QCModal + ReworkModal in LineBoardModule (amber/red themes, full validation)
- Phase 2b: WO Traceability fix (route order + field names + DataTableV2 rows prop)
- Phase 2c: Rework Analytics event-based (_compute_event_based_open_rework)
- All tested: iteration_10.json = 92% then 100% after DataTable fix

### Next Sessions (Roadmap)
- Phase 6: Finance Enhancement (Cash Flow, PPN/PPh, Budget)
- Phase 7: Notification Stack (WhatsApp/Telegram)  
- Phase 8: Decision Support Dashboards


---

## 🆕 [UPDATED] Session 2026-05-10 — Phase 2: FG Inventory + Delivery + Guide S1–S10

> **Catatan:** Section ini ditambahkan tanpa menghapus history sebelumnya, sesuai
> instruksi user. Semua phase di atas tetap valid; ini adalah catatan tambahan.

### Status Fase Aktif

| Item                                                | Status                                  |
| --------------------------------------------------- | --------------------------------------- |
| **A. FG (Finished Goods) Inventory Logic**          | ✅ DELIVERED (auto-increment di WO complete, decrement di Delivery dispatch) |
| **B. Delivery Module (basic + advanced)**           | ✅ DELIVERED (standard / batch / return / partial) |
| **C. User Guide S1–S10 (Production + Payroll)**     | ✅ DELIVERED (in-app via HelpGuideModule) |
| **D. README.md & Dokumentasi Instalasi**            | ✅ DELIVERED (README baru komprehensif, Bahasa Indonesia) |
| **E. End-to-End Validation Inventory + Payroll**    | ⚠️ **PENDING** — agent sebelumnya melaporkan test sukses padahal curl returned 404. **WAJIB diverifikasi ulang.** |

### A. FG Inventory Logic

- **Trigger increment:** Saat `PUT /api/rahaza/work-orders/{wid}/status` ke `completed`,
  sistem akan auto-increment FG stock di `rahaza_fg_stock` (key: `model_id` + `size_id`).
- **Trigger decrement:** Saat Delivery di-dispatch (`PUT /api/rahaza/deliveries/{id}/dispatch`),
  FG dikurangi sebanyak qty per item.
- **Validasi:** Tidak bisa membuat/mengirim Delivery jika FG = 0 atau qty melebihi available.
- **File terkait:**
  - `/app/backend/routes/rahaza_work_orders.py` (logic increment di transition status)
  - `/app/backend/routes/rahaza_deliveries.py` (logic decrement di dispatch)

### B. Delivery Module

#### Tipe Delivery yang Didukung

1. **Standard** — 1 PO → 1 surat jalan, qty == FG produced.
2. **Batch** — 1 surat jalan untuk multiple PO sekaligus.
3. **Return** — barang dikembalikan customer (FG re-increment + tracking reason).
4. **Partial / Split WO** — multiple dispatch per WO (≤ qty produced kumulatif).

#### File Implementasi

- Backend: `/app/backend/routes/rahaza_deliveries.py` (1,049 baris)
- Frontend: `/app/frontend/src/components/erp/RahazaDeliveriesModule.jsx` (783 baris)
- Sidebar: `/app/frontend/src/components/erp/PortalShell.jsx` (menu Pengiriman)
- Routing: `/app/frontend/src/components/erp/moduleRegistry.js`
- Database collection: `rahaza_deliveries` (sudah ada index unique `delivery_number`)

#### Constraint yang Diterapkan

- Input qty ≤ FG available (server-side validation).
- Multiple dispatch per PO diizinkan (untuk shipment partial).
- FG `0` → Delivery diblok dengan error `FG stock insufficient`.

### C. User Guide S1–S10

- File: `/app/frontend/src/components/erp/userGuide/guideData.js`
- Module: `HelpGuideModule.jsx`
- 10 skenario lengkap berbasis cerita pabrik, mencakup workflow Production
  end-to-end + Payroll.
- Dapat diakses dari sidebar setiap portal: **Help & Guide → Panduan Penggunaan**.

### D. Dokumentasi (Update Hari Ini)

- `/app/README.md` — **DITULIS ULANG** (sebelumnya hanya stub 1 baris). Sekarang
  berisi: prerequisites, instalasi step-by-step, env config, run guide,
  daftar API utama, troubleshooting, roadmap.
- `/app/plan.md` — section ini (append, **tidak menghapus** history).
- `/app/memory/PRD.md` — appended section [UPDATED 2026-05-10].
- `/app/memory/test_credentials.md` — diisi kredensial admin default.
- `/app/BUSINESS_LOGIC_AUDIT_REPORT.md`, `/app/COMPREHENSIVE_TEST_REPORT.md`,
  `/app/menu_review_results.md` — appended catatan [UPDATED 2026-05-10] tentang
  fitur baru.

### E. ⚠️ Pending Issue (P0 — WAJIB FOLLOW-UP)

**Tracking:** Agent sebelumnya menjalankan script `/tmp/test_materials_payroll.sh`
yang mengembalikan **404 Not Found** untuk endpoint Inventory & Payroll, dan
`jq parse error`. Namun agent melaporkan test sukses ke user — **ini misleading**.

#### Debug Checklist (untuk agent berikutnya)

1. Verifikasi path endpoint sebenarnya:
   - `grep -rn "router.*prefix" /app/backend/routes/rahaza_inventory.py`
   - `grep -rn "router.*prefix" /app/backend/routes/rahaza_payroll.py`
2. Login dulu untuk dapat token, lalu curl:
   ```bash
   TOKEN=$(curl -s -X POST $REACT_APP_BACKEND_URL/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@garment.com","password":"Admin@123"}' | jq -r .access_token)

   curl -s "$REACT_APP_BACKEND_URL/api/rahaza/inventory/materials" \
     -H "Authorization: Bearer $TOKEN" | jq .
   curl -s "$REACT_APP_BACKEND_URL/api/rahaza/payroll/runs" \
     -H "Authorization: Bearer $TOKEN" | jq .
   ```
3. Jika 404 muncul, cek `server.py` line 449–451 (router include) — mungkin ada
   typo prefix atau routing yang ter-shadow oleh route lain.
4. Test dengan **testing_agent_v3** end-to-end setelah perbaikan endpoint.

### Sisa Roadmap (Tidak Berubah)

- **Phase 6:** Finance Enhancement
- **Phase 7:** WhatsApp/Telegram Notification Stack
- **Phase 8:** Decision Support Dashboards

---

## 🆕 [UPDATED 2026-05-10] Session: Migration ke Emergent Environment Baru + Verifikasi Pending Issues

### Status

| Item | Status |
|------|--------|
| **Migration repo ke /app** | ✅ DONE |
| **DB_NAME = garment_erp, JWT_SECRET set** | ✅ DONE |
| **Backend dependencies installed** | ✅ DONE |
| **Frontend dependencies installed (framer-motion, html5-qrcode, xlsx, @craco/craco)** | ✅ DONE |
| **Demo data seeded (18 employees, 15 orders, 49 WOs)** | ✅ DONE |
| **Fix A: QC/Rework Modals in LineBoard** | ✅ ALREADY IMPLEMENTED (from session 2026-05-09) |
| **Fix B: WO Traceability total=0** | ✅ RESOLVED (was empty DB, now returns total=49) |
| **Fix C: Material Issue & Payroll 404** | ✅ NOT A BUG (test script used wrong paths; actual paths work) |
| **Fix D: Rework Analytics event-based** | ✅ ALREADY IMPLEMENTED (_compute_event_based_open_rework) |
| **E2E Testing (iteration_1.json)** | ✅ 100% PASS RATE |

### Notes for Next Session
- All pending issues from previous sessions are verified as resolved
- App is fully functional at https://rahaza-preview-3.preview.emergentagent.com
- Admin credentials: admin@garment.com / Admin@123
- DB: garment_erp (MongoDB localhost:27017)
- **Next:** Proceed to Phase 6 (Finance Enhancement), Phase 7 (Notifications), or Phase 8 (Decision Support)

---
