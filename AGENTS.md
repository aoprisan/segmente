# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the application code. Keep UI and screen components in `src/components/` (`MenuScreen.jsx`, `GameScreen.jsx`, `DrawingCanvas.jsx`, `ResultsScreen.jsx`). Put pure helpers in `src/utils/`, especially problem generation in `problems.js` and canvas logic in `canvas.js`. Use `src/index.css` for Tailwind v4 theme tokens such as `--color-kid-*`. Root files `index.html` and `vite.config.js` handle app bootstrap and Vite configuration.

## Build, Test, and Development Commands
- `npm install` installs React, Vite, Tailwind, and related tooling.
- `npm run dev` starts the local Vite dev server.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the built app for a final smoke test.

This repository does not currently define automated test, lint, or format scripts, so `npm run build` is the required pre-PR verification step.

## Coding Style & Naming Conventions
Follow the existing React style: function components, hooks, and ES modules. Use 2-space indentation, double quotes, and semicolons. Name components in `PascalCase`, hooks and helpers in `camelCase`, and keep utility files focused on one concern. Keep variable names and comments in English, but keep player-facing copy in Romanian. Prefer Tailwind utility classes and the shared `kid-*` color tokens instead of ad hoc inline styling.

## Testing Guidelines
There is no test harness yet. For now, validate changes by running `npm run build` and manually exercising the affected flow in the browser with `npm run dev`. If you add logic with meaningful branching, place future tests near the related module once a test runner is introduced.

## Commit & Pull Request Guidelines
The repository has no commit history yet, so use short imperative commit messages such as `Add hint toggle reset`. Keep pull requests small and focused. Include a short description, manual verification notes, and screenshots or a short recording for visible UI changes. Link the related issue or task when one exists.
