import { describe, expect, it } from 'vitest';
import { trafficAuthorizationIssue, trafficAuthorizationSubmitIssue, type TrafficAuthorizationInput } from './trafficAuthorization';
import { parseTrafficQr } from './trafficQr';

const empty: TrafficAuthorizationInput = { plate: '', carType: '0', card: '' };
const plate = '12ب34567';
const image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK1kAAAAASUVORK5CYII=';
function qrCode(value: string) {
  const sum = [...value.replace(/#/g, '')].reduce((total, digit) => total + Number(digit), 0) % 9;
  const reversed = [...value].reverse().join('');
  return `!@^${reversed.slice(0, 3)}${sum}${reversed.slice(3)}!@^`;
}
const qr = qrCode('42#120134567#76101#1234');

describe('traffic authorization prerequisites', () => {
  it.each([
    [0, '', '', 'cardRequired', 'card'],
    [0, plate, '', 'cardRequired', 'card'],
    [0, '', '۱۲۳۴', null, null],
    [1, '', '1234', null, null],
    [2, '', '1234', 'plateRequired', 'plate'],
    [2, plate, '', null, null],
    [3, plate, '', 'cardRequired', 'card'],
    [3, '', '1234', 'plateRequired', 'plate'],
    [3, '12ب345', '1234', 'plateRequired', 'plate'],
    [3, plate, '1234', null, null],
    [4, '', '', 'cardOrPlateRequired', 'card'],
    [4, plate, '', null, null],
    [4, '', '1234', null, null],
    [4, '12ب345', '1234', null, null],
    [5, plate, '1234', 'qrRequired', 'card'],
    [6, plate, '1234', 'qrRequired', 'card'],
    [5, '', qr, null, null],
    [6, '', qr, null, null],
  ] as const)('checks method %s with plate %s and card %s', (authorizationType, plate, card, key, focus) => {
    const input = { ...empty, authorizationType, plate, card };
    const expected = key ? { key, focus } : null;
    expect(trafficAuthorizationIssue(input)).toEqual(expected);
    expect(trafficAuthorizationSubmitIssue(input, image)).toEqual(expected);
  });
  it('requires a current operation image only when submitting card-and-picture', () => {
    const input = { ...empty, authorizationType: 1 as const, card: '1234' };
    expect(trafficAuthorizationIssue(input)).toBeNull();
    for (const missing of [null, '', 'not an image']) {
      expect(trafficAuthorizationSubmitIssue(input, missing)?.key).toBe('trafficImageRequired');
    }
    expect(trafficAuthorizationSubmitIssue(input, image)).toBeNull();
    expect(trafficAuthorizationSubmitIssue({ ...input, authorizationType: 0 }, null)).toBeNull();
  });
  it('keeps verified QR usable after the UI replaces scanner text with decoded fields', () => {
    const verified = { ...empty, authorizationType: 6 as const, plate, card: '1234', qr: parseTrafficQr(qr) };
    expect(trafficAuthorizationSubmitIssue(verified, null)).toBeNull();
    expect(trafficAuthorizationIssue({ ...verified, plate: '' })?.key).toBe('plateRequired');
    expect(trafficAuthorizationIssue({ ...verified, qr: null })?.key).toBe('qrRequired');
    expect(trafficAuthorizationIssue({ ...verified, card: '!@^broken!@^' })?.key).toBe('invalidQr');
  });
  it('does not send incomplete or corrupt scanner text as an ordinary card', () => {
    for (const card of ['!@^1234', '!@^broken!@^', qr.slice(0, -1)]) {
      expect(trafficAuthorizationIssue({ ...empty, authorizationType: 4, card })?.key).toBe('invalidQr');
    }
  });
  it('preserves compatibility with older doors that omit the setting', () => {
    expect(trafficAuthorizationIssue(empty)).toBeNull();
  });
});
