# Remotion integration — quick reference

This short doc explains how this repo wires Remotion to produce MP4s, which files do what, and how to add your own scenes.

**Key files**
- `src/remotion/index.ts`: registers the Remotion root via `registerRoot` so the Remotion bundler can discover compositions.
- `src/remotion/Root.tsx`: defines `Composition` entries (the scenes you can render). Currently registers `DynamicComp` and `BattlefieldStrategyDemo`.
- `src/remotion/DynamicComp.tsx`: runtime wrapper that receives `inputProps` (via `getInputProps()`), calls `compileCode()` to compile a user/LLM-provided code string, and renders the compiled component. Uses `delayRender()` / `continueRender()` while compiling.
- `src/remotion/compiler.ts`: Babel-based transpilation and small sandbox glue that converts a code string into a React component (`compileCode`). It strips imports and supplies Remotion helpers.

**Server-side render entrypoint**
- `src/app/api/lambda/render/route.ts`: accepts a render request and calls `renderMediaOnLambda(...)` from `@remotion/lambda` with:
  - `serveUrl` pointing to your deployed site,
  - `composition` set from `types/constants.ts` (`COMP_NAME`),
  - `inputProps` forwarded into the composition (these become `getInputProps()` inside `DynamicComp`).

The Lambda service boots a headless bundler which loads the registered `RemotionRoot`, mounts the requested `Composition`, passes `inputProps`, renders frames and returns/downloads the final `video.mp4`.

**Request shape**
- The render API expects `inputProps` matching `types/schema.ts` → `CompositionProps` (string `code`, `durationInFrames`, `fps`).

**How to reuse your existing React components**
- Preferred (static): Create a React component that imports your app components, compose them into a Remotion-friendly scene, then register that component in `RemotionRoot` as a `Composition`.
- Dynamic (inline code strings): This template supports compiling code strings at render-time via `DynamicComp`. Use this when generating animations from LLMs or user-submitted code.

Example registration (see `Root.tsx`):

- Add a `Composition`:

  - id: the composition name used by the renderer
  - component: the React component to mount
  - width/height/fps/durationInFrames: video config

**Example workflow to add a scene**
1. Create `src/remotion/examples/MyScene.tsx` that imports your app components and exports `export const MyScene = () => { ... }`.
2. In `src/remotion/Root.tsx` import `MyScene` and add a `Composition` entry: `id="MyScene" component={MyScene} ...`.
3. Trigger a render from the server route, passing `composition: "MyScene"` (or update `types/constants.ts` to change the default `COMP_NAME`).

If you want, this repo can also compile code strings (see `compiler.ts`), but for full control and reusability prefer the static approach.

---
Files referenced above:
- [src/remotion/index.ts](src/remotion/index.ts#L1-L3)
- [src/remotion/Root.tsx](src/remotion/Root.tsx#L1-L40)
- [src/remotion/DynamicComp.tsx](src/remotion/DynamicComp.tsx#L1-L120)
- [src/remotion/compiler.ts](src/remotion/compiler.ts#L1-L260)
- [src/app/api/lambda/render/route.ts](src/app/api/lambda/render/route.ts#L1-L80)
- [types/constants.ts](types/constants.ts#L1-L10)
- [types/schema.ts](types/schema.ts#L1-L30)
