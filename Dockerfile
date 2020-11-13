FROM node:12

EXPOSE 8888

LABEL maintainer.name="Umesh Timalsina"\
      maintainer.email="umesh.timalsina@vanderbilt.edu"

SHELL ["/bin/bash", "-c"]

ADD . /webgme

WORKDIR /webgme

RUN npm install -g npm

RUN npm config set unsafe-perm true && npm install

ENTRYPOINT NODE_ENV=production npm start

