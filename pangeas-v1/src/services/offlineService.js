import axios from '@/axios';
import store from '@/store';
import {
    clearOutbox,
    enqueueOutboxAction,
    getCachedPlace,
    getCachedPlaces,
    getMetadata,
    getOutboxActions,
    removeMetadata,
    removeOutboxAction,
    replacePlaces,
    savePlaces,
    setMetadata,
    updateOutboxAction,
} from './offlineDb';

export const OFFLINE_ACTIONS = Object.freeze({
    SET_FAVORITE: 'favorite:set',
    START_VISIT: 'visit:start',
    CANCEL_VISIT: 'visit:cancel',
    VALIDATE_VISIT: 'visit:validate',
    SUBMIT_PLACE: 'place:submit',
});

const META = Object.freeze({
    favoriteIds: 'favoriteIds',
    currentVisit: 'currentVisit',
    sessionUser: 'sessionUser',
    placesSyncedAt: 'placesSyncedAt',
});

let initialized = false;
let syncPromise = null;

const isOnline = () => navigator.onLine !== false;
const isNetworkError = error => !error?.response;
const getUserId = user => user?._id || user?.id || null;
const createActionId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const toOfflineUser = user => user ? {
    id: getUserId(user),
    pseudo: user.pseudo || '',
    avatar_url: user.avatar_url || null,
    role: user.role || 'user'
} : null;

const safely = async (operation, fallback = null) => {
    try {
        return await operation();
    } catch (error) {
        console.warn('Stockage hors ligne indisponible :', error);
        return fallback;
    }
};

const updatePendingCount = async () => {
    const actions = await safely(() => getOutboxActions(), []);
    store.commit('setPendingSyncCount', actions.length);
    return actions;
};

const executeAction = action => {
    const config = {
        withCredentials: true,
        headers: action.id ? { 'Idempotency-Key': action.id } : {}
    };
    switch (action.type) {
        case OFFLINE_ACTIONS.SET_FAVORITE:
            return action.payload.isFavorite
                ? axios.post('/api/favorites', { placeId: action.payload.placeId }, config)
                : axios.delete(`/api/favorites/${action.payload.placeId}`, config);
        case OFFLINE_ACTIONS.START_VISIT:
            return axios.post('/api/visit/start', action.payload, config);
        case OFFLINE_ACTIONS.CANCEL_VISIT:
            return axios.delete('/api/visit/cancel', config);
        case OFFLINE_ACTIONS.VALIDATE_VISIT:
            return axios.post('/api/visit/validate', action.payload, config);
        case OFFLINE_ACTIONS.SUBMIT_PLACE:
            throw new Error('La soumission de lieu sera activée avec la future fonctionnalité.');
        default:
            throw new Error(`Type d'action hors ligne inconnu : ${action.type}`);
    }
};

export const syncPendingActions = async verifiedUser => {
    if (!isOnline()) return { synced: 0, remaining: store.state.pendingSyncCount };
    if (syncPromise) return syncPromise;

    syncPromise = (async () => {
        const actions = await updatePendingCount();
        if (!actions.length) return { synced: 0, remaining: 0 };

        let serverUser = verifiedUser;
        if (!serverUser) {
            try {
                const sessionResponse = await axios.get('/api/auth/me', { withCredentials: true });
                serverUser = sessionResponse.data?.user || null;
            } catch (error) {
                if (isNetworkError(error)) return { synced: 0, remaining: actions.length };
                serverUser = null;
            }
        }

        const serverUserId = getUserId(serverUser);
        const cachedUserId = getUserId(store.state.user);
        const belongsToAnotherUser = actions.some(action => (
            action.ownerId && String(action.ownerId) !== String(serverUserId)
        ));

        if (!serverUserId || belongsToAnotherUser || (cachedUserId && String(cachedUserId) !== String(serverUserId))) {
            await clearOutbox();
            await updatePendingCount();
            if (!serverUserId) await forgetUser();
            return { synced: 0, remaining: 0 };
        }

        store.commit('setUser', serverUser);
        store.commit('setSyncing', true);
        let synced = 0;

        for (const action of actions) {
            try {
                const response = await executeAction(action);
                await removeOutboxAction(action.id);
                if (action.type === OFFLINE_ACTIONS.START_VISIT) {
                    await rememberCurrentVisit({
                        ...(response?.data?.visit || action.payload),
                        place_id: response?.data?.visit?.place_id || action.payload.place_id,
                        pendingSync: false,
                    });
                }
                if ([OFFLINE_ACTIONS.CANCEL_VISIT, OFFLINE_ACTIONS.VALIDATE_VISIT].includes(action.type)) {
                    await forgetCurrentVisit();
                }
                synced += 1;
            } catch (error) {
                if (isNetworkError(error)) break;
                if (error.response?.status === 401) {
                    await clearOutbox();
                    await forgetUser();
                    break;
                }

                await updateOutboxAction({
                    ...action,
                    attempts: (action.attempts || 0) + 1,
                    lastError: error.response?.data?.message || error.message,
                });
            }
        }

        const remainingActions = await updatePendingCount();
        if (synced > 0) {
            window.dispatchEvent(new CustomEvent('pangeas:sync-complete', {
                detail: { synced, remaining: remainingActions.length },
            }));
        }

        return { synced, remaining: remainingActions.length };
    })().finally(() => {
        store.commit('setSyncing', false);
        syncPromise = null;
    });

    return syncPromise;
};

