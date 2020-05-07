const searchUser = (req, res, db) => {

	//returning match from 'users' for name

	const { name } = req.params;

	db('*')
	.from('users')
	.where('name', 'ilike', `${name}%`)
		.then(data => {
			res.json(data)
		})
		.catch(err => res.status(400).json('error - search user'))	
}

module.exports = {
	searchUser
}