'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, Eye, EyeOff, ChevronDown, ChevronUp, Upload, X, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'announcement' | 'hero' | 'categories' | 'trust' | 'looks' | 'editorial' | 'cod' | 'newsletter' | 'footer' | 'reviews' | 'nav' | 'pixels';

const TABS: { id: Tab; label: string }[] = [
  { id: 'announcement', label: 'شريط الإعلانات' },
  { id: 'nav',          label: 'قائمة التصفح' },
  { id: 'hero',         label: 'الهيرو (البانر)' },
  { id: 'categories',   label: 'الفئات' },
  { id: 'trust',        label: 'شارات الثقة' },
  { id: 'looks',        label: 'إطلالاتنا' },
  { id: 'editorial',    label: 'قسم الوعود' },
  { id: 'cod',          label: 'بانر الدفع' },
  { id: 'newsletter',   label: 'النشرة البريدية' },
  { id: 'footer',       label: 'الفوتر' },
  { id: 'reviews',      label: 'التقييمات' },
  { id: 'pixels',       label: 'بيكسلات الإعلانات' },
];

function ImageInput({
  value, onChange, recommended, folder = 'content',
}: {
  value: string;
  onChange: (url: string) => void;
  recommended: string;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('فقط JPG, PNG, WebP مسموح بها');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5MB');
      return;
    }
    setUploading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') ?? '' : '';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'فشل الرفع');
        return;
      }
      onChange(data.data.url);
      toast.success('تم رفع الصورة ✓');
    } catch {
      toast.error('فشل الرفع');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] text-gray-500 mb-1.5">
        <Info size={10} />
        الحجم الموصى به: <span className="text-[#C9A84C] font-medium">{recommended}</span>
        &nbsp;· JPG, PNG, WebP · حتى 5MB
      </p>
      <div className="flex gap-2 mb-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... أو ارفع من جهازك"
          className="flex-1 bg-gray-900 border border-gray-600 text-white text-sm px-3 py-2 rounded focus:outline-none focus:border-[#C9A84C] transition-colors"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded border border-gray-600 transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? 'جاري الرفع...' : 'رفع صورة'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
        />
      </div>
      {value && (
        <div className="relative h-32 overflow-hidden rounded border border-gray-700 group">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-400 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs tracking-widest uppercase mb-1.5 text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-900 border border-gray-600 text-white text-sm px-3 py-2 rounded focus:outline-none focus:border-[#C9A84C] transition-colors"
    />
  );
}

function Textarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full bg-gray-900 border border-gray-600 text-white text-sm px-3 py-2 rounded focus:outline-none focus:border-[#C9A84C] transition-colors resize-none"
    />
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-[#C9A84C]' : 'bg-gray-600'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : ''}`} />
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  );
}

function Card({ title, children, collapsible = false }: { title: string; children: React.ReactNode; collapsible?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-4">
      <button
        onClick={() => collapsible && setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-white ${collapsible ? 'hover:bg-gray-750 cursor-pointer' : 'cursor-default'}`}
      >
        {title}
        {collapsible && (open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />)}
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

type DBCategory = { id: string; slug: string; nameAr: string; nameEn: string; sortOrder: number };

function NavCategoriesTab({ token }: { token: string }) {
  const [cats, setCats] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ slug: '', nameAr: '', nameEn: '' });
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Record<string, DBCategory>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCats(data.data ?? []);
    } catch { toast.error('فشل التحميل'); }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const startEdit = (cat: DBCategory) => setEditing((p) => ({ ...p, [cat.id]: { ...cat } }));
  const cancelEdit = (id: string) => setEditing((p) => { const n = { ...p }; delete n[id]; return n; });

  const saveEdit = async (id: string) => {
    const cat = editing[id];
    if (!cat) return;
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slug: cat.slug, nameAr: cat.nameAr, nameEn: cat.nameEn }),
      });
      if (!res.ok) { toast.error('فشل الحفظ'); return; }
      toast.success('تم الحفظ ✓');
      cancelEdit(id);
      load();
    } catch { toast.error('فشل الحفظ'); }
    setSaving(null);
  };

  const deleteCat = async (id: string) => {
    if (!confirm('حذف الفئة؟')) return;
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { toast.error('فشل الحذف'); return; }
      toast.success('تم الحذف ✓');
      load();
    } catch { toast.error('فشل الحذف'); }
    setSaving(null);
  };

  const addCat = async () => {
    if (!newCat.slug || !newCat.nameAr || !newCat.nameEn) { toast.error('أدخل جميع الحقول'); return; }
    setAdding(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newCat),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); toast.error(e.error ?? 'فشل الإضافة'); return; }
      toast.success('تمت الإضافة ✓');
      setNewCat({ slug: '', nameAr: '', nameEn: '' });
      load();
    } catch { toast.error('فشل الإضافة'); }
    setAdding(false);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <Card title="فئات شريط التصفح">
        <p className="text-xs text-gray-400 mb-4">التغييرات تظهر فوراً على الموقع بدون بناء.</p>
        {cats.map((cat) => {
          const e = editing[cat.id];
          return (
            <div key={cat.id} className="grid grid-cols-4 gap-2 mb-3 p-3 bg-gray-900 rounded items-end">
              <Field label="Slug (URL)">
                <input value={e ? e.slug : cat.slug} readOnly={!e}
                  onChange={(ev) => setEditing((p) => ({ ...p, [cat.id]: { ...p[cat.id], slug: ev.target.value } }))}
                  className={`w-full bg-gray-800 border text-white text-sm px-2 py-1.5 rounded focus:outline-none ${e ? 'border-[#C9A84C]' : 'border-gray-700'}`} />
              </Field>
              <Field label="English">
                <input value={e ? e.nameEn : cat.nameEn} readOnly={!e}
                  onChange={(ev) => setEditing((p) => ({ ...p, [cat.id]: { ...p[cat.id], nameEn: ev.target.value } }))}
                  className={`w-full bg-gray-800 border text-white text-sm px-2 py-1.5 rounded focus:outline-none ${e ? 'border-[#C9A84C]' : 'border-gray-700'}`} />
              </Field>
              <Field label="عربي">
                <input value={e ? e.nameAr : cat.nameAr} readOnly={!e} dir="rtl"
                  onChange={(ev) => setEditing((p) => ({ ...p, [cat.id]: { ...p[cat.id], nameAr: ev.target.value } }))}
                  className={`w-full bg-gray-800 border text-white text-sm px-2 py-1.5 rounded focus:outline-none ${e ? 'border-[#C9A84C]' : 'border-gray-700'}`} />
              </Field>
              <div className="flex gap-1">
                {e ? (
                  <>
                    <button onClick={() => saveEdit(cat.id)} disabled={saving === cat.id}
                      className="flex-1 bg-[#C9A84C] text-[#1a1a18] text-xs font-bold px-2 py-1.5 rounded hover:bg-yellow-400 disabled:opacity-60">
                      {saving === cat.id ? '...' : 'حفظ'}
                    </button>
                    <button onClick={() => cancelEdit(cat.id)} className="px-2 py-1.5 text-gray-400 hover:text-white text-xs border border-gray-700 rounded">إلغاء</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(cat)} className="flex-1 text-xs border border-gray-600 text-gray-300 hover:border-[#C9A84C] hover:text-white px-2 py-1.5 rounded">تعديل</button>
                    <button onClick={() => deleteCat(cat.id)} disabled={saving === cat.id}
                      className="px-2 py-1.5 text-red-400 hover:text-red-300 border border-gray-700 rounded disabled:opacity-60">
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </Card>

      <Card title="إضافة فئة جديدة">
        <div className="grid grid-cols-4 gap-2 items-end">
          <Field label="Slug (URL)">
            <input value={newCat.slug} onChange={(e) => setNewCat((p) => ({ ...p, slug: e.target.value }))}
              placeholder="e.g. rings"
              className="w-full bg-gray-900 border border-gray-600 text-white text-sm px-2 py-1.5 rounded focus:outline-none focus:border-[#C9A84C]" />
          </Field>
          <Field label="English">
            <input value={newCat.nameEn} onChange={(e) => setNewCat((p) => ({ ...p, nameEn: e.target.value }))}
              placeholder="Rings"
              className="w-full bg-gray-900 border border-gray-600 text-white text-sm px-2 py-1.5 rounded focus:outline-none focus:border-[#C9A84C]" />
          </Field>
          <Field label="عربي">
            <input value={newCat.nameAr} onChange={(e) => setNewCat((p) => ({ ...p, nameAr: e.target.value }))} dir="rtl"
              placeholder="خواتم"
              className="w-full bg-gray-900 border border-gray-600 text-white text-sm px-2 py-1.5 rounded focus:outline-none focus:border-[#C9A84C]" />
          </Field>
          <button onClick={addCat} disabled={adding}
            className="flex items-center justify-center gap-1 bg-[#C9A84C] text-[#1a1a18] text-sm font-bold px-4 py-1.5 rounded hover:bg-yellow-400 disabled:opacity-60">
            <Plus size={14} /> {adding ? '...' : 'إضافة'}
          </button>
        </div>
      </Card>
    </div>
  );
}

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('announcement');
  const [saving, setSaving]       = useState(false);
  const [content, setContent]     = useState<Record<string, unknown>>({});
  const [loading, setLoading]     = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') ?? '' : '';

  const load = useCallback(async () => {
    try {
      const res  = await fetch('/api/content');
      const data = await res.json();
      setContent(data.data ?? {});
    } catch {
      toast.error('فشل تحميل المحتوى');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (key: string, value: unknown) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(`فشل الحفظ: ${err.error ?? res.status}`);
        return;
      }
      setContent((prev) => ({ ...prev, [key]: value }));
      toast.success('تم الحفظ ✓');
    } catch {
      toast.error('فشل الحفظ — تحقق من الاتصال');
    } finally {
      setSaving(false);
    }
  };

  const get = <T,>(key: string, def: T): T => (key in content ? (content[key] as T) : def);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">محتوى الموقع</h1>
        <p className="text-gray-400 text-sm">تحكم في جميع النصوص والصور في كل صفحات الموقع</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-xs tracking-wide rounded transition-colors ${
              activeTab === t.id
                ? 'bg-[#C9A84C] text-[#1a1a18] font-bold'
                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── ANNOUNCEMENT BAR ─── */}
      {activeTab === 'announcement' && (() => {
        type AB = { visible: boolean; items_en: string[]; items_ar: string[]; bg_color: string; text_color: string };
        const def: AB = { visible: true, items_en: [], items_ar: [], bg_color: '#1a1a18', text_color: '#FAF9F7' };
        const val     = get<AB>('announcement_bar', def);
        const set     = (patch: Partial<AB>) => setContent((p) => ({ ...p, announcement_bar: { ...val, ...patch } }));
        return (
          <div>
            <Card title="شريط الإعلانات العلوي">
              <Field label="إظهار الشريط">
                <Toggle value={val.visible} onChange={(v) => set({ visible: v })} label={val.visible ? 'ظاهر' : 'مخفي'} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="لون الخلفية">
                  <div className="flex gap-2 items-center">
                    <input type="color" value={val.bg_color} onChange={(e) => set({ bg_color: e.target.value })}
                      className="w-10 h-8 rounded border border-gray-600 bg-transparent cursor-pointer" />
                    <Input value={val.bg_color} onChange={(v) => set({ bg_color: v })} />
                  </div>
                </Field>
                <Field label="لون النص">
                  <div className="flex gap-2 items-center">
                    <input type="color" value={val.text_color} onChange={(e) => set({ text_color: e.target.value })}
                      className="w-10 h-8 rounded border border-gray-600 bg-transparent cursor-pointer" />
                    <Input value={val.text_color} onChange={(v) => set({ text_color: v })} />
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-2">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">الرسائل بالإنجليزية</p>
                  {val.items_en.map((item, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={item}
                        onChange={(e) => { const arr = [...val.items_en]; arr[i] = e.target.value; set({ items_en: arr }); }}
                        className="flex-1 bg-gray-900 border border-gray-600 text-white text-sm px-3 py-1.5 rounded focus:outline-none focus:border-[#C9A84C]" />
                      <button onClick={() => { const arr = val.items_en.filter((_, j) => j !== i); set({ items_en: arr }); }}
                        className="text-red-400 hover:text-red-300 px-2"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => set({ items_en: [...val.items_en, ''] })}
                    className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-yellow-300 mt-1">
                    <Plus size={13} /> إضافة رسالة
                  </button>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">الرسائل بالعربية</p>
                  {val.items_ar.map((item, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={item} dir="rtl"
                        onChange={(e) => { const arr = [...val.items_ar]; arr[i] = e.target.value; set({ items_ar: arr }); }}
                        className="flex-1 bg-gray-900 border border-gray-600 text-white text-sm px-3 py-1.5 rounded focus:outline-none focus:border-[#C9A84C]" />
                      <button onClick={() => { const arr = val.items_ar.filter((_, j) => j !== i); set({ items_ar: arr }); }}
                        className="text-red-400 hover:text-red-300 px-2"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => set({ items_ar: [...val.items_ar, ''] })}
                    className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-yellow-300 mt-1">
                    <Plus size={13} /> إضافة رسالة
                  </button>
                </div>
              </div>
            </Card>
            <button onClick={() => save('announcement_bar', val)} disabled={saving}
              className="flex items-center gap-2 bg-[#C9A84C] text-[#1a1a18] px-6 py-2.5 text-sm font-bold rounded hover:bg-yellow-400 transition-colors disabled:opacity-60">
              <Save size={15} /> {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </div>
        );
      })()}

      {/* ─── NAV CATEGORIES ─── */}
      {activeTab === 'nav' && <NavCategoriesTab token={token} />}

      {/* ─── HERO SLIDES ─── */}
      {activeTab === 'hero' && (() => {
        type Slide = { image: string; tag_en: string; tag_ar: string; heading1: string; heading2: string; sub_en: string; sub_ar: string; cta_en: string; cta_ar: string; cta_href: string; };
        const val = get<Slide[]>('hero_slides', []);
        const set = (v: Slide[]) => setContent((p) => ({ ...p, hero_slides: v }));
        const upd = (i: number, patch: Partial<Slide>) => { const a = [...val]; a[i] = { ...a[i], ...patch }; set(a); };
        return (
          <div>
            {val.map((s, i) => (
              <Card key={i} title={`سلايد ${i + 1} — ${s.heading1} ${s.heading2}`} collapsible>
                <Field label="الصورة">
                  <ImageInput
                    value={s.image}
                    onChange={(v) => upd(i, { image: v })}
                    recommended="1920 × 1080px (أفقي)"
                    folder="content/hero"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Tag (EN)"><Input value={s.tag_en} onChange={(v) => upd(i, { tag_en: v })} /></Field>
                  <Field label="Tag (AR)"><Input value={s.tag_ar} onChange={(v) => upd(i, { tag_ar: v })} /></Field>
                  <Field label="Heading Line 1"><Input value={s.heading1} onChange={(v) => upd(i, { heading1: v })} /></Field>
                  <Field label="Heading Line 2 (Gold)"><Input value={s.heading2} onChange={(v) => upd(i, { heading2: v })} /></Field>
                  <Field label="Subtitle (EN)"><Input value={s.sub_en} onChange={(v) => upd(i, { sub_en: v })} /></Field>
                  <Field label="Subtitle (AR)"><Input value={s.sub_ar} onChange={(v) => upd(i, { sub_ar: v })} /></Field>
                  <Field label="CTA Button (EN)"><Input value={s.cta_en} onChange={(v) => upd(i, { cta_en: v })} /></Field>
                  <Field label="CTA Button (AR)"><Input value={s.cta_ar} onChange={(v) => upd(i, { cta_ar: v })} /></Field>
                  <Field label="CTA Link (href)"><Input value={s.cta_href} onChange={(v) => upd(i, { cta_href: v })} /></Field>
                </div>
                <button onClick={() => set(val.filter((_, j) => j !== i))}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 mt-2">
                  <Trash2 size={13} /> حذف السلايد
                </button>
              </Card>
            ))}
            <button onClick={() => set([...val, { image: '', tag_en: 'New', tag_ar: 'جديد', heading1: 'New', heading2: 'Collection', sub_en: '', sub_ar: '', cta_en: 'Shop Now', cta_ar: 'تسوق الآن', cta_href: '/products' }])}
              className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-yellow-300 mb-4">
              <Plus size={13} /> إضافة سلايد
            </button>
            <button onClick={() => save('hero_slides', val)} disabled={saving}
              className="flex items-center gap-2 bg-[#C9A84C] text-[#1a1a18] px-6 py-2.5 text-sm font-bold rounded hover:bg-yellow-400 transition-colors disabled:opacity-60">
              <Save size={15} /> {saving ? 'جاري الحفظ...' : 'حفظ السلايدات'}
            </button>
          </div>
        );
      })()}

      {/* ─── CATEGORIES ─── */}
      {activeTab === 'categories' && (() => {
        type CS = { tag_en: string; tag_ar: string; title_en: string; title_ar: string; items: { slug: string; en: string; ar: string; image: string }[] };
        const def: CS = { tag_en: 'Shop by Category', tag_ar: 'تسوق حسب الفئة', title_en: 'Our Collections', title_ar: 'مجموعاتنا', items: [] };
        const val     = get<CS>('categories_section', def);
        const set     = (patch: Partial<CS>) => setContent((p) => ({ ...p, categories_section: { ...val, ...patch } }));
        const updItem = (i: number, patch: Partial<CS['items'][0]>) => { const a = [...val.items]; a[i] = { ...a[i], ...patch }; set({ items: a }); };
        return (
          <div>
            <Card title="رأس قسم الفئات">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tag (EN)"><Input value={val.tag_en} onChange={(v) => set({ tag_en: v })} /></Field>
                <Field label="Tag (AR)"><Input value={val.tag_ar} onChange={(v) => set({ tag_ar: v })} /></Field>
                <Field label="Title (EN)"><Input value={val.title_en} onChange={(v) => set({ title_en: v })} /></Field>
                <Field label="Title (AR)"><Input value={val.title_ar} onChange={(v) => set({ title_ar: v })} /></Field>
              </div>
            </Card>
            {val.items.map((item, i) => (
              <Card key={i} title={`فئة: ${item.en}`} collapsible>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Slug"><Input value={item.slug} onChange={(v) => updItem(i, { slug: v })} /></Field>
                  <Field label="English"><Input value={item.en} onChange={(v) => updItem(i, { en: v })} /></Field>
                  <Field label="عربي"><Input value={item.ar} onChange={(v) => updItem(i, { ar: v })} /></Field>
                </div>
                <Field label="الصورة">
                  <ImageInput
                    value={item.image}
                    onChange={(v) => updItem(i, { image: v })}
                    recommended="800 × 800px (مربع)"
                    folder="content/categories"
                  />
                </Field>
              </Card>
            ))}
            <button onClick={() => set({ items: [...val.items, { slug: '', en: '', ar: '', image: '' }] })}
              className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-yellow-300 mb-4">
              <Plus size={13} /> إضافة فئة
            </button>
            <button onClick={() => save('categories_section', val)} disabled={saving}
              className="flex items-center gap-2 bg-[#C9A84C] text-[#1a1a18] px-6 py-2.5 text-sm font-bold rounded hover:bg-yellow-400 transition-colors disabled:opacity-60">
              <Save size={15} /> {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        );
      })()}

      {/* ─── TRUST BADGES ─── */}
      {activeTab === 'trust' && (() => {
        type TB = { icon: string; en: string; ar: string }[];
        const val = get<TB>('trust_badges', []);
        const set = (v: TB) => setContent((p) => ({ ...p, trust_badges: v }));
        const upd = (i: number, patch: Partial<TB[0]>) => { const a = [...val]; a[i] = { ...a[i], ...patch }; set(a); };
        return (
          <div>
            <Card title="شارات الثقة (٤ شارات)">
              <p className="text-xs text-gray-500 mb-4">الأيقونات المتاحة: CreditCard, Truck, Shield, Phone, Star, Heart, CheckCircle</p>
              {val.map((b, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 mb-3 p-3 bg-gray-900 rounded">
                  <Field label="Icon name"><Input value={b.icon} onChange={(v) => upd(i, { icon: v })} /></Field>
                  <Field label="نص (EN)"><Input value={b.en} onChange={(v) => upd(i, { en: v })} /></Field>
                  <Field label="نص (AR)">
                    <div className="flex gap-2">
                      <Input value={b.ar} onChange={(v) => upd(i, { ar: v })} />
                      <button onClick={() => set(val.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 px-2"><Trash2 size={14} /></button>
                    </div>
                  </Field>
                </div>
              ))}
              <button onClick={() => set([...val, { icon: 'Shield', en: '', ar: '' }])}
                className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-yellow-300">
                <Plus size={13} /> إضافة شارة
              </button>
            </Card>
            <button onClick={() => save('trust_badges', val)} disabled={saving}
              className="flex items-center gap-2 bg-[#C9A84C] text-[#1a1a18] px-6 py-2.5 text-sm font-bold rounded hover:bg-yellow-400 transition-colors disabled:opacity-60">
              <Save size={15} /> {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        );
      })()}

      {/* ─── SHOP OUR LOOKS ─── */}
      {activeTab === 'looks' && (() => {
        type SOL = { visible: boolean; tag_en: string; tag_ar: string; title_en: string; title_ar: string; items: { image: string; caption_en: string; caption_ar: string; href: string }[] };
        const def: SOL = { visible: true, tag_en: 'Get The Look', tag_ar: 'احصلي على الإطلالة', title_en: 'Shop Our Looks', title_ar: 'تسوقي إطلالاتنا', items: [] };
        const val      = get<SOL>('shop_our_looks', def);
        const set      = (patch: Partial<SOL>) => setContent((p) => ({ ...p, shop_our_looks: { ...val, ...patch } }));
        const updItem  = (i: number, patch: Partial<SOL['items'][0]>) => { const a = [...val.items]; a[i] = { ...a[i], ...patch }; set({ items: a }); };
        return (
          <div>
            <Card title="إعدادات القسم">
              <Field label="إظهار القسم">
                <Toggle value={val.visible} onChange={(v) => set({ visible: v })} label={val.visible ? 'ظاهر' : 'مخفي'} />
              </Field>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <Field label="Tag (EN)"><Input value={val.tag_en} onChange={(v) => set({ tag_en: v })} /></Field>
                <Field label="Tag (AR)"><Input value={val.tag_ar} onChange={(v) => set({ tag_ar: v })} /></Field>
                <Field label="Title (EN)"><Input value={val.title_en} onChange={(v) => set({ title_en: v })} /></Field>
                <Field label="Title (AR)"><Input value={val.title_ar} onChange={(v) => set({ title_ar: v })} /></Field>
              </div>
            </Card>
            {val.items.map((item, i) => (
              <Card key={i} title={`إطلالة ${i + 1} — ${item.caption_en}`} collapsible>
                <Field label="الصورة">
                  <ImageInput
                    value={item.image}
                    onChange={(v) => updItem(i, { image: v })}
                    recommended="600 × 800px (عمودي)"
                    folder="content/looks"
                  />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Caption (EN)"><Input value={item.caption_en} onChange={(v) => updItem(i, { caption_en: v })} /></Field>
                  <Field label="Caption (AR)"><Input value={item.caption_ar} onChange={(v) => updItem(i, { caption_ar: v })} /></Field>
                  <Field label="Link (href)"><Input value={item.href} onChange={(v) => updItem(i, { href: v })} /></Field>
                </div>
              </Card>
            ))}
            <button onClick={() => set({ items: [...val.items, { image: '', caption_en: '', caption_ar: '', href: '/products' }] })}
              className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-yellow-300 mb-4">
              <Plus size={13} /> إضافة إطلالة
            </button>
            <button onClick={() => save('shop_our_looks', val)} disabled={saving}
              className="flex items-center gap-2 bg-[#C9A84C] text-[#1a1a18] px-6 py-2.5 text-sm font-bold rounded hover:bg-yellow-400 transition-colors disabled:opacity-60">
              <Save size={15} /> {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        );
      })()}

      {/* ─── EDITORIAL ─── */}
      {activeTab === 'editorial' && (() => {
        type ED = { tag_en: string; tag_ar: string; heading_en: string; heading_ar: string; text_en: string; text_ar: string; image: string; promise_items: { en: string; ar: string }[] };
        const def: ED = { tag_en: 'Our Promise', tag_ar: 'وعدنا', heading_en: '', heading_ar: '', text_en: '', text_ar: '', image: '', promise_items: [] };
        const val     = get<ED>('editorial_section', def);
        const set     = (patch: Partial<ED>) => setContent((p) => ({ ...p, editorial_section: { ...val, ...patch } }));
        const updProm = (i: number, patch: Partial<{ en: string; ar: string }>) => { const a = [...val.promise_items]; a[i] = { ...a[i], ...patch }; set({ promise_items: a }); };
        return (
          <div>
            <Card title="النصوص الرئيسية">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tag (EN)"><Input value={val.tag_en} onChange={(v) => set({ tag_en: v })} /></Field>
                <Field label="Tag (AR)"><Input value={val.tag_ar} onChange={(v) => set({ tag_ar: v })} /></Field>
                <Field label="Heading (EN)"><Textarea value={val.heading_en} onChange={(v) => set({ heading_en: v })} rows={2} /></Field>
                <Field label="Heading (AR)"><Textarea value={val.heading_ar} onChange={(v) => set({ heading_ar: v })} rows={2} /></Field>
                <Field label="Body Text (EN)"><Textarea value={val.text_en} onChange={(v) => set({ text_en: v })} /></Field>
                <Field label="Body Text (AR)"><Textarea value={val.text_ar} onChange={(v) => set({ text_ar: v })} /></Field>
              </div>
              <Field label="الصورة الجانبية">
                <ImageInput
                  value={val.image}
                  onChange={(v) => set({ image: v })}
                  recommended="800 × 1000px (عمودي)"
                  folder="content/editorial"
                />
              </Field>
            </Card>
            <Card title="نقاط الوعود">
              {val.promise_items.map((p, i) => (
                <div key={i} className="grid grid-cols-2 gap-3 mb-2">
                  <Input value={p.en} onChange={(v) => updProm(i, { en: v })} placeholder="English" />
                  <div className="flex gap-2">
                    <Input value={p.ar} onChange={(v) => updProm(i, { ar: v })} placeholder="عربي" />
                    <button onClick={() => set({ promise_items: val.promise_items.filter((_, j) => j !== i) })} className="text-red-400 px-2"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              <button onClick={() => set({ promise_items: [...val.promise_items, { en: '', ar: '' }] })}
                className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-yellow-300 mt-2">
                <Plus size={13} /> إضافة نقطة
              </button>
            </Card>
            <button onClick={() => save('editorial_section', val)} disabled={saving}
              className="flex items-center gap-2 bg-[#C9A84C] text-[#1a1a18] px-6 py-2.5 text-sm font-bold rounded hover:bg-yellow-400 transition-colors disabled:opacity-60">
              <Save size={15} /> {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        );
      })()}

      {/* ─── COD BANNER ─── */}
      {activeTab === 'cod' && (() => {
        type COD = { tag_en: string; tag_ar: string; heading_ar: string; text_en: string; text_ar: string; cta_en: string; cta_ar: string };
        const def: COD = { tag_en: 'Free Delivery', tag_ar: 'توصيل مجاني', heading_ar: 'الدفع عند الاستلام\nلجميع المحافظات', text_en: '', text_ar: '', cta_en: 'Shop The Collection', cta_ar: 'تسوق المجموعة' };
        const val      = get<COD>('cod_banner', def);
        const set      = (patch: Partial<COD>) => setContent((p) => ({ ...p, cod_banner: { ...val, ...patch } }));
        return (
          <div>
            <Card title="بانر الدفع عند الاستلام">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tag (EN)"><Input value={val.tag_en} onChange={(v) => set({ tag_en: v })} /></Field>
                <Field label="Tag (AR)"><Input value={val.tag_ar} onChange={(v) => set({ tag_ar: v })} /></Field>
                <Field label="Heading (AR)"><Textarea value={val.heading_ar} onChange={(v) => set({ heading_ar: v })} rows={2} /></Field>
                <Field label="CTA (EN)"><Input value={val.cta_en} onChange={(v) => set({ cta_en: v })} /></Field>
                <Field label="Body (EN)"><Textarea value={val.text_en} onChange={(v) => set({ text_en: v })} /></Field>
                <Field label="Body (AR)"><Textarea value={val.text_ar} onChange={(v) => set({ text_ar: v })} /></Field>
              </div>
            </Card>
            <button onClick={() => save('cod_banner', val)} disabled={saving}
              className="flex items-center gap-2 bg-[#C9A84C] text-[#1a1a18] px-6 py-2.5 text-sm font-bold rounded hover:bg-yellow-400 transition-colors disabled:opacity-60">
              <Save size={15} /> {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        );
      })()}

      {/* ─── NEWSLETTER ─── */}
      {activeTab === 'newsletter' && (() => {
        type NL = { tag_en: string; tag_ar: string; heading_en: string; heading_ar: string; subtext_ar: string; note_ar: string };
        const def: NL = { tag_en: 'Stay in the loop', tag_ar: 'ابقي على اطلاع', heading_en: 'New arrivals, first.', heading_ar: 'الجديد أولاً.', subtext_ar: 'اشتركي وكوني أول من يعرف بالعروض والمنتجات الجديدة', note_ar: 'لا سبام — نوصلك بس بأهم الأخبار' };
        const val     = get<NL>('newsletter_section', def);
        const set     = (patch: Partial<NL>) => setContent((p) => ({ ...p, newsletter_section: { ...val, ...patch } }));
        return (
          <div>
            <Card title="قسم النشرة البريدية">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tag (EN)"><Input value={val.tag_en} onChange={(v) => set({ tag_en: v })} /></Field>
                <Field label="Tag (AR)"><Input value={val.tag_ar} onChange={(v) => set({ tag_ar: v })} /></Field>
                <Field label="Heading (EN)"><Input value={val.heading_en} onChange={(v) => set({ heading_en: v })} /></Field>
                <Field label="Heading (AR)"><Input value={val.heading_ar} onChange={(v) => set({ heading_ar: v })} /></Field>
                <Field label="Subtext (AR)"><Textarea value={val.subtext_ar} onChange={(v) => set({ subtext_ar: v })} /></Field>
                <Field label="Note (AR)"><Input value={val.note_ar} onChange={(v) => set({ note_ar: v })} /></Field>
              </div>
            </Card>
            <button onClick={() => save('newsletter_section', val)} disabled={saving}
              className="flex items-center gap-2 bg-[#C9A84C] text-[#1a1a18] px-6 py-2.5 text-sm font-bold rounded hover:bg-yellow-400 transition-colors disabled:opacity-60">
              <Save size={15} /> {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        );
      })()}

      {/* ─── FOOTER ─── */}
      {activeTab === 'footer' && (() => {
        type FC = { brand_desc_en: string; brand_desc_ar: string; whatsapp: string; email: string; location_en: string; location_ar: string; hours_ar: string; instagram: string; facebook: string; shop_links: { href: string; label: string }[]; help_links: { href: string; label: string }[] };
        const def: FC = { brand_desc_en: '', brand_desc_ar: '', whatsapp: '', email: '', location_en: '', location_ar: '', hours_ar: '', instagram: '', facebook: '', shop_links: [], help_links: [] };
        const val     = get<FC>('footer', def);
        const set     = (patch: Partial<FC>) => setContent((p) => ({ ...p, footer: { ...val, ...patch } }));
        return (
          <div>
            <Card title="معلومات العلامة التجارية">
              <div className="grid grid-cols-2 gap-4">
                <Field label="وصف (EN)"><Textarea value={val.brand_desc_en} onChange={(v) => set({ brand_desc_en: v })} rows={2} /></Field>
                <Field label="وصف (AR)"><Textarea value={val.brand_desc_ar} onChange={(v) => set({ brand_desc_ar: v })} rows={2} /></Field>
              </div>
            </Card>
            <Card title="بيانات التواصل">
              <div className="grid grid-cols-2 gap-4">
                <Field label="واتساب"><Input value={val.whatsapp} onChange={(v) => set({ whatsapp: v })} placeholder="+201234567890" /></Field>
                <Field label="البريد الإلكتروني"><Input value={val.email} onChange={(v) => set({ email: v })} /></Field>
                <Field label="الموقع (EN)"><Input value={val.location_en} onChange={(v) => set({ location_en: v })} /></Field>
                <Field label="الموقع (AR)"><Input value={val.location_ar} onChange={(v) => set({ location_ar: v })} /></Field>
                <Field label="ساعات العمل (AR)"><Input value={val.hours_ar} onChange={(v) => set({ hours_ar: v })} /></Field>
                <Field label="Instagram"><Input value={val.instagram} onChange={(v) => set({ instagram: v })} /></Field>
                <Field label="Facebook"><Input value={val.facebook} onChange={(v) => set({ facebook: v })} /></Field>
              </div>
            </Card>
            <Card title="روابط Shop" collapsible>
              {val.shop_links.map((l, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input value={l.label} onChange={(v) => { const a = [...val.shop_links]; a[i] = { ...l, label: v }; set({ shop_links: a }); }} placeholder="Label" />
                  <Input value={l.href} onChange={(v) => { const a = [...val.shop_links]; a[i] = { ...l, href: v }; set({ shop_links: a }); }} placeholder="/products?..." />
                  <button onClick={() => set({ shop_links: val.shop_links.filter((_, j) => j !== i) })} className="text-red-400 px-2"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => set({ shop_links: [...val.shop_links, { label: '', href: '' }] })} className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-yellow-300 mt-1"><Plus size={13} /> إضافة رابط</button>
            </Card>
            <Card title="روابط Help" collapsible>
              {val.help_links.map((l, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input value={l.label} onChange={(v) => { const a = [...val.help_links]; a[i] = { ...l, label: v }; set({ help_links: a }); }} placeholder="Label" />
                  <Input value={l.href} onChange={(v) => { const a = [...val.help_links]; a[i] = { ...l, href: v }; set({ help_links: a }); }} placeholder="/..." />
                  <button onClick={() => set({ help_links: val.help_links.filter((_, j) => j !== i) })} className="text-red-400 px-2"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => set({ help_links: [...val.help_links, { label: '', href: '' }] })} className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-yellow-300 mt-1"><Plus size={13} /> إضافة رابط</button>
            </Card>
            <button onClick={() => save('footer', val)} disabled={saving}
              className="flex items-center gap-2 bg-[#C9A84C] text-[#1a1a18] px-6 py-2.5 text-sm font-bold rounded hover:bg-yellow-400 transition-colors disabled:opacity-60">
              <Save size={15} /> {saving ? 'جاري الحفظ...' : 'حفظ الفوتر'}
            </button>
          </div>
        );
      })()}

      {/* ─── PIXELS ─── */}
      {activeTab === 'pixels' && (() => {
        type PX = { meta_pixel_id: string; tiktok_pixel_id: string };
        const def: PX = { meta_pixel_id: '', tiktok_pixel_id: '' };
        const val      = get<PX>('pixels', def);
        const set      = (patch: Partial<PX>) => setContent((p) => ({ ...p, pixels: { ...val, ...patch } }));
        return (
          <div>
            <Card title="Meta Pixel (Facebook & Instagram)">
              <p className="text-xs text-gray-400 mb-4">ستجد الـ Pixel ID في Meta Business Manager → Events Manager → Data Sources</p>
              <Field label="Meta Pixel ID">
                <Input value={val.meta_pixel_id} onChange={(v) => set({ meta_pixel_id: v })} placeholder="مثال: 1234567890123456" />
              </Field>
            </Card>
            <Card title="TikTok Pixel">
              <p className="text-xs text-gray-400 mb-4">ستجد الـ Pixel ID في TikTok Ads Manager → Assets → Events → Web Events</p>
              <Field label="TikTok Pixel ID">
                <Input value={val.tiktok_pixel_id} onChange={(v) => set({ tiktok_pixel_id: v })} placeholder="مثال: ABCDE12345" />
              </Field>
            </Card>
            <button onClick={() => save('pixels', val)} disabled={saving}
              className="flex items-center gap-2 bg-[#C9A84C] text-[#1a1a18] px-6 py-2.5 text-sm font-bold rounded hover:bg-yellow-400 transition-colors disabled:opacity-60">
              <Save size={15} /> {saving ? 'جاري الحفظ...' : 'حفظ البيكسلات'}
            </button>
          </div>
        );
      })()}

      {/* ─── REVIEWS ─── */}
      {activeTab === 'reviews' && (() => {
        type Rev = { id: number; name: string; city: string; rating: number; comment: string; date: string; product: string; verified: boolean };
        const val = get<Rev[]>('reviews', []);
        const set = (v: Rev[]) => setContent((p) => ({ ...p, reviews: v }));
        const upd = (i: number, patch: Partial<Rev>) => { const a = [...val]; a[i] = { ...a[i], ...patch }; set(a); };
        return (
          <div>
            {val.map((r, i) => (
              <Card key={i} title={`تقييم: ${r.name} — ${r.rating}★`} collapsible>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="الاسم"><Input value={r.name} onChange={(v) => upd(i, { name: v })} /></Field>
                  <Field label="المدينة"><Input value={r.city} onChange={(v) => upd(i, { city: v })} /></Field>
                  <Field label="التقييم (1-5)">
                    <select value={r.rating} onChange={(e) => upd(i, { rating: Number(e.target.value) })}
                      className="w-full bg-gray-900 border border-gray-600 text-white text-sm px-3 py-2 rounded focus:outline-none">
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                  </Field>
                  <Field label="التاريخ"><Input value={r.date} onChange={(v) => upd(i, { date: v })} /></Field>
                  <Field label="اسم المنتج"><Input value={r.product ?? ''} onChange={(v) => upd(i, { product: v })} /></Field>
                  <Field label="موثق؟">
                    <Toggle value={r.verified} onChange={(v) => upd(i, { verified: v })} label={r.verified ? 'موثق' : 'غير موثق'} />
                  </Field>
                </div>
                <Field label="نص التقييم"><Textarea value={r.comment} onChange={(v) => upd(i, { comment: v })} rows={3} /></Field>
                <button onClick={() => set(val.filter((_, j) => j !== i))} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 mt-2"><Trash2 size={13} /> حذف</button>
              </Card>
            ))}
            <button onClick={() => set([...val, { id: Date.now(), name: '', city: '', rating: 5, comment: '', date: '', product: '', verified: true }])}
              className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-yellow-300 mb-4">
              <Plus size={13} /> إضافة تقييم
            </button>
            <button onClick={() => save('reviews', val)} disabled={saving}
              className="flex items-center gap-2 bg-[#C9A84C] text-[#1a1a18] px-6 py-2.5 text-sm font-bold rounded hover:bg-yellow-400 transition-colors disabled:opacity-60">
              <Save size={15} /> {saving ? 'جاري الحفظ...' : 'حفظ التقييمات'}
            </button>
          </div>
        );
      })()}
    </div>
  );
}
