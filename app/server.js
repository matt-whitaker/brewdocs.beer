import os from 'os';

import cluster from 'cluster';

import app from './app';

const maxSpawnCount = process.env.NODE_ENV === 'production' ? os.cpus().length : 1;
const spawnCount = process.env.SPAWN_COUNT || maxSpawnCount;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is starting...`);

    for (let i = 0; i < spawnCount; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with ${code}, replacing...`);
        cluster.fork();
    });
} else {
    console.log(`Worker ${process.pid} is starting...`);

    app.create();
}
