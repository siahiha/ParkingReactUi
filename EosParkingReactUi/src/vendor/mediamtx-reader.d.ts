export {};

declare class MediaMTXWebRTCReader {
  constructor(configuration: {
    url: string;
    user?: string;
    pass?: string;
    token?: string;
    onError?: (error: string) => void;
    onTrack?: (event: RTCTrackEvent) => void;
    onDataChannel?: (event: RTCDataChannelEvent) => void;
  });
  close(): void;
}

declare global {
  interface Window {
    MediaMTXWebRTCReader: typeof MediaMTXWebRTCReader;
  }
}
