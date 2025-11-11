# 構築手順

## 初期化

```bash
npx @line/create-liff-app # frontendで作成
cd frontend
```

### 依存関係

```bash
npm i vuetify @mdi/font three socket.io-client
npm i -D sass vite-plugin-vuetify @types/three
```

### ビルドエラーのため依存関係調整

```bash
npm i vue@latest vue-router@latest vuetify@latest
npm i -D vite@latest @vitejs/plugin-vue@latest typescript@latest vue-tsc@latest
npm i -D vite-plugin-vuetify@latest sass@latest
```

### Netlifyにデプロイ

```bash
# テストビルド
npm run build
netlify deploy
# 本番デプロイ
netlify env:set LIFF_ID "Your LIFF ID"
npm run build
netlify build
netlify deploy --prod
```
