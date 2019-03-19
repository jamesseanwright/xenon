# Xenon

![Screencap](https://raw.githubusercontent.com/jamesseanwright/xenon/master/misc/screencap.gif)

A canvas game with audio for [JS1K 2019](https://js1k.com/2019-x). Collect as many Xs as possible before your health expires!

## Controls

X - rotate your ship 90° clockwise

## Play Online

Currently pending approval by JS1k. Will replace this with a link once it has been published.

## Local Development

To set up this repository:

```shell
$ git clone https://github.com/jamesseanwright/xenon.git # or use SSH if you've created a fork
$ cd xenon
$ npm i
```

You can then build Xenon with:

* `npm run build`
* `npm run watch` - builds as above, but watches the `src` directory for changes

The game will be inlined and output into `dist/index.html`.

### Configuration

#### `terserconfig.json`

Options for [Terser](https://github.com/terser-js/terser) as per its [programmatic usage](https://github.com/terser-js/terser/blob/cc00e783714c16b61288ec3233a6ca38b3de5cf6/README.md#api-reference).

#### `regpackconfig.json`

Options for [RegPack](https://github.com/Siorki/RegPack), the amazing packer that squeezes further bytes from the build. These are based upon [the default options](https://github.com/Siorki/RegPack/blob/9efcc14832adcea9f93d87f5f11707c5a21bc2bd/regPack.js#L79), but [the online UI](https://siorki.github.io/regPack.html) will provide you with additional context.

#### `js1kconfig.json`

The settings required by the JS1K shim, serialised and injected at build time.

### Source Scripts

#### `index.original.js`

The original version I developed, which includes: composable entities; pseudo-vectors for entity positions and speeds; separation of game bounds and viewport, with projection from the former to the latter; liberal use of `Math.random()`; polyphonic music with dual oscillators; and rectangle backgrounds for Xs.

#### `index.inlined.js`

Has functional parity to the original implementation, but with most functions inlined and many operations pre-evaluated.

#### `index.prepacked.js`

The result of running the inline variant through Terser, but featuring: the removal of `const`/`let`, resulting in all assignments being placed upon `window`; no X backgrounds; drastically simplified music, but with dynamic tempo based upon the current level; and the replacement of remaining projected coordinates and values with direct pixel values.

## Build Size History

![Build size history](https://raw.githubusercontent.com/jamesseanwright/xenon/master/misc/build-graph.png)
