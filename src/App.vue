
<template>

<component
    v-bind:is="currentView"
    v-on:connection-success="currentView = 'GamepadView'"
></component>
    
</template>


<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import ConnectView from './views/Connect.vue';
import GamepadView from './views/Gamepad.vue';
import { RemoteGamepadClient } from 'remotegamepad/client';
import { globalStore } from './GlobalStore';


@Component({
    components: {
        ConnectView,
        GamepadView
    }
})
export default class App extends Vue {

    currentView = null;
    /**
     * Remote client used throughout the application.
     */
    client: RemoteGamepadClient = null;

    beforeStart() {
    }

    mounted() {
        this.client = new RemoteGamepadClient();
        console.log('con:', this.client);

        this.currentView = ConnectView;
    }



}


</script>

<style>

</style>
