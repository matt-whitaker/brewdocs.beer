import path from 'path';
import express from 'express'

const app = express();
const port = process.env.PORT;

app.use('/static/assets', express.static(path.resolve(__dirname, 'static/assets')));
app.use('*', (_, res) => res.sendFile(path.resolve(process.cwd(), 'lib/static/index.html')));

app.listen(port, () => console.log(`Express started on port ${port}`));