import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Camera } from '../../api/management';
import type { Language } from '../../i18n/instance';
import { trafficCameraService } from './trafficCameraService';

export function useTrafficCameras(doorId: string, language: Language, service = trafficCameraService) {
  const { t } = useTranslation(undefined, { lng: language });
  const [cameras, setCameras] = useState<{ entry: Camera | null; exit: Camera | null }>({ entry: null, exit: null });
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    setCameras({ entry: null, exit: null }); setFailed(false); setLoading(Boolean(doorId));
    if (doorId) void service.load(Number(doorId), { entry: t('trafficLayout.entryCamera'), exit: t('trafficLayout.exitCamera') })
      .then(result => { if (active) setCameras(result); })
      .catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [doorId, t, service]);
  return { entryCamera: cameras.entry, exitCamera: cameras.exit, loading, error: failed ? t('trafficLayout.cameraError') : '' };
}
