const { join } = require('path');
const express = require('express');
const staticDir = join(__dirname, '../../../node_modules/@cryptographix');
const port = 8080;

const app = express();

app.use('/assets', express.static(join(__dirname,'../assets')));

app.use('/app', express.static(join(__dirname,'../dist')));

app.use('/lib/cryptographix', express.static(staticDir));
app.use('/lib', express.static(join(__dirname, '../../../node_modules/')));

app.use(express.static(join(__dirname,'../src')));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
