import { createStore } from 'vuex';
export default createStore({
    state: {
        user: null,
        userPosition: null,
        currentVisit: null,
    },
    mutations: {
        setUser(state, userData) {
            state.user = userData;
        },
        logout(state) {
            state.user = null;
        },
        setUserPosition(state, coords) {
            state.userPosition = coords;
        },
        setCurrentVisit(state, visitData) {
            state.currentVisit = visitData;
        },
        clearCurrentVisit(state) {
            state.currentVisit = null;
        }
    },
    getters: {
        isLoggedIn: state => !!state.user,
        userPseudo: state => state.user?.pseudo || '',
        userPosition: state => state.userPosition
    }
});
