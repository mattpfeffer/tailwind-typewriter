import type { Wordset } from './types';

const num = require('d3-interpolate');
const esc = require('cssesc');

const plugin = require('tailwindcss/plugin');

/*
 * Plugin Declaration
 */

// @ts-ignore
module.exports = plugin.withOptions((options) => {
    // @ts-ignore
    return function ({ addUtilities }) {
        // Set defaults
        const d = {
            words: ['apples', 'oranges', 'bananas'],
            delay: 1,
            repeat: -1,
            writeSpeed: 0.3,
            eraseSpeed: 0.1,
            pauseBetween: 4,
            caretColor: 'currentColor',
            caretWidth: '1px',
            caretSpacing: '0.1em',
            blinkSpeed: 0.8
        };

        // Get options
        let wordsets;
        if (typeof options !== 'undefined') {
            wordsets = options.wordsets;
        } else {
            wordsets = {
                example: d
            };
        }

        const utilities = [
            // Define caret animation
            Object.entries(wordsets).map(([key, wordset]) => {
                const { caretColor = d.caretColor } = wordset as Wordset;
                return {
                    [`@keyframes blink-caret-${esc(key, {
                        isIdentifier: true
                    })}`]: {
                        'from, to': { 'border-color': 'transparent' },
                        '50%': { 'border-color': `${caretColor}` }
                    }
                };
            }),

            // Generate text animations
            Object.entries(wordsets).map(([key, wordset]) => {
                const {
                    words,
                    repeat = d.repeat,
                    writeSpeed = d.writeSpeed,
                    eraseSpeed = d.eraseSpeed,
                    pauseBetween = d.pauseBetween
                } = wordset as Wordset;

                return generateKeyframes(
                    key,
                    words,
                    writeSpeed,
                    eraseSpeed,
                    pauseBetween,
                    repeat === -1
                );
            }),

            // Define utility classes
            Object.entries(wordsets).map(([key, wordset]) => {
                const {
                    words,
                    delay = d.delay,
                    repeat = d.repeat,
                    writeSpeed = d.writeSpeed,
                    eraseSpeed = d.eraseSpeed,
                    pauseBetween = d.pauseBetween,
                    caretColor = d.caretColor,
                    caretWidth = d.caretWidth,
                    caretSpacing = d.caretSpacing,
                    blinkSpeed = d.blinkSpeed
                } = wordset as Wordset;

                const totalTime = animationLength(words, writeSpeed, eraseSpeed, pauseBetween);

                const animations = `, write-${esc(key, {
                    isIdentifier: true
                })} ${totalTime}s ${delay}s ${repeat !== -1 ? repeat + 1 : 'infinite'} forwards`;

                return {
                    [`.${esc(`type-${key}`, {
                        isIdentifier: true
                    })}`]: {
                        '&::after': {
                            content: '""',
                            'border-right': `${caretWidth} solid ${caretColor}`,
                            'padding-right': `${caretSpacing}`,
                            animation: `blink-caret-${key} ${blinkSpeed}s infinite${animations}`,
                            transition: 'border-color 50ms cubic-bezier(0.4, 0, 0.2, 1)'
                        }
                    }
                };
            })
        ];

        addUtilities(utilities);
    };
});

/*
 * Core Functions
 */

// Generates keyframes for each word
function generateKeyframes(
    label: string,
    words: string[],
    writeSpeed: number,
    eraseSpeed: number,
    pauseBetween: number,
    infinite: boolean
) {
    const keyframes = {
        from: { content: '""' },
        to: { content: `"${words[words.length - 1]}"` }
    };
    let lastKeyframe = 0;

    const totalTime = animationLength(words, writeSpeed, eraseSpeed, pauseBetween);

    words.forEach((currentWord: string) => {
        // Write animation
        const writeSteps = calculateSteps(currentWord, writeSpeed, totalTime);

        writeSteps.forEach((currentStep: number, i: number) => {
            if (currentStep) {
                currentStep = randomize(lastKeyframe + currentStep);

                if (i === writeSteps.length - 1) {
                    // Briefly pause animation on last keyframe
                    const startPause = currentStep;
                    const endPause = (lastKeyframe = startPause + (pauseBetween / totalTime) * 100);

                    // @ts-ignore
                    keyframes[`${round(startPause)}%, ${round(endPause)}%`] = {
                        content: `"${esc(currentWord.substring(0, i), { quotes: 'double' })}"`
                    };
                } else {
                    // @ts-ignore
                    keyframes[`${round(currentStep)}%`] = {
                        content: `"${esc(currentWord.substring(0, i), { quotes: 'double' })}"`
                    };
                }
            }
        });

        // Erase animation
        if (eraseSpeed) {
            const eraseSteps = calculateSteps(currentWord, eraseSpeed, totalTime);

            eraseSteps.forEach((currentStep: number, i: number) => {
                if (currentStep) {
                    currentStep = lastKeyframe + currentStep;
                    lastKeyframe = i === writeSteps.length - 1 ? currentStep : lastKeyframe;

                    // @ts-ignore
                    keyframes[`${round(currentStep)}%`] = {
                        content: `"${esc(currentWord.substring(0, currentWord.length - i), {
                            quotes: 'double'
                        })}"`
                    };
                }
            });
        }
    });

    if (infinite || eraseSpeed !== 0) {
        keyframes.to = { content: '""' };
    }

    return {
        [`@keyframes write-${esc(label, {
            isIdentifier: true
        })}`]: keyframes
    };
}

// Calculates the total animation time in seconds
function animationLength(
    words: string[],
    writeSpeed: number,
    eraseSpeed: number,
    pauseBetween: number
) {
    let totalTime = 0;
    words.forEach((currentWord: string) => {
        totalTime +=
            (Number(writeSpeed) + Number(eraseSpeed)) * currentWord.length + Number(pauseBetween);
    });

    return totalTime;
}

// Calculates keyframe steps for word animation phase (e.g. write, erase)
function calculateSteps(currentWord: string, phaseSpeed: number, totalTime: number) {
    const phaseTime = Number(phaseSpeed) * currentWord.length;
    const phasePercentage = (phaseTime / Number(totalTime)) * 100;
    return num.quantize(num.interpolate(0, phasePercentage), currentWord.length + 1);
}

/*
 * Helper Functions
 */

// Shorthand for rounding a value 2 decimal places
function round(number: number) {
    return Number(Number(number).toFixed(2));
}

// Add a small random variance to a number
function randomize(number: number, variance: number = 0.5) {
    const max = Number(number) + Number(variance);
    const min = Number(number) - Number(variance);

    return Math.random() * (max - min) + min;
}
