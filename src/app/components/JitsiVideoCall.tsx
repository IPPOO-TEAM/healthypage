import { useEffect, useRef } from 'react';

declare global {
  interface Window { JitsiMeetExternalAPI?: any }
}

interface Props {
  room: string;
  displayName?: string;
  email?: string;
  domain?: string;
  startWithAudioMuted?: boolean;
  startWithVideoMuted?: boolean;
  onApiReady?: (api: any) => void;
  onParticipantJoined?: () => void;
  onParticipantLeft?: () => void;
  onHangup?: () => void;
  className?: string;
}

const JITSI_SCRIPT_ID = 'jitsi-external-api-script';

const loadJitsiScript = (domain: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve();
    const existing = document.getElementById(JITSI_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Jitsi script load failed')));
      return;
    }
    const s = document.createElement('script');
    s.id = JITSI_SCRIPT_ID;
    s.src = `https://${domain}/external_api.js`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Jitsi script load failed'));
    document.body.appendChild(s);
  });
};

export default function JitsiVideoCall({
  room,
  displayName,
  email,
  domain = 'meet.jit.si',
  startWithAudioMuted = false,
  startWithVideoMuted = false,
  onApiReady,
  onParticipantJoined,
  onParticipantLeft,
  onHangup,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    let disposed = false;
    let api: any = null;

    loadJitsiScript(domain)
      .then(() => {
        if (disposed || !containerRef.current || !window.JitsiMeetExternalAPI) return;
        api = new window.JitsiMeetExternalAPI(domain, {
          roomName: room,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName: displayName ?? 'Patient', email: email ?? '' },
          configOverwrite: {
            startWithAudioMuted,
            startWithVideoMuted,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            disableInviteFunctions: true,
            enableClosePage: false,
          },
          interfaceConfigOverwrite: {
            DEFAULT_BACKGROUND: '#0f172a',
            DISABLE_VIDEO_BACKGROUND: false,
            HIDE_INVITE_MORE_HEADER: true,
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'desktop', 'fullscreen', 'fodeviceselection',
              'hangup', 'chat', 'settings', 'raisehand', 'videoquality', 'tileview',
            ],
          },
        });
        apiRef.current = api;
        api.addListener('readyToClose', () => onHangup?.());
        api.addListener('participantJoined', () => onParticipantJoined?.());
        api.addListener('participantLeft', () => onParticipantLeft?.());
        onApiReady?.(api);
      })
      .catch((e) => console.error('Jitsi load error', e));

    return () => {
      disposed = true;
      try { api?.dispose(); } catch {}
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, domain]);

  return <div ref={containerRef} className={className ?? 'w-full h-full'} />;
}
