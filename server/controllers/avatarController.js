const User = require('../model/User');
const Group = require('../model/Group');



exports.getAllUsers = async (req, res) => {
  const username = req.query.username; 
  try {
    const users = await User.find({}, 'username avatar'); 
    const groups = await Group.find({username: {$all: username}}); 

    const combinedData = [...users, ...groups];
    res.json(combinedData).end();  
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getUserByUsername = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ 'message': 'Username is required ' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ 'message': 'User not found' });
    }

    res.json(user).end();  
  } catch (error) {
    res.status(500).json({ 'message': 'Internal Server Error' });
  }
};
