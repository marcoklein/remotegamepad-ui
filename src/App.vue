
<template>

<div class="fullsize">
    <div id="sceneGamepad" class="fullsize">
        <div id="gamepadLayoutDefault" class="fullsize">
            <!--
            <div @mousedown="leftButtonMouseDown" @mousemove="leftButtonMouseMove" @mouseup="leftButtonMouseUp" class="gamepadButtonLeft d-flex flex-column justify-content-center text-left">
                &lt;
            </div>
            <div v-bind:style="{ width: leftButtonWidth + '%'}" class="gamepadButtonRight d-flex flex-column justify-content-center text-right pr-4">
                &gt;
            </div>
            <div class="gamepadButtonA d-flex flex-column justify-content-center text-center">
                A
            </div>
            <div class="gamepadButtonB d-flex flex-column justify-content-center text-center">
                B
            </div>-->

            <div v-bind:style="{ width: (100 - gamepadData.leftArea.width - gamepadData.rightArea.width) + '%', left: (50 - (100 - gamepadData.leftArea.width - gamepadData.rightArea.width) / 2) + '%'}"
                class="gamepadButtonStart d-flex flex-column justify-content-center text-right pr-4">
                Start
            </div>            
            <div
                v-bind:style="{ width: gamepadData.leftArea.divider + '%', left: 0 + '%', height: gamepadData.leftArea.height + '%'}"
                @mousedown="leftButtonMouseDown" @mousemove="leftButtonMouseMove" @mouseup="leftButtonMouseUp" class="gamepadButtonLeft d-flex flex-column justify-content-center text-left">
                &lt;
            </div>
            <div
                v-bind:style="{ width: (gamepadData.leftArea.width - gamepadData.leftArea.divider) + '%', left: gamepadData.leftArea.divider + '%', height: gamepadData.leftArea.height + '%'}"
                class="gamepadButtonRight d-flex flex-column justify-content-center text-right pr-4">
                &gt;
            </div>
            <div 
                v-bind:style="{ width: gamepadData.rightArea.width + '%', bottom: 0 + '%', height: gamepadData.rightArea.divider + '%'}"
                class="gamepadButtonA d-flex flex-column justify-content-center text-center">
                A
            </div>
            <div 
                v-bind:style="{ width: gamepadData.rightArea.width + '%', bottom: gamepadData.rightArea.divider + '%', height: (gamepadData.rightArea.height - gamepadData.rightArea.divider) + '%'}"
                class="gamepadButtonB d-flex flex-column justify-content-center text-center">
                B
            </div>
        </div>
    </div>

    <div>
        <b-modal id="connectionCodeModal" size="xl" variant="primary" v-model="showConnectionCodeModal" title="Connect to the Game"  ><!-- ok-disabled cancel-disabled no-close-on-esc no-close-on-backdrop hide-header-close hide-footer-->
            <h3 class="mt-5 mb-2">Enter the Connection Code</h3>
            <!-- TODO replace input text with dedicated number buttons to input code more easily -->

            <div class="input-group">
                <input v-model="connectionCode" type="text" class="form-control" placeholder="Connection Code" v-on:keyup.enter="onConnectButtonClick">
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
            <div class="mt-1 mb-5">
                <b-alert variant="danger" v-model="showConnectionErrorAlert" dismissible>
                    Sorry, connection to <b>{{connectionCode}}</b> failed. Please check the code and internet connection.
                </b-alert>
            </div>

        </b-modal>
        <!-- Modals -->
        <b-modal id="connectingModal" title="Connecting" v-model="showConnectingModal" ok-disabled cancel-disabled no-close-on-esc no-close-on-backdrop hide-header-close hide-footer>
            <p class="my-4">Connecting to {{connectionCode}}</p>

        </b-modal>
    </div>


</div>
    
</template>


<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { RemoteGamepadClient } from 'remotegamepad/client';

type Area = {
    width: number,
    height: number,
    /**
     * Either a horizontal or vertical divider.
     */
    divider: number
}

@Component
export default class App extends Vue {

    /**
     * Remote client used throughout the application.
     */
    client: RemoteGamepadClient = new RemoteGamepadClient();
    /**
     * Connection code set by the input field.
     */
    connectionCode: string = '';


    showConnectingModal: boolean = false;
    showConnectionErrorAlert: boolean = false;
    connectionError: string = null;

    showConnectionCodeModal: boolean = true;

    gamepadData: {
        leftArea: Area;
        rightArea: Area;
    } = {
        leftArea: {
            width: 40,
            height: 80,
            divider: 30
        },
        rightArea: {
            width: 40,
            height: 80,
            divider: 30
        }
    };


    mounted() {
    }

    onConnectButtonClick() {
        let connectionCode = this.connectionCode;
        if (connectionCode.trim().length <= 0) {
            // no empty connection codes
            return;
        }

        // connect
        this.client.connect(connectionCode).then((client) => {
            console.log('Connection successfull.');
        }).catch((error) => {
            console.error('Error on connection: ', error);
            this.showConnectionErrorAlert = true;
            this.connectionError = error;
        }).finally(() => {
            this.showConnectingModal = false;
        });
        this.showConnectingModal = true;
    }

    leftButtonMouseDown() {
        console.log('mouse down left');
    }
    leftButtonMouseMove() {
        console.log('mouse move left');
    }
    leftButtonMouseUp() {
        console.log('mouse up left');
    }


}


</script>

<style>

</style>
