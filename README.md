# tailwind-typewriter

A plugin for [Tailwind CSS](https://tailwindcss.com/) that generates typewriter style text
animations in pure CSS _(no JavaScript required)_ ✨

### Support

This plugin has been **tested with Tailwind CSS v3**. Previous releases may also work but are not
officially supported.

## Demo

![Demo](./.github/demo.gif)

## Installation

Install the plugin:

```sh
# Using npm
npm install tailwind-typewriter

# Using Yarn
yarn add tailwind-typewriter
```

Then add the plugin to your `tailwind.config.js` file:

```js
// tailwind.config.js
module.exports = {
    theme: {
        // ...
    },
    plugins: [
        require('tailwind-typewriter')
        // ...
    ]
};
```

## Usage

The quickest, dirtiest way to get started is to insert a `<span>` with the `type-example` utility
class somewhere in your markup. This will let you verify that everything is working with a built-in
example:

```html
<span class="type-example"></span>
```

### Styling

You can style the animation text with the usual Tailwind utilities:

```html
<span class="type-example text-lg text-rose-500"></span>
```

<small>🗒️ **Note:** The blinking caret can only be styled using the configuration options
below.</small>

### Customizing

The above example is essentially useless on its own. In a real world application, you'll probably
want to provide your own text etc 😎. If, for example, you want to create an animation that cycles
between names of fruit (with a 3 second delay) - you can do the following:

```js
// tailwind.config.js
module.exports = {
    theme: {
        // ...
    },
    plugins: [
        require('tailwind-typewriter')({
            wordsets: {
                fruit: {
                    words: ['apple', 'banana', 'orange', 'pear', 'strawberry'],
                    delay: 3
                }
            }
        })
    ]
};
```

```html
<span class="type-fruit"></span>
```

<small>🗒️ **Note:** The animation is generated in the `::after` pseudo-element so it will be
appended to any text inserted inside the `<span>`. This may or may not be desirable depending on
your project.</small>

#### Multiple Animations

You can create multiple animations in a single project. Each animation is called a 'wordset'. Each
wordset has a name, a set of words/phrases, and its own configuration options
([see the full API below](#configuration)).

```js
// tailwind.config.js
module.exports = {
    theme: {
        // ...
    },
    plugins: [
        require('tailwind-typewriter')({
            wordsets: {
                fruit: {
                    words: ['apple', 'banana', 'orange', 'pear', 'strawberry'],
                    delay: 3
                },
                vegetables: {
                    words: ['carrot', 'celery', 'corn', 'potato'],
                    pauseBetween: 5
                }
            }
        })
    ]
};
```

A unique class is generated for each set as `type-{wordset}`. For example, to reference the
_Vegetables_ animation instead of _Fruit_, you would use the following:

```html
<span class="type-vegetables"></span>
```

#### Singular Animations

This plugin was originally designed to create animations that cycled through a set of words.
Sometimes however, you may need to create a simple effect for a single word or phrase. You probably
also want this animation to output in a forwards direction, stopping after the last character.

To do this, choose your phrase, then set `repeat` and `eraseSpeed` to `0`:

```js
// tailwind.config.js
module.exports = {
    theme: {
        // ...
    },
    plugins: [
        require('tailwind-typewriter')({
            wordsets: {
                fruit: {
                    words: ['Your clever phrase'],
                    repeat: 0,
                    eraseSpeed: 0
                }
            }
        })
    ]
};
```

#### A word about performance

Generally speaking, CSS animations are very performant (certainly compared with JavaScript).
However, it is worth noting that every letter in a wordset generates a CSS keyframe. This means that
if you have a wordset with a large amount of text, this will have some impact on file size and
possibly renderer performance. This wont be a problem in most use cases, but in large projects,
discretion is strongly advised.

## Configuration

### `wordsets`

Currently, this is the only available top-level property. It serves as a wrapper for each wordset
grouping. A wordset in essence, is just an object literal with a unique name for the key that
contains the necessary configuration options for each animation:

```js
wordsets: {
    fruit: {
        words: ['apple', 'banana', 'orange'],
        // ..
    },
    vegetables: {
        words: ['carrot', 'celery', 'corn'],
        // ...
    }
}
```

### Options

The following options are also available to each individual wordset.

| Option         | Description                                                                | Accepts     | Default            |
| :------------- | :------------------------------------------------------------------------- | ----------- | ------------------ |
| `words`        | A list of words or phrases for each step of the animation.                 | `Array`     | _Built-in Example_ |
| `delay`        | Delays the start of the animation by _**n** seconds_.                      | `Number`    | `1`                |
| `repeat`       | Repeat the animation _**n** times_. `-1` for an infinite loop.             | `Number`    | `-1`               |
| `writeSpeed`   | Speed per letter during the write phase _(**n** seconds)_.                 | `Number`    | `0.3`              |
| `eraseSpeed`   | Speed per letter during the erase phase _(**n** seconds)_. `0` to disable. | `Number`    | `0.1`              |
| `pauseBetween` | Pause for _**n** seconds_ between each word.                               | `Number`    | `4`                |
| `caretColor`   | Set the color of the caret.                                                | `CSS Color` | `'currentColor'`   |
| `caretWidth`   | Specify an alternate width for the caret.                                  | `CSS Unit`  | `'1px'`            |
| `caretSpacing` | Space between the last character and the caret.                            | `CSS Unit`  | `'0.1em'`          |
| `blinkSpeed`   | The frequency at which the caret blinks _(**n** seconds)_.                 | `Number`    | `0.8`              |
