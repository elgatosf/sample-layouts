/// <reference path="libs/js/stream-deck.js" />
/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/utils.js" />

/**
 * This example shows how to create a custom layout for Stream Deck.
 * In it's manifest it sets the relative path to the custom layout file (layouts/layouts.json)
 * In the customlayout.json a custom layout with 3 bars, 3 rectangles and an svg-icon is defined.
 * In the manifest.json 'Keypad' is removed from the list of supported controllers (that means
 * the action will only be shown in the Stream Deck app under the 'Dials' tab).
 */

// Action Cache
const MACTIONS = {};
const MICONS = [
    {title: 'Wave Link', url: 'action/assets/Plus.svg'},
    {title: 'Voice Chat', url: 'action/assets/voice_chat.svg'},
    {title: '8-ball', url: 'action/assets/eight.svg'},
    {title: 'Wave Link Store', url: 'action/assets/waveLink_appIcon_store.png'},
    {title: 'ControlCenter', url: 'action/assets/controlcenter_pluginIcon.png'},
    {title: 'Caution', url: 'action/assets/caution.svg'},
    {title: 'Analog Clock', url: 'action/assets/analogclock_pluginIcon.png'},
    {title: 'Twitch', url: 'action/assets/twitch_pluginIcon.png'},
    {title: 'Volume Controller', url: 'action/assets/volumecontroller_pluginIcon.png'}
];
const MABCICONS = [
    {title: 'A', url: 'action/assets/a.svg'},
    {title: 'B', url: 'action/assets/b.svg'},
    {title: 'C', url: 'action/assets/c.svg'}
];


// Utilities
const cycle = (idx, min, max) => (idx > max ? min : idx < min ? max : idx);
const randomColor = () => '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, 0);

// Action Events
const sampleLayoutsAction = new Action('com.elgato.sample-layouts.action');

sampleLayoutsAction.onWillAppear(({context, payload}) => {
    // console.log('will appear', context, payload);
    MACTIONS[context] = new SampleAction(context, payload);
});

sampleLayoutsAction.onWillDisappear(({context}) => {
    // console.log('will disappear', context);
    delete MACTIONS[context];
});

sampleLayoutsAction.onTitleParametersDidChange(({context, payload}) => {
    // console.log('onTitleParametersDidChange', context, payload);
    MACTIONS[context].color = payload.titleParameters.titleColor;
});

sampleLayoutsAction.onDidReceiveSettings(({context, payload}) => {
    console.log('onDidReceiveSettings', payload.settings.layout);
    MACTIONS[context].settings = payload.settings;
    const pl = {layout: payload.settings.layout};
    $SD.send(context, 'setFeedbackLayout', {payload: pl});
    // {
    //     event: "setFeedbackLayout",
    //     context,
    //     payload: {
    //         layout: payload.settings.layout
    //     }

    $SD.setFeedback(context, {
        title: `${payload.settings.layout}`
    });
    MACTIONS[context].update(payload);
});


sampleLayoutsAction.onDialPress(({context, payload}) => {
    // console.log('dial was pressed', context, payload);
    if(payload.pressed === false) {

    }
});

sampleLayoutsAction.onDialRotate(({context, payload}) => {
    // console.log('dial was rotated', context, payload.ticks);
    if(payload.hasOwnProperty('ticks')) {
        MACTIONS[context].dialRotate(payload);
    }
});

sampleLayoutsAction.onTouchTap(({context, payload}) => {
    // console.log('touchpanel was tapped', context, payload);
    if(payload.hold === false) {
        MACTIONS[context].touchTap();
    }
});

class SampleAction {
    constructor (context, payload) {
        this.context = context;
        this.color = randomColor();
        this.manualValue = -1;
        this.update(payload);
    }

    dialRotate(payload, inTitle = 'Dial rotating') {
        this.manualValue = cycle(this.manualValue + payload?.ticks, 0, 100);
        $SD.setFeedback(this.context, {
            title: `${inTitle} : ${this.manualValue}`,
        });
        this.update(payload, true);
    }

