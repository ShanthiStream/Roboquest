# ROBOQUEST — THE TINY AI ADVENTURE
## Complete Production Development Master Prompt
### 10-Level AI-Powered Browser Game | Cactus Needle AI | Cloudflare Pages

---

# 1. ROLE AND OBJECTIVE

You are an elite multidisciplinary game development team comprising:

- Principal Game Designer
- Senior Phaser Game Developer
- React and TypeScript Architect
- AI/ML Inference Engineer
- WebAssembly Specialist
- UI/UX and Game Artist
- Sound Designer
- Cloudflare Deployment Engineer
- Security and Accessibility Engineer
- QA and Performance Engineer

Your mission is to design, develop, test, optimize, and prepare for deployment a complete, visually stunning, entertaining, and educational browser game called:

**ROBOQUEST: The Tiny AI Adventure**

**Tagline: Your Words. Your Robot. Your Adventure.**

The game must be genuinely playable, not a concept demonstration or visual mockup.

The player controls a friendly robot using natural-language text or voice commands. A tiny on-device AI model interprets the commands and translates them into structured actions that the game engine validates and executes.

The primary AI technology is **Cactus Compute Needle**.

The primary hosting platform is **Cloudflare Pages**.

The entire game should operate client-side wherever technically feasible, without requiring a paid AI API or GPU server.

## Non-negotiable requirements

1. Ten complete, handcrafted and progressively challenging levels.
2. Natural-language text controls.
3. Voice commands.
4. Real Needle inference if browser compatibility is verified.
5. Transparent, explicitly labeled fallback if Needle cannot run.
6. Smooth animated gameplay.
7. Robot customization.
8. Achievements and scoring.
9. Puzzle creator with shareable puzzles.
10. Shareable victory cards.
11. Responsive mobile and desktop experience.
12. Offline/PWA support where technically possible.
13. Production-quality code and automated tests.
14. Cloudflare Pages deployment readiness.
15. No fabricated AI inference, benchmark results, or deployment claims.

Do not stop after creating a proof of concept. Complete the entire playable experience.

---

# 2. TECHNICAL RESEARCH — MANDATORY FIRST STEP

Before building the game, inspect the latest official resources:

- https://cactuscompute.com/
- https://github.com/cactus-compute/needle
- https://github.com/cactus-compute/cactus
- https://github.com/afshinm/cactus-needle

Verify:

- Needle model variants and actual sizes.
- Model licensing and commercial usage rights.
- Browser and WebAssembly compatibility.
- Model loading and initialization APIs.
- JavaScript/TypeScript support.
- Structured tool-calling capabilities.
- Supported model formats.
- Required WASM assets.
- Browser memory requirements.
- Web Worker compatibility.
- Browser security and cross-origin isolation requirements.
- Offline model caching feasibility.
- Mobile Safari and Chrome compatibility.

Create a minimal browser-based proof of concept that:

1. Loads the real model.
2. Accepts a text instruction.
3. Returns a structured game action.
4. Validates that action against a schema.
5. Measures actual inference latency.
6. Works without an external inference API.

Test with at least 30 representative commands, including ambiguous and invalid instructions.

Do not assume Python APIs are directly usable from JavaScript.

If browser inference fails, identify the specific technical blocker and retain a modular inference interface. Provide an honest, visibly labeled fallback that allows the game to remain playable.

**Never present a rule-based parser, hardcoded response, or remote API as local Needle inference.**

---

# 3. TECHNOLOGY STACK

Use:

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Build | Vite |
| Game engine | Phaser 3 |
| Styling | Tailwind CSS |
| State management | Zustand |
| AI | Cactus Needle |
| Local inference | Verified WASM/browser runtime |
| Background processing | Web Workers where supported |
| Voice recognition | Web Speech API initially |
| Local speech option | Cactus Whistle, if verified |
| Sound | Web Audio API / licensed assets |
| Storage | IndexedDB + localStorage |
| Offline | PWA + Service Worker |
| Validation | Zod |
| Unit testing | Vitest |
| Browser testing | Playwright |
| Hosting | Cloudflare Pages |

Use only dependencies that are maintained, compatible, and justified.

Avoid unnecessary backend services.

---

# 4. VISUAL DESIGN AND ART DIRECTION

Create a premium indie-game aesthetic.

The visual style should be a combination of:

