# Workshop Reader: art notes

## Non-negotiable teaching rule
**Every word spoken on screen gets highlighted as it is spoken.** The student learns to read by watching print light up while he hears it and while he teaches the droid. Art must never cover, shrink or replace that highlighting.
- `sayHL()` / `talk()` and the `.hl` class are unchanged. That covers feedback `#fb-text`, pattern text, missions, bubbles, Radio and Hear again.
- `.hl` is now stronger: gold fill, a 4px ring, a soft glow and an underline. `.big-word.hl` adds a big gold glow, an 8px underline and a slight zoom.
- In Teach mode the correct spelling stays in `.big-word`. The droid's wrong guess is **spoken only, never printed**. I didn't add `readable()` to `.big-word` on purpose: the droid's line ("This word is… X") targets the whole word, and splitting it into word spans would make the highlight drop off after the first spoken token.

## What kids will see differently
- A new droid: an unfinished protocol robot with a silver and gunmetal frame and one metallic blue chest plate. Red and cyan wires show through its open torso. It bobs gently while idle.
- Parts not yet earned show as dashed outlines ("missing covers"). When earned they fill in: glowing amber oval eyes, a vocabulator grill (it flickers while the droid talks), servo arms, legs with knee joints, a pulsing cyan memory core, gold plating, and a blinking red antenna tip.
- A blueprint title block ("STREAM WORKSHOP · DWG WR-01") in the top bar, and uppercase section headings.
- Finished levels get a tilted green CERTIFIED stamp.
- Primary buttons look like gold metal and press down when clicked. Tiles, choices and job cards squish when tapped, and a correct answer flashes green.
- The toast pops up with a 🔧 and a spark ring.
- Animations switch off if the device asks for reduced motion.

## Palette
| Role | Hex |
|---|---|
| Background (blueprint navy) | #0E2944 |
| Panel | #163B60 |
| Line | #2D5F8F |
| Ink | #EEF5FF |
| Muted text (≈6:1 on panel) | #A9C1DC |
| Accent / highlight gold | #FFC93C |
| Droid silver | #EEF2F7 → #6B7686 |
| Droid gunmetal | #7C8796 → #3A4350 |
| Chest plate blue | #9CC6FF → #3F8CFF → #1B4FA8 |
| Gold plating | #FFF1B8 → #E2B23A → #8A6212 |
| Eyes | #FFD54A |
| Core / vocabulator | #6FF0FF |
| Decoder colors | unchanged |

## How the droid builds (DROID_PARTS, unchanged)
| Words taught | Part |
|---|---|
| 0 | Frame (head shell, neck, torso, blue chest, wires) |
| 10 | Photoreceptors (eyes) |
| 25 | Vocabulator |
| 45 | Servo arms |
| 70 | Leg actuators |
| 100 | Memory core |
| 140 | Gold plating (head and limbs turn gold; the chest stays blue) |
| 200 | Comm antenna |

## Offline notes
- No new network dependencies. Twemoji (CDN) and Lexend (Google Fonts) are the only external loads, and both may be blocked by school IT.
- If Twemoji fails, `emo()` falls back to the plain emoji character.
- If Lexend fails, the page uses system fonts (Segoe UI, system-ui, Roboto, Arial).
- The droid is pure inline SVG, so it always works offline.
