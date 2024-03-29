# Configs
  - firefox
    - dom.events.testing.asyncClipboard -> true
    - dom.events.asyncClipboard.readText -> true

# How to add a new command

1. Add to key-bindings.ts
   1. Choose which mode for new command and add (here, we add to `Normal`)

      ```ts
        { key: "b", command: "cursorBackwordsStartWord" }, // jump backwards to the start of a word
      ```

   2. Specify synonyms if you want

      ```ts
        synonyms: {
          "<esc>": "<Escape>",
        },
      ```

2. Add commandName as method to `abstract-text-mode.ts` (the UI part)
   1. Handle logic that takes input from the vim module and translate to UI actions
      (Most of the time it should be just moving cursor, as text gets updated automatically(?))

3. Add commandName as method to `abstract-mode.ts` (Actual Vim implementation)

4. Add command to `vim-commands-repository.ts`


---

# Auto generated

vvvvvvvvvvvvvvvv

# `or-tree-note`

This project is bootstrapped by [aurelia-cli](https://github.com/aurelia/cli).

For more information, go to https://aurelia.io/docs/cli/webpack

## Run dev app

Run `npm start`, then open `http://localhost:9090`

You can change the standard webpack configurations from CLI easily with something like this: `npm start -- --open --port 8888`. However, it is better to change the respective npm scripts or `webpack.config.js` with these options, as per your need.

To enable Webpack Bundle Analyzer, do `npm run analyze` (production build).

To enable hot module reload, do `npm start -- --hmr`.

To change dev server port, do `npm start -- --port 8888`.

To change dev server host, do `npm start -- --host 127.0.0.1`

**PS:** You could mix all the flags as well, `npm start -- --host 127.0.0.1 --port 7070 --open --hmr`

For long time aurelia-cli user, you can still use `au run` with those arguments like `au run --env prod --open --hmr`. But `au run` now simply executes `npm start` command.

## Build for production

Run `npm run build`, or the old way `au build --env prod`.

## Unit tests

Run `au test` (or `au karma`).

To run in watch mode, `au test --watch` or `au karma --watch`.

## Integration (e2e) tests

You need the app running for integration test.

First, run `au run` and keep it running.

Then run `au cypress` to run cypress in interactive mode.

To perform a test-run and reports the results, do `au cypress --run`.

To ask the `cypress` to start the application first and then start testing: `au cypress --run --start`

The two following flags are useful when using `--start` flag:
 * To change dev server port, do `au cypress --start --port 8888`.
 * To change dev server host, do `au cypress --start --host 127.0.0.1`


**PS:** It is also possible to mix the flags `au cypress --run --start --port 7070 --host 127.0.0.1`
