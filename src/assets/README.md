# Assets Directory

This directory contains character tokens used in the Owlbear Rodeo Virtual Tabletop application. These assets can be used to create tokens on the game board using the `create_token` function from the `obr-actions.js` module.

## Available Character Tokens

| Filename | Character Type | Description |
|----------|---------------|-------------|
| `cat person #ffffff.png` | Humanoid Feline | A cat-like humanoid character token with white background |
| `Half-elf Bard #ffffff.png` | Half-elf | A half-elf bard character token with white background |
| `Half-orc cleric #ffffff.png` | Half-orc | A half-orc cleric character token with white background |
| `Half-orc fighter #ffffff.png` | Half-orc | A half-orc fighter character token (variant 1) with white background |
| `Half-orc fighter 2 #ffffff.png` | Half-orc | A half-orc fighter character token (variant 2) with white background |
| `half-orc fighter 3 #ffffff.png` | Half-orc | A half-orc fighter character token (variant 3) with white background |
| `Human #ffffff.png` | Human | A generic human character token with white background |
| `Knight 1 #ffffff.png` | Knight | A knight character token (variant 1) with white background |
| `Knight 2 #ffffff.png` | Knight | A knight character token (variant 2) with white background |
| `Kurig #ffffff.png` | Character | A character token named Kurig with white background |
| `Paladin #ffffff.png` | Paladin | A paladin character token with white background |
| `Plague knight #ffffff.png` | Knight | A plague knight character token with white background |

## How to Use

These assets can be used with the `create_token` function from the `obr-actions.js` module. Example:

```javascript
import { create_token } from '../obr/obr-actions';

// Create a token on the scene
async function placeKnight() {
  await create_token({
    name: "Knight",
    imageUrl: "./assets/Knight 1  #ffffff.png", // Path to the image
    x: 100,
    y: 100,
    layer: "CHARACTER",
    width: 100,
    height: 100
  });
}
```
