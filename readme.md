# MERN Chat Application


![Alt Text](./Skärmbild%202024-03-12%20203659.jpg)

## Overview
    This is a chat application built using the MERN stack (MongoDB, Express.js, React.js, Node.js). 
    It provides a real-time communication platform with a variety of features.  

## Features

### JWT Authentication
    Users are authenticated using JSON Web Tokens (JWT). 

### Real-time Communication
    Real-time communication is facilitated through Socket.IO. 
    Users can send and receive messages instantly in their respective chat groups.

### Group Making
    Users have the ability to create and join chat groups, 
    fostering a community environment.

### Encryption
    All messages are encrypted to ensure user privacy and data security.

### User Profile Management
    Users can update their username and avatar, 
    providing a personalized experience. They also have the option to leave a group.

### User and Message Management
    Users have the ability to delete their account, 
    along with their messages, ensuring control over their data.

### Friend Search
    A search feature is available for users to find friends on the platform.

### File Upload
    Users can upload and share files within the chat, 
    enhancing the communication experience.

## Getting Started

    In both the client and the server folder run npm i 

    Then navigate to the server folder and then create .env file that containes 
    .. MONGO_URI
    .. ACCESS_TOKEN_SECRET


    Finally run * npm run dev *  on the client folder and nodemon server in the server folder