    touchTap() {
        this.manualValue = Math.floor(Math.random() * 100);
        this.color = randomColor();
        this.dialRotate(0, 'TouchTap');
    }
    // Icon Layout ($X1)
    // Canvas Layout ($A0)
    // Value Layout ($A1)
    // Bar Layout ($B1)
    // GBar Layout ($B2)
    // Double Bar Layout ($C1)

    update(payload, useManualValue = false) {
        const layout = payload?.settings?.layout;
        if(!layout) return;
        this.manualValue = useManualValue ? this.manualValue : parseInt(Math.random() * 100);
        const num = this.manualValue;
        const numIcons = MICONS.length;
        const iconNum = num % MICONS.length;

        switch(layout) {
            case '$X1':
                $SD.setFeedback(this.context, {
                    title: MICONS[iconNum].title,
                    icon: MICONS[iconNum].url
                });
                break;
            case '$A0':
                $SD.setFeedback(this.context, {
                    "full-canvas": this.makeIcon(200, 100),
                    canvas: this.makeIcon(136, 24)
                });
                break;
            case '$A1':
                $SD.setFeedback(this.context, {
                    value: (Math.random() * 100).toFixed(2),
                    icon: MICONS[iconNum].url
                });
                break;
            case '$B1':
                $SD.setFeedback(this.context, {
                    title: MICONS[iconNum].title,
                    value: iconNum + 1,
                    indicator: Math.ceil(iconNum / (MICONS.length - 1) * 100),
                    icon: MICONS[iconNum].url
                });
                break;
            case '$B2':
                $SD.setFeedback(this.context, {
                    value: num,
                    indicator: num,
                    icon: MICONS[iconNum].url
                });
                break;
            case '$C1':
                $SD.setFeedback(this.context, {
                    indicator1: num,
                    indicator2: 100 - num,
                    icon1: MICONS[iconNum].url,
                    icon2: MABCICONS[num % MABCICONS.length].url
                });
                break;
        }
    }

    makeIcon(w, h) {
        const color = randomColor();
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
           <rect x="0" y="0" width="${w}" height="${h}" fill="${color}" />
        </svg>`;
        return `data:image/svg+xml;,${svg}`;

    }
};





const test =
{
    "id": "com.elgato.sample-layouts.action.layout",
    "items": [
        {
            "key": "title",
            "type": "text",
            "font": {"size": 16, "weight": 600},
            "rect": [16, 4, 132, 24],
            "alignment": "left",
            "zOrder": 5
        },
        {
            "key": "redrect",
            "type": "placcard",
            "rect": [172, 10, 20, 20],
            "background": "#FF3300",
            "zOrder": 2
        },
        {
            "key": "yellowrect",
            "type": "placcard",
            "rect": [172, 40, 20, 20],
            "background": "#FFDD00",
            "zOrder": 2
        },
        {
            "key": "greenrect",
            "type": "placcard",
            "rect": [172, 70, 20, 20],
            "background": "#33BB00"
        },
        {
            "key": "midrect",
            "type": "pixmap",
            "rect": [152, 10, 12, 80],
            "background": "#AAAAAA",
            "zOrder": 3
        },
        {
            "key": "bar0",
            "type": "gbar",
            "subtype": 4,
            "rect": [16, 32, 100, 20],
            "bar_h": 12,
            "border_w": 0,
            "zOrder": 3
        },
        {
            "key": "bar1",
            "type": "gbar",
            "subtype": 4,
            "rect": [16, 54, 100, 20],
            "bar_h": 12,
            "border_w": 0,
            "bar_bg_c": "0:#ff0000,0.33:#a6d4ec,0.66:#f4b675,1:#00ff00"
        },
        {
            "key": "bar2",
            "type": "bar",
            "subtype": 4,
            "border_w": 0,
            "rect": [16, 76, 100, 12],
            "value": 55
        }

    ]
}

