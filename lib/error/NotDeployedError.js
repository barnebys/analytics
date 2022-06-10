const NOT_DEPLOYED = "NOT_DEPLOYED";
/**
 * Deprecated as the service moved to azure
 */
class NotDeployedError extends Error {
  constructor() {
    super();
    this.code = NOT_DEPLOYED;
    this.message = "Project must be deployed to ZEIT Now";
  }
}

export default NotDeployedError;
