FROM node:20-bookworm
RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /app
COPY package*.json./
RUN npm install --production
COPY..
CMD ["sh","start.sh"]
