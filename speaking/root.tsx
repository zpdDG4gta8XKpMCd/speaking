import * as React from 'react';
import * as ReactDom from 'react-dom';
import { broke, isNull } from './core';
import { isHtmlElement, isInteractiveHtmlElement } from './dom';
import { $on, inside } from './inside';
import { Player, willEnableYouTube } from './youtube';

type MediaRecorderState = 'recording' | 'paused' | 'inactive';

interface Enabled {
    start(): void;
    stop(): void;
    seeWhatStateIs(): MediaRecorderState;
    player: Player;
}

declare var MediaRecorder: any;
let audio: HTMLMediaElement | null = null;

async function willEnable() {
    // this function cannot be called right at onload, because Chrome won't let this API
    // be available until the user activates the page (basically clicks somewhere)
    // so this code can only be run as soon as there is the first page activity

    const player = await willEnableYouTube(youtubePlayerElementId);
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

    return { start, stop, seeWhatStateIs, player };
}

const youtubePlayerElementId = 'youtube';



let _enabled: Enabled | null = null;
async function willMakeSureEnabled(): Promise<Enabled> {
    if (isNull(_enabled)) {
        return _enabled = await willEnable();
    }
    return _enabled;
}

async function start() {
    const { start, player } = await willMakeSureEnabled();
    start();
    console.log(player);
    lastProps = rerender(inProps.state[$on](lastProps, 'recording'));
}

async function stop() {
    const { stop } = await willMakeSureEnabled();
    stop();
    lastProps = rerender(inProps.state[$on](lastProps, 'inactive'));
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

const inProps = inside<AppProps>();

interface AppProps {
    state: MediaRecorderState;
}
class App extends React.Component<AppProps> {
    render() {
        const { state } = this.props;
        return <div>
            <iframe id={youtubePlayerElementId}
                width="640" height="390"
                src="http://www.youtube.com/embed/M7lc1UVf-VE?enablejsapi=1" />
            <div>
                <button onClick={start}>Start</button>
                <button onClick={stop}>Stop</button>
                <span>{state}</span>
            </div>
            <div>
                <audio ref={self => audio = self} controls={true} />
            </div>
        </div>;
    }
}

const rootElement = document.getElementById('root')!;
let lastProps = rerender({ state: 'inactive' });
function rerender(props: AppProps): AppProps {
    ReactDom.render(<App {...props} />, rootElement);
    return props;
}

window.document.addEventListener('keydown', e => {
    switch (e.which) {
        case 32: // SPACE
            if (seeIfAtToggableElement()) return;
            toggle();
            return;
        default:
            return;
    }
});


/** If there is a active element, then the space key would toggle it too,
    so we gonna get a toggle on and immediately toggle off, to avoid it we
    igore the space key if there is an active element. */
function seeIfAtToggableElement() {
    const { activeElement } = window.document;
    return !isNull(activeElement) && isHtmlElement(activeElement) && isInteractiveHtmlElement(activeElement);
}
