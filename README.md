# OwlBear LLM Chat

A medieval-themed D&D chat interface built with Vite and vanilla JavaScript, featuring authentic parchment styling and medieval fonts.

## Features

- 🏰 **Medieval Theme**: Authentic old parchment background with medieval fonts
- 📜 **No Message Boxes**: Clean text display without modern chat bubbles
- ⚔️ **D&D Style**: Dungeon Master and Player roles with distinctive styling
- 🎨 **Custom Typography**: Medieval fonts including Cinzel, Berkshire Swash, and Metamorphous
- 💬 **Real-time Chat**: Instant messaging with simulated responses

## Screenshots

The interface features:
- Old paper texture background
- Medieval fonts for authentic D&D feel
- Sender names displayed above messages
- Compact message layout without timestamps
- Elegant header and footer design

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Agamador/OwlBear-llm-chat.git
cd OwlBear-llm-chat
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Project Structure

```
llm-DM/
├── index.html          # Main HTML file with Google Fonts imports
├── package.json        # Project dependencies and scripts
├── vite.config.js      # Vite configuration
├── src/
│   ├── main.js         # Application logic and chat functionality
│   ├── style.css       # Medieval theme styling
│   └── oldpaper.jpeg   # Background texture image
└── public/
    ├── vite.svg
    └── manifest.json
```

## Customization

### Fonts
The application uses several medieval Google Fonts:
- **Cinzel**: Classical serif for message content
- **Berkshire Swash**: Decorative script for sender names
- **Metamorphous**: Fantasy-inspired font for messages
- **UnifrakturMaguntia**: Traditional blackletter/gothic script

### Colors
The color scheme uses warm, parchment-inspired tones:
- Background: Old paper texture image
- Text: Dark brown (`#4a2c17`, `#2c1810`)
- Accents: Saddle brown (`#8b4513`)
- Borders: Various brown shades for medieval feel

### Background
Replace `src/oldpaper.jpeg` with your own parchment texture for a different look.

## Technologies Used

- **Vite**: Fast build tool and dev server
- **Vanilla JavaScript**: Pure JS for lightweight performance
- **CSS3**: Modern styling with medieval aesthetics
- **Google Fonts**: Medieval and fantasy typography

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Inspired by classic D&D tabletop gaming
- Medieval fonts provided by Google Fonts
- Built with modern web technologies for authentic retro feel
