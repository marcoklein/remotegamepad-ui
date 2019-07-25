
<template>

<div class="fullsize">
    <div id="sceneGamepad" class="fullsize" v-if="gamepadButtons">
        <div id="gamepadLayoutDefault" class="fullsize"
            @touchstart="touchStart" @touchmove="touchMoving" @touchend="touchEnd"
            @mousedown="leftButtonMouseDown" @mousemove="leftButtonMouseMove" @mouseup="leftButtonMouseUp"
        >

            <div gamepad-button="9"
                v-bind:class="{ pressed: (gamepadButtons[9].pressed) }"
                v-bind:style="{ width: (100 - gamepadData.leftArea.width - gamepadData.rightArea.width) + '%', left: (50 - (100 - gamepadData.leftArea.width - gamepadData.rightArea.width) / 2) + '%'}"
                class="gamepadButtonStart d-flex flex-column justify-content-center text-right pr-4">
                Start
            </div>
            
            <div class="dividerSlider leftSlider"
                @touchstart="leftDividerTouchStart" @touchmove="leftDividerTouchMove"
                v-bind:style="{left: gamepadData.leftArea.divider + '%', bottom: (gamepadData.leftArea.height * 0.8) + '%'}">
            </div>
            <div gamepad-button="14"
                v-bind:class="{ pressed: (gamepadButtons[14].pressed) }"
                v-bind:style="{ width: gamepadData.leftArea.divider + '%', left: 0 + '%', height: gamepadData.leftArea.height + '%'}"
                class="gamepadButtonLeft d-flex flex-column justify-content-center text-left">
                &lt;
            </div>
            <div gamepad-button="15" 
                v-bind:class="{ pressed: (gamepadButtons[15].pressed) }"
                v-bind:style="{ width: (gamepadData.leftArea.width - gamepadData.leftArea.divider) + '%', left: gamepadData.leftArea.divider + '%', height: gamepadData.leftArea.height + '%'}"
                class="gamepadButtonRight d-flex flex-column justify-content-center text-right pr-4">
                &gt;
            </div>

            <div class="dividerSlider rightSlider"
                v-bind:style="{bottom: gamepadData.rightArea.divider + '%', right: (gamepadData.rightArea.width * 0.8) + '%'}">
            </div>
            <div gamepad-button="0" 
                v-bind:class="{ pressed: (gamepadButtons[0].pressed) }"
                v-bind:style="{ width: gamepadData.rightArea.width + '%', bottom: 0 + '%', height: gamepadData.rightArea.divider + '%'}"
                class="gamepadButtonA d-flex flex-column justify-content-center text-center">
                A
            </div>
            <div gamepad-button="1" 
                v-bind:class="{ pressed: (gamepadButtons[1].pressed) }"
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

    /**
     * Gamepad buttons array.
     * The ids follow the official WC3 guideline:
     * https://www.w3.org/TR/gamepad/#gamepad-interface
     */
    gamepadButtons: {
        pressed: boolean
    }[] = null;

    /**
     * Array with all previous touches.
     * Each touch has a unique identifier, directly mapped to a certain button id.
     */
    lastButtonTouches: {[key: number]: number} = {};

    created() {
        this.initGamepadState();
    }

    mounted() {
        //this.initGamepadState();
    }
    
    /**
     * Init all needed gamepad buttons.
     */
    private initGamepadState() {
        this.gamepadButtons = [];
        for (let i = 0; i < 16; i++) {
            this.gamepadButtons.push({
                pressed: false
            });
        } 
    }

    /**
     * Loops through all gamepad buttons and sets pressed to false.
     */
    private resetGamepadButtons() {
        for (let i = 0; i < this.gamepadButtons.length; i++) {
            this.gamepadButtons[i].pressed = false;
        }
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

    leftButtonMouseDown(event: MouseEvent) {
        this.handlePointerDown(event.clientX, event.clientY, 0);
    }

    leftButtonMouseMove(event: MouseEvent) {
        if (event.which >= 1) {
            console.log(event.which);
            this.handlePointerDown(event.clientX, event.clientY, 0);
        }
    }
    leftButtonMouseUp() {
        this.handlePointerUp(0);
    }

    touchStart(event: TouchEvent) {
        event.preventDefault();
        for (let i = 0; i < event.changedTouches.length; i++) {
            let touch = event.changedTouches[i];
            this.handlePointerDown(touch.pageX, touch.pageY, touch.identifier);
        }
    }

    touchEnd(event: TouchEvent) {
        event.preventDefault();
        for (let i = 0; i < event.changedTouches.length; i++) {
            let touch = event.changedTouches[i];
            this.handlePointerUp(touch.identifier);
        }
    }

    touchMoving(event: TouchEvent) {
        event.preventDefault();
        for (let i = 0; i < event.changedTouches.length; i++) {
            let touch = event.changedTouches[i];
            this.handlePointerDown(touch.pageX, touch.pageY, touch.identifier);
        }
    }

    handlePointerDown(x: number, y: number, identifier: number) {
        // find touched element
        let element = document.elementFromPoint(x, y);
        // extract button info
        let gamepadButton = !element ? null : element.getAttribute('gamepad-button');

        // uncheck the last button if existing
        let lastButton = this.lastButtonTouches[identifier];
        if (lastButton >= 0) {
            this.gamepadButtons[lastButton].pressed = false;
        } // else, lastButton is null or undefined

        if (gamepadButton) {
            // mark button as pressed
            this.gamepadButtons[gamepadButton].pressed = true;
            // set last button in map
            this.lastButtonTouches[identifier] = Number.parseInt(gamepadButton);
        }
    }

    handlePointerUp(identifier: number) {
        // uncheck the last button if existing
        let lastButton = this.lastButtonTouches[identifier];
        if (lastButton >= 0) {
            this.gamepadButtons[lastButton].pressed = false;
        } // else, lastButton is null or undefined
    }

    /* Left Divider Touch Events */

    /**
     * Store the position of the left divider on touch start.
     */
    leftDividerTouchStartX: number;
    /**
     * Store the relative position of the left divider on touch start.
     */
    leftDividerTouchStartValue: number;

    /**
     * Left divider is touched.
     */
    leftDividerTouchStart(event: TouchEvent) {
        event.preventDefault();
        // only change position with first (0) touch pointer
        this.leftDividerTouchStartX = event.changedTouches[0].clientX;
        this.leftDividerTouchStartValue = this.gamepadData.leftArea.divider;
    }

    /**
     * The touch position of the divider has moved.
     */
    leftDividerTouchMove(event: TouchEvent) {
        event.preventDefault();
        // calculate absolute screen positions to map absolute to relative position
        let absoluteDelta = event.changedTouches[0].clientX - this.leftDividerTouchStartX;
        let percentageDelta = absoluteDelta / document.body.clientWidth * 100;
        // calculate new divider position
        this.gamepadData.leftArea.divider = this.leftDividerTouchStartValue + percentageDelta;

        // apply min and max percentages
        if (this.gamepadData.leftArea.divider < this.gamepadData.leftArea.width * 0.1) {
            this.gamepadData.leftArea.divider = this.gamepadData.leftArea.width * 0.1;
        } else if (this.gamepadData.leftArea.divider > this.gamepadData.leftArea.width * 0.9) {
            this.gamepadData.leftArea.divider = this.gamepadData.leftArea.width * 0.9;
        }
    }

}


</script>

<style>

</style>
