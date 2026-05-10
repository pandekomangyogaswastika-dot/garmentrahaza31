/**
 * ProductionWizardModule — Production Wizard (P0 Automation)
 * Menggabungkan Order → WO → Release jadi 1 wizard 3-step.
 * Fitur:
 *   - Step 1: Data Order (customer, model, size, qty) + inline model creation
 *   - Step 2: Preview WO + BOM status + input material jika tidak ada BOM
 *   - Step 3: Konfirmasi & Mulai Produksi
 */
import { useState, useEffect } from 'react';
import {
  Wand2, Package, FileText, CheckCircle2, AlertCircle, ChevronRight,
  ChevronLeft, Calendar, User, Boxes, Plus, X, AlertTriangle,
  CheckCircle, Leaf, Settings2, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { GlassCard, GlassInput } from '@/components/ui/glass';
import { useProductionUI } from '@/contexts/ProductionUIContext';
import { toast } from 'sonner';

// ── Stepper ───────────────────────────────────────────────────────────────────
const WizardStepper = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Data Order', icon: FileText },
    { id: 2, label: 'Preview WO', icon: Package },
    { id: 3, label: 'Konfirmasi', icon: CheckCircle2 },
  ];
  return (
    <div className="hidden md:block w-[220px] pr-4 border-r border-border/60" data-testid="wizard-stepper">
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;
          return (
            <div key={step.id} className="flex items-start gap-3 py-3">
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                isActive ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]'
                : isDone ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'border-border bg-[var(--glass-bg)] text-muted-foreground'
              }`} data-testid={`wizard-step-dot-${step.id}`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-medium ${isActive ? 'text-foreground' : isDone ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  {step.label}
                </div>
                <div className="text-xs text-muted-foreground">Step {step.id}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Inline Model Creation Form ────────────────────────────────────────────────
const InlineModelCreateForm = ({ token, onCreated, onCancel }) => {
  const [form, setForm] = useState({ code: '', name: '', category: 'Sweater', description: '' });
  const [saving, setSaving] = useState(false);
  const categories = ['Sweater', 'Cardigan', 'Polo', 'Jacket', 'Kids', 'Lainnya'];

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Kode dan Nama wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/rahaza/models', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const newModel = await res.json();
      toast.success(`Model "${newModel.code}" berhasil dibuat`);
      onCreated(newModel);
    } catch (e) {
      toast.error('Gagal membuat model: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2 p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
          <Plus className="w-3 h-3" /> Tambah Model Baru
        </span>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-muted-foreground mb-0.5">Kode *</label>
          <GlassInput
            placeholder="e.g. SWT-NEW"
            value={form.code}
            onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-0.5">Nama *</label>
          <GlassInput
            placeholder="Nama model"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-muted-foreground mb-0.5">Kategori</label>
          <select
            className="w-full h-8 px-2 rounded-lg border border-border bg-[var(--input-surface)] text-sm"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-0.5">Deskripsi</label>
          <GlassInput
            placeholder="Opsional"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button size="sm" variant="ghost" onClick={onCancel} className="h-7 text-xs">Batal</Button>
        <Button size="sm" onClick={handleSave} disabled={saving} className="h-7 text-xs">
          {saving ? 'Menyimpan...' : 'Simpan Model'}
        </Button>
      </div>
    </div>
  );
};

// ── Step 1: Data Order ────────────────────────────────────────────────────────
const Step1OrderData = ({ form, setForm, customers, models, sizes, token, onModelsRefresh }) => {
  const [showCreateModel, setShowCreateModel] = useState(null); // idx of item showing create form

  const handleModelCreated = (idx, newModel) => {
    onModelsRefresh(newModel);
    const newItems = [...form.items];
    newItems[idx].model_id = newModel.id;
    setForm(f => ({ ...f, items: newItems }));
    setShowCreateModel(null);
  };

  return (
    <div className="space-y-4" data-testid="production-wizard-step-order">
      {/* Jenis Order */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-1.5">Jenis Order</label>
        <div className="flex gap-3">
          <button
            onClick={() => setForm(f => ({ ...f, is_internal: false }))}
            className={`flex-1 h-10 rounded-[var(--radius-control)] border transition-all ${
              !form.is_internal ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-[var(--glass-bg)] text-muted-foreground hover:bg-[var(--glass-bg-hover)]'
            }`}
            data-testid="wizard-order-type-customer"
          >
            <User className="w-4 h-4 inline mr-2" />Customer
          </button>
          <button
            onClick={() => setForm(f => ({ ...f, is_internal: true, customer_id: '' }))}
            className={`flex-1 h-10 rounded-[var(--radius-control)] border transition-all ${
              form.is_internal ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-[var(--glass-bg)] text-muted-foreground hover:bg-[var(--glass-bg-hover)]'
            }`}
            data-testid="wizard-order-type-internal"
          >
            <Boxes className="w-4 h-4 inline mr-2" />Internal
          </button>
        </div>
      </div>

      {!form.is_internal && (
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">
            Pelanggan <span className="text-red-400">*</span>
          </label>
          <select
            className="w-full h-10 px-3 rounded-[var(--radius-control)] border border-border bg-[var(--input-surface)] text-foreground"
            value={form.customer_id}
            onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}
            data-testid="wizard-customer-select"
          >
            <option value="">— Pilih Pelanggan —</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">
            <Calendar className="w-3.5 h-3.5 inline mr-1" />Tanggal Order
          </label>
          <GlassInput type="date" value={form.order_date}
            onChange={e => setForm(f => ({ ...f, order_date: e.target.value }))}
            data-testid="wizard-order-date" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1.5">Deadline</label>
          <GlassInput type="date" value={form.due_date}
            onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
            data-testid="wizard-due-date" />
        </div>
      </div>

      {/* Item Order */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-1.5">
          Item Order <span className="text-red-400">*</span>
        </label>
        <GlassCard className="p-3 space-y-3">
          {form.items.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-start">
                <div>
                  <select
                    className="w-full h-9 px-2 rounded-lg border border-border bg-[var(--input-surface)] text-sm"
                    value={item.model_id}
                    onChange={e => {
                      if (e.target.value === '__create_new__') {
                        setShowCreateModel(idx);
                        return;
                      }
                      const newItems = [...form.items];
                      newItems[idx].model_id = e.target.value;
                      setForm(f => ({ ...f, items: newItems }));
                    }}
                    data-testid={`wizard-item-model-${idx}`}
                  >
                    <option value="">— Pilih Model —</option>
                    {models.map(m => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}
                    <option value="__create_new__" className="text-primary font-medium">✚ Tambah Model Baru...</option>
                  </select>
                </div>
                <select
                  className="h-9 w-24 px-2 rounded-lg border border-border bg-[var(--input-surface)] text-sm"
                  value={item.size_id}
                  onChange={e => {
                    const newItems = [...form.items];
                    newItems[idx].size_id = e.target.value;
                    setForm(f => ({ ...f, items: newItems }));
                  }}
                  data-testid={`wizard-item-size-${idx}`}
                >
                  <option value="">Size</option>
                  {sizes.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <GlassInput
                    type="number" placeholder="Qty" min="1"
                    value={item.qty}
                    onChange={e => {
                      const newItems = [...form.items];
                      newItems[idx].qty = e.target.value;
                      setForm(f => ({ ...f, items: newItems }));
                    }}
                    className="w-20 h-9 text-sm"
                    data-testid={`wizard-item-qty-${idx}`}
                  />
                  {form.items.length > 1 && (
                    <button onClick={() => {
                      const newItems = form.items.filter((_, i) => i !== idx);
                      setForm(f => ({ ...f, items: newItems }));
                    }} className="text-muted-foreground hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {/* Inline model create form */}
              {showCreateModel === idx && (
                <InlineModelCreateForm
                  token={token}
                  onCreated={(m) => handleModelCreated(idx, m)}
                  onCancel={() => setShowCreateModel(null)}
                />
              )}
            </div>
          ))}
          <Button
            size="sm" variant="ghost"
            onClick={() => setForm(f => ({ ...f, items: [...f.items, { model_id: '', size_id: '', qty: '' }] }))}
            data-testid="wizard-add-item-btn"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Item
          </Button>
        </GlassCard>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-1.5">Catatan</label>
        <textarea
          className="w-full h-20 px-3 py-2 rounded-[var(--radius-control)] border border-border bg-[var(--input-surface)] text-foreground text-sm resize-none"
          placeholder="Catatan order (opsional)"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          data-testid="wizard-order-notes"
        />
      </div>
    </div>
  );
};

// ── Material Input Row ────────────────────────────────────────────────────────
const MaterialInputRow = ({ mat, idx, materials, onMaterials }) => {
  const update = (field, val) => {
    const next = [...materials];
    next[idx] = { ...next[idx], [field]: val };
    onMaterials(next);
  };
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-1.5 items-center">
      <GlassInput
        placeholder="Nama material (e.g. Benang Akrilik)"
        value={mat.material_name}
        onChange={e => update('material_name', e.target.value)}
        className="h-8 text-sm"
      />
      <GlassInput
        type="number" placeholder="Qty/pcs" min="0" step="0.001"
        value={mat.qty_per_pcs}
        onChange={e => update('qty_per_pcs', e.target.value)}
        className="h-8 text-sm"
      />
      <select
        className="h-8 px-2 rounded-lg border border-border bg-[var(--input-surface)] text-sm"
        value={mat.unit}
        onChange={e => update('unit', e.target.value)}
      >
        <option value="kg">kg</option>
        <option value="gram">gram</option>
        <option value="m">meter</option>
        <option value="pcs">pcs</option>
        <option value="lusin">lusin</option>
      </select>
      <button onClick={() => onMaterials(materials.filter((_, i) => i !== idx))}
        className="text-muted-foreground hover:text-red-400 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ── Step 2: Preview WO + BOM Input ────────────────────────────────────────────
const Step2Preview = ({ previewData, loading, materialInputs, setMaterialInputs }) => {
  const [expandedBOM, setExpandedBOM] = useState({});

  const toggleBOMInput = (idx) => {
    setExpandedBOM(prev => ({ ...prev, [idx]: !prev[idx] }));
    if (!materialInputs[idx]) {
      setMaterialInputs(prev => ({
        ...prev,
        [idx]: [{ material_name: '', qty_per_pcs: '', unit: 'kg' }]
      }));
    }
  };

  const updateMaterials = (idx, mats) => {
    setMaterialInputs(prev => ({ ...prev, [idx]: mats }));
  };

  const addMaterialRow = (idx) => {
    setMaterialInputs(prev => ({
      ...prev,
      [idx]: [...(prev[idx] || []), { material_name: '', qty_per_pcs: '', unit: 'kg' }]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="production-wizard-step-preview">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Menghitung preview...</p>
        </div>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="text-center text-muted-foreground py-12" data-testid="production-wizard-step-preview">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>Preview belum tersedia</p>
      </div>
    );
  }

  const noBomItems = (previewData.items || []).filter(it => !it.has_bom);

  return (
    <div className="space-y-4" data-testid="production-wizard-step-preview">
      {/* Summary Card */}
      <GlassCard className="p-4">
        <div className="text-sm font-semibold text-foreground mb-3">Ringkasan</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Work Orders</div>
            <div className="text-2xl font-bold text-primary">{previewData.wo_count || 0}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Item</div>
            <div className="text-2xl font-bold text-foreground">{previewData.items?.length || 0}</div>
          </div>
        </div>
      </GlassCard>

      {/* BOM Warning Banner */}
      {noBomItems.length > 0 && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-400/10 border border-amber-300/20">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-300/90">
            <strong>{noBomItems.length} item tidak memiliki BOM.</strong> WO akan dibuat tanpa BOM.
            Anda dapat input estimasi bahan di bawah agar BOM terbentuk otomatis,
            atau input aktual setelah WO selesai di modul Work Order.
          </div>
        </div>
      )}

      {/* Detail per Item */}
      <div>
        <div className="text-sm font-semibold text-foreground mb-2">Detail WO yang akan dibuat:</div>
        <div className="space-y-2">
          {(previewData.items || []).map((item, idx) => (
            <GlassCard key={idx} className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {item.model_code || '—'} · {item.size_code || '—'}
                  </div>
                  <div className="text-xs text-muted-foreground">{item.model_name || 'Model'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-primary">{item.qty} pcs</div>
                  {item.has_bom ? (
                    <div className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle className="w-3 h-3" /> BOM tersedia
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleBOMInput(idx)}
                      className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {expandedBOM[idx] ? 'Tutup input' : 'Input estimasi bahan'}
                    </button>
                  )}
                </div>
              </div>

              {/* Material Input Form (if no BOM and expanded) */}
              {!item.has_bom && expandedBOM[idx] && (
                <div className="border-t border-border/40 pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground/70 flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-primary" />
                      Estimasi bahan per 1 pcs (opsional)
                    </span>
                    <div className="text-[10px] text-muted-foreground">Nama · Qty/pcs · Satuan</div>
                  </div>
                  <div className="space-y-1.5">
                    {(materialInputs[idx] || []).map((mat, mIdx) => (
                      <MaterialInputRow
                        key={mIdx}
                        mat={mat}
                        idx={mIdx}
                        materials={materialInputs[idx] || []}
                        onMaterials={(mats) => updateMaterials(idx, mats)}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => addMaterialRow(idx)}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Tambah bahan
                  </button>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Info className="w-3 h-3" />
                    BOM akan dibuat otomatis saat wizard dijalankan.
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Step 3: Konfirmasi ────────────────────────────────────────────────────────
const Step3Confirm = ({ form, previewData, materialInputs, confirmed, setConfirmed }) => {
  const itemsWithBomInput = Object.values(materialInputs).filter(
    mats => mats?.some(m => m.material_name && parseFloat(m.qty_per_pcs) > 0)
  ).length;

  return (
    <div className="space-y-4" data-testid="production-wizard-step-confirm">
      <div className="bg-[hsl(var(--info))]/10 border border-[hsl(var(--info))]/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[hsl(var(--info))] shrink-0 mt-0.5" />
          <div className="text-sm text-foreground/90 space-y-1">
            <div>Wizard akan membuat <strong>{previewData?.wo_count || 0} Work Order</strong> dan
            langsung di-release ke produksi.</div>
            {itemsWithBomInput > 0 && (
              <div className="text-emerald-400">
                ✓ BOM akan dibuat otomatis untuk {itemsWithBomInput} item berdasarkan estimasi bahan yang diisi.
              </div>
            )}
          </div>
        </div>
      </div>

      <GlassCard className="p-4">
        <div className="text-sm font-semibold text-foreground mb-3">Checklist Validasi</div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            className="mt-0.5"
            data-testid="wizard-confirm-checkbox"
          />
          <span className="text-sm text-foreground/90">
            Saya sudah mengecek target qty dan deadline. Data sudah benar.
          </span>
        </label>
      </GlassCard>

      <div className="text-xs text-muted-foreground">
        <strong>Catatan:</strong> Setelah eksekusi, Order akan muncul di modul Order Produksi
        dengan status <em>In Production</em> dan WO akan tersedia di modul Work Orders
        dengan status <em>Released</em>.
        {Object.keys(materialInputs).length > 0 && itemsWithBomInput === 0 && (
          <span className="block mt-1 text-amber-300/80">
            ⚠ Ada item tanpa BOM yang tidak diisi estimasi bahannya.
            Anda dapat input aktual bahan setelah WO selesai melalui detail Work Order.
          </span>
        )}
      </div>
    </div>
  );
};

// ── Main Wizard Component ─────────────────────────────────────────────────────
export default function ProductionWizardModule({ token, isGlobalMount = false }) {
  const { wizardOpen, wizardInitial, openWizard, closeWizard } = useProductionUI();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    is_internal: false,
    customer_id: '',
    order_date: new Date().toISOString().split('T')[0],
    due_date: '',
    items: [{ model_id: '', size_id: '', qty: '' }],
    notes: '',
  });
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [materialInputs, setMaterialInputs] = useState({}); // { itemIdx: [{material_name, qty_per_pcs, unit}] }
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Master data
  const [customers, setCustomers] = useState([]);
  const [models, setModels] = useState([]);
  const [sizes, setSizes] = useState([]);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (wizardOpen) {
      fetchMasterData();
      if (wizardInitial) setForm(f => ({ ...f, ...wizardInitial }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardOpen]);

  const fetchMasterData = async () => {
    try {
      const [c, m, s] = await Promise.all([
        fetch('/api/rahaza/customers?active=true&limit=200', { headers }).then(r => r.json()),
        fetch('/api/rahaza/models?active=true&limit=200', { headers }).then(r => r.json()),
        fetch('/api/rahaza/sizes?active=true&limit=200', { headers }).then(r => r.json()),
      ]);
      setCustomers(Array.isArray(c) ? c : c.items || []);
      setModels(Array.isArray(m) ? m : m.items || []);
      setSizes(Array.isArray(s) ? s : s.items || []);
    } catch (e) {
      console.error('Failed to fetch master data:', e);
    }
  };

  const handleModelsRefresh = (newModel) => {
    setModels(prev => [...prev, newModel]);
  };

  const validateStep1 = () => {
    if (!form.is_internal && !form.customer_id) {
      setError('Pilih pelanggan atau centang Produksi Internal.');
      return false;
    }
    const validItems = form.items.filter(i => i.model_id && i.size_id && Number(i.qty) > 0);
    if (validItems.length === 0) {
      setError('Minimal 1 item dengan model, size, dan qty > 0.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setPreviewLoading(true);
      try {
        const cleanedItems = form.items
          .filter(i => i.model_id && i.size_id && Number(i.qty) > 0)
          .map(i => ({ model_id: i.model_id, size_id: i.size_id, qty: Number(i.qty) }));
        const res = await fetch('/api/rahaza/wizard/preview-production', {
          method: 'POST', headers,
          body: JSON.stringify({ items: cleanedItems }),
        });
        if (!res.ok) throw new Error('Preview gagal');
        const data = await res.json();
        setPreviewData(data);
        setMaterialInputs({});
        setStep(2);
      } catch (e) {
        toast.error('Gagal mendapatkan preview: ' + e.message);
      } finally {
        setPreviewLoading(false);
      }
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async () => {
    if (!confirmed) { setError('Centang konfirmasi terlebih dahulu.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const cleanedItems = form.items
        .filter(i => i.model_id && i.size_id && Number(i.qty) > 0)
        .map((i, idx) => {
          // Attach material inputs for items without BOM
          const mats = (materialInputs[idx] || [])
            .filter(m => m.material_name && parseFloat(m.qty_per_pcs) > 0)
            .map(m => ({
              material_name: m.material_name,
              qty_per_pcs: parseFloat(m.qty_per_pcs),
              unit: m.unit || 'kg',
              material_type: 'yarn',
            }));
          return {
            model_id: i.model_id,
            size_id: i.size_id,
            qty: Number(i.qty),
            materials: mats.length > 0 ? mats : undefined,
          };
        });

      const payload = {
        is_internal: form.is_internal,
        customer_id: form.customer_id || null,
        order_date: form.order_date,
        due_date: form.due_date || null,
        items: cleanedItems,
        notes: form.notes,
        auto_release_wo: true,
        auto_generate_bundles: false,
      };

      const res = await fetch('/api/rahaza/wizard/start-production', {
        method: 'POST', headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }
      const result = await res.json();
      const bomMsg = result.wos?.filter(w => w.has_bom).length || 0;
      toast.success(
        `✅ Produksi dimulai! Order ${result.order_number} · ${result.wos_created} WO dibuat${bomMsg > 0 ? ` · ${bomMsg} BOM terbentuk` : ''}`
      );
      handleClose();
    } catch (e) {
      toast.error('Gagal memulai produksi: ' + e.message);
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setForm({
      is_internal: false,
      customer_id: '',
      order_date: new Date().toISOString().split('T')[0],
      due_date: '',
      items: [{ model_id: '', size_id: '', qty: '' }],
      notes: '',
    });
    setPreviewData(null);
    setMaterialInputs({});
    setConfirmed(false);
    setError('');
    closeWizard();
  };

  if (!wizardOpen) {
    if (isGlobalMount) return null;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_24px_hsl(var(--primary)/0.2)]">
          <Wand2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground mb-2">Production Wizard</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            Mulai produksi baru dengan cepat: isi data order, review WO, dan konfirmasi dalam 3 langkah.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-left max-w-lg w-full">
          {[
            { step: 1, icon: FileText, label: 'Data Order', desc: 'Isi customer, model, size, dan qty. Bisa tambah model baru langsung.' },
            { step: 2, icon: Package, label: 'Preview WO', desc: 'Review WO yang akan dibuat. Input estimasi bahan jika belum ada BOM.' },
            { step: 3, icon: CheckCircle2, label: 'Konfirmasi', desc: 'Konfirmasi & mulai produksi. WO langsung di-release.' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="rounded-[var(--radius-lg)] border border-border/50 bg-[var(--glass-bg)] p-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs font-semibold text-foreground mb-1">Step {s.step}: {s.label}</p>
                <p className="text-[11px] text-muted-foreground">{s.desc}</p>
              </div>
            );
          })}
        </div>
        <Button
          size="lg" className="gap-2 px-8 shadow-[var(--shadow-glow-blue)]"
          onClick={openWizard} data-testid="production-wizard-open-button"
        >
          <Wand2 className="w-5 h-5" /> Mulai Wizard Produksi
        </Button>
        <p className="text-xs text-muted-foreground">
          Atau gunakan tombol ✨ di pojok kanan bawah · Shortcut:{' '}
          <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono bg-[var(--glass-bg)]">Alt+I</kbd>
        </p>
      </div>
    );
  }

  if (!isGlobalMount) return null;

  return (
    <Dialog open={wizardOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[980px] max-h-[85vh] overflow-hidden flex flex-col" data-testid="production-wizard-dialog">
        <DialogHeader className="pb-2 border-b border-border/60">
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Production Wizard
          </DialogTitle>
          <DialogDescription>
            Mulai produksi dengan 1 klik: Order → WO → Release
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 flex-1 overflow-hidden">
          <WizardStepper currentStep={step} />

          <div className="flex-1 overflow-y-auto pr-2">
            {error && (
              <div className="bg-red-400/10 border border-red-300/20 rounded-lg p-3 mb-4 text-sm text-red-300">
                {error}
              </div>
            )}
            {step === 1 && (
              <Step1OrderData
                form={form} setForm={setForm}
                customers={customers} models={models} sizes={sizes}
                token={token} onModelsRefresh={handleModelsRefresh}
              />
            )}
            {step === 2 && (
              <Step2Preview
                previewData={previewData} loading={previewLoading}
                materialInputs={materialInputs} setMaterialInputs={setMaterialInputs}
              />
            )}
            {step === 3 && (
              <Step3Confirm
                form={form} previewData={previewData}
                materialInputs={materialInputs}
                confirmed={confirmed} setConfirmed={setConfirmed}
              />
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/60">
          {step > 1 && (
            <Button variant="ghost" onClick={handleBack} disabled={submitting} data-testid="production-wizard-back-button">
              <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
            </Button>
          )}
          <div className="flex-1" />
          {step < 3 && (
            <Button onClick={handleNext} disabled={previewLoading} data-testid="production-wizard-next-button">
              Lanjut <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {step === 3 && (
            <Button
              onClick={handleSubmit}
              disabled={!confirmed || submitting}
              data-testid="production-wizard-confirm-button"
            >
              {submitting ? 'Memproses...' : 'Mulai Produksi'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
