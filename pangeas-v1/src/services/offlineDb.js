const DATABASE_NAME = 'pangeas-offline';
const DATABASE_VERSION = 1;

const STORES = {
    places: 'places',
    metadata: 'metadata',
    outbox: 'outbox',
};

let databasePromise;

const requestToPromise = request => new Promise((resolve, reject) => {
    request.addEventListener('success', () => resolve(request.result), { once: true });
    request.addEventListener('error', () => reject(request.error), { once: true });
});

const transactionToPromise = transaction => new Promise((resolve, reject) => {
    transaction.addEventListener('complete', () => resolve(), { once: true });
    transaction.addEventListener('abort', () => reject(transaction.error), { once: true });
    transaction.addEventListener('error', () => reject(transaction.error), { once: true });
});

const createActionId = () => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const openOfflineDatabase = () => {
    if (!('indexedDB' in globalThis)) {
        return Promise.reject(new Error('IndexedDB indisponible dans ce navigateur.'));
    }

    if (!databasePromise) {
        databasePromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

            request.addEventListener('upgradeneeded', () => {
                const database = request.result;

                if (!database.objectStoreNames.contains(STORES.places)) {
                    database.createObjectStore(STORES.places, { keyPath: '_id' });
                }

                if (!database.objectStoreNames.contains(STORES.metadata)) {
                    database.createObjectStore(STORES.metadata, { keyPath: 'key' });
                }

                if (!database.objectStoreNames.contains(STORES.outbox)) {
                    const outbox = database.createObjectStore(STORES.outbox, { keyPath: 'id' });
                    outbox.createIndex('createdAt', 'createdAt');
                    outbox.createIndex('entityKey', 'entityKey');
                }
            });

            request.addEventListener('success', () => resolve(request.result), { once: true });
            request.addEventListener('error', () => reject(request.error), { once: true });
            request.addEventListener('blocked', () => {
                reject(new Error('La base locale est utilisée par une ancienne version de Pangeas.'));
            }, { once: true });
        });
    }

    return databasePromise;
};

export const savePlaces = async places => {
    const validPlaces = (Array.isArray(places) ? places : []).filter(place => place?._id);
    if (!validPlaces.length) return;

    const database = await openOfflineDatabase();
    const transaction = database.transaction(STORES.places, 'readwrite');
    const store = transaction.objectStore(STORES.places);
    validPlaces.forEach(place => store.put(place));
    await transactionToPromise(transaction);
};

export const replacePlaces = async places => {
    const validPlaces = (Array.isArray(places) ? places : []).filter(place => place?._id);
    const database = await openOfflineDatabase();
    const transaction = database.transaction(STORES.places, 'readwrite');
    const store = transaction.objectStore(STORES.places);
    store.clear();
    validPlaces.forEach(place => store.put(place));
    await transactionToPromise(transaction);
};

export const getCachedPlaces = async () => {
    const database = await openOfflineDatabase();
    const transaction = database.transaction(STORES.places, 'readonly');
    const places = await requestToPromise(transaction.objectStore(STORES.places).getAll());
    await transactionToPromise(transaction);
    return places;
};

export const getCachedPlace = async placeId => {
    if (!placeId) return null;
    const database = await openOfflineDatabase();
    const transaction = database.transaction(STORES.places, 'readonly');
    const place = await requestToPromise(transaction.objectStore(STORES.places).get(String(placeId)));
    await transactionToPromise(transaction);
    return place || null;
};

export const setMetadata = async (key, value) => {
    const database = await openOfflineDatabase();
    const transaction = database.transaction(STORES.metadata, 'readwrite');
    transaction.objectStore(STORES.metadata).put({ key, value });
    await transactionToPromise(transaction);
};

export const getMetadata = async (key, fallback = null) => {
    const database = await openOfflineDatabase();
    const transaction = database.transaction(STORES.metadata, 'readonly');
    const entry = await requestToPromise(transaction.objectStore(STORES.metadata).get(key));
    await transactionToPromise(transaction);
    return entry?.value ?? fallback;
};

export const removeMetadata = async key => {
    const database = await openOfflineDatabase();
    const transaction = database.transaction(STORES.metadata, 'readwrite');
    transaction.objectStore(STORES.metadata).delete(key);
    await transactionToPromise(transaction);
};

export const getOutboxActions = async () => {
    const database = await openOfflineDatabase();
    const transaction = database.transaction(STORES.outbox, 'readonly');
    const actions = await requestToPromise(
        transaction.objectStore(STORES.outbox).index('createdAt').getAll()
    );
    await transactionToPromise(transaction);
    return actions;
};

export const enqueueOutboxAction = async action => {
    const normalizedAction = {
        id: action.id || createActionId(),
        type: action.type,
        entityKey: action.entityKey || action.type,
        payload: action.payload ?? {},
        ownerId: action.ownerId || null,
        createdAt: action.createdAt || Date.now(),
        attempts: action.attempts || 0,
    };

    if (!normalizedAction.type) {
        throw new Error('Une action hors ligne doit avoir un type.');
    }

    if (action.replacePending) {
        const existingActions = await getOutboxActions();
        const database = await openOfflineDatabase();
        const transaction = database.transaction(STORES.outbox, 'readwrite');
        const store = transaction.objectStore(STORES.outbox);
        existingActions
            .filter(existing => existing.entityKey === normalizedAction.entityKey)
            .forEach(existing => store.delete(existing.id));
        store.put(normalizedAction);
        await transactionToPromise(transaction);
        return normalizedAction;
    }

    const database = await openOfflineDatabase();
    const transaction = database.transaction(STORES.outbox, 'readwrite');
    transaction.objectStore(STORES.outbox).put(normalizedAction);
    await transactionToPromise(transaction);
    return normalizedAction;
};

export const removeOutboxAction = async actionId => {
    const database = await openOfflineDatabase();
    const transaction = database.transaction(STORES.outbox, 'readwrite');
    transaction.objectStore(STORES.outbox).delete(actionId);
    await transactionToPromise(transaction);
};

export const updateOutboxAction = async action => {
    const database = await openOfflineDatabase();
    const transaction = database.transaction(STORES.outbox, 'readwrite');
    transaction.objectStore(STORES.outbox).put(action);
    await transactionToPromise(transaction);
};

export const clearOutbox = async () => {
    const database = await openOfflineDatabase();
    const transaction = database.transaction(STORES.outbox, 'readwrite');
    transaction.objectStore(STORES.outbox).clear();
    await transactionToPromise(transaction);
};
