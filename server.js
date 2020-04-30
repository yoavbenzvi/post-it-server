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

// Endpoint

// app.get('/get-user/:email', (req, res) => {
// 	const { email } = req.params;



// 	res.json(email)
// })

// Sign in to app
app.post('/login', (req, res) => {
	const { email, password } = req.body;

	// should turn email to lowercase in front end
		const emailForNow = email.toLowerCase()
	//
	if(!email || !password) {
		console.log('should actually throw error')

		//error something went wrong return modal popper
	}


	db.select('*')
	.from('login')
	.where({email: emailForNow}/*NOTICE - to change*/)
		.then(data => {

			const isValid = bcrypt.compareSync(password, data[0].hash)

			if(isValid) {
				db.select('*')
				.from('users')
				.where({email: emailForNow}/*NOTICE - to change*/)
					.then(user => {
						res.json(user[0])
					})
					.catch(/* error user not found */ )
			}
		})
		.catch(/* error is in credentials */ )
})


//Register to app
app.post('/register', (req, res) => {
	const { email, password, name } = req.body;

	if(!email || !name || !password) {
		return res.status(400).json(/*ERROR*/)
	}

	const hash = bcrypt.hashSync(password);

	db.transaction(trx => {
		trx
		.insert({
			email: email.toLowerCase(),
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
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(/*ERROR*/)

})

// 'sign-in' - done
// 'register' - done
// 'get-all-posts'
// 'get-user-posts'
// 'get-user-data'
// 'add-post'
// 'delete-post'
// 'add-like'
// 'remove-like'

//

app.listen(3001, () => {
	console.log('app is running on port 3001');
})