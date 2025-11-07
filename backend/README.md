# セットアップ

mkdir -p backend && cd backend
npm init -y
npm i express socket.io cors dotenv
npm i -D typescript ts-node-dev @types/node @types/express @types/cors
npx tsc --init
