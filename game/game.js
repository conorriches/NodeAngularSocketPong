/**
 * Game of pong
 * @author Conor Riches
 * @constructor
 */


// Constructor
function Game() {

    //Parameters
    this.pointsToWin = 3;


    this.originalState = {
        'inPlay':false,
        'outcome':0,
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
            'speed':5,
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
    this.state.players.left.points = 0;
    this.state.players.right.points = 0;
    this.state.outcome = 0;
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
    var newY = oldY + this.state.ball.angle.dy;

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
    if(altx) this.state.ball.angle.dx *=  -1; //(this.state.ball.angle.dx * -1) ;
    if(alty) this.state.ball.angle.dy *= -1; //(this.state.ball.angle.dy * -1) ;

};

Game.prototype.gameOverCheck = function(){

};


Game.prototype.boundaryCheck = function(oldX,oldY,newX,newY){

    if(newX < 0){
        //Check for left bat

        var batPos = this.state.players.left.bat;
        var batTop = batPos - 50 - 20;
        var batBottom = batPos + 50 + 20;

        if( newY > batBottom || newY < batTop){
           // console.log("SCORE: bat len " + batTop + " to " + batBottom + ", ball at");
            this.score('right');
        }
    }


    if(newX > 640){
        //Check for right bat

        var batPos = this.state.players.right.bat;
        var batTop = batPos - 50 - 20; //Allow for bat and ball
        var batBottom = batPos + 50 + 20;

        if( newY > batBottom || newY < batTop){
            this.score('left');
        }
    }



    //Check for edges


    //Check for edes
    if(newX < 0 && this.state.ball.angle.dx < 0){
        this.alternate(true,false);
    }

    if(newX > 640 && this.state.ball.angle.dx > 0){
        this.alternate(true,false);
    }

    if(newY < 10 && this.state.ball.angle.dy < 0){
        this.alternate(false,true);
    }

    if(newY > 380 && this.state.ball.angle.dy > 0){
        this.alternate(false,true);
    }

    return true;
};


Game.prototype.score = function(team){

    if(team == 'left'){
        this.state.inPlay = false;
        this.state.players.left.points +=1;
        this.checkWin();
        return true;
    }
    if(team == 'right'){
        this.state.inPlay = false;
        this.state.players.right.points +=1;
        this.checkWin();
        return true;
    }

    return false;
};


Game.prototype.checkWin = function(){
    if(this.state.players.left.points == this.pointsToWin ){
        this.state.outcome = -1;
    }
    if(this.state.players.right.points == this.pointsToWin ){
        this.state.outcome = 1;
    }
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

        var dx = ((Math.random() * 2)-1) * 2;
        var dy = ((Math.random() * 2)-1) * 2;

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