FROM node:12

EXPOSE 8888

LABEL maintainer.name="Umesh Timalsina"\
      maintainer.email="umesh.timalsina@vanderbilt.edu"

SHELL ["/bin/bash", "-c"]

ADD . /webgme

WORKDIR /webgme

RUN chmod +x utils/install-miniconda.sh && ./utils/install-miniconda.sh

ENV PATH /root/miniconda3/bin:$PATH

RUN conda init && conda env create --file environment.yml

RUN source activate electric-circuits && ./utils/install-graphgym.sh

RUN npm install -g npm

RUN npm config set unsafe-perm true && npm install &&  npm config set script-shell /bin/bash

ENTRYPOINT NODE_ENV=production npm start
