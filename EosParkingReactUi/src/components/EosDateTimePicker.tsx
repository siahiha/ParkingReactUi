import { useEffect, useState, type ChangeEvent } from 'react';
import { Box, Button, IconButton, InputAdornment, Popover, TextField, Typography, type TextFieldProps } from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

type Language = 'fa' | 'en';
export type EosDateTimePickerProps = Omit<TextFieldProps, 'value' | 'onChange' | 'type'> & { value: string; onChange: (value: string) => void; language?: Language; dateOnly?: boolean };
const pd = '۰۱۲۳۴۵۶۷۸۹';
const iso = (y: number, m: number, d: number) => `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const leap = (y: number) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
const latin = (v: string) => v.replace(/[۰-۹]/g, (d) => String(pd.indexOf(d)));

function j2g(input: string): string | null {
  const m = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(latin(input.trim())); if (!m) return null;
  const jy = Number(m[1]); const jm = Number(m[2]); const jd = Number(m[3]); if (jm < 1 || jm > 12 || jd < 1 || jd > (jm <= 6 ? 31 : jm <= 11 ? 30 : 30)) return null;
  const y = jy + 1595; let days = -355668 + 365 * y + Math.floor(y / 33) * 8 + Math.floor(((y % 33) + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 1) * 30 + 6); let gy = 400 * Math.floor(days / 146097); days %= 146097;
  if (days > 36524) { gy += 100 * Math.floor(--days / 36524); days %= 36524; if (days >= 365) days++; } gy += 4 * Math.floor(days / 1461); days %= 1461; if (days > 365) { gy += Math.floor((days - 1) / 365); days = (days - 1) % 365; }
  let gm = 0; let gd = days + 1; const md = [31, leap(gy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; while (gm < 12 && gd > md[gm]) { gd -= md[gm]; gm++; } return iso(gy, gm + 1, gd);
}

function g2j(input: string): string {
  const [gy, gm, gd] = input.split('-').map(Number); if (!gy || !gm || !gd) return '';
  const md = [0, 31, leap(gy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let days = 365 * (gy - 1600) + Math.floor((gy - 1600 + 3) / 4) - Math.floor((gy - 1600 + 99) / 100) + Math.floor((gy - 1600 + 399) / 400) - 80 + gd; for (let i = 1; i < gm; i++) days += md[i]; let jy = 979 + 33 * Math.floor(days / 12053); days %= 12053; jy += 4 * Math.floor(days / 1461); days %= 1461; if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; } const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30); const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30); return `${String(jy).padStart(4, '0')}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}
const jMonthDays = (y: number, m: number) => m <= 6 ? 31 : m <= 11 ? 30 : (j2g(`${y + 1}/01/01`) && j2g(`${y}/01/01`) && Math.round((Date.parse(`${j2g(`${y + 1}/01/01`)}T00:00:00Z`) - Date.parse(`${j2g(`${y}/01/01`)}T00:00:00Z`)) / 86400000) === 366 ? 30 : 29);

export function EosDateTimePicker({ value, onChange, label, language = 'fa', dateOnly = false, ...props }: EosDateTimePickerProps) {
  const fa = language === 'fa'; const today = new Date(); const fallback = iso(today.getFullYear(), today.getMonth() + 1, today.getDate()); const date = value.slice(0, 10) || fallback; const time = value.includes('T') ? value.slice(11, 16) : '';
  const initial = (fa ? g2j(date) : date).split(/[/-]/).map(Number); const [open, setOpen] = useState(false); const [anchor, setAnchor] = useState<HTMLElement | null>(null); const [year, setYear] = useState(initial[0]); const [month, setMonth] = useState(initial[1]);
  useEffect(() => { if (!open) return; const next = (fa ? g2j(date) : date).split(/[/-]/).map(Number); setYear(next[0]); setMonth(next[1]); }, [open, date, fa]);
  const months = fa ? ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'] : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; const weeks = fa ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']; const first = fa ? j2g(`${year}/${String(month).padStart(2, '0')}/01`) : iso(year, month, 1); const offset = first ? (fa ? (new Date(`${first}T00:00:00Z`).getUTCDay() + 1) % 7 : new Date(`${first}T00:00:00Z`).getUTCDay()) : 0; const days = fa ? jMonthDays(year, month) : new Date(Date.UTC(year, month, 0)).getUTCDate(); const selected = Number((fa ? g2j(date) : date).split(/[/-]/)[2]);
  const setDay = (day: number) => { const next = fa ? j2g(`${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`) ?? '' : iso(year, month, day); onChange(`${next}${dateOnly ? '' : `T${time || '00:00'}`}`); setOpen(false); }; const setTime = (e: ChangeEvent<HTMLInputElement>) => onChange(`${value.slice(0, 10) || fallback}T${e.target.value}`); const move = (n: number) => { let m = month + n; let y = year; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } setMonth(m); setYear(y); };
  return <Box sx={{ display: 'grid', gridTemplateColumns: dateOnly ? '1fr' : 'minmax(0, 1fr) auto', gap: 1, alignItems: 'start' }}><TextField {...props} fullWidth type="text" label={label} value={value ? (fa ? g2j(date) : date) : ''} placeholder={fa ? '۱۴۰۴/۰۱/۰۱' : 'YYYY-MM-DD'} onClick={(e) => { setAnchor(e.currentTarget); setOpen(true); }} slotProps={{ input: { readOnly: true, endAdornment: <InputAdornment position="end"><IconButton size="small" aria-label={String(label)} onClick={(e) => { setAnchor(e.currentTarget); setOpen(true); }}><CalendarMonthRoundedIcon /></IconButton></InputAdornment> } }} />{!dateOnly && <TextField {...props} fullWidth type="time" label="" value={time} onChange={setTime} slotProps={{ htmlInput: { 'aria-label': `${String(label)} - ${fa ? 'ساعت' : 'time'}` } }} />}
    <Popover open={open} anchorEl={anchor} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}><Box dir={fa ? 'rtl' : 'ltr'} sx={{ p: 1.5, width: 280 }}><Box className="inline-status-row" sx={{ justifyContent: 'space-between', mb: 1 }}><IconButton size="small" onClick={() => move(fa ? 1 : -1)}><ChevronLeftRoundedIcon /></IconButton><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{months[month - 1]} {year}</Typography><IconButton size="small" onClick={() => move(fa ? -1 : 1)}><ChevronRightRoundedIcon /></IconButton></Box><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.25, textAlign: 'center' }}>{weeks.map((w, i) => <Typography key={`${w}-${i}`} variant="caption" color="text.secondary" sx={{ p: 0.5, fontWeight: 800 }}>{w}</Typography>)}{Array.from({ length: offset + days }, (_, i) => i < offset ? <Box key={`empty-${i}`} /> : <Button key={i} size="small" onClick={() => setDay(i - offset + 1)} variant={selected === i - offset + 1 ? 'contained' : 'text'} sx={{ minWidth: 0, p: 0.5 }}>{i - offset + 1}</Button>)}</Box></Box></Popover></Box>;
}
