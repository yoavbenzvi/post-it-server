const addPost = (req, res, db) => {

	//creating a transaction, new post is created,
	//serial id returned from creation and added to 
	//user's 'posts' column in 'users',
	//responding with all posts

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

}

module.exports = {
	addPost
}