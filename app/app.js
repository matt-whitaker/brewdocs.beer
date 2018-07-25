import path from 'path';
import express from 'express'

function createApp () {
    return new Promise((res) => {
        const app = express();
        const port = process.env.PORT;

        /**
         * Serve static assets
         * @todo Serve assets from Nginx proxy
         */
        app.use('/static/assets', express.static(path.resolve(__dirname, 'static/assets')));

        /**
         * Serve the app for rest of routes
         * @todo Add server-side rendering for app
         */
        app.use('*', (_, res) => res.sendFile(path.resolve(process.cwd(), 'lib/static/index.html')));

        /**
         * Start the application
         */
        app.listen(port, () => {
            console.log(`Express started on port ${port}`);
            res(app);
        });
    })
}

export default {
    create: createApp
};