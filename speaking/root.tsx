import * as React from 'react';
import * as ReactDom from 'react-dom';
type AudioContextConstructor = new (contextOptions?: AudioContextOptions) => AudioContext;

function thusAudioContext(): AudioContextConstructor {
    // @ts-ignore;
    return window.AudioContext || window.webkitAudioContext;
}

declare var MediaRecorder: any;
let audio: HTMLMediaElement | null = null;

async function enable() {
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
        if (audio === null) return;
        const blob = e.data;
        const url = window.URL.createObjectURL(blob);
        audio.src = url;
        audio.play();
    };

    function stop() {
        if (mediaRecorder.state !== 'recording') return;
        mediaRecorder.stop();
    }

    return { start, stop }
}

let enabled: { start(): void; stop(): void; } | null = null;

async function enableAndStart() {
    if (enabled === null) {
        enabled = await enable();
    }
    enabled.start();
}

function stop() {
    if (enabled === null) return;
    enabled.stop();
}

const rootElement = document.getElementById('root')!;
ReactDom.render(
    <div>
        <button onClick={enableAndStart}>Start</button>
        <button onClick={stop}>Stop</button>
        <div>
            <audio ref={self => audio = self} controls={true} />
        </div>
    </div>,
    rootElement
);
