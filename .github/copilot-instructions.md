# Copilot / AI Agent Instructions for this repository

**Purpose:** Help AI agents be productive in this Expo + React Native project using `expo-router` and TypeScript.

- **Big picture:** This is an Expo app (SDK ~54) using `expo-router` (file-based routing) and React Native with web support via `react-native-web`. The app root is `app/` and screens are file routes. The JS entry is handled by `expo-router/entry` (see `package.json`).

- **Start / run commands:** Use the npm scripts in `package.json`:
  - `npm run start` → `expo start`
  - `npm run android` → `expo start --android`
  - `npm run ios` → `expo start --ios`
  - `npm run web` → `expo start --web`

- **Routing & layout patterns:**
  - Routes live under `app/` and follow Expo Router file conventions. Grouping by parentheses is used (example: `(tabs)` group). See `app/_layout.tsx` for the root stack and modal registration.
  - Modal screens are registered as separate routes (`Stack.Screen name="modal"` in `app/_layout.tsx`).
  - Special files with `+` prefixes appear (e.g., `+html.tsx`, `+not-found.tsx`) — treat these as framework entry/metadata pages.

- **TypeScript & module resolution:** `tsconfig.json` extends `expo/tsconfig.base` and defines an alias `@/*` → `./*`. Use `@/components/...` and `@/constants/...` imports accordingly.

- **Styling & theme conventions:**
  - App-level theme switching uses `ThemeProvider` from `@react-navigation/native` with a custom `useColorScheme` hook located in `components/useColorScheme.ts`.
  - Fonts are loaded in `app/_layout.tsx` using `useFonts` and `SplashScreen.preventAutoHideAsync()` / `SplashScreen.hideAsync()` — do not remove the splash/hide flow.

- **Platform-specific files:** Platform overrides are used (see `useClientOnlyValue.ts` and `useClientOnlyValue.web.ts`). Follow suffix conventions (`.web.tsx`, `.ios.tsx`, etc.) when adding platform-specific implementations.

- **Constants & utilities:** The `constants/` folder contains shared helpers. Example: `constants/colors.tsx` exports `lightenColor`, `darkenColor`, `getRandomColor`, and a default `blindingColors` object — prefer reusing these helpers rather than duplicating color logic.

- **Important dependencies / runtime notes:**
  - `react-native-reanimated` is imported early (`app/_layout.tsx`) — keep its top-level import to avoid runtime issues.
  - `@expo/vector-icons` and `expo-font` are used for icons/fonts; new fonts should be added under `assets/fonts` and registered in `app/_layout.tsx`.

- **Testing & CI:** No test scripts or CI config detected. There is a `react-test-renderer` devDependency only. For local validation, run the Expo app via `npm run start` and use device/emulator.

- **Conventions & best practices (repo-specific):**
  - Keep route components small and put reusable UI in `components/`.
  - Use `constants/` for app-wide values (colors, strings, icons, math helpers).
  - Prefer named exports for utilities that are consumed selectively; some files also export a `default` object (e.g., `constants/colors.tsx`) — maintain both where present.
  - Avoid changing `package.json` `main` (expo-router entry) unless you understand expo-router's entry expectations.

- **Where to look for examples:**
  - Root layout and routing: `app/_layout.tsx`
  - Tab group: `app/(tabs)/_layout.tsx` and `app/(tabs)/index.tsx`
  - Color utilities: `constants/colors.tsx`
  - Hooks & platform splits: `components/useClientOnlyValue.ts` and `components/useClientOnlyValue.web.ts`

If anything above is unclear or you'd like more detail (examples for adding a new screen, theme-aware component patterns, or suggested tests), tell me which area to expand. 
