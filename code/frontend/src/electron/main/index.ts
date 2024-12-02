import { join } from "path";
import { existsSync } from "fs";
import { ChildProcessWithoutNullStreams, ProcessEnvOptions, spawn } from "child_process";

import { app, shell, BrowserWindow } from "electron";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";

let backendProcess: ChildProcessWithoutNullStreams | null = null;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: false
    }
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
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
};

const startBackend = () => {
  const resourcesDir = is.dev
    ? join(__dirname, "../../../../resources")
    : join(__dirname, "../../../../../app.asar.unpacked/resources");

  const rExecutable = join(resourcesDir, "r/bin/Rscript.exe");

  if (process.platform === "win32" && !existsSync(rExecutable)) {
    // check that R is available
    console.warn(`Could not find Rscript.exe at '${rExecutable}', continue anyway`);
  }

  const pythonDir = join(resourcesDir, "python");
  const pythonExecutableFile =
    process.platform === "win32" ? "decision-support-ui-backend.exe" : "decision-support-ui-backend";
  const pythonExecutable = join(pythonDir, pythonExecutableFile);

  if (!existsSync(pythonExecutable)) {
    console.warn(`Could not find python backend executable at '${pythonExecutable}', continue anyway`);
    return null;
  }

  const args: string[] = ["-p", "8000", "--host", "127.0.0.1"];
  if (process.platform === "win32") {
    args.push("-r", rExecutable);
  }

  const backendProcess = spawn(pythonExecutable, args, { cwd: pythonDir });
  backendProcess.stdout.pipe(process.stdout);
  backendProcess.stderr.pipe(process.stderr);

  return backendProcess;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  backendProcess = startBackend();
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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
  if (backendProcess !== null && backendProcess.exitCode == null) {
    backendProcess.kill();
  }
});
