const { join } = require('path');
const express = require('express');
const staticDir = join(__dirname, '../../../node_modules/@cryptographix');

const port = 8080;

const app = express();
//app.set('view engine', 'html');
app.use('/lib/cryptographix', express.static(staticDir));
app.use('/lib', express.static(join(__dirname, '../../../node_modules/')));
app.use(express.static(join(__dirname,'../src')));
//app.use((req, res, next) => {
//    res.render('index');
//});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
