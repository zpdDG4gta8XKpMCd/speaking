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

async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    const AudioContext = thusAudioContext();
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(1024, 1, 1);

    source.connect(processor);
    processor.connect(context.destination);

    processor.addEventListener('audioprocess', e => {
        console.log(e.inputBuffer);
    });
}

const rootElement = document.getElementById('root')!;
ReactDom.render(
    <div>
        <button onClick={start}>Start</button>
    </div>,
    rootElement
);
