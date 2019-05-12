import { soon } from "./promises";

export interface Player {
}

declare var YT: any;


export async function willEnableYouTube(elementId: string): Promise<Player> {

    const soonPlayer = soon<Player>();
    const w: any = window;

    function onPlayerReady() {
        console.log(2);
    };

    function onPlayerStateChange(event: any) {
        console.log(3);
        console.log(event.data);
    };

    w.onYouTubeIframeAPIReady = function () {
        console.log(1);
        const player = new YT.Player(elementId, {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
        soonPlayer(player);
    }


    var tag = document.createElement('script');
    tag.id = 'iframe-demo';
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);

    return soonPlayer();
}
