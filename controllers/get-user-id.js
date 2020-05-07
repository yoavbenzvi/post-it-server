const getUserId = (req, res, db) => {

	//checking for email on 'users' table and returns id

	const { email } = req.params;

	db.select('id')
	.from('users')
	.where({email})
		.then(id => {
			res.json(id[0].id)
		})
		.catch(err => res.status(400).json('error - get user id'))
}

module.exports = {
	getUserId
}