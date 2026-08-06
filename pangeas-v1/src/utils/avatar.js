const MAX_AVATAR_SIZE = 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const resolveAvatarUrl = (avatarUrl, fallback = '') => {
    if (!avatarUrl || avatarUrl === '/img-avatar.jpg' || avatarUrl.endsWith('/img-avatar.jpg')) {
        return fallback;
    }
    if (/^(https?:|blob:|data:)/.test(avatarUrl)) return avatarUrl;
    return `${apiBaseUrl}${avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`}`;
};

export const getAvatarValidationError = file => {
    if (!file) return 'Aucune image selectionnee.';
    if (!ALLOWED_AVATAR_TYPES.has(file.type)) return 'Choisissez une image JPG, PNG ou WebP.';
    if (file.size > MAX_AVATAR_SIZE) return 'L image ne doit pas depasser 1 Mo.';
    return null;
};

export const getUploadErrorMessage = (error, fallback) => {
    const fieldError = error.response?.data?.errors?.find(item => item.field === 'avatar');
    return fieldError?.message || error.response?.data?.message || fallback;
};
