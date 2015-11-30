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

        $scope.$apply();
    };


    $scope.getPlayerCount = function(){
        var count =0;

        if($scope.game != null){
            if($scope.game.players.left != null){count++;}
            if($scope.game.players.right != null){count++;}
        }
        console.log("There are " + count + " players.");

        return count;
    };

    /**
     * Checks the waiting status of players.
     */
    $scope.checkForPlayers = function(){
        $scope.waitingForOtherSide = $scope.getPlayerCount() < 2;
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
     * When a ley is pressed this function is called.
     * If it's an up/down key, move the bat.
     * Other keys can be added here.
     * @param e event itself
     */
    $scope.arrow = function(e){

        //If there is a scrollar, stop scroll event.


        //Make sure that the game is playable and the user has a correct side
       // if(!$scope.showGame){return;}
        //if($scope.outcome !=0){e.preventDefault();return;}
        if($scope.side =='left' || $scope.side =='right') {

            //Get the key
            var key = e.keyCode;
            console.log("Key down :" + key);

            //Get the current position
            var current = $scope.game.players[$scope.side].bat;

            //Depending on the key, do something
            switch (key) {
                case 32: //SPACE
                    e.preventDefault();
                    $scope.start();
                    break;
                case 38: //UP
                    current -= 40;
                    e.preventDefault();
                    break;
                case 40: //DWN
                    current += 40;
                    e.preventDefault();
                    break;
                default :
                    console.log("No event for that key.");
                    return true;
            }

            var batPos = Math.max(50, Math.min(current, 350));

            //Tell the server we have moved
            socket.emit('update-bat', {
                'bat': $scope.side,
                'pos': batPos
            });

            console.log("Sending update about bat position");
        }


    };




    /**
     * NOTIFICATIONS HERE
     * When a new message arrives, deal with it.
     */
    socket.on('notification', function(data) {
        console.log("Notification" );
        console.log(data.state);

        $scope.game = data.state;
        $scope.init = true;

        if($scope.side != null){
            if($scope.game.players.left != null && $scope.game.players.right != null ){
                $scope.showGame = true;
            }else {
                $scope.showGame = false;
            }
        }else{
            $scope.showGame = false;
        }

        /**
         * Based on the outcome, generate the name to show
         */
        if($scope.outcome == 0 ){$scope.winnerName = "";}
        if($scope.outcome == -1 ){ $scope.winnerName = "LEFT";}
        if($scope.outcome == 1 ){$scope.winnerName = "RIGHT";}

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


    socket.on('pong', function(data) {
        console.log("Pong!");
        console.log(data.state);
        $scope.game = data.state;
        $scope.init = true;
        $scope.$apply();

    });


    socket.on('notificationGameStatus', function(data) {
        console.log("* Game Status notification: " + data);
    });




});




