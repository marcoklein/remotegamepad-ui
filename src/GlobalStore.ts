import Vue from 'vue';

/**
 * Globally shared state.
 */
export const globalStore = new Vue({
    data: {
        client: null
    }
});