# Probleme cu Segmente — Clasa a III-a

## Project overview
An interactive math web app for 3rd grade Romanian students to practice "probleme cu segmente" (segment problems). Kids generate random problems across 4 categories, draw segments graphically on a canvas, and type answers to check their work.

## Tech stack
- **React 19** with functional components and hooks
- **Vite** for dev server and builds
- **Tailwind CSS v4** (using `@tailwindcss/vite` plugin, `@import "tailwindcss"` syntax)
- No additional UI framework — custom components throughout

## Architecture

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Root component, screen routing (menu/game/results)
├── index.css             # Tailwind import + custom theme + global styles
├── components/
│   ├── MenuScreen.jsx    # Category selection grid (4 categories)
│   ├── GameScreen.jsx    # Main game: problem card + canvas + answer input
│   ├── DrawingCanvas.jsx # HTML5 Canvas drawing (segments, braces, labels)
│   └── ResultsScreen.jsx # End-of-session score display
└── utils/
    ├── problems.js       # Problem generator (generateProblem, generateSession)
    └── canvas.js         # Canvas drawing helpers (grid, segment, brace, label)
```

## Key conventions
- **Language**: All UI text is in Romanian. Variable names and comments in English.
- **Target audience**: 8-9 year old kids. Keep UI large, colorful, touch-friendly.
- **Mobile-first**: Max width 480px, all touch targets ≥ 44px, `touch-action: none` on canvas.
- **Custom colors**: Defined as `--color-kid-*` in Tailwind theme (index.css). Use `kid-blue`, `kid-coral`, `kid-green`, `kid-purple`, `kid-amber`, `kid-teal`, `kid-pink`, `kid-red` and their `-light`/`-dark` variants.
- **Font**: Nunito (loaded via Google Fonts in index.html).
- **No external state management** — local useState/useRef only.
- **Canvas drawing**: Uses imperative Canvas 2D API via refs. The DrawingCanvas component exposes a `clear()` method via forwardRef/useImperativeHandle.

## Problem categories
1. **suma** — Add two segment lengths
2. **diferenta** — Subtract one segment from another
3. **dublu** — Double or half a segment length
4. **mixt** — Random mix of the above

Each session = 5 randomly generated problems. Problems include: text, question, answer (number), hint, steps (array), and segments metadata.

## Commands
```bash
npm run dev     # Start dev server on port 3000
npm run build   # Production build to dist/
npm run preview # Preview production build
```

## Common tasks

### Adding a new problem category
1. Add generation logic in `src/utils/problems.js` → `generateProblem()`
2. Add category card in `src/components/MenuScreen.jsx`
3. Add label + color mapping in `src/components/GameScreen.jsx` (CAT_LABELS, CAT_COLORS)

### Adding a new drawing tool
1. Add tool definition in `src/utils/canvas.js` → `TOOLS` object
2. Add draw function in same file
3. Add to `drawStroke()` switch
4. Add button in `DrawingCanvas.jsx` toolbar

### Changing the number of problems per session
Edit the `5` in `App.jsx` → `generateSession(cat, 5)`

## Known issues / TODOs
- Canvas doesn't persist drawings across problem transitions (by design — `clear()` is called).
- No persistence / local storage yet — sessions are ephemeral.
- `prompt()` is used for label input on canvas — replace with a custom modal for better UX.
- No sound effects yet.
- No difficulty levels yet (all problems use the same number ranges).
- Could add animated transitions between screens.
- Could add a "reference diagram" that auto-draws the problem's segments as a visual hint.
