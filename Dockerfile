FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# パッケージのインストール（bcryptのネイティブビルドが不要に）
RUN npm install

COPY . .

# ビルド
RUN npm run build

# 起動コマンド
CMD ["npm", "run", "start:prod"]