const {
  app,
  Menu,
  Tray,
  nativeImage,
  BrowserWindow,
  ipcMain,
} = require("electron");
const path = require("path");
const DockerService = require("./services/DockerService");
const {
  handleAlreadyOpen,
  parseContextsForRenderer,
} = require("./services/UiService");

let tray = null;

const quitApp = () => app.quit();

// TODO: Get executable from path / multi OS
const dockerExecutable =
  "/Applications/Docker.app/Contents/Resources/bin/docker";

const dockerService = new DockerService(dockerExecutable);

async function populateDockerContexts() {
  const list = await dockerService.listDockerContexts();

  return list.map((d) => {
    return {
      label: d.Name,
      description: d.Description,
      endpoint: d.DockerEndpoint,
      checked: d.Current,
      type: "radio",
      click: async ({ label }) => {
        await dockerService.changeCurrentDockerContext(label);
        tray.setTitle(label);
        sendContextsList();
      },
    };
  });
}

function isOpenAtLoginEnabled() {
  return app.getLoginItemSettings().openAtLogin;
}

function changeOpenOnStartup() {
  const currently = isOpenAtLoginEnabled();

  app.setLoginItemSettings({
    openAtLogin: !currently,
  });
}

/** @type {import('electron').BrowserWindow} */
let manageWin;
/** @type {import('electron').BrowserWindow} */
let createWin;

const commonWindowPrefs = {
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
  },
};

function openManageWindow() {
  if (handleAlreadyOpen(manageWin)) {
    return;
  }

  manageWin = new BrowserWindow({
    width: 800,
    height: 600,
    ...commonWindowPrefs,
  });

  manageWin.loadFile("manage.html");

  manageWin.on("close", () => {
    manageWin = null;
  });
}

function openCreateWindow() {
  if (handleAlreadyOpen(createWin)) {
    return;
  }

  createWin = new BrowserWindow({
    width: 500,
    height: 300,
    ...commonWindowPrefs,
    useContentSize: true,
  });

  createWin.loadFile("create.html");

  createWin.on("close", () => {
    createWin = null;
  });
}

ipcMain.on("open-create-window", openCreateWindow);

async function sendContextsList() {
  const contexts = await dockerService.listDockerContexts();

  const contextsList = parseContextsForRenderer(contexts);

  if (manageWin != null) {
    manageWin.webContents.send("update-contexts-list", contextsList);
  }
}

ipcMain.on("get-contexts", () => {
  sendContextsList();
});

async function updateTray() {
  let contexts;

  try {
    contexts = await populateDockerContexts();
  } catch (err) {
    console.error(err);
    contexts = [];
  }

  const permanentItems = [
    { label: "", type: "separator" },
    { label: "Manage contexts", type: "normal", click: openManageWindow },
    { label: "", type: "separator" },
    { label: "Refresh contexts", type: "normal", click: updateTray },
    {
      label: "Open at login",
      type: "checkbox",
      checked: isOpenAtLoginEnabled(),
      click: () => {
        changeOpenOnStartup();
        updateTray();
      },
    },
    { label: "Close", type: "normal", click: quitApp },
  ];

  const contextMenu = Menu.buildFromTemplate([...contexts, ...permanentItems]);

  tray.setContextMenu(contextMenu);
  tray.setTitle(contexts.find((d) => d.checked).label);

  sendContextsList();
}

ipcMain.on("create-context", async (event, contextData) => {
  const { label, description, protocol, host, port } = contextData;

  try {
    await dockerService.createDockerContext(
      label,
      description,
      protocol,
      host,
      port
    );

    event.returnValue = "ok";
  } catch (err) {
    event.returnValue = err;
  }

  updateTray();
});

ipcMain.on("use-context", async (event, contextName) => {
  await dockerService.changeCurrentDockerContext(contextName);

  updateTray();
});

ipcMain.on("delete-context", async (event, contextName) => {
  event.returnValue = await dockerService.deleteDockerContext(contextName);

  updateTray();
});

const image = nativeImage.createFromPath(path.join(__dirname, "icon.png"));

app
  .whenReady()
  .then(async () => {
    if (app.dock) {
      app.dock.hide();
    }

    tray = new Tray(image.resize({ width: 16, height: 16 }));
    tray.setToolTip("Contexto");
    updateTray();
  })
  .catch((err) => {
    console.error(err);
  });

app.on("window-all-closed", () => {
  // Nothing
});