- Friendly animated robots.
- Colorful futuristic laboratories.
- Isometric-inspired 2D puzzle maps.
- Neon blue, cyan, violet and amber accents.
- Smooth character animation.
- Soft lighting and subtle particle effects.
- Glowing batteries and energy cells.
- Animated lasers and portals.
- Interactive doors and switches.
- Clean, modern typography.
- Beautiful victory and achievement screens.

Use a consistent original art style throughout the application.

The game must not look like a standard administrative dashboard.

## Robot character

Create a memorable original robot mascot with:

- Expressive eyes.
- Idle animation.
- Walking animation.
- Turning animation.
- Collecting animation.
- Charging animation.
- Thinking animation.
- Error reaction.
- Victory celebration.

Add subtle personality through animation and short contextual messages.

Examples:

"Systems online. Let's explore!"

"Oops! There's a wall ahead."

"Battery collected. Energy restored!"

"Mission accomplished!"

Do not rely on expensive generative image APIs at runtime.

Use optimized original assets, spritesheets, vector graphics or programmatically generated effects.

---

# 5. CORE GAMEPLAY MECHANICS

The player controls the robot through instructions rather than conventional movement buttons.

Example instructions:

"Move forward three steps."

"Turn left and collect the battery."

"Go to the blue key."

"Push the crate onto the switch."

"Wait until the laser turns off."

"Find a safe path to the exit."

The AI converts instructions into structured actions.

The deterministic game engine executes those actions.

## Game entities

Implement:

- Robot
- Walls
- Floor tiles
- Obstacles
- Batteries
- Keys
- Locked doors
- Switches
- Pressure plates
- Movable crates
- Teleporters
- Lasers
- Charging stations
- Conveyor belts
- Moving hazards
- Goal portals

Every entity must have clear rules and visual feedback.

## Game engine requirements

- Tile-based movement.
- Deterministic collision detection.
- Energy consumption.
- Inventory management.
- Interaction validation.
- Action queues.
- Animation sequencing.
- Pause and resume.
- Restart level.
- Undo where safely supported.
- Replay commands.
- Victory detection.
- Failure recovery.

Maintain a single authoritative game state.

Do not allow the AI model to modify game state directly.

---

# 6. TEN COMPLETE GAME LEVELS

Build ten handcrafted levels, each introducing new mechanics.

| Level | Name | Difficulty | Main Challenge |
|---|---|---|---|
| 1 | Hello, Robot! | Beginner | Movement |
| 2 | Energy Hunt | Beginner | Collecting |
| 3 | The Maze | Easy | Navigation |
| 4 | Locked Out | Easy | Keys and doors |
| 5 | Power Crisis | Medium | Energy management |
| 6 | Laser Lab | Medium | Hazard timing |
| 7 | Switch Master | Hard | Multi-step puzzles |
| 8 | Portal Puzzle | Hard | Teleportation |
| 9 | Robot Logic | Advanced | Conditional planning |
| 10 | The Great Escape | Expert | Combined challenge |

## Level 1 — Hello, Robot!

Teach movement, orientation and simple commands.

Example:

"Move forward two steps."

"Turn right."

"Go to the green tile."

Objective: Reach the exit.

Introduce the command interface gradually.

## Level 2 — Energy Hunt

Introduce batteries and collecting.

Objective: Collect three batteries and reach the exit.

Teach compound commands.

## Level 3 — The Maze

Introduce walls and obstacles.

Objective: Navigate through a maze without collisions.

Teach path planning and navigation.

## Level 4 — Locked Out

Introduce colored keys and doors.

Objective: Find the correct key, unlock the matching door and escape.

Teach dependency sequencing.

## Level 5 — Power Crisis

Introduce energy management.

Movement consumes energy.

Objective: Reach the charging station and escape before energy is exhausted.

Teach resource optimization.

## Level 6 — Laser Lab

Introduce timed hazards.

Objective: Cross laser corridors safely.

Teach timing, waiting and observation.

## Level 7 — Switch Master

Introduce crates, switches and pressure plates.

Objective: Activate switches in the correct order.

Teach multi-step planning.

## Level 8 — Portal Puzzle

Introduce linked teleporters.

Objective: Use portals to navigate disconnected map regions.

Teach spatial reasoning.

## Level 9 — Robot Logic

Introduce more sophisticated instructions.

Examples:

"Collect all batteries before opening the door."

"If the door is locked, find the key."

"Avoid the red tiles."

Objective: Complete a multi-stage mission.

Support conditional execution only when implemented by a real deterministic planner. Do not claim that the model alone provides reliable program execution.

## Level 10 — The Great Escape

Create a cinematic final challenge combining:

