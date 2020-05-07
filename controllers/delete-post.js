const deletePost = (req, res, db) => {

	//creating a transaction, post is removed from 'posts' with id,
	//then removing from 'posts' array of user where email matches,
	//responding with all posts

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
}

module.exports = {
	deletePost
}