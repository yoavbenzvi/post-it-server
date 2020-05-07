const getAllPosts = (req, res, db) => {

	//returns all posts from 'posts' table

	db('*')
	.from('posts')
		.then(data => {
			res.json(data)
		})
		.catch(err => res.status(400).json('error - get all posts'))
}

module.exports = {
	getAllPosts
}