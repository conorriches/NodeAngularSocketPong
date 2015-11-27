#Pong game with AngularJS 
By Conor

###Objectives
* Get model set up
* Allow clients to update model
* Ensure model updates across clients
* Link model to GUI

###Architecture
* Model of the game runs on the server. This is the single source of truth that all clients must adhere to.
* Clients can connect to the server, and choose to take control of left or right bat. 
* On an action, clients send a message to server updating state.
  This can be done with a game state object
  
###Objects

Single Source of Truth on the server as an object:
```
{
    'bats':{
        'l':$ypos,
        'r',$ypos
    },
    'ball':{
        'x':xpos,
        'y':ypos
    },
    'inplay': boolean,
    'points': {
        'l' : 1,
        'r' : 2
    }
}

```

Alternative:
```
{
    'l':{
        'points':1,
        'ypos': 300
    },
    'r':{
            'points':1,
            'ypos': 300
        },
    'ball':{
        'x':xpos,
        'y':ypos
    },
    'inplay': boolean,
}

```

Communication can be an entire object, updating the whole state. 
This is heavy, needs a way of just updating the key objects.

* Only l and r can be updated. The rest are read only.

###Communication
####Bats
Y-position of bats has to be updated on move of any paddle.
Has to specify which paddle.
Either specifying one bat or both for avoidance of doubt:
`(l,300)` or `{('l',300),('r',0)}`
####Ball
Ball position can be done in three ways
#####Total Automation
The ball moves according to an algorithm, and is automated. This trusts that both clients can accuratly move the ball 
and don't freeze or delay. Probably not the best option
#####Checkpoints
Like before, but with checkpoitns every second. Requires minimal network communication:
`('b',xpos,ypos)`
This updates the ball to the position on both clients.
What happens when clients disagree on position? Central model for the game.
Server's version of the game is accurate. Any nr of clients can connect, choosing to take control
of the left or right bat. 
#####Total Communication
On every pixel move, update the bad positon. Network heavy, but more accurate.

###Limitations
Anyone can pose as anyone. This means that a rogue client can move the bat madly. 
Perhaps only allow increments of the bat as opposed to just acecpting any number.

