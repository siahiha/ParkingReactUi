import { ThemeProvider } from '@mui/material';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appTheme } from '../../theme';
import en from '../../locales/en';
import fa from '../../locales/fa';
import { CameraEquipmentWorkspace } from './CameraEquipmentWorkspace';

function setup(language: 'fa' | 'en', failed = false) {
  const requests: { path: string; body: Record<string, unknown> | null }[] = [];
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = new URL(String(input));
    const body = init?.body ? JSON.parse(String(init.body)) as Record<string, unknown> : null;
    requests.push({ path: url.pathname, body });
    let response: unknown;
    if (url.pathname.endsWith('/GetParkingEquipments')) {
      response = { ResponseResultType: 1, Values: [{ Id: 42, DeviceType: 0, DeviceName: 'Entry camera', Ip: '192.0.2.10', Port: 554 }] };
    } else if (url.pathname.endsWith('/rtspcamera/connect')) {
      response = { status: { cameraId: '42', state: failed ? 'Failed' : 'Connected', viewerCount: 1, error: failed ? 'Private camera failure' : null } };
    } else if (url.pathname.endsWith('/rtspcamera/status')) {
      response = { cameraId: '42', state: 'Disconnected', viewerCount: 0 };
    } else if (url.pathname.endsWith('/rtspcamera/rois')) {
      response = [];
    } else if (url.pathname.endsWith('/rtspcamera/disconnect')) {
      response = {};
    } else {
      throw new Error(`Unexpected request: ${url.pathname}`);
    }
    return new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } });
  });
  render(<ThemeProvider theme={appTheme}><CameraEquipmentWorkspace title="Equipment" parkingId={7} language={language} /></ThemeProvider>);
  return { requests, labels: language === 'fa' ? fa : en };
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('camera test from equipment', () => {
  it.each(['fa', 'en'] as const)('connects on the first test click and disconnects when closed (%s)', async language => {
    const { requests, labels } = setup(language);
    fireEvent.doubleClick(await screen.findByText('Entry camera'));
    const dialog = screen.getByRole('dialog');
    expect(requests.filter(request => request.path.endsWith('/connect'))).toHaveLength(0);
    fireEvent.click(within(dialog).getByRole('button', { name: labels.equipment.testCameraConnection }));
    await waitFor(() => expect(requests.filter(request => request.path.endsWith('/connect'))).toHaveLength(1));
    expect(requests.find(request => request.path.endsWith('/connect'))?.body).toEqual({ cameraId: '42', viewerId: expect.any(String), streamMode: 'WebRTC' });
    await within(dialog).findByRole('button', { name: labels.cameraPreview.disconnect });
    const disconnects = requests.filter(request => request.path.endsWith('/disconnect')).length;
    fireEvent.click(within(dialog).getByRole('button', { name: labels.equipment.cancel }));
    await waitFor(() => expect(requests.filter(request => request.path.endsWith('/disconnect'))).toHaveLength(disconnects + 1));
    expect(requests.some(request => /SaveParkingEquipment|GetParkingDoors/.test(request.path))).toBe(false);
  });

  it('uses an unsaved explicit RTSP URL and shows a localized connection failure', async () => {
    const { requests, labels } = setup('en', true);
    fireEvent.doubleClick(await screen.findByText('Entry camera'));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByRole('textbox', { name: labels.equipment.rtspUrl }), { target: { value: 'rtsp://192.0.2.11/live' } });
    fireEvent.click(within(dialog).getByRole('button', { name: labels.equipment.testCameraConnection }));
    await within(dialog).findByRole('img', { name: labels.cameraPreview.connectionFailed });
    expect(requests.find(request => request.path.endsWith('/connect'))?.body).toMatchObject({ cameraId: '42', rtspUrl: 'rtsp://192.0.2.11/live' });
    expect(screen.queryByText('Private camera failure')).not.toBeInTheDocument();
    expect(requests.some(request => request.path.endsWith('/SaveParkingEquipment'))).toBe(false);
  });
});
