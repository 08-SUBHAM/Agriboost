const jwt = require('jsonwebtoken');
const User = require('../models/user');

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            // Clear any existing user data
            res.locals.user = null;
            req.user = null;
            
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "shhhhhhhhhh");
        const user = await User.findById(decoded.id);
        
        if (!user) {
            // Clear invalid token and user data
            res.clearCookie("token", {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                path: '/'
            });
            res.locals.user = null;
            req.user = null;
            
            if (req.path.startsWith('/api/')) {
                return res.status(401).json({ error: 'User not found' });
            }
            return res.redirect('/login');
        }

        // Add user info to request object and locals
        req.user = {
            _id: user._id,
            email: user.email || '',
            firstname: user.firstname || '',
            surname: user.surname || ''
        };
        res.locals.user = req.user;

        next();
    } catch (error) {
        // Clear invalid token and user data
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            path: '/'
        });
        res.locals.user = null;
        req.user = null;
        
        if (req.path.startsWith('/api/')) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        return res.redirect('/login');
    }
};

module.exports = { isAuthenticated }; 