
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
                @touchstart="rightDividerTouchStart" @touchmove="rightDividerTouchMove"
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

    <!-- Overlay -->
    
    <button id="fullscreenButton" type="button" v-on:click="toggleFullscreen" v-if="fullscreenEnabled && !isFullscreen">
        <img src="./assets/buttonExpand.png">
    </button>
    
    <h3 id="pingText">
        {{ client.lastPing }}
    </h3>

    <!-- Modals -->

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
import screenfull, { Screenfull } from 'screenfull';
let fullscreenPlugin: Screenfull = <Screenfull> screenfull;

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
            height: 100,
            divider: 30
        },
        rightArea: {
            width: 40,
            height: 100,
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

    /* Fullscreen */
    fullscreenEnabled = fullscreenPlugin.enabled;
    isFullscreen = fullscreenPlugin.isFullscreen;

    beforeCreate() {
        // change listener of fullscreen plugin
        fullscreenPlugin.on('change', () => {
            this.$data.isFullscreen = fullscreenPlugin.isFullscreen;
        });
    }

    created() {
        this.initGamepadState();
        
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
        //this.activateFullscreen();

        let connectionCode = this.connectionCode;
        if (connectionCode.trim().length <= 0) {
            // no empty connection codes
            return;
        }

        // connect
        this.client.connect(connectionCode).then((client) => {
            console.log('Connection successfull.');
            // hide connection modal
            this.showConnectionCodeModal = false;
        }).catch((error) => {
            console.error('Error on connection: ', error);
            this.showConnectionErrorAlert = true;
            this.connectionError = error;
        }).finally(() => {
            this.showConnectingModal = false;
        });
        this.showConnectingModal = true;
    }

    /**
     * Called by the pointer down and up functions as the state of a button is altered.
     */
    changeButtonState(buttonId: number, pressed: boolean) {
        this.gamepadButtons[buttonId].pressed = pressed;
        if (this.client.connection) {
            this.client.sendMessage('buttonUpdate', {
                index: buttonId,
                pressed: pressed
            });
        }
    }

    /**
     * Called as a touch, mouse down, touch move, or mouse move event occurs.
     * Handles and updates the pressed state of all buttons.
     */
    handlePointerDown(x: number, y: number, identifier: number) {
        // find touched element
        let element = document.elementFromPoint(x, y);
        // extract button info
        let gamepadButton = !element ? null : element.getAttribute('gamepad-button');

        // uncheck the last button if existing
        let lastButton = this.lastButtonTouches[identifier];
        if (lastButton >= 0 && gamepadButton && lastButton != Number.parseInt(gamepadButton)) {
            this.changeButtonState(lastButton, false);
        } // else, lastButton is null or undefined

        if (gamepadButton) {
            // mark button as pressed
            let gamepadButtonInt = Number.parseInt(gamepadButton);
            this.changeButtonState(gamepadButtonInt, true);
            // set last button in map
            this.lastButtonTouches[identifier] = gamepadButtonInt;
        }
    }

    /**
     * Mouse or touch as been released.
     */
    handlePointerUp(identifier: number) {
        // uncheck the last button if existing
        let lastButton = this.lastButtonTouches[identifier];
        if (lastButton >= 0) {
            this.changeButtonState(lastButton, false);
        } // else, lastButton is null or undefined
    }

    
    /**
     * Use screenfull.js to toggle fullscreen if available.
     */
    toggleFullscreen() {
        fullscreenPlugin.toggle();
    }

    /**
     * Request fullscreen mode.
     */
    activateFullscreen() {
        if (this.fullscreenEnabled && !this.isFullscreen) {
            fullscreenPlugin.request();
        }
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

    /* Right Divider Touch Events */

    /**
     * Store the position of the left divider on touch start.
     */
    rightDividerTouchStartY: number;
    /**
     * Store the relative position of the left divider on touch start.
     */
    rightDividerTouchStartValue: number;

    /**
     * Left divider is touched.
     */
    rightDividerTouchStart(event: TouchEvent) {
        event.preventDefault();
        // only change position with first (0) touch pointer
        this.rightDividerTouchStartY = event.changedTouches[0].clientY;
        this.rightDividerTouchStartValue = this.gamepadData.rightArea.divider;
    }

    /**
     * The touch position of the divider has moved.
     */
    rightDividerTouchMove(event: TouchEvent) {
        event.preventDefault();
        // calculate absolute screen positions to map absolute to relative position
        let absoluteDelta = event.changedTouches[0].clientY - this.rightDividerTouchStartY;
        let percentageDelta = absoluteDelta / document.body.clientHeight * 100;
        // calculate new divider position
        this.gamepadData.rightArea.divider = this.rightDividerTouchStartValue - percentageDelta;

        // apply min and max percentages
        if (this.gamepadData.rightArea.divider < this.gamepadData.rightArea.height * 0.1) {
            this.gamepadData.rightArea.divider = this.gamepadData.rightArea.height * 0.1;
        } else if (this.gamepadData.rightArea.divider > this.gamepadData.rightArea.height * 0.9) {
            this.gamepadData.rightArea.divider = this.gamepadData.rightArea.height * 0.9;
        }
    }


    /** Touch and Mouse event helper */

    leftButtonMouseDown(event: MouseEvent) {
        this.handlePointerDown(event.clientX, event.clientY, 0);
    }

    leftButtonMouseMove(event: MouseEvent) {
        if (event.which >= 1) {
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

}


</script>

<style>
</style>
