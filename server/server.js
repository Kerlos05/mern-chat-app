
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = 8080; 
const cors = require('cors'); 
const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs'); 
const path=require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer({ dest: "uploads" })

const privateKey = fs.readFileSync(path.join(__dirname,'/private_key.pem'));

const Conversation = require('./model/Conversation.js');
const Group = require('./model/Group.js');
const File = require('./model/File.js');

const connectDB = require('./config/dbconn.js'); 
connectDB(); 

const io = require('socket.io')(5000, {
    cors: {
      origin: ['http://localhost:5173'],
      credentials: true
    },
});


app.use(cors()); 
app.use(cookieParser()); 
app.use(express.json({ limit: '20mb' }));

app.use('/auth', require('./routes/auth.js'));
app.use('/register',require('./routes/register.js'));
app.use('/message',require('./routes/message.js'));
app.use('/avatar', require('./routes/avatar.js'));  
app.use('/update_user', require('./routes/update_user.js'));  
app.use('/jwt', require('./middleware/JWTMiddleWare.js'));



app.post('/create-group', async (req, res) => {
  const { usernames, createdBy } = req.body;

  if (!usernames || usernames.length < 3) {
    return res.status(400).json({ error: 'Invalid usernames. At least three usernames are required.' });
  }

  try {
    const existingGroup = await Group.aggregate([
      { $match: { username: { $eq: usernames } } }
    ]);

    if (existingGroup.length > 0) {
      return res.status(409).json({ error: 'Group with the same usernames already exists.' });
    }

    // Create a new group
    const newGroup = new Group({ username: usernames, createdBy: createdBy});
    await newGroup.save();

    res.status(201).json({ message: 'Group created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post("/upload", upload.single("file"), async (req, res) => {
  if(!req.file || !req.file.originalname){
    return res.end();
  }
  
  if(req.file.originalname === 'localhost:8080'){
    return res.end();
  }
  
  try {
    const fileData = {
      path: req.file?.path,
      originalName: req.file?.originalname,
    }
  
    const file = await File.create(fileData);
    res.json({fileLink:`${req.headers.host}/file/${file.id}`, fileName: req.file.originalname }).end();
  } catch (error) {
    return res.json({'message': 'File not found'});
  }
});


app.route("/file/:id").get(handleDownload).post(handleDownload)

async function handleDownload(req, res) {
  const file = await File.findById(req.params.id)
  file.downloadCount++
  await file.save()

  res.download(file.path, file.originalName)
}


mongoose.connection.once('open', () =>{
  app.listen(PORT, () =>{
    console.log('DB connected, server listening on port: ' + PORT);
  });

  io.on('connection', (socket) => {
    socket.on('startConversation', async ({ participants }) => {
      let filteredParticipants = participants;
      if (typeof participants === 'string') {
          filteredParticipants = [participants];
      } else {
          filteredParticipants = [...new Set([].concat(...participants))];
      }
      
      let conversation = await Conversation.findOne({
        participants: { $all: filteredParticipants, $size: filteredParticipants.length }
      });
      
  
      if (!conversation) {
        conversation = new Conversation({ participants: filteredParticipants });
        await conversation.save();
        console.log('Conversation created');
      }
      
      socket.join(conversation._id.toString());
      socket.emit('conversationStarted', { conversationId: conversation._id });
    });
  

      
    socket.on('sendMessage', async ( sender, conversationId, encryptedMessage, fileLink ) => {
      const conversation = await Conversation.findById(conversationId);

      if(!conversation){
        return false; 
      }


      const buffer = Buffer.from(encryptedMessage, 'base64');
      const decryptedMessage = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        buffer
      ).toString('utf-8');

      const message = `${fileLink.fileName || '' } ${ fileLink.fileLink || ''} ${decryptedMessage || ''}`; 
      
      conversation.messages.push({ message, sender });
      await conversation.save();

      io.to(conversationId).emit('messageReceived', { decryptedMessage, sender });
    });

    socket.on('updateUserUI', () => {
      io.sockets.emit('updateUI');  
    })
    
    socket.on('updateAvatarUI', () => {
      io.sockets.emit('updateAvatar');  
    })

  });
})
   