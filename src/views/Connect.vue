
<template>
<div>
<div class="container">
    <h1 class="mt-5 mb-5">Enter the Connection Code</h1>
    <!-- TODO replace input text with dedicated number buttons to input code more easily -->

    <div class="input-group">
        <input v-model="connectionCode" type="text" class="form-control" placeholder="Connection Code">
        <div class="input-group-append">
            <button
                v-on:click="onConnectButtonClick"
                v-bind:disabled="connectionCode.trim().length <= 0"
                class="btn btn-primary"
                type="button">
                Connect
            </button>
        </div>
    </div>
    <div class="mt-5">
        <h3>Status</h3>
        Connecting: "{{client.isConnecting}}"
    </div>

</div>

<div>
    <!-- Modals -->
    <b-modal id="connectingModal" title="Connecting" v-model="modelOpen">
        <p class="my-4">Connecting to {{connectionCode}}</p>
    </b-modal>
</div>


</div>


    
</template>


<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { RemoteGamepadClient } from 'remotegamepad/client';

/**
 * Initial view showing a form to input the connection code of the gamepad server.
 * 
 * The view handles the connection logic. A pop-up is shown during a connection attempt and the respective error if something fails.
 * On successfull connection the view emits an 'connection-success' event.
 */
@Component
export default class ConnectView extends Vue {

    /**
     * Access remote client.
     */
    client: RemoteGamepadClient = null;
    /**
     * Connection code set by the input field.
     */
    connectionCode: string = '';

    modelOpen: boolean = false;

    mounted() {
        console.log(this.$parent.$data.client.isConnecting);
        this.client = this.$parent.$data.client;
        console.log('cc:', this.client.isConnecting);
    }

    onConnectButtonClick() {
        let connectionCode = this.connectionCode;

        //(<any> this).$bvModal.show('connectingModal');
        // connect
        this.$root.$data.client.connect(connectionCode).then((client) => {
            console.log('Connection successfull.');
            this.$emit('connection-success');
        }).catch((error) => {
            console.error('Error on connection: ', error);
        });

    }

    data() {
        return {
            client: this.$root.$data.client
        }
    }
}


</script>

<style>

</style>
