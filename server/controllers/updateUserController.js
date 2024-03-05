const User = require('../model/User');
const Group = require('../model/Group');
const Conversation = require('../model/Conversation');


exports.updateUserController = async (req, res) => {
  const {oldUsername, newUsername, avatar, removeUserFromGroup} = req.body; 
  if(!newUsername && !avatar && !removeUserFromGroup?.length){
    return res.status(400).json({message:'Nothing to update'}); 
  }

  const foundUser = await User.findOne({username: oldUsername}).exec(); 
  if(foundUser){
    if(newUsername){
      foundUser.username = newUsername;

      if(avatar){
        foundUser.avatar = avatar;
      }

      const existingUser = await Group.findOne({
        $or: [
          { username: newUsername },
          { createdBy: newUsername }
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      const group = await Group.updateMany(
        {
          $or: [
            { username: oldUsername },
            { createdBy: oldUsername }
          ]
        },
        {
          $set: {
            'username.$[elem]': newUsername,
            'createdBy': newUsername
          }
        },
        {
          arrayFilters: [{ 'elem': oldUsername }]
        }
      );
      
      const conversations = await Conversation.find({
        $or: [
          { 'participants': oldUsername },
          { 'messages.sender': oldUsername }
        ]
      });
      
      for (let conversation of conversations) {
        const participantIndex = conversation.participants.indexOf(oldUsername);
        if (participantIndex !== -1) {
          conversation.participants[participantIndex] = newUsername;
        }
      
        conversation.messages.forEach(message => {
          if (message.sender === oldUsername) {
            message.sender = newUsername;
          }
        });
      
        await conversation.save();
      }
    } 
  
    foundUser.save(); 
  }

  if(removeUserFromGroup?.length > 0){
    let group = await Group.findById(removeUserFromGroup);
    group.username.pull(oldUsername);
    
    if (group.username.length === 1) {
      await Group.deleteOne({_id: removeUserFromGroup});
    } else {
      await group.save();
    }
  }
  
  
  console.log('done');
  return res.status(200).end(); 

};



exports.deleteUserController = async (req, res) => {
  const {usernameID} = req.query; 
 try {
   const foundUser = await User.findOne({_id: usernameID}).exec(); 
   
   if(!foundUser){
     return res.status(400).json({message: "User not found"}).end(); 
   }
   const username = foundUser.username; 
 
   await User.deleteOne({_id: usernameID}).exec();
 
 
   await Group.updateMany(
     {}, 
     {$pull: {username: username}}
   ).exec();
 
   await Conversation.updateMany(
     {}, 
     { $pull: { participants: username } }
   ).exec();
 
   await Conversation.updateMany(
     {}, 
     { $pull: { messages: { username: username } } }
   ).exec();
 } catch (error) {
    return res.status(400).json({message: 'Try again later'}).end(); 
 }

 return res.status(200).end(); 

}