export const initializeOfflineService = async () => {
    if (initialized) return;
    initialized = true;

    store.commit('setOnline', isOnline());

    const [favoriteIds, currentVisit, sessionUser, placesSyncedAt] = await Promise.all([
        safely(() => getMetadata(META.favoriteIds, []), []),
        safely(() => getMetadata(META.currentVisit, null), null),
        safely(() => getMetadata(META.sessionUser, null), null),
        safely(() => getMetadata(META.placesSyncedAt, null), null),
    ]);

    store.commit('setFavorites', favoriteIds);
    store.commit('setCurrentVisit', currentVisit);
    store.commit('setLastPlacesSyncAt', placesSyncedAt);

    if (sessionUser) {
        store.commit('setUser', sessionUser);
    }

    store.subscribe(mutation => {
        if (mutation.type === 'setUser') {
            safely(() => setMetadata(META.sessionUser, toOfflineUser(store.state.user)));
        }

        if (mutation.type === 'logout') {
            safely(() => removeMetadata(META.sessionUser));
            safely(() => setMetadata(META.favoriteIds, []));
            safely(async () => {
                await clearOutbox();
                await updatePendingCount();
            });
        }

        if (['setFavorites', 'addFavorite', 'removeFavorite'].includes(mutation.type)) {
            safely(() => setMetadata(META.favoriteIds, store.state.favorites));
        }

        if (mutation.type === 'setCurrentVisit') {
            safely(() => setMetadata(META.currentVisit, store.state.currentVisit));
        }

        if (mutation.type === 'clearCurrentVisit') {
            safely(() => removeMetadata(META.currentVisit));
        }
    });

    await updatePendingCount();

    window.addEventListener('online', () => {
        store.commit('setOnline', true);
        syncPendingActions();
    });

    window.addEventListener('offline', () => {
        store.commit('setOnline', false);
    });

};

export const loadCachedPlaces = () => safely(() => getCachedPlaces(), []);
export const loadCachedPlace = placeId => safely(() => getCachedPlace(placeId), null);

export const rememberPlaces = async places => {
    const syncedAt = Date.now();
    await safely(() => replacePlaces(places));
    await safely(() => setMetadata(META.placesSyncedAt, syncedAt));
    store.commit('setLastPlacesSyncAt', syncedAt);
    store.commit('setUsingOfflineData', false);
};

export const rememberPlace = place => safely(() => savePlaces([place]));

export const rememberUser = user => {
    store.commit('setUser', user);
    return safely(() => setMetadata(META.sessionUser, toOfflineUser(user)));
};

export const forgetUser = async () => {
    store.commit('logout');
    await Promise.all([
        safely(() => removeMetadata(META.sessionUser)),
        safely(() => setMetadata(META.favoriteIds, [])),
    ]);
};

export const rememberFavoriteIds = favoriteIds => (
    safely(() => setMetadata(META.favoriteIds, favoriteIds.map(String)))
);

export const rememberFavoriteSnapshot = async favoritePlaces => {
    const places = Array.isArray(favoritePlaces) ? favoritePlaces.filter(Boolean) : [];
    await rememberFavoriteIds(places.map(place => place._id));
    await safely(() => savePlaces(places));
};

