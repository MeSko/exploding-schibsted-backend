FROM node:12.16
USER node
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
WORKDIR /home/node/app
COPY --chown=node:node ./ /home/node/app/
EXPOSE 4000
ENV PORT 4000
ENV TS_NODE_TRANSPILE_ONLY true
ENV TS_NODE_SKIP_IGNORE true
ENV DEBUG API*
ENV DEBUG_DEPTH=15

RUN npm install pm2 -g
CMD [ "npm", "run", "start:prod" ]
