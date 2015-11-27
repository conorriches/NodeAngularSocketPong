/**
 * Created by criches on 23/11/2015.
 */
var myApp = angular.module('myApp',[]);


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


myApp.controller('myCtrl', function($scope, socket) {
    $scope.side = null;
    $scope.game = null;

    $scope.join = function(side) {
        console.log("Joining as " + side);
        socket.emit('add-client',side);
        $scope.side = side;
    };

    $scope.start = function(){

        //Tell the server we are starting
        socket.emit('start','');

    };

    $scope.state = function(){
        console.log("Updating");
        socket.emit('update-state','');
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

            //Update the model directly
           // $scope.game.state.players[$scope.side].bat = mybat;

            //Tell the server we have moved
            socket.emit('update-bat',{
                'bat':$scope.side,
                'pos':mybat
            });
        }

    };

    /**
     * NOTIFICATIONS HERE
     * When a new message arrives, deal with it.
     */
    socket.on('notification', function(data) {
        $scope.game = data;
        $scope.$apply();

    });

    socket.on('notificationGameStatus', function(data) {
        console.log("* Game Status notification: " + data);
    });




});




