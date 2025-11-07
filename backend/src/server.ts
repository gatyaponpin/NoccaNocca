import 'dotenv/config'
import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import { initSocket } from './realtime/socket'

const PORT = Number(process.env.PORT || 3000)
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

const app = express()
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

app.get('/healthz', (_req, res) => res.json({ ok: true }))

const server = http.createServer(app)

const io = new Server(server, {
  cors: { origin: CORS_ORIGIN },
})

// ソケット処理を外部に委譲
initSocket(io)

server.listen(PORT, () => {
  console.log(`Server listening on :${PORT} (CORS ${CORS_ORIGIN})`)
})