/**
 * Game of pong
 * @author Conor Riches
 * @constructor
 */


// Constructor
function Game() {
    this.originalState = {
        'inPlay':false,
        'players':{
            'left' : null,
            'right' : null
        },
        'ball':{
            'original' : {
                'x':325,
                'y':200
            },
            'x':325,
            'y':200,
            'speed':10,
            'angle':{
                'dx' : 0,
                'dy' : 0
            },
            'time':0
        }
    };
    this.state = {};


    //Set the state to the initial one
    this.state = this.originalState;

}

Game.prototype.reset = function(){
    console.log("RESET ===========");
    this.state = this.originalState;
};

// class methods

Game.prototype.addPlayer = function(side){

    var newPlayer = {
        'bat' : 0,
        'points' : 0
    };

    switch(side){
        case 'left':
            this.state.players.left = newPlayer;
            break;
        case 'right':
            this.state.players.right = newPlayer;
            break;
    }


};



Game.prototype.setBat = function(side,pos){

    switch(side){
        case 'left':
            this.state.players.left.bat = pos;
            break;
        case 'right':
            this.state.players.right.bat = pos;
            break;
    }


};


/**
 * Tick event
 */
Game.prototype.tick = function(){

    var oldX = this.state.ball.x;
    var oldY = this.state.ball.y;


    var newX = oldX + this.state.ball.angle.dx;
    var newY = oldX + this.state.ball.angle.dy;

    //set model
    this.state.ball.x = newX;
    this.state.ball.y = newY;

    this.boundaryCheck(oldX,oldY,newX,newY);

};

/**
 * Alternates the angle of the ball
 */
Game.prototype.alternate = function(altx, alty){
    console.log("Bounce!" + this.state.ball.x + ", " + this.state.ball.y );

    //Alternate angle... perhaps add random element?
    if(altx)this.state.ball.angle.dx = (this.state.ball.angle.dx * -1) ;
    if(alty) this.state.ball.angle.dy = (this.state.ball.angle.dy * -1) ;

};



Game.prototype.boundaryCheck = function(oldX,oldY,newX,newY){

    if(newX < 20 && this.state.ball.angle.dx < 0){
        this.alternate(true,false);
    }

    if(newX > 680 && this.state.ball.angle.dx > 0){
        this.alternate(true,false);
    }

    if(newY < 20 && this.state.ball.angle.dy < 0){
        this.alternate(false,true);
    }

    if(newY > 300 && this.state.ball.angle.dy > 0){
        this.alternate(false,true);
    }

    return true;
};





/**
 * Attempts to start the game if there are two players
 * @returns {boolean}
 */
Game.prototype.startGame = function(){
    this.state.inPlay = false;

    if(this.state.players.left && this.state.players.right){

        //Step 1: Centre the ball
        this.state.ball.x=325;
        this.state.ball.y=200;

        var dx = (Math.random() * 4)-2;
        var dy = (Math.random() * 4)-2;

        this.state.ball.angle.dx = dx;
        this.state.ball.angle.dy = dy;

        //Step 3: Start the game
        this.state.inPlay = true;
        console.log("Started with angle " + dx + ", " + dy + "!");

    }else{console.log("Cannot start, need two players.");}


    return this.state.inPlay;
};

Game.prototype.movebat = function(player,position) {
    this.state.players[player].bat = position;
};

// export the class
module.exports = Game;