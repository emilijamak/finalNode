module.exports = {
    handleConnection: (socket, io) => {
        // // Emit a welcome message when a user connects
        // socket.emit('info', { type: 'system', content: 'Welcome to the chat' });
        //
        // // Broadcast to others when a user connects
        // socket.broadcast.emit('info', { type: 'system', content: 'A user has joined the chat' });

        // Listen for chat messages
        socket.on('chatMessage', (message) => {
            // Broadcast the message object to other users
            io.emit('message', message);
            io.emit('messageReceived')
        });
        // Listen for chat messages
        socket.on('privateChatMessage', (message) => {
            // Broadcast the message object to other users
            io.emit('privateMessage', message);
            io.emit('messageReceived')
        });

        socket.on('userAdded', () => {
            io.emit('messageReceived')

        })
        // Listen for chat delete
        socket.on('deleteConversation', (conversations) => {
            // Broadcast the message object to other users
            io.emit('conversationDeleted', conversations)
        });


        socket.on('profileUpdated', (updatedProfile) => {
            // Broadcast the updated profile to all connected clients
            io.emit('profileUpdated', updatedProfile);
        });
        socket.on('registeredUsers', (users) => {
            // Broadcast the updated profile to all connected clients
            io.emit('registeredUsers', users);
        });
        socket.on('deletedAcc', (users) => {
            // Broadcast the updated profile to all connected clients
            io.emit('deletedAcc', users);
        });

        // Handle user disconnect
        socket.on('disconnect', () => {
            io.emit('info', { type: 'system', content: 'A user has left the chat' });
        });

        socket.on('likeMessage', (messages) => {
            io.emit('likeMessage', messages);  // Emit to all connected clients
        });
    }


};