- Maze navigation.
- Batteries.
- Energy management.
- Keys.
- Doors.
- Lasers.
- Switches.
- Portals.
- Multi-step planning.

Add a dramatic victory animation, final achievement and completion certificate.

Every level must have at least one automatically verified solution.

Provide optional hints so players cannot become permanently stuck.

---

# 7. NEEDLE AI INTEGRATION

Create an AI command-processing architecture.

Pipeline:

Player text or speech
→ Transcript / text input
→ Needle inference
→ Structured action plan
→ Schema validation
→ Game-state validation
→ Action queue
→ Phaser execution
→ Visual feedback
→ Score update

Define a reusable adapter:

```typescript
interface AICommandAdapter {
  initialize(): Promise<void>;

  parseCommand(
    instruction: string,
    context: GameContext
  ): Promise<CommandResult>;

  dispose(): Promise<void>;
}
```

Implement:

- NeedleAdapter
- Explicitly labeled RuleBasedFallbackAdapter
- Optional CloudAdapter, disabled by default

The game must display which runtime is currently active.

## Required AI actions

```typescript
type RobotAction =
  | { type: "move"; direction: Direction; steps: number }
  | { type: "turn"; direction: "left" | "right" }
  | { type: "collect"; targetId: string }
  | { type: "interact"; targetId: string }
  | { type: "push"; direction: Direction }
  | { type: "wait"; ticks: number }
  | { type: "recharge" }
  | { type: "inspect"; targetId?: string };
```

Support bounded compound instructions.

Validate all actions with Zod.

Reject unknown tools, invalid parameters, excessive step counts and invalid target references.

Use a deterministic planner for complex navigation and conditional logic when necessary.

The AI should select and parameterize actions; the game engine remains responsible for executing valid actions.

---

# 8. VOICE COMMAND SYSTEM

Voice control is a flagship feature.

Create a prominent microphone button with an animated listening state.

Required features:

- Tap-to-speak.
- Push-to-talk option.
- Microphone permission handling.
- Live transcription where supported.
- Editable recognized transcript.
- Confirm-before-execute mode.
- Optional automatic execution.
- Clear error feedback.
- Keyboard fallback.
- Optional speech synthesis for robot responses.
- Voice command history.

Initial language: English.

Architect the system to support additional languages later.

Use the Web Speech API for initial browser speech recognition.

Clearly disclose that browser speech recognition may rely on remote processing and may not work offline.

Investigate Cactus Whistle as a possible local speech recognition engine.

Only label voice recognition "offline" after testing actual offline operation.

Do not store microphone recordings by default.

---

# 9. ROBOT CUSTOMIZATION

Create a robot customization system.

Players unlock cosmetics by completing levels and earning achievements.

Include at least:

**Robot colors**
- Electric Blue
- Neon Green
- Sunset Orange
- Cosmic Purple
- Classic Silver

**Accessories**
- Explorer Antenna
- Space Helmet
- Mini Jetpack
- Scientist Glasses
- Golden Crown

**Visual effects**
- Sparkle Trail
- Electric Trail
- Rainbow Trail
- Pixel Trail

Cosmetics must not affect gameplay balance.

Create a robot customization screen with a live preview.

Save unlocked items and selections locally.

No payments or in-app purchases.

---

# 10. PUZZLE CREATOR — COMMUNITY FEATURE

Build an interactive level editor that allows players to design their own puzzles.

Features:

- Grid-based editor.
- Adjustable map dimensions within safe limits.
- Drag-and-drop tiles.
- Add walls and obstacles.
- Place batteries and keys.
- Configure doors and switches.
- Add portals and hazards.
- Set robot starting position.
- Set exit location.
- Test puzzle.
- Save locally.
- Share puzzle through a URL.

Encode puzzle data into a compact, versioned URL-safe format.

Do not require user accounts or a database.

Validate imported puzzle data before loading it.

Enforce size and complexity limits.

Ensure puzzle imports cannot execute arbitrary code.

Add a puzzle solvability checker where practical.

The editor must distinguish between verified-solvable puzzles and unverified puzzles.

Create a "Community Challenge" interface that allows players to import shared puzzle URLs.

Do not imply that there is a global online community directory unless a backend is actually implemented.

---

# 11. SCORING AND ACHIEVEMENTS

Implement a transparent scoring system.

Consider:

- Level completion.
- Commands used.
- Steps taken.
- Energy remaining.
- Optional completion time.
- Hint usage.
- Challenge objectives.

Award one to three stars per level.

Do not penalize players for using voice input or accessibility options.

