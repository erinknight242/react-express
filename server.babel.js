import express from 'express';
import getData from './getData';

const app = express();

app.use('/', express.static('public'));
app.use('/get', getData());

app.listen(process.env.PORT || 3000);
