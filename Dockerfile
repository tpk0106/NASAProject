FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

COPY client/package*.json client/
RUN npm run install-client --omit=dev
# RUN npm install --prefix client --omit=dev

COPY server/package*.json server/
RUN npm run install-server --omit=dev

RUN npm install dotenv

COPY client/ client/
RUN npm run build --prefix client
# this line below is to copy public folder in linux way since above code is not working
RUN npm run build_linux --prefix client 

COPY server/ server/

USER node 

CMD ["npm", "start", "--prefix", "server"]

EXPOSE 8000