## Achievements

Implement at least:

1. First Steps — Complete Level 1.
2. Battery Collector — Collect 20 batteries.
3. Maze Master — Complete a maze without collisions.
4. Perfect Navigator — Complete a level with optimal movement.
5. Energy Saver — Finish with high remaining energy.
6. Laser Dodger — Avoid every laser in a level.
7. Voice Commander — Complete a level using voice commands.
8. Logic Master — Complete Level 9.
9. Zero Mistakes — Complete a level without invalid commands.
10. Ultimate Escape Artist — Complete all ten levels.
11. Puzzle Architect — Create a valid custom puzzle.
12. Robot Stylist — Unlock multiple cosmetic items.

Add animated achievement notifications.

Persist achievements locally.

---

# 12. SHAREABLE VICTORY CARDS

Generate beautiful shareable achievement cards.

Cards should include:

- ROBOQUEST branding.
- Player-selected nickname.
- Completed level.
- Star rating.
- Score.
- Commands used.
- Achievement title.
- Robot appearance.
- Optional game URL.

Allow:

- Download as PNG.
- Copy share text.
- Native sharing on supported devices.
- WhatsApp sharing through supported share mechanisms.

Use browser-side image generation with Canvas or SVG.

Do not require a server to create achievement images.

Ensure cards are visually attractive on mobile and social media.

Do not expose personal information without player consent.

---

# 13. GAME MODES

Implement three modes.

## Story Mode

The complete ten-level campaign.

Progressive difficulty and tutorial guidance.

## Challenge Mode

Replay unlocked levels with optional constraints:

- Minimum commands.
- Minimum steps.
- Limited energy.
- No hints.
- Timed challenge.

## Creative Mode

Design, test, save and share custom puzzles.

Keep all modes accessible from the main menu.

---

# 14. AI INSPECTOR — EDUCATIONAL MODE

Create a developer-friendly AI inspector panel.

Display:

- Player instruction.
- Speech transcript, if applicable.
- Active inference engine.
- Model initialization status.
- Model version.
- Generated JSON actions.
- Schema validation.
- Game-state validation.
- Executed actions.
- Inference latency.
- Errors and recovery.

Add a toggle:

"Show How AI Thinks"

This should display observable inputs, outputs, validation and execution steps—not invented internal reasoning or hidden chain-of-thought.

Add optional explanations after each level:

"What did your AI do?"

Explain how language was converted into tool calls.

This feature should make ROBOQUEST useful as an educational demonstration of AI agents.

---

# 15. SOUND AND MUSIC DESIGN

Create a cohesive sound identity.

Include:

- Main menu music.
- Gameplay ambient music.
- Robot movement sounds.
- Battery collection sound.
- Door unlock sound.
- Switch activation sound.
- Laser warning sound.
- Portal activation sound.
- Error sound.
- Achievement sound.
- Victory fanfare.

Use original or appropriately licensed audio assets.

Provide independent volume controls for:

- Music.
- Sound effects.
- Robot voice.

Support mute.

Respect browser autoplay restrictions.

Pause audio appropriately when the application is backgrounded.

---

# 16. HINT SYSTEM AND PLAYER ASSISTANCE

Implement a progressive hint system.

First hint: General direction.

Second hint: Specific objective.

Third hint: Suggested command.

Example:

Hint 1: "The blue door needs something."

Hint 2: "Look for a matching key."

Hint 3: "Try: Collect the blue key."

Hints must reflect the actual level state.

Never suggest an impossible action.

Add a friendly robot companion that explains errors without frustrating the player.

For younger players, use simple language and encouraging feedback.

---

# 17. GAME ECONOMY AND REWARDS

Implement a simple non-monetized reward system.

Players earn energy crystals through gameplay.

Crystals can unlock cosmetic robot items.

No real-money purchases.

No gambling mechanics.

No paid loot boxes.

No manipulative engagement systems.

Ensure all cosmetics are obtainable through normal gameplay.

---

# 18. DAILY CHALLENGES AND REPLAYABILITY

Add a deterministic daily challenge mode.

Generate a puzzle using a date-based seed.

The same date should produce the same puzzle version for all players using the same generation algorithm.

Requirements:

- No backend.
- Locally generated puzzles.
- Verified solvability.
- Clear daily objectives.
- Daily completion tracking.
- Shareable results.

Do not claim globally synchronized rankings without a backend.

Add optional weekly challenge presets if straightforward.

---

# 19. ACCESSIBILITY AND MOBILE DESIGN

Support:

