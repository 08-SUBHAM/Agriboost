const express = require('express');
const router = express.Router();
const Forum = require('../models/forum');
const { isAuthenticated } = require('../middleware/auth');

// Get all posts with filtering and sorting
router.get('/posts', isAuthenticated, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        
        const query = {};
        if (req.query.category) {
            query.category = req.query.category;
        }

        let sort = { createdAt: -1 }; // Default sort by most recent
        if (req.query.sort === 'popular') {
            sort = { 'likes.length': -1 };
        }

        const posts = await Forum.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('author', 'firstname surname');

        // Convert author field to string for each post
        const formattedPosts = posts.map(post => {
            const postObj = post.toObject();
            postObj.author = post.author._id.toString();
            return postObj;
        });

        const total = await Forum.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        res.json({
            posts: formattedPosts,
            currentPage: page,
            totalPages,
            hasMore: page < totalPages
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Create a new post
router.post('/posts', isAuthenticated, async (req, res) => {
    try {
        const { title, content, category } = req.body;
        
        const post = new Forum({
            title,
            content,
            category,
            author: req.user._id,
            authorName: `${req.user.firstname} ${req.user.surname}`
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Like/Unlike a post
router.post('/posts/:postId/like', isAuthenticated, async (req, res) => {
    try {
        const post = await Forum.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const userLikeIndex = post.likes.indexOf(req.user._id);
        if (userLikeIndex === -1) {
            // Like the post
            post.likes.push(req.user._id);
        } else {
            // Unlike the post
            post.likes.splice(userLikeIndex, 1);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        console.error('Error updating post likes:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Add a reply to a post
router.post('/posts/:postId/replies', isAuthenticated, async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Forum.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        post.replies.push({
            content,
            author: req.user._id,
            authorName: `${req.user.firstname} ${req.user.surname}`
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ error: 'Failed to add reply' });
    }
});

// Get a single post with replies
router.get('/posts/:postId', isAuthenticated, async (req, res) => {
    try {
        const post = await Forum.findById(req.params.postId)
            .populate('author', 'firstname surname')
            .populate('replies.author', 'firstname surname');
            
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Delete a post (only by the author)
router.delete('/posts/:postId', isAuthenticated, async (req, res) => {
    try {
        const post = await Forum.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Check if the current user is the author of the post
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this post' });
        }
        
        await Forum.findByIdAndDelete(req.params.postId);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

module.exports = router; 