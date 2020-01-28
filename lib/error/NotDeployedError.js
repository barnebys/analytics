const NOT_DEPLOYED = 'NOT_DEPLOYED';

class NotDeployedError extends Error {
    constructor() {
        super();
        this.code = NOT_DEPLOYED;
        this.message = 'Project must be deployed to ZEIT Now';
    }
}

export default NotDeployedError