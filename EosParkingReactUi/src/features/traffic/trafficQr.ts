import { isValidIranianPlate, normalizeIranianPlateValue } from '../../components/IranianPlateInput';

export type TrafficQr = { dumpId: number; plate: string; memberCode: string; cardNumber: string };
export function normalizeCard(value: string) {
  return value.trim().replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x6f0))
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x660));
}

/** Wire format of SecurityHelper.QRCoderDecrypt, without trusting the decoded identifiers. */
export function parseTrafficQr(input: string): TrafficQr | null {
  const text = normalizeCard(input);
  if (text.length > 1024 || !text.startsWith('!@^') || !text.endsWith('!@^')) return null;
  const encoded = text.slice(3, -3);
  if (encoded.length < 5 || !/^\d$/.test(encoded[3])) return null;
  const decoded = [...(encoded.slice(0, 3) + encoded.slice(4))].reverse().join('');
  if (!/^[\d#]+$/.test(decoded)) return null;
  const checksum = [...decoded.replace(/#/g, '')].reduce((sum, digit) => sum + Number(digit), 0) % 9;
  if (checksum !== Number(encoded[3])) return null;
  const fields = decoded.split('#');
  if (fields.length < 4 || fields.length > 5 || !/^\d+$/.test(fields[0]) || !/^\d{9}$/.test(fields[1])) return null;
  const dumpId = Number(fields[0]);
  const plate = normalizeIranianPlateValue(fields[1]);
  if (!Number.isSafeInteger(dumpId) || dumpId <= 0 || !isValidIranianPlate(plate, '0')) return null;
  return { dumpId, plate, memberCode: fields[2], cardNumber: fields[3] };
}
