import { createStore } from 'vuex';
export default createStore({
    state: {
        user: null,
        userPosition: null,
        currentVisit: null,
        visitPlaceFromDetail: null,
        favorites: []
    },
    mutations: {
        setUser(state, userData) {
            state.user = userData;
        },
        logout(state) {
            state.user = null;
            state.favorites = [];
        },
        setUserPosition(state, coords) {
            state.userPosition = coords;
        },
        setCurrentVisit(state, visitData) {
            state.currentVisit = visitData;
        },
        clearCurrentVisit(state) {
            state.currentVisit = null;
        },
        setFavorites(state, favorites) {
            state.favorites = favorites.map(id => String(id));
        },
        addFavorite(state, placeId) {
            const normalizedPlaceId = String(placeId);
            if (!state.favorites.includes(normalizedPlaceId)) {
                state.favorites.push(normalizedPlaceId);
            }
        },
        removeFavorite(state, placeId) {
            const normalizedPlaceId = String(placeId);
            state.favorites = state.favorites.filter(id => String(id) !== normalizedPlaceId);
        },
        setVisitPlaceFromDetail(state, place) {
            state.visitPlaceFromDetail = place;
        },
        clearVisitPlaceFromDetail(state) {
            state.visitPlaceFromDetail = null;
        }
    },
    getters: {
        isLoggedIn: state => !!state.user,
        userPseudo: state => state.user?.pseudo || '',
        userPosition: state => state.userPosition,
        isFavorite: (state) => (placeId) => {
            return state.favorites.map(id => String(id)).includes(String(placeId));
        }
    }
});
