import { useEffect, useState } from 'react';
import type { Camera } from '../../api/management';
import { HshDetectionConnection, parseHshDetectionConfig, type HshDetectionHandler, type HshDetectionStatus } from '../../api/hshDetectionRealtime';
import { parseShahabDetectionConfig } from '../../api/shahabDetectionConfig';

export function useTrafficCameraDetection(entryCamera: Camera | null, exitCamera: Camera | null, onDetection?: HshDetectionHandler) {
  const [errors, setErrors] = useState<Record<string, 'configuration' | 'connection'>>({});
  useEffect(() => {
    const cameras = [entryCamera, exitCamera].filter((camera): camera is Camera => Boolean(camera?.cameraId));
    setErrors({});
    if (!onDetection || cameras.length === 0) return undefined;

    let active = true;
    const connections: HshDetectionConnection[] = [];

    const start = async () => {
      await Promise.all(cameras.map(async (camera) => {
        const configValue = camera.detectionServerAddress?.trim();
        if (!configValue || camera.enabled === false || parseShahabDetectionConfig(configValue)) return;
        const config = parseHshDetectionConfig(configValue);
        if (!config) {
          if (active) setErrors(current => ({ ...current, [camera.cameraId]: 'configuration' }));
          return;
        }
        const connection = new HshDetectionConnection(config, camera.cameraId);
        connections.push(connection);
        const handleDetection: HshDetectionHandler = (event, loadArtifact) => onDetection(
          {
            ...event,
            source: { ...event.source, direction: camera.direction },
          },
          loadArtifact,
        );
        await connection.start(handleDetection, (status: HshDetectionStatus) => {
          if (!active) return;
          if (status.state === 'error' || status.state === 'cursor-expired') {
            setErrors(current => ({ ...current, [camera.cameraId]: 'connection' }));
          } else if (status.state === 'connected') {
            setErrors(current => { const next = { ...current }; delete next[camera.cameraId]; return next; });
          }
        });
      }));
    };

    void start();
    return () => {
      active = false;
      void Promise.all(connections.map((connection) => connection.stop()));
    };
  }, [entryCamera, exitCamera, onDetection]);


  return Object.values(errors).includes('configuration') ? 'configuration' : Object.keys(errors).length ? 'connection' : null;
}
