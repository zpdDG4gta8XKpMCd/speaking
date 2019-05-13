import * as React from 'react';
import * as ReactDom from 'react-dom';
import { broke, isNull, sureString } from './core';
import { Curtain } from './curtain';
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

async function _willEnable() {
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
        return _enabled = await _willEnable();
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
        case 'inactive':
            start();
            return;
        case 'recording':
            stop();
            return;
        case 'paused':
            return;
        default: return broke(state);
    }
}

const inProps = inside<AppProps>();

interface AppProps {
    state: MediaRecorderState;
    isActivated: boolean;
}

interface Cut {
    title: string;
    start: number;
    end: number;
}

interface Clip {
    id: string;
    title: string;
    cuts: Cut[];
}

const clips: Clip[] = [{
    id: 'tfz1HiXKuZ8',
    title: 'BALL, BOWL, BALD, BOLD, BOWLED',
    cuts: [
        {
            title: 'ball',
            start: 9,
            end: 10,
        }
    ]
}];

let isActivatingInitiated = false;
async function initiateActivating() {
    if (isActivatingInitiated) return;
    isActivatingInitiated = true;
    _enabled = await willMakeSureEnabled();
    isActivatingInitiated = false;
    lastProps = rerender(inProps.isActivated[$on](lastProps, true));
}

class App extends React.Component<AppProps> {
    render() {
        const { state, isActivated } = this.props;
        return <div>
            {!isActivated ? <Curtain className="as-non-activated" onClickedCurtain={initiateActivating}>
                <div className="curtain-content">Click to activate</div>
            </Curtain> : null}
            <iframe id={youtubePlayerElementId}
                width="640" height="390"
                src="http://www.youtube.com/embed/M7lc1UVf-VE?enablejsapi=1" />
            <div>
                <button onClick={start}>Start</button>
                <button onClick={stop}>Stop</button>
                <span>{state}</span>
            </div>
            <div>
                <ul>
                    {clips.map(({ id, title, cuts }) => {
                        return <li key={sureString(id)}>
                            <a href="" onClick={async e => {
                                e.preventDefault();
                                console.log(id);
                                const once = _enabled!.player.loadVideoById(id);
                                console.log(once);
                                const xxx = await once;
                                console.log(xxx);
                            }}>{title}</a>
                            <ul>
                                {cuts.map(({ title, start, end }) => {
                                    return <a key={title + start + end} href="" onClick={async e => {
                                        e.preventDefault();
                                        _enabled!.player.seekTo(start);
                                    }}>{title}: {start} - {end}</a>;
                                })}
                            </ul>
                        </li>;
                    })}
                </ul>
            </div>
            <div>
                <audio ref={self => audio = self} controls={true} />
            </div>
        </div>;
    }
}

const rootElement = document.getElementById('root')!;
let lastProps = rerender({ state: 'inactive', isActivated: false });


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
