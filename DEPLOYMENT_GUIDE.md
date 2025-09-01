# 🎯 Rummy Score Tracker - Deployment & iPhone Installation Guide

## 📦 Step 1: Push to GitHub

### Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Repository name: `rummy-score-tracker`
4. Set it to **Public** (required for GitHub Pages)
5. Click "Create repository"

### Push Your Code
```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/rummy-score-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under "Source", select **GitHub Actions**
5. The workflow will automatically deploy your app

Your app will be available at: `https://YOUR_USERNAME.github.io/rummy-score-tracker`

## 📱 Step 3: Install on iPhone

### Method 1: Add to Home Screen (Recommended)
1. Open **Safari** on your iPhone
2. Go to: `https://YOUR_USERNAME.github.io/rummy-score-tracker`
3. Tap the **Share** button (square with arrow up)
4. Scroll down and tap **"Add to Home Screen"**
5. Customize the name if needed
6. Tap **"Add"**

### Method 2: Bookmark for Easy Access
1. Open the app in Safari
2. Tap the **Share** button
3. Tap **"Add Bookmark"**
4. Save to Favorites for quick access

## ✨ PWA Features on iPhone

Once installed, your Rummy Score Tracker will:
- ✅ Work completely **offline**
- ✅ Launch like a **native app**
- ✅ Have its own **app icon** on home screen
- ✅ Run in **fullscreen mode** (no Safari UI)
- ✅ Store all game data **locally**
- ✅ Work without internet connection

## 🎮 App Features

- **Modern Glassmorphism Design** - iOS-style glass effects
- **Offline First** - Works without internet
- **Score Tracking** - Track multiple players and rounds
- **Auto-Elimination** - Players eliminated at 250 points
- **Score Validation** - Prevents invalid scores
- **Game History** - View past games
- **Responsive Design** - Perfect for phones and tablets

## 🔧 Troubleshooting

### If the app doesn't install properly:
1. Make sure you're using **Safari** (not Chrome or other browsers)
2. Check that the repository is **Public** on GitHub
3. Wait a few minutes for GitHub Pages to deploy
4. Try refreshing the page before adding to home screen

### If updates don't appear:
1. Open the app
2. Pull down to refresh
3. Or clear Safari cache: Settings → Safari → Clear History and Website Data

## 🎯 Quick Start Commands

```bash
# If you haven't pushed yet, run these commands:
git remote add origin https://github.com/YOUR_USERNAME/rummy-score-tracker.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username!

---

**Enjoy your glassmorphism Rummy Score Tracker! 🎉**
