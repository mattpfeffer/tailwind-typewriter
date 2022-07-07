const postcss = require('postcss');
const typewriterPlugin = require('../dist/index');

/*
 * Configuration
 */

// Mock Options
const options = {
    name: 'vegetables',
    words: ['corn', 'carrot', 'potato'],
    delay: Math.PI,
    repeat: 0,
    writeSpeed: 2,
    eraseSpeed: 1,
    pauseBetween: 3,
    caretColor: 'white',
    caretWidth: '2px'
};

/*
 * Helper Functions
 */

describe('Helper Functions', () => {
    test('round() -> rounds a number to two decimal places', () => {
        const round = typewriterPlugin.__get__('round');

        // Test number input (use c.delay for generic input)
        expect(round(options.delay)).toBe(3.14);

        // Test string input
        expect(round(String(options.delay))).toBe(3.14);
    });

    test('randomize() -> adds a small random variance to a number', () => {
        const randomize = typewriterPlugin.__get__('randomize');

        const number = options.delay;
        const string = String(number);
        const variance = 0.5;

        let result;

        // Test number input
        result = randomize(number, variance);
        expect(result).toBeGreaterThanOrEqual(number - variance);
        expect(result).toBeLessThanOrEqual(number + variance);
        expect(result).not.toBe(number);

        // Test string input
        result = randomize(string, variance);
        expect(result).toBeGreaterThanOrEqual(number - variance);
        expect(result).toBeLessThanOrEqual(number + variance);
        expect(result).not.toBe(number);
    });
});

/*
 * Core Functions
 */

describe('Core Functions', () => {
    test('generateKeyframes() -> generates keyframes for a given wordset', () => {
        const generateKeyframes = typewriterPlugin.__get__('generateKeyframes');

        const expected = {
            [`@keyframes write-${options.name}`]: {
                from: { content: expect.stringMatching(/""/) },
                to: { content: expect.stringMatching(/""|"\w+"/) }
            }
        };

        const sample = expect.stringMatching(/"\d+(?:\.\d+)?%":\{"content":"\\"\w*\\""\},/);

        let result;

        // Test default usage
        result = generateKeyframes(
            options.name,
            options.words,
            options.writeSpeed,
            options.eraseSpeed,
            options.pauseBetween,
            options.repeat === -1
        );

        expect(result).toMatchObject(expected);
        expect(JSON.stringify(result).replace('\\', '')).toEqual(sample);

        // Re-test with eraseSpeed disabled
        result = generateKeyframes(
            options.name,
            options.words,
            options.writeSpeed,
            0,
            options.pauseBetween,
            options.repeat === -1
        );

        expect(result).toMatchObject(expected);
        expect(JSON.stringify(result).replace('\\', '')).toEqual(sample);
    });

    test('animationLength() -> calculates the total animation time in seconds', () => {
        const animationLength = typewriterPlugin.__get__('animationLength');

        const result = animationLength(
            options.words,
            options.writeSpeed,
            options.eraseSpeed,
            String(options.pauseBetween)
        );

        expect(result).toBe(57);
    });

    test('calculateSteps() -> calculates keyframe steps for each word phase', () => {
        const calculateSteps = typewriterPlugin.__get__('calculateSteps');

        const result = calculateSteps(options.words[0], options.writeSpeed, 50);

        expect(result.length).toBe(5);
        expect(result).toContain(12);
    });
});

/*
 * Plugin Declaration
 */

// Default config test strings
const defaultOutput = {};

defaultOutput.a = `
@keyframes blink-caret-example {
    from, to {
        border-color: transparent
    }
    50% {
        border-color: currentColor
    }
}
`;

defaultOutput.b = `
@keyframes write-example {
    from {
        content: ""
    }
    to {
        content: ""
    }
`;

defaultOutput.c = 'content: "bananas"';

/* eslint-disable no-useless-escape */
defaultOutput.d = `
.type-example::after {
    content: \"\";
    border-right: 1px solid currentColor;
    padding-right: 0.1em;
    animation: blink-caret-example 0.8s infinite, write-example 20s 1s infinite forwards;
    transition: border-color 50ms cubic-bezier(0.4, 0, 0.2, 1)
}
`;
/* eslint-enable no-useless-escape */

// User config test strings
const userOutput = {};

userOutput.a = `
@keyframes blink-caret-${options.name} {
    from, to {
        border-color: transparent
    }
    50% {
        border-color: ${options.caretColor}
    }
}
`;

userOutput.b = `
@keyframes write-${options.name} {
    from {
        content: ""
    }
    to {
        content: ""
    }
`;

userOutput.c = `content: "${options.words[2]}"`;

/* eslint-disable no-useless-escape */
userOutput.d = `
.type-${options.name}::after {
    content: \"\";
    border-right: ${options.caretWidth} solid ${options.caretColor};
    padding-right: 0.1em;
    animation: blink-caret-${options.name} 0.8s infinite, write-${options.name} 57s ${
    options.delay
}s ${options.repeat + 1} forwards;
    transition: border-color 50ms cubic-bezier(0.4, 0, 0.2, 1)
}
`;
/* eslint-enable no-useless-escape */

describe('Plugin Declaration', () => {
    test('with default options -> generates keyframes and utility classes', () => {
        const result = postcss([
            require('tailwindcss')({
                content: [
                    {
                        raw: 'type-example'
                    }
                ],
                plugins: [require('../dist')]
            })
        ]).process('@tailwind utilities').css;

        expect(result).toEqual(expect.stringContaining(defaultOutput.a.trim()));
        expect(result).toEqual(expect.stringContaining(defaultOutput.b.trim()));
        expect(result).toEqual(expect.stringContaining(defaultOutput.c.trim()));
        expect(result).toEqual(expect.stringContaining(defaultOutput.d.trim()));
    });

    test('with basic options -> generates keyframes and utility classes', () => {
        const result = postcss([
            require('tailwindcss')({
                content: [
                    {
                        raw: `type-${options.name}`
                    }
                ],
                plugins: [
                    require('../dist')({
                        wordsets: {
                            [options.name]: {
                                words: options.words
                            }
                        }
                    })
                ]
            })
        ]).process('@tailwind utilities').css;

        expect(result).toEqual(expect.stringContaining(userOutput.b.trim()));
        expect(result).toEqual(expect.stringContaining(userOutput.c.trim()));
    });

    test('with advanced options -> generates keyframes and utility classes', () => {
        const result = postcss([
            require('tailwindcss')({
                content: [
                    {
                        raw: `type-${options.name}`
                    }
                ],
                plugins: [
                    require('../dist')({
                        wordsets: {
                            [options.name]: options
                        }
                    })
                ]
            })
        ]).process('@tailwind utilities').css;

        expect(result).toEqual(expect.stringContaining(userOutput.a.trim()));
        expect(result).toEqual(expect.stringContaining(userOutput.b.trim()));
        expect(result).toEqual(expect.stringContaining(userOutput.c.trim()));
        expect(result).toEqual(expect.stringContaining(userOutput.d.trim()));
    });
});
