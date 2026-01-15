const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let pythonProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // In development, load from Vite dev server
  // In production, load from built files
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function checkBackendHealth(retries = 10) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http.get('http://localhost:5000/api/health', (res) => {
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

  console.log('Starting Python backend...');
  pythonProcess = spawn('python3', [pythonScript], {
    cwd: path.join(__dirname, '..', 'backend')
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data.toString().trim()}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data.toString().trim()}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      console.error('Backend crashed! Please check the logs.');
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
