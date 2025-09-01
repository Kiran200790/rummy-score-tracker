# 🎯 Rummy Score Tracker PWA

A modern, offline-first Progressive Web App for tracking Rummy game scores. Built with vanilla JavaScript, featuring a clean design and full offline functionality.

## ✨ Features

### 🎮 Game Management
- **2-10 Players Support** - Flexible player count
- **Round-by-Round Scoring** - Track scores for each round
- **Winner Marking** - Mark round winners with "R"
- **Score Validation** - Ensures proper Rummy rules (2-80 points, one winner per round)
- **Danger Zone Alert** - Highlights players with 200+ points

### 📱 PWA Features
- **Fully Offline** - Works without internet connection
- **Installable** - Add to home screen on mobile/desktop
- **Responsive Design** - Optimized for all screen sizes
- **Fast Loading** - Cached resources for instant access
- **Native App Feel** - Standalone app experience

### 💾 Data Management
- **Local Storage** - All data saved locally on device
- **Game History** - View and reload past games
- **Auto-Save** - Progress automatically preserved
- **Export Ready** - Easy to extend with export features

### 🎨 Modern UI
- **Clean Design** - Professional, game-focused interface
- **Smooth Animations** - Polished user experience
- **Touch Optimized** - Perfect for mobile gameplay
- **Dark/Light Support** - System theme awareness

## 🚀 Quick Start

### Online Access
Open `index.html` in any modern web browser - that's it! No installation required.

### Local Development
1. Clone or download this repository
2. Open `index.html` in a web browser
3. For local server (recommended):
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
4. Visit `http://localhost:8000`

### Install as PWA
1. Open the app in Chrome/Edge/Safari
2. Look for "Install" prompt or click the install icon in address bar
3. Click "Install" to add to home screen
4. Launch like a native app!

## 🎯 How to Play

### Game Setup
1. Select number of players (2-10)
2. Enter player names
3. Click "Start Game"

### Scoring
- Enter scores 2-80 for each player per round
- Enter "R" for the round winner (gets 0 points)
- Only one winner allowed per round
- Players with 200+ points are highlighted in red

### Game Management
- **Add Round**: Start a new round
- **Save Game**: Save to history
- **New Game**: Start fresh
- **View History**: See past games

## 🛠️ Technical Details

### Tech Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **PWA**: Service Worker, Web App Manifest
- **Storage**: localStorage API
- **Icons**: Custom generated with Python/PIL
- **Fonts**: Google Fonts (Nunito Sans)
- **Icons**: Font Awesome

### File Structure
```
/
├── index.html          # Main HTML file
├── styles.css          # Application styles
├── app.js             # Main application logic
├── sw.js              # Service Worker
├── manifest.json      # PWA manifest
├── generate_icons.py  # Icon generation script
├── icons/             # App icons
│   ├── icon-72x72.png
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── favicon.ico
└── README.md          # This file
```

### Browser Support
- ✅ Chrome 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Customization

### Styling
Edit `styles.css` to customize:
- Colors (CSS variables in `:root`)
- Fonts and typography
- Layout and spacing
- Animations and effects

### Game Rules
Modify `app.js` to change:
- Score ranges (currently 2-80)
- Danger threshold (currently 200)
- Validation rules
- Player limits

### PWA Settings
Update `manifest.json` for:
- App name and description
- Theme colors
- Display mode
- Shortcuts

## 📊 Features Roadmap

### Planned Enhancements
- [ ] Export games to PDF/CSV
- [ ] Player statistics and analytics
- [ ] Multiple game variants
- [ ] Sound effects and haptic feedback
- [ ] Multiplayer sync (future)
- [ ] Tournament mode
- [ ] Custom scoring rules

## 🤝 Contributing

This is a standalone PWA designed for simplicity and offline use. Feel free to fork and modify for your needs!

### Development Guidelines
1. Keep dependencies minimal (vanilla JS preferred)
2. Maintain offline-first approach
3. Ensure mobile responsiveness
4. Follow PWA best practices

## 📄 License

Open source - feel free to use, modify, and distribute!

## 🎉 Enjoy Your Games!

Perfect for family game nights, tournaments, or casual play. No internet required, no data collection, just pure gaming fun!

---

**Made with ❤️ for Rummy enthusiasts everywhere!**
