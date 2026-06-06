# Pokédex App 📱

My first real React Native project, built while learning Expo and mobile development from scratch. The goal was to go beyond a basic tutorial and actually ship something that feels complete — with real API data, navigation, caching, and a UI I'm proud of.

Data comes from the free, open-source [PokéAPI](https://pokeapi.co).

---

## App Showcase

![App Showcase](https://github.com/user-attachments/assets/3e2b6f3d-f964-4f6d-afd0-c26d8d46a619)

---

## What it does

### Pokémon List
- Loads Pokémon from PokéAPI in pages of 20 and keeps fetching as you scroll (infinite scroll)
- Each card is coloured based on the Pokémon's primary type
- Shows official artwork, Pokédex number, name, and type badges on every card
- Long names shrink to fit on one line instead of wrapping

### Search
- Filters the loaded list as you type
- If the Pokémon you're searching for hasn't been loaded yet, it falls back to a direct API lookup by name — so you're not limited to what's already on screen

### Type Filter
- Fetches all Pokémon types from the API (not hardcoded)
- Displayed in a horizontally scrollable row
- When filtering by type, the app automatically loads more pages if the current results aren't enough to fill the screen

### Detail Screen
- Tap any card to open its detail page
- Header colour changes based on the Pokémon's type
- Shows the official artwork overlapping the header and card sections
- Two tabs — **About** and **Base Stats** — that you can swipe between or tap to switch
  - About: species, height, weight, abilities
  - Base Stats: all 6 stats with coloured progress bars (colours chosen based on what each stat represents — green for HP, red for attack, etc.)

### Caching
One thing I learned about PokéAPI is that they're a free community resource and explicitly ask developers to cache responses locally instead of hitting their endpoints repeatedly. So I built a simple cache layer using AsyncStorage that stores all API responses for 24 hours. After the first load, the app doesn't re-fetch data it already has.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React Native + Expo | The core framework — this is what I'm learning |
| Expo Router | File-based navigation, handles the list → detail screen transition |
| TypeScript | Helped me catch a lot of mistakes while learning |
| AsyncStorage | Saves API responses locally so the app respects PokéAPI's fair use policy |
| PokéAPI | Free, open Pokémon data |

---

## Project Structure

```
├── app/
│   ├── _layout.tsx          # Root Stack navigator
│   ├── index.tsx            # Main list screen
│   ├── PokemonCard.tsx      # Card component
│   ├── PokemonHeader.tsx    # Search bar + type filter
│   ├── PokemonList.tsx      # Infinite scroll + filter/search logic
│   └── pokemon/
│       └── [id].tsx         # Detail screen (dynamic route)
└── utils/
    └── cache.ts             # AsyncStorage cache with 24h TTL
```

---

## Running it locally

You'll need Node.js and the **Expo Go** app on your phone (or an emulator).

```bash
git clone https://github.com/usmanbutt-dev/Pokedex.git
cd Pokedex
npm install
npx expo start
```

Scan the QR code with Expo Go and it should open on your device.

---

## Things I learned building this

- How file-based routing works in Expo Router
- Handling async data fetching with pagination and race conditions
- Why caching matters for free public APIs and how to implement it with AsyncStorage
- Using `Animated.Value` to drive smooth UI animations (the tab underline that follows your swipe)
- Safe area handling for different screen sizes and notches
- How React Native's `useRef` helps avoid stale state inside async callbacks