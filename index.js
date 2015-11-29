var express = require('express'),
    app = express();



/**
 * Configure middleware on the server
 */
app.use('/', express.static(__dirname + '/public'));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));
app.use('/bower_components', express.static(__dirname + '/bower_components/'));


/**
 * Run the server
 */
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("=====================================");
    console.log("Server Started! Go to "  + ":" + port);
    console.log("=====================================");
});


/**
 * Set up the game model
 */
var Game = require('./game/game.js');
var game = new Game();
var intervalID;


/**
 * Set up the sockets
 */
var io = require('socket.io')(server);
var allClients = {};

io.sockets.on('connection', function(socket) {
    console.log('= New client has conencted!');
    console.log(socket.id);


    /**
     * When a user disconnects, free up their side. This will end the game if in progress.
     * #ragequit.
     *
     * If a player is waiting, do not disconnect them!
     */
    socket.on('disconnect', function(e) {

        var side = allClients[socket.id];
        console.log("Disconnect: " + socket.id + "on side " + side);

        //Make that side null
        game.state.players[side] = null;

        //Tell everyone that it is null
        io.sockets.emit('notification', game);
        io.sockets.emit('disconnect', game);
    });

    /**
     * A client has reset everything.
     * Shit the bed.
     */
    socket.on('reset', function() {
        game = new Game();
        allClients = {};
        clearInterval(intervalID);
        io.sockets.emit('reset', game);
    });


    socket.on('add-client', function(side) {
        console.log("Adding player on socket " + socket.id + " as " + side);
        allClients[socket.id] = side;
        game.addPlayer(side);

        io.sockets.emit('notification', game);
    });

    socket.on('update-state', function() {
        console.log("Sending update");
        socket.emit('notification', game);
    });

    socket.on('update-bat', function(obj) {
        //console.log("Updating bat " + obj.bat + " to pos: " + obj.pos);
        game.setBat(obj.bat,obj.pos);
        io.sockets.emit('notification', game);
    });

    socket.on('tick', function(obj) {
        game.tick();
    });

    socket.on('ping', function(obj) {
        console.log("PINGGGG");
        socket.emit('pong', game);
    });


    socket.on('start', function() {
        console.log("Starting...");

        clearInterval(intervalID);
        game.reset();
        socket.emit('notificationGameStatus', false);

        var response = game.startGame();
        if(response){
            intervalID = setInterval(timer,game.state.ball.speed);
        }

        socket.emit('notificationGameStatus', response);
    });

});


var timer = function(){
    game.tick();
    io.sockets.emit('notification', game);
    if(game.state.inPlay==false) clearInterval(intervalID);
};



/**
 * When index is requested, serve the GUI
 */
app.get('/game', function (req, res) {

    res.send(JSON.stringify(game));
});


