const getUserPosts = (req, res, db) => {

	//finding email where id matches in 'users' 
	//then matches every post with returned email and in 'posts'
	//and returns it

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
}

module.exports = {
	getUserPosts
}