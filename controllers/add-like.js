const addLike = (req, res, db) => {

	//adding the voter's email to the 'likes' array of 
	//post, which is found by id.
	//returning all posts

	const { id, email } = req.body;

	db.select('likes')
	.from('posts')
	.where({id})
		.then(oldLikesArray => {
			const newLikesArray = [...oldLikesArray[0].likes, email]

			db.select('*')
			.from('posts')
			.where({id})
			.update({likes: newLikesArray})
				.then(() => {
					db('*')
					.from('posts')
					.then(data => res.json(data))
				})
				.catch(err => res.status(500).json('error - add like'))
		})
		.catch(err => res.status(400).json('error - add like'))
}

module.exports = {
	addLike
}