# Investo Installation Guide

## For End Users (Using Installer)

### Windows

1. **Download the installer**: Get `Investo-Setup-1.0.0.exe` from the releases page
2. **Run the installer**: Double-click the .exe file
3. **Follow the installation wizard**:
   - Choose installation directory (or use default)
   - Select whether to create desktop shortcut
   - Click Install
4. **Launch Investo**: Use the desktop shortcut or Start menu

**Requirements:**
- Windows 10 or later (64-bit)
- Python 3.7+ must be installed ([Download Python](https://www.python.org/downloads/))
  - During Python installation, check "Add Python to PATH"

### macOS

1. **Download the installer**: Get `Investo-1.0.0.dmg` from the releases page
2. **Open the DMG file**: Double-click the downloaded file
3. **Drag Investo to Applications**: Drag the app icon to the Applications folder
4. **Launch Investo**: Open from Applications folder
5. **First launch**: Right-click and select "Open" if you see a security warning

**Requirements:**
- macOS 10.13 or later
- Python 3.7+ must be installed ([Download Python](https://www.python.org/downloads/))

### Linux

**AppImage (Recommended):**
1. **Download**: Get `Investo-1.0.0.AppImage` from the releases page
2. **Make executable**: `chmod +x Investo-1.0.0.AppImage`
3. **Run**: `./Investo-1.0.0.AppImage`

**Debian/Ubuntu (.deb):**
1. **Download**: Get `investo_1.0.0_amd64.deb` from the releases page
2. **Install**: `sudo dpkg -i investo_1.0.0_amd64.deb`
3. **Run**: `investo` or find in applications menu

**Requirements:**
- Ubuntu 18.04+, Debian 10+, or similar
- Python 3.7+ must be installed: `sudo apt install python3 python3-pip`

## For Developers (From Source)

### Prerequisites

- Node.js 16 or higher ([Download Node.js](https://nodejs.org/))
- Python 3.7 or higher ([Download Python](https://www.python.org/downloads/))
- Git ([Download Git](https://git-scm.com/downloads))

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd investo
   ```

2. **Run setup:**

   **Linux/macOS:**
   ```bash
   ./setup.sh
   ```

   **Windows:**
   ```batch
   setup.bat
   ```

3. **Start the application:**

   **Linux/macOS:**
   ```bash
   ./run.sh
   ```

   **Windows:**
   ```batch
   run.bat
   ```

### Building Installers

To create distributable installers:

**Windows:**
```batch
build-installer.bat
```

**Linux/macOS:**
```bash
./build-installer.sh
```

Installers will be created in `frontend/release/`

## Troubleshooting

### Python Not Found

**Windows:**
- Download Python from python.org
- During installation, check "Add Python to PATH"
- Restart your terminal/command prompt

**macOS:**
- Install via Homebrew: `brew install python3`
- Or download from python.org

**Linux:**
- Ubuntu/Debian: `sudo apt install python3 python3-pip`
- Fedora: `sudo dnf install python3 python3-pip`

### Backend Won't Start

1. Check Python is installed: `python3 --version`
2. Install dependencies manually:
   ```bash
   cd backend
   pip3 install -r requirements.txt
   ```

### Port Already in Use

If port 5000 is already in use:
1. Stop other applications using port 5000
2. Or modify `backend/app.py` to use a different port
3. Update `frontend/src/App.jsx` with the same port

### Electron Won't Start

1. Check Node.js is installed: `node --version`
2. Reinstall dependencies:
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   ```

## Getting Help

- Report issues: [GitHub Issues](https://github.com/<your-repo>/investo/issues)
- Read documentation: See README.md and ARCHITECTURE.md
- Check logs: Look in the terminal/console for error messages

## Uninstallation

**Windows:**
- Use "Add or Remove Programs" in Windows Settings
- Or run the uninstaller from the installation directory

**macOS:**
- Drag Investo from Applications to Trash
- Empty Trash

**Linux:**
- AppImage: Just delete the file
- DEB: `sudo apt remove investo`