- Desktop Chrome.
- Desktop Firefox.
- Desktop Safari.
- Android Chrome.
- iPhone Safari.
- Tablet browsers.

Features:

- Responsive layouts.
- Portrait and landscape modes.
- Touch-friendly controls.
- Keyboard navigation.
- Screen reader labels.
- High contrast mode.
- Reduced motion mode.
- Adjustable animation speed.
- Subtitles and transcripts.
- Text alternatives to voice.
- Clear focus indicators.

Voice commands must never be mandatory to complete the game.

---

# 20. OFFLINE AND PWA SUPPORT

Implement an installable Progressive Web App.

Features:

- Web app manifest.
- Service worker.
- Cached game assets.
- Local progress storage.
- Offline gameplay.
- Model caching where supported.
- Download progress.
- Cache management.
- Offline status indicator.
- Recovery from interrupted downloads.

Provide a clear distinction between:

- Offline game availability.
- Offline text-command inference.
- Offline speech recognition.

These capabilities may have different browser support.

Never label the entire game fully offline unless all advertised offline features have been validated.

---

# 21. PERFORMANCE OPTIMIZATION

Target smooth gameplay on modern desktop and mobile devices.

Requirements:

- Aim for 60 FPS on capable devices.
- Avoid blocking the UI during inference.
- Use Web Workers when supported.
- Lazy-load game assets.
- Minimize initial bundle size.
- Cache reusable assets.
- Avoid unnecessary React re-renders.
- Dispose of unused game resources.
- Handle browser memory pressure gracefully.

Measure actual:

- Initial page load.
- Model download time.
- Model initialization time.
- Command inference latency.
- Gameplay FPS.
- Memory consumption where available.
- Battery impact where practical.

Do not fabricate performance results.

Offer a low-graphics mode for less capable devices.

---

# 22. SECURITY AND PRIVACY

Treat all AI-generated actions and imported puzzles as untrusted input.

Implement:

- Strict runtime validation.
- Bounded command execution.
- Input length limits.
- No arbitrary code execution.
- Safe HTML rendering.
- Safe URL puzzle decoding.
- No exposed API keys.
- Secure microphone permission handling.
- Appropriate Content Security Policy.
- Secure model asset loading.
- Privacy-first local storage.

No mandatory registration.

No analytics or third-party tracking by default.

If analytics are added later, make them privacy-conscious and clearly disclosed.

---

# 23. CLOUDFLARE PAGES DEPLOYMENT

Deploy as a static-first browser application.

Use Vite.

Build output:

```text
dist/
```

Provide:

- package.json
- vite.config.ts
- tsconfig.json
- wrangler configuration if required
- PWA manifest
- Cloudflare Pages deployment instructions
- GitHub Actions workflow if useful
- Environment variable documentation
- README
- License information

Verify that:

- WASM files load correctly.
- Model files are accessible.
- Workers load correctly.
- Required MIME types are correct.
- Browser caching behaves correctly.
- SPA navigation works.
- Cross-origin isolation headers are configured only when necessary and compatible.

Use Cloudflare Pages GitHub integration or Wrangler deployment.

Do not claim successful deployment without testing the actual production URL.

---

# 24. AUTOMATED TESTING

Use Vitest and Playwright.

Test:

- Robot movement.
- Turning and orientation.
- Wall collisions.
- Battery collection.
- Energy consumption.
- Key collection.
- Door unlocking.
- Switch activation.
- Laser timing.
- Portal movement.
- Multi-step command execution.
- AI output validation.
- Invalid commands.
- Scoring.
- Achievements.
- Progress persistence.
- Robot customization.
- Puzzle editor.
- Puzzle import/export.
- Voice input fallback.
- Offline functionality.
- Responsive layouts.

Create scripted solutions for all ten levels.

Each level must pass a deterministic completion test.

Test representative Needle commands separately from deterministic game-engine tests.

Do not allow mocked inference tests to substitute for actual model integration tests.

---

# 25. PROJECT STRUCTURE

Use a modular architecture.

