const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '',
    database : 'post-it'
  }
});

const app = express();
app.use(express.json())
app.use(cors())

app.listen(3001, () => {
	console.log('app is running on port 3001');
})