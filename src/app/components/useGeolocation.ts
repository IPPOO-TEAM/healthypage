import { useEffect, useState } from 'react';

export type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

interface GeoState {
  status: GeoStatus;
  position: [number, number] | null;
  error: string | null;
}

export function useGeolocation(autoRequest = true) {
  const [state, setState] = useState<GeoState>({ status: 'idle', position: null, error: null });

  const request = () => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'unavailable', position: null, error: 'Géolocalisation non supportée' });
      return;
    }
    setState((s) => ({ ...s, status: 'requesting' }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: 'granted',
          position: [pos.coords.latitude, pos.coords.longitude],
          error: null
        });
      },
      (err) => {
        setState({
          status: err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable',
          position: null,
          error: err.message
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 }
    );
  };

  useEffect(() => {
    if (autoRequest) request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, request };
}
