# 🎄 Holiday Bingo React

A festive, interactive bingo game built with React featuring automatic card generation, real-time scoring, and built-in anti-cheat mechanisms to ensure fair play during your holiday celebrations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

## 📋 Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Game Rules](#game-rules)
- [Development](#development)
- [Testing](#testing)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contact & Support](#contact--support)

## ✨ Features

### Core Gameplay
- **🎲 Dynamic Card Generation**: Automatically generates unique bingo cards for each player
- **🏆 Auto-Scoring System**: Real-time score tracking and winner detection
- **🛡️ Anti-Cheat Protection**: Built-in mechanisms to prevent cheating and ensure fair play
- **🎯 Multiple Game Modes**: Support for different bingo patterns (line, full card, corners, etc.)
- **👥 Multi-Player Support**: Play with friends and family
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### User Experience
- **🎨 Festive Theme**: Beautiful holiday-themed UI with seasonal decorations
- **🔊 Sound Effects**: Optional audio feedback for marking squares and winning
- **💾 Game State Persistence**: Save and resume games
- **📊 Statistics**: Track your wins, losses, and playing history
- **🌙 Dark Mode**: Easy on the eyes during late-night holiday parties

### Technical Features
- **⚡ Fast Performance**: Optimized React components for smooth gameplay
- **🔄 Real-time Updates**: Instant synchronization across all players
- **🎭 Animations**: Smooth transitions and celebratory effects
- **♿ Accessibility**: WCAG compliant for inclusive gaming

## 🎮 Demo

[Live Demo Link] (Coming Soon)

### Screenshots

*(Screenshots will be added once the application is deployed)*

## 🛠 Technology Stack

### Frontend
- **React** (18+) - UI framework
- **React Hooks** - State management and lifecycle
- **CSS3/SASS** - Styling and animations
- **JavaScript (ES6+)** - Core programming language

### Development Tools
- **Node.js** (16+) - Runtime environment
- **npm/yarn** - Package management
- **Webpack/Vite** - Module bundler
- **Babel** - JavaScript transpiler
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Testing
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **Cypress** - End-to-end testing

### Additional Libraries
- **PropTypes** - Runtime type checking
- **React Router** (optional) - Navigation
- **LocalStorage API** - Data persistence

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 16.x or higher
  ```bash
  node --version
  ```

- **npm**: Version 8.x or higher (comes with Node.js)
  ```bash
  npm --version
  ```

Or alternatively:
- **Yarn**: Version 1.22.x or higher
  ```bash
  yarn --version
  ```

- **Git**: For cloning the repository
  ```bash
  git --version
  ```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ginjaninja78/holiday-bingo-react.git
cd holiday-bingo-react
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using Yarn:
```bash
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory (if required):

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
REACT_APP_NAME=Holiday Bingo
REACT_APP_VERSION=1.0.0
REACT_APP_API_URL=http://localhost:3000
# Add other environment variables as needed
```

### 4. Start Development Server

Using npm:
```bash
npm start
```

Or using Yarn:
```bash
yarn start
```

The application will open automatically in your default browser at `http://localhost:3000`

## 💻 Usage

### Starting a New Game

1. **Launch the Application**: Open the app in your web browser
2. **Create or Join a Game**: 
   - Click "New Game" to start as host
   - Or enter a game code to join an existing game
3. **Configure Game Settings**:
   - Select bingo pattern (traditional line, full card, four corners, etc.)
   - Set number of players
   - Choose theme and sound preferences
4. **Generate Cards**: Each player receives a unique bingo card
5. **Start Playing**: The host calls out items, players mark their cards
6. **Win**: First player to complete the pattern wins!

### Game Controls

- **Mark Square**: Click or tap on a square to mark it
- **Unmark Square**: Click marked square again to unmark
- **Call Bingo**: Click "BINGO!" button when you complete a pattern
- **Reset Game**: Start a new round with the same players
- **New Game**: Start fresh with new settings

### Keyboard Shortcuts

- `Space` - Mark/unmark selected square
- `Arrow Keys` - Navigate between squares
- `Enter` - Call bingo
- `R` - Reset game (host only)
- `Esc` - Close dialogs

## 📁 Project Structure

```
holiday-bingo-react/
├── public/
│   ├── index.html           # HTML template
│   ├── favicon.ico          # App icon
│   ├── manifest.json        # PWA manifest
│   └── assets/              # Static assets
│       ├── images/          # Image files
│       └── sounds/          # Sound effects
│
├── src/
│   ├── components/          # React components
│   │   ├── BingoCard/       # Bingo card component
│   │   ├── GameBoard/       # Game board container
│   │   ├── ScoreBoard/      # Score tracking
│   │   ├── PlayerList/      # Player management
│   │   └── common/          # Reusable UI components
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useGame.js       # Game logic hook
│   │   ├── useScore.js      # Scoring logic hook
│   │   └── useAntiCheat.js  # Anti-cheat mechanism
│   │
│   ├── utils/               # Utility functions
│   │   ├── cardGenerator.js # Card generation logic
│   │   ├── patternChecker.js # Win condition checker
│   │   └── validation.js    # Input validation
│   │
│   ├── styles/              # CSS/SASS files
│   │   ├── global.css       # Global styles
│   │   ├── variables.css    # CSS variables
│   │   └── components/      # Component-specific styles
│   │
│   ├── context/             # React Context
│   │   └── GameContext.js   # Game state context
│   │
│   ├── constants/           # Constants and configuration
│   │   ├── gameRules.js     # Game rules and patterns
│   │   └── themes.js        # Theme configurations
│   │
│   ├── App.js               # Main App component
│   ├── App.css              # App styles
│   ├── index.js             # Entry point
│   └── setupTests.js        # Test configuration
│
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests
│
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── README.md                # This file
└── LICENSE                  # License information
```

## ⚙️ Configuration

### Game Settings

Customize the game by editing `src/constants/gameRules.js`:

```javascript
export const GAME_CONFIG = {
  cardSize: 5,              // 5x5 traditional bingo card
  freeSpace: true,          // Center square is free
  patterns: {
    line: true,             // Any complete line
    fullCard: true,         // All squares marked
    corners: true,          // Four corner squares
    // Add custom patterns
  },
  autoVerify: true,         // Automatically verify wins
  antiCheat: {
    enabled: true,
    validateTiming: true,   // Check marking timestamps
    requireHost: true,      // Host must verify wins
  }
};
```

### Theme Customization

Modify themes in `src/constants/themes.js`:

```javascript
export const THEMES = {
  classic: {
    primary: '#c41e3a',
    secondary: '#165b33',
    background: '#ffffff',
    // ... more colors
  },
  winter: {
    primary: '#4a90e2',
    secondary: '#ffffff',
    background: '#f0f8ff',
    // ... more colors
  }
};
```

### Sound Effects

Enable/disable sounds in game settings or via configuration:

```javascript
export const SOUND_CONFIG = {
  enabled: true,
  volume: 0.7,
  effects: {
    mark: 'click.mp3',
    bingo: 'celebration.mp3',
    win: 'victory.mp3',
  }
};
```

## 🎯 Game Rules

### Traditional Bingo

1. Each player receives a unique 5x5 bingo card with numbers/items
2. The center square is typically a "FREE" space
3. The caller randomly selects and announces items
4. Players mark the called items on their cards
5. First player to complete a pattern calls "BINGO!"
6. The card is verified before declaring a winner

### Winning Patterns

- **Line**: Complete any horizontal, vertical, or diagonal line
- **Four Corners**: Mark all four corner squares
- **Full Card**: Mark all squares (blackout)
- **X Pattern**: Mark both diagonals
- **Custom Patterns**: Configure your own patterns

### Anti-Cheat Measures

The game includes several anti-cheat features:

- **Timestamp Validation**: Marks are timestamped and validated
- **Pattern Verification**: Automatic win condition checking
- **Host Verification**: Optional host approval for wins
- **Audit Trail**: Complete game history for review
- **Card Uniqueness**: Ensures all cards are unique

## 🔧 Development

### Development Workflow

1. **Create a Branch**: Always work on a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**: Implement your feature or fix

3. **Test Your Changes**: Run tests before committing
   ```bash
   npm test
   ```

4. **Lint Your Code**: Ensure code quality
   ```bash
   npm run lint
   ```

5. **Commit Changes**: Use meaningful commit messages
   ```bash
   git commit -m "Add: Description of your changes"
   ```

6. **Push and Create PR**: Push branch and open a pull request
   ```bash
   git push origin feature/your-feature-name
   ```

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run test suite
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run eject` - Eject from Create React App (irreversible)

### Code Style Guidelines

- Follow React best practices and hooks rules
- Use functional components with hooks
- Keep components small and focused
- Write meaningful variable and function names
- Add PropTypes for component props
- Comment complex logic
- Maintain consistent formatting (use Prettier)

### Adding New Features

1. **Component**: Create in `src/components/`
2. **Hook**: Add custom hooks in `src/hooks/`
3. **Utility**: Place helper functions in `src/utils/`
4. **Styles**: Component styles in `src/styles/components/`
5. **Tests**: Add tests alongside your code

## 🧪 Testing

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Run tests with coverage:
```bash
npm test -- --coverage
```

### Test Structure

```
tests/
├── unit/
│   ├── components/       # Component tests
│   ├── hooks/           # Hook tests
│   └── utils/           # Utility function tests
├── integration/
│   └── game-flow.test.js # Integration tests
└── e2e/
    └── complete-game.cy.js # Cypress E2E tests
```

### Writing Tests

Example component test:

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import BingoCard from './BingoCard';

describe('BingoCard', () => {
  it('marks a square when clicked', () => {
    render(<BingoCard />);
    const square = screen.getByTestId('square-1-1');
    fireEvent.click(square);
    expect(square).toHaveClass('marked');
  });
});
```

### End-to-End Tests

Run Cypress tests:
```bash
npm run cypress:open
```

Or run headless:
```bash
npm run cypress:run
```

## 🏗 Building for Production

### Create Production Build

```bash
npm run build
```

This creates an optimized build in the `build/` directory:

- Minified JavaScript and CSS
- Optimized assets
- Source maps for debugging
- Service worker for PWA (if configured)

### Build Optimization

The build is optimized for:
- **Performance**: Code splitting and lazy loading
- **Size**: Minification and compression
- **Caching**: Content hashing for cache busting
- **Compatibility**: Transpiled for browser support

### Analyzing Bundle Size

Analyze the bundle:
```bash
npm run build -- --stats
npx webpack-bundle-analyzer build/bundle-stats.json
```

## 🚢 Deployment

### Deployment Options

#### Option 1: Static Hosting (Netlify, Vercel, GitHub Pages)

**Netlify:**
```bash
npm run build
# Drag and drop build/ folder to Netlify
# Or connect GitHub repo for auto-deploy
```

**Vercel:**
```bash
npm install -g vercel
vercel
```

**GitHub Pages:**
```bash
npm install --save-dev gh-pages
# Add to package.json:
# "homepage": "https://ginjaninja78.github.io/holiday-bingo-react"
# "predeploy": "npm run build"
# "deploy": "gh-pages -d build"
npm run deploy
```

#### Option 2: Docker

Create `Dockerfile`:
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t holiday-bingo-react .
docker run -p 80:80 holiday-bingo-react
```

#### Option 3: Traditional Web Server

1. Build the application: `npm run build`
2. Upload `build/` contents to your web server
3. Configure server to serve `index.html` for all routes
4. Enable gzip compression
5. Set proper cache headers

### Environment Variables for Production

Create `.env.production`:
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENV=production
```

### Post-Deployment Checklist

- [ ] Test all features in production
- [ ] Verify mobile responsiveness
- [ ] Check browser compatibility
- [ ] Test performance and load times
- [ ] Ensure HTTPS is enabled
- [ ] Verify analytics are working
- [ ] Test error logging
- [ ] Check SEO meta tags

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/ginjaninja78/holiday-bingo-react.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Write clean, documented code
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   ```

5. **Commit Your Changes**
   ```bash
   git commit -m 'Add: Amazing new feature'
   ```
   
   Use conventional commits:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Docs:` for documentation changes
   - `Style:` for formatting changes
   - `Refactor:` for code refactoring
   - `Test:` for adding tests

6. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

### Code Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited

### Reporting Bugs

Please create an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS information
- Console errors if any

### Suggesting Features

Create an issue with:
- Clear feature description
- Use case and benefits
- Possible implementation approach
- Mockups or examples if applicable

## 🐛 Troubleshooting

### Common Issues

#### Installation Issues

**Problem**: `npm install` fails
```bash
# Solution 1: Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Solution 2: Use different Node version
nvm install 16
nvm use 16
npm install
```

**Problem**: Port 3000 is already in use
```bash
# Solution: Use different port
PORT=3001 npm start
```

#### Runtime Issues

**Problem**: Cards are not generating
- Check console for errors
- Verify card generation logic in `src/utils/cardGenerator.js`
- Ensure proper state management

**Problem**: Scores not updating
- Check `useScore` hook implementation
- Verify context provider is wrapping components
- Check browser console for state update errors

**Problem**: Anti-cheat false positives
- Review timing thresholds in configuration
- Check system clock synchronization
- Verify timestamp validation logic

#### Build Issues

**Problem**: Build fails
```bash
# Check for syntax errors
npm run lint

# Clear build cache
rm -rf build node_modules/.cache
npm run build
```

**Problem**: Out of memory during build
```bash
# Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### Getting Help

If you encounter issues:

1. Check existing [GitHub Issues](https://github.com/ginjaninja78/holiday-bingo-react/issues)
2. Search Stack Overflow with the error message
3. Create a new issue with detailed information
4. Join our community Discord (if available)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## 📞 Contact & Support

### Project Maintainer

- **GitHub**: [@ginjaninja78](https://github.com/ginjaninja78)
- **Email**: ginja.ninja@outlook.com

### Resources

- **Repository**: [https://github.com/ginjaninja78/holiday-bingo-react](https://github.com/ginjaninja78/holiday-bingo-react)
- **Issue Tracker**: [GitHub Issues](https://github.com/ginjaninja78/holiday-bingo-react/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ginjaninja78/holiday-bingo-react/discussions)

### Support

For support:
1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing [issues](https://github.com/ginjaninja78/holiday-bingo-react/issues)
3. Create a new issue if needed
4. Star ⭐ the project if you find it useful!

---

## 🎄 Happy Holidays and Happy Gaming! 🎮

Made with ❤️ by [ginjaninja78](https://github.com/ginjaninja78)

If you enjoy this project, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🤝 Contributing to the code
- 📢 Sharing with others

---

*Last Updated: December 2025*
