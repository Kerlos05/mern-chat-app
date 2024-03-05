
const Conversation = require('../model/Conversation');


const deleteMessage = async(req, res) => {
  const messageID = req.body.messageID;
  const selectedUser = req.body.selectedUser;

  try {
    const deletedMessage = await Conversation.findByIdAndUpdate(
      selectedUser,
      {
        $pull: { messages: { _id: messageID } },
      }
    );


    if(!deletedMessage){
      return res.status(404).json({message: 'Conversation not found'}); 
    }
    await deletedMessage.save();
  
    res.status(200).end();
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'An error occurred' });
  }

}



const getAllMessages = async (req, res) => {
  try {
    let { selectedUser } = req.query;

    if(!selectedUser){
      return ; 
    }
    
    if (typeof selectedUser === 'string') {
      selectedUser = [selectedUser];
    }
    
    const conversation = await Conversation.findOne({
      _id: selectedUser
    });

    return res.json(conversation?.messages).end();  
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};



module.exports = {deleteMessage, getAllMessages}; 