![contexto icon](/.github/images/logo.svg#gh-light-mode-only)
![contexto icon](/.github/images/logo-dark.svg#gh-dark-mode-only)

A MacOS menu bar app to quickly switch between Docker contexts. Built using Electron.

![contexto screnshot](https://i.imgur.com/ZcPTpVo.png)

## Usage

Clone this repo and run `pnpm install`.

To build the app run `pnpm run build`.

Move the built app to /Applications.

On app execution, a menu bar item will show the existing Docker contexts, and clicking one will switch to the selected one.

Docker must be running prior to running Contexto.

## Features

[x] List existing contexts
[x] Switch to selected context
[ ] Manage contexts (create / delete)
[ ] Open on system startup
[ ] Customize Docker executable path
[ ] Linux and Windows support
