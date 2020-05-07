const login = (req, res, db, bcrypt) => {

	//comparing hash to password where email matches in 'login',
	//if true returns user from 'users' where email matches

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
			} else {
				res.status(400).json('login - wrong credentials')
			}
		})
		.catch(err => res.status(400).json('login - DB error'))
}

module.exports = {
	login
}