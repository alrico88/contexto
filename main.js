const { app, Menu, Tray, nativeImage } = require('electron');
const { exec } = require('child_process');
const path = require('path');

function executeCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }

      resolve(stdout);
    });
  });
}

let tray = null;

const quitApp = () => app.quit();

// TODO: Get executable from path / multi OS
const dockerExecutable =
  '/Applications/Docker.app/Contents/Resources/bin/docker';

function changeContext(contextName) {
  return executeCommand(`${dockerExecutable} context use ${contextName}`);
}

async function getDockerContexts() {
  const list = await executeCommand(
    `${dockerExecutable} context ls --format=json`,
  );
  const parsed = JSON.parse(list);

  return parsed.map((d) => {
    return {
      label: d.Name,
      checked: d.Current,
      type: 'radio',
      click: async ({ label }) => {
        await changeContext(label);
        tray.setTitle(label);
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

async function updateTray() {
  let contexts;

  try {
    contexts = await getDockerContexts();
  } catch (err) {
    console.error(err);
    contexts = [];
  }

  const permanentItems = [
    { label: '', type: 'separator' },
    { label: 'Refresh contexts', type: 'normal', click: updateTray },
    {
      label: 'Open at login',
      type: 'checkbox',
      checked: isOpenAtLoginEnabled(),
      click: () => {
        changeOpenOnStartup();
        updateTray();
      },
    },
    { label: 'Close', type: 'normal', click: quitApp },
  ];

  const contextMenu = Menu.buildFromTemplate([...contexts, ...permanentItems]);

  tray.setContextMenu(contextMenu);
  tray.setTitle(contexts.find((d) => d.checked).label);
}

const image = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));

app
  .whenReady()
  .then(async () => {
    if (app.dock) {
      app.dock.hide();
    }

    tray = new Tray(image.resize({ width: 16, height: 16 }));
    tray.setToolTip('Contexto');
    updateTray();
  })
  .catch((err) => {
    console.error(err);
  });
