const colyseus = require('colyseus');
const { State } = require('./schema/AmongUsChaseState');

exports.AmongUsChase = class extends colyseus.Room {
    onCreate (options) {
        var state = new State();
        this.setState(state);
        this.impostorPlayer;
        this.alivePlayers=0;
        this.startTime=0;
        this.lastTime=0;

        console.log(this.state);
        this.setSimulationInterval((deltaTime) => this.update(deltaTime));
        this.setPatchRate(50);
        this.onMessage("name", (client, message) => {
            this.state.players.get(client.sessionId).name = message;
            console.log("Client", client.sessionId, " set his name to: ", message);
        });
        this.onMessage("color", (client, message) => {
            this.state.players.get(client.sessionId).color = message;
            console.log("Client", client.sessionId, " set his color to: ",
            message);
        });
		var last;
        this.onMessage("pos", (client, pos) => {
            var player = this.state.players.get(client.sessionId);
            player.x = pos.x;
            player.y = pos.y;
			//var now = new Date().getTime();
			//console.log(pos.x, pos.y, now - last);
			//last = now;
        });
        this.onMessage("start", (client, message) => {
            if(this.state.started) {
                console.log("Atempt to start started game");
                return;
            }
            console.log("Client", client.sessionId, " started the game");
			var obstacles = [];
			for(var i=0; i<15; i++) {
				var obstacle = {};
				obstacle.x = Math.random() * this.state.world_size;
        		obstacle.y = Math.random() * this.state.world_size;
				obstacles.push(obstacle);
			}
			this.broadcast("obstacles", obstacles);
            var impostor = Math.floor(Math.random()*this.state.players.size);
            console.log("Impostor index: ", impostor)
            var i = 0;
            this.state.players.forEach((player) => {
                if(impostor == i) {
                    console.log("Impostor player: ", player.name)
                    player.impostor = true;
                    this.impostorPlayer = player;
                } else {
                    player.impostor = false;
                }
                i++;
            });
            this.alivePlayers = this.state.players.size;
            this.state.started = true;
            this.startTime=new Date().getTime();
            this.lastTime=this.startTime;
            this.state.telapsed = 0;
        });

    }
    update (deltaTime) {
        if(this.impostorPlayer && this.state.started) {
            this.state.players.forEach((player) => {
                if(player == this.impostorPlayer)
                    return;
                if(!player.alive)
                    return;
                if(Math.abs(player.x - this.impostorPlayer.x) > 30)
                    return;
                if(Math.abs(player.y - this.impostorPlayer.y) > 30)
                    return;
                player.alive = false;
                this.alivePlayers--;
                console.log("Player killed: " + player.name, this.alivePlayers);
            });
            if(this.alivePlayers<=1) {
                this.state.started = false;
                console.log("Impostor won");
                setTimeout(() => {
                    this.state.players.forEach((player) => {
                        player.alive = true;
                    });
                    this.state.elapsed = 0;
                }, 3000)

            } else {
                var c = new Date().getTime(); 
                if((c-this.lastTime)>1000) {
                    this.state.elapsed = Math.round((c-this.startTime)/1000);
                    this.lastTime = c;
                } 
                if(this.state.elapsed >= 100) {
                    this.state.started = false;
                    console.log("Time elapsed");
                    setTimeout(() => {
                        this.state.elapsed = 0;
                    }, 1000)
                }
            }
        }
        
        // implement your physics or world updates here!
        // this is a good place to update the room state
    }
    onJoin (client, options) {
        console.log("Client joined: ", client.sessionId);
        var player = new Player();
        player.id = client.sessionId;
        player.x = Math.random() * this.state.world_size;
        player.y = Math.random() * this.state.world_size;
        player.alive = true;
        player.impostor = false;
        this.state.players.set(client.sessionId, player);
        this.alivePlayers++;
    }

    onLeave (client, consented) {
        console.log("Client left: ", client.sessionId);
		var player = this.state.players.get(client.sessionId);
        this.state.players.delete(client.sessionId);
        this.alivePlayers--;
		if (player.impostor) {
		    console.log("Impostor left");
		    this.state.elapsed = 100;
		    setTimeout(() => {
				this.state.started = false;
		    }, 500)
		    setTimeout(() => {
		        this.state.elapsed = 0;
		    }, 3000)
		}
    }

    onDispose() {
    }

}
