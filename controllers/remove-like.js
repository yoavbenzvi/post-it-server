const removeLike = (req, res, db) => {

	//removing the voter's email to the 'likes' array of 
	//post, which is found by id.
	//returning all posts

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
}

module.exports = {
	removeLike
}