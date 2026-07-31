const { spawnSync, spawn } = require('child_process')

console.log('[startup] Running database migrations...')

const migration = spawnSync(
  'node',
  ['node_modules/prisma/build/index.js', 'migrate', 'deploy'],
  { stdio: 'inherit', env: process.env }
)

if (migration.status !== 0) {
  console.error(
    `[startup] WARNING: prisma migrate deploy exited with code ${migration.status}. ` +
    'Manual intervention may be required. Starting Next.js anyway.'
  )
} else {
  console.log('[startup] Migrations applied successfully.')
}

const server = spawn(
  'node',
  ['node_modules/next/dist/bin/next', 'start'],
  { stdio: 'inherit', env: process.env }
)

server.on('exit', (code) => process.exit(code ?? 0))
