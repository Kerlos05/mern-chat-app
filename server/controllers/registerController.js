const User = require('../model/User');
const argon2 = require('argon2');

const handleNewUser = async (req, res) => {
    const {base64, pwd, user} =  req.body; 

    if (!user || !pwd) {
        return res.status(400).json({ 'message': 'Username and password are required.' });
    }

    const duplicate = await User.findOne({ username: user }).exec();
    if (duplicate) {
        return res.status(409).json({ 'message': 'Username already exists' });
    }

    try {
        
        const hashedPwd = await argon2.hash(pwd);
        await User.create({
            "username": user,
            "password": hashedPwd,
            'avatar': base64
        });

    
        res.status(201).json({ 'success': `New user ${user} created!` }).end();
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports =  handleNewUser ;