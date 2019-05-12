import * as React from 'react';
import * as ReactDom from 'react-dom';
type AudioContextConstructor = new (contextOptions?: AudioContextOptions) => AudioContext;

function thusAudioContext(): AudioContextConstructor {
    // @ts-ignore;
    return window.AudioContext || window.webkitAudioContext;
}

function start1() {
    const AudioContext = thusAudioContext();
    const context = new AudioContext();

    const myArrayBuffer = context.createBuffer(2, context.sampleRate * 3, context.sampleRate);

    for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
        const nowBuffering = myArrayBuffer.getChannelData(channel);
        for (let i = 0; i < myArrayBuffer.length; i++) {
            nowBuffering[i] = Math.random() * 2 - 1;
        }
    }

    const source = context.createBufferSource();

    source.buffer = myArrayBuffer;
    source.connect(context.destination);
    source.start();
}

declare var MediaRecorder: any;

async function enable() {

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    const audio = document.createElement('audio');
    audio.controls = true;
    document.body.appendChild(audio);
    const mediaRecorder = new MediaRecorder(stream);

    function start() {
        if (mediaRecorder.state !== 'inactive') return;
        mediaRecorder.start();
    }

    mediaRecorder.ondataavailable = e => {
        const blob = e.data;
        const url = window.URL.createObjectURL(blob);
        audio.src = url;
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
    </div>,
    rootElement
);
