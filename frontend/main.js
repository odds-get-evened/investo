const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let pythonProcess;

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Portfolio',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-portfolio');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/odds-get-evened/investo');
          }
        },
        { type: 'separator' },
        {
          label: 'About Investo',
          click: () => {
            const aboutWindow = new BrowserWindow({
              width: 400,
              height: 300,
              resizable: false,
              minimizable: false,
              maximizable: false,
              title: 'About Investo'
            });
            aboutWindow.setMenu(null);
            aboutWindow.loadURL(`data:text/html;charset=utf-8,
              <html>
                <head>
                  <style>
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      height: 100vh;
                      margin: 0;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      text-align: center;
                    }
                    h1 { margin: 10px 0; }
                    p { margin: 5px 0; }
                  </style>
                </head>
                <body>
                  <h1>Investo</h1>
                  <p>Version 1.0.0</p>
                  <p>Your Personal Stock Portfolio Manager</p>
                  <br>
                  <p style="font-size: 12px; opacity: 0.8;">Built with Electron, React, and Python Flask</p>
                  <p style="font-size: 12px; opacity: 0.8;">© 2026 Investo Contributors</p>
                </body>
              </html>
            `);
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Investo - Stock Portfolio Manager',
    backgroundColor: '#f5f5f5',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'public', 'icon.png')
  });

  // Create application menu
  createMenu();

  // In development, load from Vite dev server
  // In production, load from built files
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function checkBackendHealth(retries = 10) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http.get('http://localhost:5555/api/health', (res) => {
        if (res.statusCode === 200) {
          console.log('Backend is ready!');
          resolve();
        } else {
          retry();
        }
      }).on('error', () => {
        retry();
      });
    };

    const retry = () => {
      if (retries > 0) {
        retries--;
        console.log(`Waiting for backend... (${10 - retries}/10)`);
        setTimeout(attempt, 1000);
      } else {
        reject(new Error('Backend failed to start'));
      }
    };

    attempt();
  });
}

function startPythonBackend() {
  const pythonScript = path.join(__dirname, '..', 'backend', 'app.py');

  // Use 'python' on Windows, 'python3' on Unix-like systems
  const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

  console.log('Starting Python backend...');
  console.log('Python command:', pythonCommand);
  console.log('Script path:', pythonScript);
  console.log('Working directory:', path.join(__dirname, '..', 'backend'));

  // Use -u flag to run Python in unbuffered mode (important for subprocess output)
  pythonProcess = spawn(pythonCommand, ['-u', pythonScript], {
    cwd: path.join(__dirname, '..', 'backend'),
    shell: process.platform === 'win32', // Use shell on Windows for better compatibility
    env: { ...process.env, PYTHONUNBUFFERED: '1' } // Ensure unbuffered output
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data.toString().trim()}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data.toString().trim()}`);
  });

  pythonProcess.on('error', (error) => {
    console.error('Failed to start Python process:', error);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      console.error('Backend crashed! Please check the logs above.');
    }
  });
}

app.on('ready', async () => {
  startPythonBackend();

  try {
    await checkBackendHealth();
    createWindow();
  } catch (error) {
    console.error('Failed to start backend:', error);
    app.quit();
  }
});

app.on('window-all-closed', function () {
  if (pythonProcess) {
    pythonProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});
