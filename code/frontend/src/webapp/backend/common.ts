export const AUTHORIZATION_HEADER = (import.meta.env.VITE_BACKEND_AUTH_HEADER || "Authorization").trim();

export const REQUEST_TIMEOUT = 2000;

const _getBackendBaseURL = async (): Promise<string> => {
  if (window && (window as any).api && (window as any).api.getBackendBaseURL) {
    // webapp was started with electron
    return await (window as any).api.getBackendBaseURL();
  } else {
    // webapp was started from browser
    return import.meta.env.VITE_BACKEND_BASE_URL || "";
  }
};

let _cachedBackendBaseUrl: string | null = null;

export const getBackendBaseURL = async () => {
  if (!_cachedBackendBaseUrl) {
    _cachedBackendBaseUrl = await _getBackendBaseURL();
  }
  return _cachedBackendBaseUrl;
};
