import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '../../i18n/instance';
import fa from '../../locales/fa';
import en from '../../locales/en';
import type { HshDetectionEvent } from '../../api/hshDetectionRealtime';
import { TrafficDetectionPanel } from './TrafficDetectionPanel';

const event: HshDetectionEvent = {
  eventId: 'detection-1', sequence: 1, eventType: 'plate', occurredAtUtc: '2026-11-10T08:00:00Z',
  source: { cameraId: '17', direction: 'entry' }, matched: true, matchingTriggerIds: [],
  plateText: '12ب34567', confidence: null, artifacts: [], raw: {},
};

describe('traffic detection presentation', () => {
  afterEach(cleanup);
  it('enlarges the selected image without losing the plate and latest event', async () => {
    render(<TrafficDetectionPanel language="fa" detection={{ event, fullFrameUrl: '/frame.png', plateImageUrl: '/plate.png' }} />);
    fireEvent.click(screen.getByRole('button', { name: `${fa.trafficLayout.enlarge} — ${fa.trafficLayout.fullFrame}` }));
    const dialog = screen.getByRole('dialog', { name: fa.trafficLayout.fullFrame });
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/frame.png');
    fireEvent.click(within(dialog).getByRole('button', { name: fa.trafficIdentity.close }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText(event.plateText)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: `${fa.trafficLayout.enlarge} — ${fa.trafficLayout.plateImage}` }));
    expect(within(screen.getByRole('dialog', { name: fa.trafficLayout.plateImage })).getByRole('img')).toHaveAttribute('src', '/plate.png');
  });
  it('shows a localized empty state with no unusable image controls', () => {
    render(<TrafficDetectionPanel language="en" detection={null} />);
    expect(screen.getByText(en.trafficLayout.detectionUnavailable)).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('keeps the traffic presentation translation keys complete in both languages', () => {
    for (const section of ['trafficLayout', 'trafficIdentity', 'trafficGrid'] as const) {
      expect(Object.keys(en[section]).sort()).toEqual(Object.keys(fa[section]).sort());
      expect(Object.values(en[section]).every(value => Array.isArray(value) ? value.every(Boolean) : Boolean(value))).toBe(true);
      expect(Object.values(fa[section]).every(value => Array.isArray(value) ? value.every(Boolean) : Boolean(value))).toBe(true);
    }
  });
});
