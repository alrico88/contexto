/**
 * Handles the situation of an already open browser window
 *
 * @param {import('electron').BrowserWindow} win
 * @return {boolean}
 */
function handleAlreadyOpen(win) {
  if (win != null) {
    win.show();
    win.focus();

    return true;
  }

  return false;
}

/**
 * Parses Docker contexts for renderer frontend
 *
 * @param {import('./DockerService').DockerContext[]} contexts
 * @return {{label: string, description: string, endpoint: string, current: boolean}[]}
 */
function parseContextsForRenderer(contexts) {
  return contexts.map((d) => {
    return {
      label: d.Name,
      description: d.Description,
      endpoint: d.DockerEndpoint,
      current: d.Current,
    };
  });
}

module.exports = {
  handleAlreadyOpen,
  parseContextsForRenderer,
};
