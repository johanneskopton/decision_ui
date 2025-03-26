import * as path from "path";
import * as fs from "fs";
import * as net from "net";
import * as child_process from "child_process";

import { app, shell, BrowserWindow, ipcMain } from "electron";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";

/**
 * Returns a random free port to be used for the python backend.
 *
 * Create a temporary server socket with the port "0", indicating that
 * the operating system should choose a random free port and immediately
 * stops the socket again.
 *
 * @returns port number
 */
const findPort = async (): Promise<number> => {
  return new Promise<number>(resolve => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const port = (srv.address() as net.AddressInfo).port;
      srv.close(() => {
        resolve(port);
      });
    });
  });
};

/**
 * Return the file path to the backend executable.
 *
 * @returns path to backend executable
 */
const getBackendPath = () => {
  const resourcesDir = is.dev
    ? path.join(__dirname, "../../../../resources")
    : path.join(__dirname, "../../../../../app.asar.unpacked/resources");

  const backendDir = path.join(resourcesDir, "decision-support-ui-backend");
  const pythonExecutableFile =
    process.platform === "win32" ? "decision-support-ui-backend.exe" : "decision-support-ui-backend";
  const pythonExecutable = path.join(backendDir, pythonExecutableFile);

  if (!fs.existsSync(pythonExecutable)) {
    console.warn(`Could not find python backend executable at '${pythonExecutable}', continue anyway`);
    return null;
  }

  return pythonExecutable;
};

/**
 * Returns the file path to the sqlite database file (considering the operating system file system layout).
 *
 * On Windows: %APPDATA%\decision-support-ui\decision-support-ui-backend.db
 * On Linux: $XDG_CONFIG_HOME/decision-support-ui/decision-support-ui-backend.db
 * On Mac: ~/Library/Application Support/decision-support-ui/decision-support-ui-backend.db
 *
 * See: https://www.electronjs.org/docs/latest/api/app#appgetpathname
 *
 * @returns the file path to the sqlite database file
 */
const getDatabasePath = () => {
  return path.join(app.getPath("userData"), "decision-support-ui-backend.db");
};

/**
 * Starts the python backend if possible.
 *
 * @param port the port for the REST api of the backend
 * @returns the backend process or null
 */
const startBackend = (port: number) => {
  const databasePath = getDatabasePath();
  const backendPath = getBackendPath();

  if (backendPath) {
    const backendProcess = child_process.spawn(
      backendPath,
      ["-p", "" + port, "--host", "127.0.0.1", "-s", databasePath],
      { cwd: path.dirname(backendPath) }
    );

    // forward stdout and stderr to electron process
    backendProcess.stdout.pipe(process.stdout);
    backendProcess.stderr.pipe(process.stderr);

    return backendProcess;
  }

  return null;
};

/**
 * Create the electron window.
 *
 * @param backendPort the port for the backend REST api
 */
const createWindow = async (backendPort: number) => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.mjs"),
      sandbox: false
    }
  });

  ipcMain.handle("getBackendBaseURL", () => {
    return `http://127.0.0.1:${backendPort}`;
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
};

/**
 * Run the electron app.
 */
const run = async () => {
  const backendPort = await findPort();
  const backendProcess = startBackend(backendPort);

  app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId("com.electron");

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on("browser-window-created", (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    createWindow(backendPort);

    app.on("activate", function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow(backendPort);
      }
    });
  });

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("quit", () => {
    if (backendProcess !== null) {
      try {
        backendProcess.kill();
      } catch {
        // ignore any errors and hope for the best
      }
    }
  });
};

run();
