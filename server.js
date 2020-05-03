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
// Endpoints //
// =======================================


// Getting user's id

app.get('/get-user-id/:email', (req, res) => {
	const { email } = req.params;

	db.select('id')
	.from('users')
	.where({email})
		.then(id => {
			res.json(id[0].id)
		})
		.catch(err => res.status(400).json('error - get user id'))
})

// =======================================

//Getting user's data

app.get('/get-user-info/:id',(req, res) => {
	const { id } = req.params;

	db('*')
	.from('users')
	.where({id})
		.then(data => res.json(data[0]))
		.catch(err => res.status(400).json('error - get user info'))
})

// =======================================


//Getting all posts

app.get('/get-all-posts',(req, res) => {
	db('*')
	.from('posts')
		.then(data => {
			res.json(data)
		})
		.catch(err => res.status(400).json('error - get all posts'))
})

// =======================================

//Get user specific posts
app.get('/get-user-posts/:id',(req, res) => {
	const { id } = req.params;

	db.select('email')
	.from('users')
	.where({id})
		.then(email => {
			db.select('*')
			.from('posts')
			.where({email: email[0].email})
				.then(data => res.json(data))
		})
		.catch(err => res.status(400).json('error - get user posts'))

})

// =======================================

//Search user
app.get('/search-user/:name', (req, res) => {
	const { name } = req.params;

	db('*')
	.from('users')
	.where('name', 'ilike', `${name}%`)
		.then(data => {
			res.json(data)
		})
		.catch(err => res.status(400).json('error - search user'))	
})


// =======================================

//Add a like to a post

app.patch('/add-like', (req, res) => {
	const { id, email } = req.body;

	db.select('likes')
	.from('posts')
	.where({id})
		.then(oldLikesArray => {
			const newLikesArray = [...oldLikesArray[0].likes, email]

			db.select('*')
			.from('posts')
			.where({id})
			.update({likes: newLikesArray})
				.then(() => {
					db('*')
					.from('posts')
					.then(data => res.json(data))
				})
				.catch(err => res.status(500).json('error - add like'))
		})
		.catch(err => res.status(400).json('error - add like'))
})
// =======================================

//Remove a like from a post

app.patch('/remove-like', (req, res) => {
	const { id, email } = req.body;

	db.select('likes')
	.from('posts')
	.where({id})
		.then(oldLikesArray => {
			const newLikesArray = oldLikesArray[0].likes.filter(voter => voter !== email)

			db.select('*')
			.from('posts')
			.where({id})
			.update({likes: newLikesArray})
				.then(() => {
					db('*')
					.from('posts')
					.then(data => res.json(data))
				})
				.catch(err => res.status(500).json('error - remove like'))
		})
		.catch(err => res.status(400).json('error - remove like'))
})
// =======================================

// Sign in to app

app.post('/login', (req, res) => {
	const { email, password } = req.body;

	if(!email || !password) {
		res.status(400).json('error - missing credentials')
	}


	db.select('*')
	.from('login')
	.where({email})
		.then(data => {

			const isValid = bcrypt.compareSync(password, data[0].hash)

			if(isValid) {
				db.select('*')
				.from('users')
				.where({email})
					.then(user => {
						res.json(user[0])
					})
					.catch(err => res.status(500).json('login - response error'))
			}
		})
		.catch(err => res.status(400).json('login - DB error'))
})

// =======================================

//Register to app

app.post('/register', (req, res) => {
	const { email, password, name } = req.body;

	if(!email || !name || !password) {
		return res.status(400).json(new Error('error - missing credentials'))
	}

	const hash = bcrypt.hashSync(password);

	db.transaction(trx => {
		trx
		.insert({
			email,
			hash
		})
		.into('login')
		.then(() => {
			return trx('users')
			.returning('*')
			.insert({
				email: email.toLowerCase(),
				name,
				joined: new Date().toString().substring(0, 10)
			})
				.then(user => {
					res.json(user[0])
				})
				.catch(err => res.status(500).json('register - response error'))
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('register - DB error'))

})

// =======================================

// Add a new post

app.post('/add-post', (req, res) => {
	const { email, name, content } = req.body;

	db.transaction(trx => {
		trx.insert({
			email,
			content,
			name,
			created: new Date().toString().substring(0, 10)
		})
		.into('posts')
		.returning('id')
			.then(id => {
				return trx
				.select('posts')
				.from('users')
				.where({email: email})
					.then(oldPostsArray => {
						const newPostsArray = [...oldPostsArray[0].posts, id[0]]
						return trx('users')
						.where({email: email})
						.update({posts: newPostsArray})
						.returning('*')
							.then(() => {
								db('*')
								.from('posts')
									.then(data => res.json(data))
							})
							.catch(err => res.status(400).json('error - post response'))

					})
					.then(trx.commit)
					.catch(trx.rollback)
			})
			.catch(err => res.status(500).json('error - post DB'))
	})

})

// =======================================

//Delete a post

app.delete('/delete-post/:id', (req, res) => {
	const { id } = req.params;

	//finding and removing the post from 'posts' by id
	db.transaction(trx => {
		trx('posts')
		.where({id})
		.del()
		.returning('email')
			.then(userEmail => {
				//returning the post's email and finding the user by email
				return trx.select('posts')
				.from('users')
				.where({email: userEmail[0]})
					.then( oldPostsArray => {
						newPostsArray = oldPostsArray[0].posts.filter(postId => postId !== id);
						// removing post from user's posts array
						return trx('users')
						.where({email: userEmail[0]})
						.update({ posts: newPostsArray})
							.then(() => {
								db('*')
								.from('posts')
									.then(data => res.json(data))
							})
							.catch(err => res.status(400).json('error - post delete'))
					})
					.then(trx.commit)
					.catch(trx.rollback)
			})	
			.catch(err => res.status(400).json('error - post delete'))
	})
})

// =======================================
// =======================================


app.listen(3001, () => {
	console.log('app is running on port 3001');
})