const colyseus = require('colyseus');
const { State } = require('./schema/AmongUsChaseState');

exports.AmongUsChase = class extends colyseus.Room {
    onCreate (options) {
        console.log("ROOM created");
        var game = "chase";
        if(process.argv[2] == "amongus") {
            game = "amongus";
        }
        var state = new State(game);
        state.game = game;
        if(game == "chase") {
            state.world_size_x = state.world_size_y = 1000;
            this.ALIVE_IMPOSTOR_WIN = 1;
        } else {
            state.world_size_x = 3660;
            state.world_size_y = 2198;
            this.ALIVE_IMPOSTOR_WIN = 1;
            this.TOTAL_TASKS = 9;
            this.TASKS = 4;
        }
        this.setState(state);
        this.impostorPlayer;
        this.alivePlayers=0;
        this.startTime=0;
        this.lastTime=0;

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
        this.onMessage("killed", (client, id) => {
            var player = this.state.players.get(id);
            if(!player.alive)
				return;
            player.alive = false;
            this.alivePlayers--;
            console.log("Player killed: " + player.name, this.alivePlayers);
        });
        this.onMessage("completed", (client, completed) => {
            var player = this.state.players.get(client.sessionId);
            player.completed = completed;
            console.log("Player ", player.name, " completed ", this.completed);
        });
        this.onMessage("meeting", (client, ignore) => {
            var playerCalledMeeting = this.state.players.get(client.sessionId);
            this.broadcast("meeting", '')
			console.log("Player ", playerCalledMeeting.name, " called meeting ");
			this.votes = 0;
		});
        this.onMessage("vote", (client, voted_id) => {
            var voting_player = this.state.players.get(client.sessionId);
			var voted_player = this.state.players.get(voted_id);
			voted_player.votes=(voted_player.votes || 0) + 1; 
            this.broadcast("vote", {id: client.sessionId, voted_id: voted_id})
			console.log("Player", voting_player.name, "voted for", voted_player.name);
			this.votes++;
			if(this.votes == this.alivePlayers) {
				var max = 0;
				var max_votes_player_id;
				var tie = false;
				this.state.players.forEach((player, key) => {
					if(player.votes > max) {
						max = player.votes;
						max_votes_player_id = key;
						tie = false;
					} else if(player.votes == max && max!=0) {
						tie = true;
					}
					player.votes = 0;
				})
				if(tie) {
					this.broadcast("TIE", "");
				} else {
					var max_votes_player = this.state.players.get(max_votes_player_id);
					if(max_votes_player.impostor) {
						this.broadcast("IMPOSTOR VOTED", max_votes_player_id);
						console.log("Impostor voted out!");
						this.state.started = false;
		                setTimeout(this.revivePlayers, 3000, this)
					} else {
						this.broadcast("CREWMATE VOTED", max_votes_player_id);
						max_votes_player.alive = false;
						this.alivePlayers--;
						console.log("Player", max_votes_player.name, "voted out!");
					}
				}
			} else {
				console.log(this.votes, this.alivePlayers)
			}
        });
        this.onMessage("start", (client, message) => {
            if(this.state.started) {
                console.log("Atempt to start started game");
                return;
            }
            console.log("Client", client.sessionId, " started the game");
            var impostor = Math.floor(Math.random()*this.state.players.size);
            console.log("Impostor index: ", impostor)
            this.alivePlayers = this.state.players.size;
            if(game == "chase") {
				this.startChase(impostor);
            } else {
				this.startAmongUs(impostor);
            }
        });

    }
	
	startChase(impostor) {
	    this.obstacles = [];
	    for (var i = 0; i < 15; i++) {
	        var obstacle = {};
	        obstacle.x = Math.random() * this.state.world_size_x;
	        obstacle.y = Math.random() * this.state.world_size_y;
	        this.obstacles.push(obstacle);
	    }
	    this.broadcast("obstacles", this.obstacles);
	    this.startTime = new Date().getTime();
	    this.lastTime = this.startTime;
	    this.state.elapsed = 0;
	    var i = 0;
	    this.state.players.forEach((player) => {
			player.alive = true;
	        if (impostor == i) {
	            console.log("Impostor player: ", player.name)
	            player.impostor = true;
	            this.impostorPlayer = player;
	        } else {
	            player.impostor = false;
	        }
	        i++;
	    });
		setTimeout(() => {
			this.state.started = true;
		}, 500)
	    

	}
	startAmongUs(impostor) {
	    var i = 0;
	    this.state.players.forEach((player) => {
			player.alive = true;
	        if (impostor == i) {
	            console.log("Impostor player: ", player.name)
	            player.impostor = true;
	            this.impostorPlayer = player;
	        } else {
	            player.impostor = false;
	            player.completed = 0;
	        }
	        i++;
	    });
		setTimeout(() => {
			this.state.started = true;
		}, 500)
	}
	revivePlayers(self) {
	    self.state.players.forEach((player) => {
	        player.alive = true;
	    });
	    self.state.elapsed = 0;
	}
	update(deltaTime) {
        if(this.impostorPlayer && this.state.started) {
            if(this.alivePlayers <= this.ALIVE_IMPOSTOR_WIN) {
                console.log("Impostor won");
				this.broadcast("IMPOSTOR WON", "")
			    this.state.started = false;
				setTimeout(this.revivePlayers, 2000, this)
				}
				else if (this.state.game == "chase") {
                this.checkTime();
            } else {
                this.checkTasksCompleted()
            }
        }

        // implement your physics or world updates here!
        // this is a good place to update the room state
    }

    checkTasksCompleted() {
        var sum = 0;
        this.state.players.forEach((player) => {
            sum+=player.completed;
        });
        if(sum >= this.state.players.size * this.TASKS) {
            this.state.started = false;
			this.broadcast("TASKS COMPLETED", "")
            console.log("Tasks completed");
        }
    }

    checkTime() {
        var c = new Date().getTime();
        if((c - this.lastTime) > 1000) {
            this.state.elapsed = Math.round((c - this.startTime)/1000);
            this.lastTime = c;
        }
        if(this.state.elapsed >= 100) {
			this.broadcast("IMPOSTOR FAILED", "")
            this.state.started = false;
            console.log("Time elapsed");
            setTimeout(() => {
                this.state.elapsed = 0;
            }, 1000)
        }
    }

    onJoin (client, options) {
        console.log("Client joined: ", client.sessionId);
        var player = new Player();
        player.id = client.sessionId;
		player.name = player.id;
        if(this.state.game == "chase") {
            player.x = Math.random() * this.state.world_size_x;
            player.y = Math.random() * this.state.world_size_y;
        } else {
            player.x = Math.random() * 484 + 1734;
            player.y = Math.random() * 78 + 236;
        }
		if(this.state.started) {
			player.alive = false;
		} else {
			player.alive = true;
			this.alivePlayers++;
		}
        player.impostor = false;
        if(this.game == "amongus") {
            player.tasks = generateTasks(this.TASKS, this.TOTAL_TASKS);
            player.completed = 0;
        } else {
			if(this.state.started) {
				setTimeout(() => {
					client.send("obstacles", this.obstacles);
				}, 500)
			}
		}
        this.state.players.set(client.sessionId, player);
    }

    onLeave (client, consented) {
        console.log("Client left: ", client.sessionId);
        var player = this.state.players.get(client.sessionId);
        this.state.players.delete(client.sessionId);
        if (player.impostor) {
            console.log("Impostor left");
			this.broadcast("IMPOSTOR LEFT", "")
            setTimeout(() => {
                this.state.started = false;
            }, 500)
            setTimeout(() => {
                this.state.elapsed = 0;
            }, 1000)
        } else {
            if(player.alive)
                this.alivePlayers--;
        }
    }

    onDispose() {
    }

    generateTasks(num, total) {
        var a = [];
        for (var i = 0; i < num; i++) {
            var n;
            do {
                n = Math.floor(Math.random()*total);
            } while(a.contains(n))
            a.push(n);
        }
        return a.join(",");
    }

}
