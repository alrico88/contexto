const { executeCommand } = require("./CmdService");

/**
 * @typedef DockerContext
 *
 * @property {boolean} Current
 * @property {string} Name
 * @property {string} Description
 * @property {string} DockerEndpoint
 * @property {string} ContextType
 */

class DockerService {
  /**
   * @param {string} dockerExecutable
   */
  constructor(dockerExecutable) {
    this.dockerExecutable = dockerExecutable;
  }

  /**
   * Lists available Docker contexts
   *
   * @return {Promise<DockerContext[]>}
   * @memberof DockerService
   */
  async listDockerContexts() {
    const list = await executeCommand(
      `${this.dockerExecutable} context ls --format=json`
    );

    return JSON.parse(list);
  }

  /**
   * Creates a new context
   * Docker command has a quirk that always returns an stderror.
   * Will check for expected response string instead
   *
   * @param {string} name
   * @param {string} description
   * @param {string} endpointProtocol
   * @param {string} endpointHost
   * @param {number} endpointPort
   * @return {Promise<string>}
   * @memberof DockerService
   */
  async createDockerContext(
    name,
    description,
    endpointProtocol,
    endpointHost,
    endpointPort
  ) {
    const expectedResponse = `Successfully created context "${name}"\n`;

    const endpoint = `${endpointProtocol}://${endpointHost}:${endpointPort}`;

    try {
      await executeCommand(
        `${this.dockerExecutable} context create ${name} --description "${description}" --docker "host=${endpoint}"`
      );

      return "ok";
    } catch (err) {
      if (err === expectedResponse) {
        return "ok";
      } else {
        throw err;
      }
    }
  }

  /**
   * Changes to desired context
   *
   * @param {string} contextName
   * @return {Promise<any>}
   * @memberof DockerService
   */
  changeCurrentDockerContext(contextName) {
    return executeCommand(
      `${this.dockerExecutable} context use ${contextName}`
    );
  }

  /**
   * Removes a context by label
   *
   * @param {string} contextName
   * @return {Promise<any>}
   * @memberof DockerService
   */
  deleteDockerContext(contextName) {
    return executeCommand(
      `${this.dockerExecutable} context remove ${contextName}`
    );
  }
}

module.exports = DockerService;
