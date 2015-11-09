# Dockerfile to create a docker image
FROM node

# Add files to the image
RUN mkdir -p /opt/nodejs
ADD . /opt/nodejs
RUN cd /opt/nodejs && npm install
WORKDIR /opt/nodejs

# Expose the container port
# EXPOSE 3000

ENTRYPOINT ["node", "app.js"]
