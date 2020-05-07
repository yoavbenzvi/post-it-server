const register = (req, res, db, bcrypt) => {

	//creates a transaction, creating a login column in 'login'
	//and user column in 'users'

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
}

module.exports = {
	register
}