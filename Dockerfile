# Uses the node base image with the latest LTS version
FROM node:14
# Informs Docker that the container listens on the
# specified network ports at runtime
EXPOSE 3000


ARG NPM_TOKEN

# Changes working directory to the new directory just created
WORKDIR /web-app
COPY . /web-app


# Installs yarn dependencies on container
# RUN yarn --production
RUN yarn
# RUN yarn add browserify

RUN yarn build:server
# Command container will actually run when called
# CMD ["yarn", "start"]
CMD ["yarn", "start:dev"]
# CMD ["tail", "-f", "/dev/null"]