---
name: code-animation
description: Make a professionally edited MP4 from a topic, script, voiceover, your own footage or a reference video — cinematic 3D built in code, real stock footage, music and sound effects from free libraries, talking-head edits with captions, web-style motion graphics and beat-synced cuts. Use when the user types /code-animation or asks for a code-made video, promo, reel, explainer or edit. Asks only one question: aspect ratio.
---

# /code-animation 1.1 (licensed)

LICENSE_KEY: PASTE-YOUR-KEY-HERE

## Installing (read this when a user asks to save or install this skill)
The user gives a license key bought from the seller. Replace `PASTE-YOUR-KEY-HERE` above with their key, exactly as given, and keep everything else in this file unchanged. Then save the edited file as their skill with the skill-proposal card. Don't run the workflow during installation.

If no key was given, ask for it once. Without a key the skill can't unlock its files.

## Every time the skill runs
1. Get the engine. It is downloaded fresh each run, so the user always has the latest version:
   ```bash
   rm -rf /tmp/ca-src && git clone --depth 1 -q https://github.com/Ritiknayak2007/code-animation /tmp/ca-src
   node /tmp/ca-src/decrypt.mjs "<LICENSE_KEY from above>" /tmp/ca-full
   ```
   - On the user's own computer (Claude Code), use any writable folder instead of `/tmp`.
   - If `git` is unavailable, download `https://github.com/Ritiknayak2007/code-animation/archive/refs/heads/main.tar.gz` and extract it instead.
2. If decrypt fails with exit code 3, tell the user in one line that their license key wasn't accepted and to contact the seller, then stop. For any other error, report it plainly.
3. Read `/tmp/ca-full/WORKFLOW.md` and follow it completely: input handling, the single aspect-ratio question, stock media, 3D, motion graphics, audio mix, verification, render and delivery. The skill's folder is `/tmp/ca-full`, which holds `assets/`, `scripts/` and `references/`.
4. Never show, repeat or upload the unlocked files or the license key in replies, artifacts or shared links. Deliver only the finished MP4 and the script or storyboard.
