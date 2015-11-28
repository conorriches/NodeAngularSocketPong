/**
 * Created by criches on 23/11/2015.
 */
var myApp = angular.module('myApp',[]);


/**
 * Factory to create a socket and deal with events.
 * Events are on, which listen for emit events.
 */
myApp.factory('socket', ['$rootScope', function($rootScope) {
    var socket = io.connect();

    return {
        on: function(eventName, callback){
            socket.on(eventName, callback);
        },
        emit: function(eventName, data) {
            socket.emit(eventName, data);
        }
    };
}]);


/**
 * Main controller for the application
 */
myApp.controller('myCtrl', function($scope, socket) {

    /**
     * Local variable dictating which side this player is on
     * @type {null}
     */
    $scope.side = null;

    /**
     * Local variable of the game. Updated from server.
     * @type {null}
     */
    $scope.game = null;

    /**
     * Determines whether we are waiting for the other side.
     * @type {boolean}
     */
    $scope.waitingForOtherSide = false;


    /**
     * Check that the game has recieved a model
     * @type {boolean}
     */
    $scope.init = false;


    /**
     * Whether to show the board.
     * @type {boolean}
     */
    $scope.showGame = false;


    /**
     * Who has won?
    */
    $scope.winnerName = "";



    socket.emit('ping','');





    /**
     * Resets te current game.
     */
    $scope.reset = function(emit){
        socket.emit('reset');
    };

    /**
     * Request to join the current game on a given side.
     * @param side String left or right.
     */
    $scope.joinGame = function(side) {

        //Say hello to server.
        socket.emit('add-client',side);

        //Save which side we are locally.
        $scope.side = side;

        //Check if we are waiting
        $scope.checkForPlayers();
    };

    /**
     * Checks the waiting status of players.
     */
    $scope.checkForPlayers = function(){
        var count =0;

        if($scope.game != null){
            if($scope.game.players.left != null){count++;}
            if($scope.game.players.right != null){count++;}
        }
        console.log("There are " + count + " players.");

        $scope.waitingForOtherSide = count < 2;


    };

    $scope.start = function(){
        //Tell the server we are starting
        socket.emit('start','');
    };

    $scope.setGUIBatBounds = function(val){
        return Math.max(0, val -50);
    };

    $scope.setGUIBallBounds = function(val){
        return Math.max(0, val -20);
    };



    /**
     * When the mouse moves the following should happen:
     * 1. Model should be updated with the mouse.
     * 3. GUI refreshed.
     */
    $scope.mouseMove = function(event) {

        //Ensure the user has chosen a side.
        if($scope.side =='left' || $scope.side =='right'){

            //Get the element, and calculate the relative position to the screen
            var element = event.srcElement;
            var y = (event.y - element.getBoundingClientRect().top);

            //Make sure that the bat cannot be outside the range of the table.
            // Bat has height of 100, so make min of 50 and max of height-50.
            //((batPos < 50)? 00 : batPos - 50)
            var mybat = Math.floor(
                Math.max(
                    50, Math.min(
                        y, element.getBoundingClientRect().height-50
                    )
                )
            );

            //Tell the server we have moved
            socket.emit('update-bat',{
                'bat':$scope.side,
                'pos':mybat
            });
            console.log("Sending update about bat position");

        }else{console.error('INCORRECT SIDE');}

    };




    /**
     * NOTIFICATIONS HERE
     * When a new message arrives, deal with it.
     */
    socket.on('notification', function(data) {
        console.log("Notification for " + $scope.side );
        console.log(data.state);

        $scope.game = data.state;
        $scope.init = true;

        if($scope.side != null){
            if($scope.game.players.left != null && $scope.game.players.right != null ){
                $scope.showGame = true;

            }
        }

        /**
         * Based on the outcome, generate the name to show
         */
        if($scope.outcome == 0 ) $scope.winnerName = "";
        if($scope.outcome == -1 ) $scope.winnerName = "LEFT";
        if($scope.outcome == 1 ) $scope.winnerName = "RIGHT";

        $scope.$apply();


    });

    socket.on('reset', function(data) {
        console.log("RESET event recieved");
        $scope.game.players = {};
        $scope.waitingForOtherSide = false;
        $scope.showGame = false;
        $scope.init = false;
        $scope.side = null;

        socket.emit('ping','');

    });

    socket.on('disconnect', function(data) {
        $scope.reset(false);

    });

    socket.on('pong', function(data) {
        console.log("Pong!");
        $scope.game = data;
        $scope.init = true;
        $scope.$apply();

    });


    socket.on('notificationGameStatus', function(data) {
        console.log("* Game Status notification: " + data);
    });




});




