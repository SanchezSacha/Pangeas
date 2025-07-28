import { createStore } from 'vuex';
export default createStore({
    state: {
        user: null,
        userPosition: null,
        currentVisit: null,
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
            state.favorites = favorites;
        },
        addFavorite(state, placeId) {
            if (!state.favorites.includes(placeId)) {
                state.favorites.push(placeId);
            }
        },
        removeFavorite(state, placeId) {
            state.favorites = state.favorites.filter(id => id !== placeId);
        }
    },
    getters: {
        isLoggedIn: state => !!state.user,
        userPseudo: state => state.user?.pseudo || '',
        userPosition: state => state.userPosition,
        isFavorite: (state) => (placeId) => {
            return state.favorites.includes(placeId);
        }
    }
});
