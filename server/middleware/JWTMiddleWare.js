const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();


router.post('/', (req,res,next)=> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json('No token provided');
    }
    const token = authHeader.split(' ')[1]; 
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json('Failed to authenticate token');
        }
        req.userId = decoded.id;
        return res.status(200).json('Token authenticated successfully');
    });
});


module.exports = router;

