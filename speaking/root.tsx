import * as React from 'react';
import * as ReactDom from 'react-dom';
import { broke, isNull } from './core';

type MediaRecorderState = 'recording' | 'paused' | 'inactive';

interface Enabled { start(): void; stop(): void; seeWhatStateIs(): MediaRecorderState; }

declare var MediaRecorder: any;
let audio: HTMLMediaElement | null = null;

async function willEnable() {
    // this function cannot be called right at onload, because Chrome won't let this API
    // be available until the user activates the page (basically clicks somewhere)
    // so this code can only be run as soon as there is the first page activity

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const mediaRecorder = new MediaRecorder(stream);

    function start() {
        if (mediaRecorder.state !== 'inactive') return;
        mediaRecorder.start();
    }

    mediaRecorder.ondataavailable = e => {
        if (isNull(audio)) return;
        const blob = e.data;
        const url = window.URL.createObjectURL(blob);
        audio.src = url;
        audio.play();
    };

    function stop() {
        if (mediaRecorder.state !== 'recording') return;
        mediaRecorder.stop();
    }

    function seeWhatStateIs(): MediaRecorderState {
        return mediaRecorder.state;
    }

    return { start, stop, seeWhatStateIs };
}

let _enabled: Enabled | null = null;
async function willMakeSureEnabled(): Promise<Enabled> {
    if (isNull(_enabled)) {
        return _enabled = await willEnable();
    }
    return _enabled;
}

async function start() {
    const { start } = await willMakeSureEnabled();
    start();
}

async function stop() {
    const { stop } = await willMakeSureEnabled();
    stop();
}


async function toggle() {
    const { seeWhatStateIs } = await willMakeSureEnabled();
    const state = seeWhatStateIs();
    switch (state) {
        case 'inactive': start();
            return;
        case 'recording': stop();
            return;
        case 'paused':
            return;
        default: return broke(state);
    }
}

const rootElement = document.getElementById('root')!;
ReactDom.render(
    <div>
        <button onClick={start}>Start</button>
        <button onClick={stop}>Stop</button>
        <div>
            <audio ref={self => audio = self} controls={true} />
        </div>
    </div>,
    rootElement
);

window.document.addEventListener('keydown', e => {
    switch (e.which) {
        case 32: // SPACE
            toggle();
            return;
        default:
            return;
    }
});