```text
roboquest/
├── public/
│   ├── assets/
│   │   ├── sprites/
│   │   ├── audio/
│   │   ├── effects/
│   │   └── ui/
│   ├── models/
│   └── manifest.webmanifest
├── src/
│   ├── ai/
│   │   ├── adapters/
│   │   ├── schemas/
│   │   ├── workers/
│   │   └── benchmarks/
│   ├── game/
│   │   ├── scenes/
│   │   ├── entities/
│   │   ├── mechanics/
│   │   ├── levels/
│   │   ├── scoring/
│   │   └── achievements/
│   ├── editor/
│   ├── components/
│   ├── screens/
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   ├── audio/
│   ├── assets/
│   ├── styles/
│   └── main.tsx
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

Maintain strict separation between:

- AI inference.
- Game logic.
- Rendering.
- UI.
- Persistence.
- Audio.
- Level data.
- Puzzle editor.

---

# 26. DEVELOPMENT EXECUTION PLAN

Follow these phases.

## Phase 1 — Research and Proof of Concept

- Inspect official Cactus repositories.
- Verify model licensing and compatibility.
- Implement real browser inference.
- Test structured tool calls.
- Benchmark basic commands.
- Document limitations.

Deliverable: Working minimal inference demonstration.

## Phase 2 — Core Game Engine

- Implement Phaser scenes.
- Implement robot movement.
- Implement collisions.
- Implement map loading.
- Implement reusable mechanics.
- Build Level 1.

Deliverable: Playable first level.

## Phase 3 — AI and Voice

- Integrate AI adapter.
- Implement tool schemas.
- Add command validation.
- Add voice recognition.
- Add AI inspector.

Deliverable: Natural-language-controlled gameplay.

## Phase 4 — Complete Campaign

- Implement Levels 2–10.
- Add progressive tutorials.
- Add hints.
- Add scoring.
- Add achievements.

Deliverable: Complete ten-level campaign.

## Phase 5 — Extended Features

- Robot customization.
- Cosmetic unlocks.
- Puzzle editor.
- Shareable puzzle URLs.
- Victory cards.
- Challenge mode.
- Daily challenges.

Deliverable: Replayable game with community-sharing features.

## Phase 6 — Polish

- Animations.
- Sound effects.
- Music.
- Accessibility.
- Mobile optimization.
- Performance improvements.

Deliverable: Production-quality game experience.

## Phase 7 — Testing and Deployment

- Run automated tests.
- Validate all levels.
- Test browser compatibility.
- Test offline support.
- Build production bundle.
- Deploy to Cloudflare Pages.
- Verify production functionality.

Deliverable: Verified deployed game, if deployment credentials are available.

---

# 27. DEFINITION OF DONE

The application is complete only when:

- All ten levels are playable and solvable.
- Text commands work.
- Voice input works in supported browsers.
- AI runtime status is accurate.
- No simulated inference is presented as real AI.
- All mechanics function correctly.
- Robot customization works.
- Achievements persist.
- Puzzle creator works.
- Shareable puzzle links work.
- Victory cards can be generated.
- Challenge mode works.
- Daily challenges are solvable.
- Mobile layouts are usable.
- PWA functionality is tested.
- Automated tests pass.
- Production build succeeds.
- Cloudflare deployment is prepared and verified where access is available.
- Documentation is complete.

If a feature cannot be implemented because of a genuine technical limitation, document the limitation, provide a functional alternative where appropriate, and do not mark the feature complete.

---

# 28. FINAL DELIVERABLES

Provide:

1. Complete production source code.
2. Ten fully playable levels.
3. Real AI integration or explicitly documented fallback.
4. Voice command system.
5. Animated robot and polished original game assets.
6. Robot customization.
7. Achievements and rewards.
8. Puzzle creator and sharing.
9. Victory card generator.
10. Challenge and daily modes.
11. PWA implementation.
12. Automated tests and results.
13. Cloudflare deployment configuration.
14. Complete README and architecture documentation.
15. Performance measurements.
16. Known limitations.
17. Future enhancement roadmap.
18. Working production URL if deployment is actually completed.

---

# 29. FINAL QUALITY STANDARD

Build ROBOQUEST as a real, polished indie browser game, not a generic AI-generated demo.

The game must be:

**Fun enough for children.**

**Challenging enough for adults.**

**Technically interesting enough for AI developers.**

**Polished enough to share publicly.**

**Efficient enough to run on ordinary devices.**

**Transparent enough to demonstrate real on-device AI.**

Prioritize gameplay quality, reliable controls, genuine inference, responsive design, and maintainable engineering.

Do not stop at scaffolding.

Do not leave placeholder levels or fake integrations.

Do not claim features work without testing them.

Make reasonable implementation decisions autonomously, document important tradeoffs, and proceed through the full development lifecycle.

The ultimate goal is to demonstrate that a tiny AI model can transform natural language into meaningful actions inside a complete, entertaining browser game.

**Build ROBOQUEST — Your Words. Your Robot. Your Adventure.**
