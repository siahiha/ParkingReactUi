import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../api/client';
import { definitionApi } from '../../api/management';
import type { Language } from '../../i18n';
import { boolValue, definitionConfig, emptyDefinitionForm, emptyParkingSpaceForm, emptySpaceRangeForm, ensureApiSuccess, firstPositiveNumber, hasParkingSection, idOf, normalizeParkingSpace, nestedRows, parkSpacesOf, parkingSpaceId, rowsOf, spaceFloorId, spaceSectionId, tariffsOf, unwrap, valueOf, type DefinitionForm, type DefinitionKind, type DefinitionRow, type ParkingSpaceRow, type SpaceRangeForm } from './definitionDomain';

export function useDefinitionCrud({ kind, parkingId, language, title, canEdit, canDelete }: { kind: DefinitionKind; parkingId: number; language: Language; title: string; canEdit: boolean; canDelete: boolean }) {
  const [rows, setRows] = useState<DefinitionRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [form, setForm] = useState<DefinitionForm>({ ...emptyDefinitionForm });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [spaceKinds, setSpaceKinds] = useState<DefinitionRow[]>([]);
  const [floorRows, setFloorRows] = useState<DefinitionRow[]>([]);
  const [zoneFloorId, setZoneFloorId] = useState<number | null>(null);
  const [zoneFloorSpaces, setZoneFloorSpaces] = useState<DefinitionRow[]>([]);
  const [zoneFloorSpaceCount, setZoneFloorSpaceCount] = useState(0);
  const [zoneFloorSpacesLoading, setZoneFloorSpacesLoading] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<number | null>(null);
  const [editingZone, setEditingZone] = useState<DefinitionRow | null>(null);
  const [selectedZoneSpaceIds, setSelectedZoneSpaceIds] = useState<number[]>([]);
  const [spaceRows, setSpaceRows] = useState<ParkingSpaceRow[]>([]);
  const [deletedSpaceIds, setDeletedSpaceIds] = useState<number[]>([]);
  const [selectedSpaceIndex, setSelectedSpaceIndex] = useState<number | null>(null);
  const [selectedSpaceIndexes, setSelectedSpaceIndexes] = useState<number[]>([]);
  const [spaceForm, setSpaceForm] = useState<ParkingSpaceRow>({ ...emptyParkingSpaceForm });
  const [spaceDialogOpen, setSpaceDialogOpen] = useState(false);
  const [spaceRangeForm, setSpaceRangeForm] = useState<SpaceRangeForm>({ ...emptySpaceRangeForm });
  const [spaceRangeDialogOpen, setSpaceRangeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof DefinitionForm, string>>>({});
  const [memberKindTariffs, setMemberKindTariffs] = useState<DefinitionRow[]>([]);
  const copy = language === 'fa'
    ? { add: 'جدید', edit: 'ویرایش', remove: 'حذف', refresh: 'به‌روزرسانی', save: 'ذخیره', cancel: 'انصراف', create: `افزودن ${title}`, update: `ویرایش ${title}`, empty: 'رکوردی برای نمایش وجود ندارد.', loading: 'در حال دریافت اطلاعات...', error: 'دریافت اطلاعات این بخش ناموفق بود.', required: 'عنوان الزامی است.', removeConfirm: 'آیا از حذف رکورد انتخاب‌شده مطمئن هستید؟', used: 'این طبقه جای‌پارک استفاده‌شده دارد و حذف آن مجاز نیست.', memberKindUsed: 'حذف نوع عضویت استفاده‌شده مجاز نیست.', saved: 'اطلاعات با موفقیت ذخیره شد.', deleted: 'رکورد حذف شد.', title: 'عنوان', description: 'توضیحات', fee: 'حق عضویت', duration: 'مدت عضویت (روز)', creditType: 'نوع اعتبار', membershipType: 'نوع عضویت', refund: 'مهلت استرداد (روز)', tariffs: 'تعرفه‌های مرتبط', creditValues: ['اعتباری', 'مدت‌دار', 'اعتباری و مدت‌دار'], membershipValues: ['مالک', 'دارای جای پارک مشخص', 'فاقد جای پارک مشخص'], using: 'در حال استفاده' }
    : { add: 'New', edit: 'Edit', remove: 'Delete', refresh: 'Refresh', save: 'Save', cancel: 'Cancel', create: `Add ${title}`, update: `Edit ${title}`, empty: 'No records to display.', loading: 'Loading...', error: 'Loading this section failed.', required: 'Title is required.', removeConfirm: 'Delete the selected record?', used: 'This floor has assigned parking spaces and cannot be deleted.', memberKindUsed: 'A membership type that is in use cannot be deleted.', saved: 'Saved successfully.', deleted: 'Record deleted.', title: 'Title', description: 'Description', fee: 'Membership fee', duration: 'Duration (days)', creditType: 'Credit type', membershipType: 'Membership type', refund: 'Refund deadline (days)', tariffs: 'Related tariffs', creditValues: ['Credit', 'Long-time', 'Long-time credit'], membershipValues: ['Owner', 'Member with assigned space', 'Member without assigned space'], using: 'In use' };

  const load = async () => {
    setLoading(true); setError(''); setMessage('');
    try {
      const loaded = rowsOf(await definitionApi.get(definitionConfig[kind].get(parkingId)));
      setRows(loaded);
      if (!loaded.some((row, index) => idOf(row, index) === selectedId)) setSelectedId(null);
      setSelectedIds((current) => current.filter((id) => loaded.some((row, index) => idOf(row, index) === id)));
    } catch (cause) {
      setRows([]); setError(cause instanceof ApiError && cause.status === 403 ? (language === 'fa' ? 'دسترسی این کاربر برای مشاهده یا مدیریت این بخش مجاز نیست.' : 'The current user is not allowed to manage this section.') : copy.error);
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [kind, parkingId]);
  useEffect(() => {
    if (kind === 'floors') void definitionApi.getParkingSpaceKinds(parkingId).then((response) => setSpaceKinds(rowsOf(response))).catch(() => setSpaceKinds([])); else setSpaceKinds([]);
    if (kind === 'zones') void definitionApi.getParkingFloors(parkingId).then((response) => setFloorRows(rowsOf(response))).catch(() => setFloorRows([])); else setFloorRows([]);
  }, [kind, parkingId]);
  useEffect(() => {
    if (kind !== 'zones' || !zoneFloorId) { setZoneFloorSpaces([]); setZoneFloorSpaceCount(0); setZoneFloorSpacesLoading(false); return; }
    let active = true;
    setZoneFloorSpaces([]); setZoneFloorSpaceCount(0); setZoneFloorSpacesLoading(true);
    void definitionApi.getParkingFloor(zoneFloorId).then((floorResponse) => {
      if (!active) return;
      ensureApiSuccess(floorResponse);
      const responseRows = rowsOf(floorResponse);
      const detailedFloor = responseRows.find((row) => parkSpacesOf(row).length > 0) ?? responseRows[0];
      const listedFloor = floorRows.find((floor, index) => idOf(floor, index) === zoneFloorId);
      const floorSpaces = detailedFloor && parkSpacesOf(detailedFloor).length > 0 ? parkSpacesOf(detailedFloor) : listedFloor ? parkSpacesOf(listedFloor) : [];
      const normalizedFloorSpaces = floorSpaces.map(normalizeParkingSpace).filter((space, index) => parkingSpaceId(space, index) > 0);
      const floorSpaceIds = new Set(normalizedFloorSpaces.map((space, index) => parkingSpaceId(space, index)));
      const sectionSpaces = (editingZone ? parkSpacesOf(editingZone) : []).filter((space, index) => spaceFloorId(space) === zoneFloorId || (spaceFloorId(space) === null && floorSpaceIds.has(parkingSpaceId(space, index)))).map(normalizeParkingSpace).filter((space, index) => parkingSpaceId(space, index) > 0);
      const currentZoneSpaceIds = new Set(sectionSpaces.map((space, index) => parkingSpaceId(space, index)));
      const visibleSpacesById = new Map<number, DefinitionRow>();
      normalizedFloorSpaces.forEach((space, index) => { const id = parkingSpaceId(space, index); if (!hasParkingSection(space) || currentZoneSpaceIds.has(id)) visibleSpacesById.set(id, space); });
      sectionSpaces.forEach((space, index) => { const id = parkingSpaceId(space, index); if (!visibleSpacesById.has(id)) visibleSpacesById.set(id, space); });
      const parkSpaces = [...visibleSpacesById.values()].sort((left, right) => String(valueOf(left, 'Title')).localeCompare(String(valueOf(right, 'Title')), language));
      const visibleSpaceIds = new Set(parkSpaces.map((space, index) => parkingSpaceId(space, index)));
      setZoneFloorSpaceCount(floorSpaceIds.size); setZoneFloorSpaces(parkSpaces); setSelectedZoneSpaceIds([...currentZoneSpaceIds].filter((id) => visibleSpaceIds.has(id)));
    }).catch(() => { if (!active) return; setZoneFloorSpaces([]); setZoneFloorSpaceCount(0); setError(copy.error); }).finally(() => { if (active) setZoneFloorSpacesLoading(false); });
    return () => { active = false; };
  }, [copy.error, editingZone, floorRows, kind, language, zoneFloorId]);

  const selected = useMemo(() => rows.find((row, index) => idOf(row, index) === selectedId), [rows, selectedId]);
  const openCreate = () => { if (!canEdit) return; setForm({ ...emptyDefinitionForm }); setMemberKindTariffs([]); setFieldErrors({}); setSpaceRows([]); setDeletedSpaceIds([]); setSelectedSpaceIndex(null); setSelectedSpaceIndexes([]); setZoneFloorId(null); setEditingZoneId(null); setEditingZone(null); setSelectedZoneSpaceIds([]); setMessage(''); setError(''); setDialogOpen(true); };
  const openEdit = async () => {
    if (!selected || !canEdit) return;
    let source = selected;
    if (kind === 'floors') { try { const detail = rowsOf(await definitionApi.getParkingFloor(idOf(selected)))[0]; if (detail) source = detail; } catch { setError(copy.error); return; } }
    if (kind === 'zones') { const sectionSpaces = parkSpacesOf(source); setEditingZoneId(idOf(source)); setEditingZone(source); setZoneFloorId(firstPositiveNumber(sectionSpaces[0] ?? {}, ['ParkingFloorId', 'FloorId']) ?? firstPositiveNumber(source, ['ParkingFloorId', 'FloorId']) ?? null); setSelectedZoneSpaceIds(sectionSpaces.map((space, index) => parkingSpaceId(space, index)).filter((id) => id > 0)); }
    setMemberKindTariffs(kind === 'member-kinds' ? tariffsOf(source) : []);
    const sourceSpaces = parkSpacesOf(source);
    let selectedSpaces = sourceSpaces.map((space) => ({ Id: idOf(space), Title: String(valueOf(space, 'Title') ?? ''), IsActive: boolValue(valueOf(space, 'IsActive')), ParkingFloorId: idOf(source), ParkingSectionId: spaceSectionId(space) || null, ParkingParkSpaceKindId: Number(valueOf(space, 'ParkingParkSpaceKindId') ?? 0) }));
    if (kind === 'floors' && selectedSpaces.length === 0 && idOf(source) > 0) { try { selectedSpaces = rowsOf(await definitionApi.getUnsectionedParkingSpaces(idOf(source))).map((space) => ({ Id: idOf(space), Title: String(valueOf(space, 'Title') ?? ''), IsActive: boolValue(valueOf(space, 'IsActive')), ParkingFloorId: idOf(source), ParkingSectionId: Number(valueOf(space, 'ParkingSectionId') ?? 0) || null, ParkingParkSpaceKindId: Number(valueOf(space, 'ParkingParkSpaceKindId') ?? 0) })); } catch { /* primary floor response remains the source */ } }
    setForm({ Id: idOf(source), Title: String(valueOf(source, 'Title') ?? ''), Description: String(valueOf(source, 'Description') ?? ''), MembershipFee: String(valueOf(source, 'MembershipFee') ?? 0), DurationDays: String(valueOf(source, 'DurationDays') ?? 0), MembershipCreditType: String(valueOf(source, 'MembershipCreditType') ?? 0), MembershipType: String(valueOf(source, 'MembershipType') ?? 0), RefundDeadlineDayCount: String(valueOf(source, 'RefundDeadlineDayCount') ?? 0) });
    setFieldErrors({}); setSpaceRows(selectedSpaces); setDeletedSpaceIds([]); setSelectedSpaceIndex(null); setSelectedSpaceIndexes([]); setMessage(''); setDialogOpen(true);
  };
  const save = async () => {
    if (!canEdit) { setError(language === 'fa' ? 'مجوز ایجاد یا ویرایش این بخش را ندارید.' : 'You are not allowed to create or edit this section.'); return; }
    const nextFieldErrors: Partial<Record<keyof DefinitionForm, string>> = {};
    if (!form.Title.trim()) nextFieldErrors.Title = copy.required;
    if (kind === 'member-kinds') {
      const fee = Number(form.MembershipFee); const duration = Number(form.DurationDays); const refund = Number(form.RefundDeadlineDayCount); const creditType = Number(form.MembershipCreditType); const membershipType = Number(form.MembershipType);
      if (!Number.isInteger(fee) || fee < 0) nextFieldErrors.MembershipFee = language === 'fa' ? 'مبلغ باید عدد صحیح و نامنفی باشد.' : 'Fee must be a non-negative integer.';
      if (!Number.isInteger(duration) || duration < 0 || (creditType !== 0 && duration <= 0)) nextFieldErrors.DurationDays = creditType === 0 ? (language === 'fa' ? 'مدت نامعتبر است.' : 'Duration is invalid.') : (language === 'fa' ? 'برای این نوع اعتبار، مدت باید بزرگ‌تر از صفر باشد.' : 'Duration must be greater than zero for this credit type.');
      if (![0, 1, 2].includes(creditType)) nextFieldErrors.MembershipCreditType = language === 'fa' ? 'نوع اعتبار نامعتبر است.' : 'Credit type is invalid.';
      if (![0, 1, 2].includes(membershipType)) nextFieldErrors.MembershipType = language === 'fa' ? 'نوع عضویت نامعتبر است.' : 'Membership type is invalid.';
      if (!Number.isInteger(refund) || refund < 0 || (duration > 0 && refund > duration)) nextFieldErrors.RefundDeadlineDayCount = duration > 0 ? (language === 'fa' ? 'مهلت عودت وجه نمی‌تواند از مدت اعتبار بیشتر باشد.' : 'Refund deadline cannot exceed the membership duration.') : (language === 'fa' ? 'مهلت عودت وجه باید عدد صحیح و نامنفی باشد.' : 'Refund deadline must be a non-negative integer.');
      if (membershipType === 0 && creditType !== 1) nextFieldErrors.MembershipCreditType = language === 'fa' ? 'نوع عضویت مالک باید مدت‌دار باشد.' : 'Owner membership must be long-time.';
    }
    setFieldErrors(nextFieldErrors); if (Object.keys(nextFieldErrors).length > 0) { setError(language === 'fa' ? 'اطلاعات فرم را بررسی کنید.' : 'Please correct the form errors.'); return; }
    setSaving(true); setError(''); setMessage('');
    const payload: DefinitionRow = { Id: form.Id, Title: form.Title.trim(), ParkingId: parkingId };
    if (kind === 'floors' || kind === 'zones') payload.Description = form.Description;
    if (kind === 'member-kinds') Object.assign(payload, { MembershipFee: Number(form.MembershipFee), DurationDays: Number(form.DurationDays), MembershipCreditType: Number(form.MembershipCreditType), MembershipType: Number(form.MembershipType), RefundDeadlineDayCount: Number(form.RefundDeadlineDayCount) });
    if (kind === 'floors') payload.ParkSpaces = [...spaceRows.map((space) => ({ Id: space.Id, Title: space.Title, IsActive: space.IsActive, ParkingFloorId: form.Id, ParkingSectionId: space.ParkingSectionId, ParkingParkSpaceKindId: space.ParkingParkSpaceKindId })), ...deletedSpaceIds.map((id) => ({ Id: -id }))];
    if (kind === 'zones') { if (!zoneFloorId) { setError(language === 'fa' ? 'انتخاب طبقه برای زون الزامی است.' : 'Select a floor for the zone.'); setSaving(false); return; } payload.ParkSpaces = selectedZoneSpaceIds.map((id) => { const space = zoneFloorSpaces.find((row, index) => parkingSpaceId(row, index) === id) ?? {}; return { Id: id, Title: String(valueOf(space, 'Title') ?? ''), IsActive: boolValue(valueOf(space, 'IsActive')), ParkingFloorId: zoneFloorId, ParkingSectionId: form.Id || null, ParkingParkSpaceKindId: Number(valueOf(space, 'ParkingParkSpaceKindId') ?? 0) }; }); }
    try { const response = await definitionApi.save(definitionConfig[kind].save, payload); ensureApiSuccess(response); const savedId = Number(unwrap(response) ?? form.Id); setDialogOpen(false); setFieldErrors({}); setMessage(copy.saved); await load(); if (savedId > 0) setSelectedId(savedId); } catch (cause) { setError(cause instanceof Error && cause.message ? cause.message : copy.error); } finally { setSaving(false); }
  };
  const openCreateSpace = () => { setSpaceForm({ ...emptyParkingSpaceForm, ParkingFloorId: form.Id }); setSpaceDialogOpen(true); };
  const openEditSpace = () => { if (selectedSpaceIndex === null || !spaceRows[selectedSpaceIndex]) return; setSpaceForm({ ...spaceRows[selectedSpaceIndex] }); setSpaceDialogOpen(true); };
  const saveSpace = () => { if (!spaceForm.Title.trim() || !spaceForm.ParkingParkSpaceKindId) { setError(language === 'fa' ? 'عنوان و نوع جای‌پارک الزامی است.' : 'Space title and space type are required.'); return; } const next = { ...spaceForm, Title: spaceForm.Title.trim(), ParkingFloorId: form.Id }; setSpaceRows((current) => selectedSpaceIndex === null ? [...current, next] : current.map((space, index) => index === selectedSpaceIndex ? next : space)); setSpaceDialogOpen(false); setSelectedSpaceIndex(null); setSelectedSpaceIndexes([]); };
  const openCreateSpaceRange = () => { setSpaceRangeForm({ ...emptySpaceRangeForm }); setSpaceRangeDialogOpen(true); };
  const saveSpaceRange = () => { const from = Number(spaceRangeForm.from.replace(/,/g, '')); const to = Number(spaceRangeForm.to.replace(/,/g, '')); if (!spaceRangeForm.prefix.trim() || !Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < from || to - from > 500 || !spaceRangeForm.ParkingParkSpaceKindId) { setError(language === 'fa' ? 'پیشوند، بازه‌ی عددی معتبر و نوع جای‌پارک را وارد کنید. بازه نمی‌تواند بیشتر از ۵۰۰ مورد باشد.' : 'Enter a valid prefix, numeric range and space type. The range cannot exceed 500 items.'); return; } const prefix = spaceRangeForm.prefix.trim(); const existingTitles = new Set(spaceRows.map((space) => space.Title)); const generated: ParkingSpaceRow[] = []; for (let number = from; number <= to; number += 1) { const titleValue = `${prefix}${number}`; if (existingTitles.has(titleValue)) { setError(language === 'fa' ? `عنوان «${titleValue}» تکراری است.` : `The title "${titleValue}" already exists.`); return; } existingTitles.add(titleValue); generated.push({ Id: 0, Title: titleValue, IsActive: spaceRangeForm.IsActive, ParkingFloorId: form.Id, ParkingSectionId: null, ParkingParkSpaceKindId: spaceRangeForm.ParkingParkSpaceKindId }); } setSpaceRows((current) => [...current, ...generated]); setSpaceRangeDialogOpen(false); setError(''); };
  const removeSpace = () => { if (selectedSpaceIndexes.length === 0) return; const indexes = new Set(selectedSpaceIndexes); const removedIds = spaceRows.filter((_, index) => indexes.has(index)).map((space) => space.Id).filter((id) => id > 0); if (removedIds.length > 0) setDeletedSpaceIds((current) => [...new Set([...current, ...removedIds])]); setSpaceRows((current) => current.filter((_, index) => !indexes.has(index))); setSelectedSpaceIndex(null); setSelectedSpaceIndexes([]); };
  const remove = async () => { const targets = rows.filter((row, index) => selectedIds.includes(idOf(row, index))); if (targets.length === 0) return; setLoading(true); setError(''); setMessage(''); try { for (const target of targets) { if (kind === 'floors') { const spaces = nestedRows(target, 'ParkSpaces', 'ParkingParkSpaces').filter((space) => idOf(space) > 0).map((space) => ({ Id: idOf(space) })); if (spaces.length > 0) { const used = rowsOf(await definitionApi.checkUsedParkingSpaces(spaces)); if (used.length > 0) throw new Error(copy.used); } } await definitionApi.remove(definitionConfig[kind].remove(idOf(target))); } setSelectedId(null); setSelectedIds([]); setDeleteDialogOpen(false); setMessage(copy.deleted); await load(); } catch (cause) { setError(cause instanceof Error && cause.message ? cause.message : copy.error); setLoading(false); } };

  return { kind, language, title, canEdit, canDelete, copy, rows, selected, selectedId, setSelectedId, selectedIds, setSelectedIds, form, setForm, dialogOpen, setDialogOpen, loading, saving, error, message, fieldErrors, spaceKinds, floorRows, zoneFloorId, setZoneFloorId, zoneFloorSpaces, zoneFloorSpaceCount, zoneFloorSpacesLoading, editingZoneId, selectedZoneSpaceIds, setSelectedZoneSpaceIds, spaceRows, selectedSpaceIndex, selectedSpaceIndexes, setSelectedSpaceIndex, setSelectedSpaceIndexes, spaceForm, setSpaceForm, spaceDialogOpen, setSpaceDialogOpen, spaceRangeForm, setSpaceRangeForm, spaceRangeDialogOpen, setSpaceRangeDialogOpen, deleteDialogOpen, setDeleteDialogOpen, memberKindTariffs, zoneSpaces: kind === 'zones' && zoneFloorId ? zoneFloorSpaces : [], zoneFloorLocked: editingZoneId !== null && selectedZoneSpaceIds.length > 0, load, openCreate, openEdit, save, openCreateSpace, openEditSpace, saveSpace, openCreateSpaceRange, saveSpaceRange, removeSpace, remove };
}
