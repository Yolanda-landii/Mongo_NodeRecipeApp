const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (requiredRoles = []) => async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || (requiredRoles.length > 0 && !requiredRoles.includes(user.role))) {
            return res.status(403).send({ message: 'Access denied' });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).send({ message: 'Authentication failed' });
    }
};



module.exports = auth;