export const setFavoriteOfflineAware = async (placeId, shouldBeFavorite) => {
    const normalizedId = String(placeId);
    const wasFavorite = store.getters.isFavorite(normalizedId);

    store.commit(shouldBeFavorite ? 'addFavorite' : 'removeFavorite', normalizedId);
    await rememberFavoriteIds(store.state.favorites);

    const queueChange = async () => {
        await enqueueOutboxAction({
            type: OFFLINE_ACTIONS.SET_FAVORITE,
            entityKey: `favorite:${normalizedId}`,
            payload: { placeId: normalizedId, isFavorite: shouldBeFavorite },
            ownerId: getUserId(store.state.user),
            replacePending: true,
        });
        await updatePendingCount();
        return { queued: true };
    };

    if (!isOnline()) return queueChange();

    try {
        await executeAction({
            id: createActionId(),
            type: OFFLINE_ACTIONS.SET_FAVORITE,
            payload: { placeId: normalizedId, isFavorite: shouldBeFavorite },
        });
        return { queued: false };
    } catch (error) {
        if (isNetworkError(error)) return queueChange();

        store.commit(wasFavorite ? 'addFavorite' : 'removeFavorite', normalizedId);
        await rememberFavoriteIds(store.state.favorites);
        throw error;
    }
};

export const rememberCurrentVisit = visit => {
    store.commit('setCurrentVisit', visit);
    return safely(() => setMetadata(META.currentVisit, visit));
};

export const forgetCurrentVisit = () => {
    store.commit('clearCurrentVisit');
    return safely(() => removeMetadata(META.currentVisit));
};

export const queueOfflineAction = async action => {
    const queuedAction = await enqueueOutboxAction({
        ...action,
        ownerId: action.ownerId || getUserId(store.state.user),
    });
    await updatePendingCount();
    return queuedAction;
};

const executeOrQueue = async action => {
    const actionWithId = { ...action, id: action.id || createActionId() };
    if (!isOnline()) {
        await queueOfflineAction(actionWithId);
        return { queued: true, response: null };
    }

    try {
        const response = await executeAction(actionWithId);
        return { queued: false, response };
    } catch (error) {
        if (!isNetworkError(error)) throw error;
        await queueOfflineAction(actionWithId);
        return { queued: true, response: null };
    }
};

export const startVisitOfflineAware = async payload => {
    const localVisit = {
        place_id: payload.place_id,
        user_lat: payload.user_lat,
        user_lng: payload.user_lng,
        pendingSync: true,
    };

    await rememberCurrentVisit(localVisit);

    try {
        const result = await executeOrQueue({
            type: OFFLINE_ACTIONS.START_VISIT,
            entityKey: `visit:start:${payload.place_id}`,
            payload,
            replacePending: true,
        });

        if (!result.queued) {
            await rememberCurrentVisit({
                ...(result.response?.data?.visit || localVisit),
                place_id: result.response?.data?.visit?.place_id || payload.place_id,
                pendingSync: false,
            });
        }

        return result;
    } catch (error) {
        await forgetCurrentVisit();
        throw error;
    }
};

export const cancelVisitOfflineAware = async () => {
    const currentVisit = store.state.currentVisit;
    await forgetCurrentVisit();

    const pendingActions = await safely(() => getOutboxActions(), []);
    const pendingStart = pendingActions.find(action => (
        action.type === OFFLINE_ACTIONS.START_VISIT &&
        action.payload.place_id === currentVisit?.place_id
    ));

    if (pendingStart && currentVisit?.pendingSync) {
        await removeOutboxAction(pendingStart.id);
        await updatePendingCount();
        return { queued: false, cancelledLocally: true };
    }

    try {
        return await executeOrQueue({
            type: OFFLINE_ACTIONS.CANCEL_VISIT,
            entityKey: 'visit:cancel',
            payload: {},
            replacePending: true,
        });
    } catch (error) {
        if (currentVisit) await rememberCurrentVisit(currentVisit);
        throw error;
    }
};

export const validateVisitOfflineAware = async payload => {
    const result = await executeOrQueue({
        type: OFFLINE_ACTIONS.VALIDATE_VISIT,
        entityKey: `visit:validate:${payload.place_id}`,
        payload,
        replacePending: true,
    });

    await forgetCurrentVisit();
    return result;
};
