import { useEffect } from "react";

export const LIVE_DATA_RELOAD_EVENT = "yosti:live-data-reload";

export function notifyLiveDataReload() {
  window.dispatchEvent(new CustomEvent(LIVE_DATA_RELOAD_EVENT));
}

export function useLiveDataReload(reload: () => void) {
  useEffect(() => {
    const refresh = () => reload();
    window.addEventListener(LIVE_DATA_RELOAD_EVENT, refresh);
    return () => window.removeEventListener(LIVE_DATA_RELOAD_EVENT, refresh);
  }, [reload]);
}
