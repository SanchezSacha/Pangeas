import { createStore } from 'vuex';
export default createStore({
    state: {
        user: null,
        userPosition: null
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
        }
    },
    getters: {
        isLoggedIn: state => !!state.user,
        userPseudo: state => state.user?.pseudo || '',
        userPosition: state => state.userPosition
    }
});
