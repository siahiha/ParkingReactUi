import { isValidIranianPlate } from '../../components/IranianPlateInput';
import type { TrafficAuthorizationType } from './trafficDoorService';
import { normalizeCard, parseTrafficQr, type TrafficQr } from './trafficQr';
import { trafficImage } from './trafficImages';

export type TrafficAuthorizationInput = {
  authorizationType?: TrafficAuthorizationType;
  plate: string;
  carType: string;
  card: string;
  qr?: TrafficQr | null;
};
export type TrafficAuthorizationIssue = {
  key: 'cardRequired' | 'plateRequired' | 'cardOrPlateRequired' | 'qrRequired' | 'invalidQr' | 'trafficImageRequired';
  focus: 'card' | 'plate';
};

/** The same prerequisites apply to identification and to the final UI submit check. */
export function trafficAuthorizationIssue(input: TrafficAuthorizationInput): TrafficAuthorizationIssue | null {
  const card = normalizeCard(input.card);
  const encodedQr = card.includes('!@^');
  const qr = encodedQr ? parseTrafficQr(card) : input.qr;
  if (encodedQr && !qr) return { key: 'invalidQr', focus: 'card' };
  const hasCard = Boolean((encodedQr ? qr?.cardNumber : card)?.trim());
  const hasPlate = isValidIranianPlate(encodedQr && qr ? qr.plate : input.plate, input.carType);
  switch (input.authorizationType) {
    case 0:
    case 1:
      return hasCard ? null : { key: 'cardRequired', focus: 'card' };
    case 2:
      return hasPlate ? null : { key: 'plateRequired', focus: 'plate' };
    case 3:
      if (!hasCard) return { key: 'cardRequired', focus: 'card' };
      return hasPlate ? null : { key: 'plateRequired', focus: 'plate' };
    case 4:
      return hasCard || hasPlate ? null : { key: 'cardOrPlateRequired', focus: 'card' };
    case 5:
    case 6:
      if (!qr) return { key: 'qrRequired', focus: 'card' };
      return input.authorizationType === 6 && !hasPlate ? { key: 'plateRequired', focus: 'plate' } : null;
    default:
      // Older API responses omit the setting; retain their existing identification behavior.
      return null;
  }
}

export function trafficAuthorizationSubmitIssue(input: TrafficAuthorizationInput, image: string | null): TrafficAuthorizationIssue | null {
  return trafficAuthorizationIssue(input)
    ?? (input.authorizationType === 1 && !trafficImage(image) ? { key: 'trafficImageRequired', focus: 'card' } : null);
}
