const argon2 = require('argon2');
const User = require('../model/User');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    const user = req.body.username;
    const pwd = req.body.password;
    if (!user || !pwd) {
        return res.status(400).json({ 'message': 'Username and password are required.' });
    }

    const foundUser = await User.findOne({ username: user }).exec();
    if (!foundUser) {
        return res.status(401).json({ 'message': 'Password or username are incorrect.' });
    }

    const match = await argon2.verify(foundUser.password, pwd); 
    
    if (match) {
        const payload = { 
            username: foundUser.username,
            id: foundUser._id
         }; 
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1000s' 
        });

        return res.status(200).json({token: token, username: foundUser.username});
    } else {
        return res.status(401).json({'message': 'Password or username are incorrect.'});
    }
}



module.exports =  {handleLogin} ;