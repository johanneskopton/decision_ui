export const AUTHORIZATION_HEADER = (import.meta.env.VITE_BACKEND_AUTH_HEADER || "Authorization").trim()

const getBackendBaseURL = async () => {
    if (window && (window as any).api && (window as any).api.getBackendBaseURL) {
        // webapp was started with electron
        return await (window as any).api.getBackendBaseURL();
    } else {
        // webapp was started from browser
        return import.meta.env.VITE_BACKEND_BASE_URL || "";
    }
}

export const BACKEND_BASE_URL = await getBackendBaseURL();