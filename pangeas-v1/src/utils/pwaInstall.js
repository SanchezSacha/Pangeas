const DISMISSED_UNTIL_KEY = 'pangeas-install-dismissed-until';

const listeners = new Set();

const installState = {
    deferredPrompt: null,
    isInstalled: false,
    isInstallable: false,
    isIos: false,
    isStandalone: false,
};

const isBrowser = typeof window !== 'undefined';

const detectStandalone = () => {
    if (!isBrowser) return false;
    return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
};

const detectIos = () => {
    if (!isBrowser) return false;
    const platform = window.navigator.platform || '';
    const userAgent = window.navigator.userAgent || '';
    const iPadOs = platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
    return /iphone|ipad|ipod/i.test(userAgent) || iPadOs;
};

const isPotentiallyInstallableBrowser = () => {
    if (!isBrowser) return false;
    return 'serviceWorker' in window.navigator && window.isSecureContext;
};

const getDismissedUntil = () => Number(window.localStorage.getItem(DISMISSED_UNTIL_KEY) || 0);

const notify = () => {
    listeners.forEach(listener => listener(getInstallState()));
};

export const getInstallState = () => {
    if (!isBrowser) return { ...installState, canInstall: false, wasDismissed: false };

    const wasDismissed = getDismissedUntil() > Date.now();
    const isStandalone = detectStandalone();
    const isIos = detectIos();

    installState.isStandalone = isStandalone;
    installState.isIos = isIos;
    installState.isInstalled = isStandalone || installState.isInstalled;
    installState.isInstallable = Boolean(installState.deferredPrompt);

    return {
        ...installState,
        canInstall: !installState.isInstalled && (installState.isInstallable || isIos || isPotentiallyInstallableBrowser()),
        wasDismissed,
    };
};

export const subscribeToInstallState = (listener) => {
    listeners.add(listener);
    listener(getInstallState());

    return () => listeners.delete(listener);
};

export const initializePwaInstall = () => {
    if (!isBrowser || window.__pangeasPwaInstallReady) return;

    window.__pangeasPwaInstallReady = true;

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        installState.deferredPrompt = event;
        installState.isInstallable = true;
        notify();
    });

    window.addEventListener('appinstalled', () => {
        installState.deferredPrompt = null;
        installState.isInstalled = true;
        installState.isInstallable = false;
        window.localStorage.removeItem(DISMISSED_UNTIL_KEY);
        notify();
    });

    window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', notify);
    getInstallState();
};

export const dismissInstallNudge = (days = 7) => {
    if (!isBrowser) return;
    const dismissedUntil = Date.now() + days * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(DISMISSED_UNTIL_KEY, String(dismissedUntil));
    notify();
};

export const promptPwaInstall = async () => {
    const state = getInstallState();

    if (state.isInstalled) {
        return { outcome: 'installed' };
    }

    if (state.deferredPrompt) {
        state.deferredPrompt.prompt();
        const choice = await state.deferredPrompt.userChoice;
        installState.deferredPrompt = null;
        installState.isInstallable = false;
        notify();
        return choice;
    }

    if (state.isIos) {
        return { outcome: 'ios-instructions' };
    }

    if (isPotentiallyInstallableBrowser()) {
        return { outcome: 'manual-instructions' };
    }

    return { outcome: 'unavailable' };
};

initializePwaInstall();
