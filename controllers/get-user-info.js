const getUserInfo = (req, res, db) => {

	//returning all data where id matches from 'users' table

	const { id } = req.params;

	db('*')
	.from('users')
	.where({id})
		.then(data => res.json(data[0]))
		.catch(err => res.status(400).json('error - get user info'))
}

module.exports = {
	getUserInfo
}