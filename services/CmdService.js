const { exec } = require("child_process");

function executeCommand(cmd, ignoreStdErrors = false) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        reject(error.message);
        return;
      }
      if (stderr && !ignoreStdErrors) {
        reject(stderr);
        return;
      }

      resolve(stdout);
    });
  });
}

module.exports = {
  executeCommand,
};
