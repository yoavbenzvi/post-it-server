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

// =======================================
// imported functions
// =======================================

const { getUserId } = require('./controllers/get-user-id');
const { getUserInfo } = require('./controllers/get-user-info');
const { getAllPosts } = require('./controllers/get-all-posts');
const { getUserPosts } = require('./controllers/get-user-posts');
const { searchUser } = require('./controllers/search-user');
const { addLike } = require('./controllers/add-like');
const { removeLike } = require('./controllers/remove-like');
const { login } = require('./controllers/login');
const { register } = require('./controllers/register');
const { addPost } = require('./controllers/add-post');
const { deletePost } = require('./controllers/delete-post');

// =======================================
// Endpoints //
// =======================================

app.get('/get-user-id/:email', (req, res) => getUserId(req, res, db));
app.get('/get-user-info/:id', (req, res) => getUserInfo(req, res, db));
app.get('/get-all-posts', (req, res) => getAllPosts(req, res, db));
app.get('/get-user-posts/:id',(req, res) => getUserPosts(req, res, db));
app.get('/search-user/:name', (req, res) => searchUser(req, res, db));
app.patch('/add-like', (req, res) => addLike(req, res, db));
app.patch('/remove-like', (req, res) => removeLike(req, res, db));
app.post('/login', (req, res) => login(req, res, db, bcrypt));
app.post('/register', (req, res) => register(req, res, db, bcrypt));
app.post('/add-post', (req, res) => addPost(req, res, db));
app.delete('/delete-post/:id', (req, res) => deletePost(req, res, db));

// =======================================

app.listen(3001, () => {
	console.log('app is running on port 3001');
})