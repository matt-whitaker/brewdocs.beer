import os from 'os';

import cluster from 'cluster';

import app from './app';

const spawnCount = process.env.SPAWN_COUNT || os.cpus().length;

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
