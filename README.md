# Metronome

A simple, single-page metronome for guitar practice — built with Next.js and the Web Audio API.

## Features

- Tempo range: 20–300 BPM (slider + numeric input)
- Time signatures: 4/4, 3/4, 2/4, 6/8
- Audio clicks with accented first beat
- Visual beat indicator (pulsing circle)
- Tap tempo
- Mute toggle (audio off, visual on)
- Works offline as a static site

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Building

```bash
npm run build
```

The static site is exported to `out/`. Serve it with any static file server:

```bash
npx serve out
```

## Docker

```bash
docker compose up --build
```

Then open [http://localhost:80](http://localhost:80).