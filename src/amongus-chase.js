var Q = document.querySelector.bind(document);
var QA = document.querySelectorAll.bind(document)
var INPUT_RESPONSE_RATE = 1;
var NON_SCROLLING_RATIO = 0.3;
var KILL_TIMEOUT=30;
var corridorR = 1;
var corridorG = 2;
var corridorB = 3;
var PLAYER_SIZE = 48;
var TEXT_COLOR = "black";
var KILL_DISTANCE = 40;
var USE_DISTANCE = 50;
var VIEW_TASK_DISTANCE = 200;
var MEETING_DISTANCE = 120;
var USE_SPRITE_SIZE = 40;
var g_players = {};
var players_length;
var mySessionId;
var me;
var offset;
var state;
var tilingSprite;
var container;
var g_room;
var graphics;
var g_map;
var g_obstacles;
var style, styleImpostor;
var g_game;
var g_next_kill_time = 0;
var g_time_to_kill_sec;
var g_my_items = [];
var TASKS = [
    {x: 521, y: 726, name: "Align (UPPER ENGINE)", type: "task"},
    {x: 590, y: 720, name: "Fuel (UPPER ENGINE)", type: "task"},
    {x: 678, y: 442, name: "Power (UPPER ENGINE)", type: "task"},
    {x: 1633, y: 275, name: "Wires (CAFFE)", type: "task"},
    {x: 2332, y: 300, name: "Data (CAFFE)", type: "task"},
    {x: 2413, y: 381, name: "Garbage (CAFFE)", type: "task"},
    {x: 2800, y: 556, name: "Asteroids (WEAPONS)", type: "task", visual: true},
    {x: 2970, y: 526, name: "Power (WEAPONS)", type: "task"},
    {x: 2927, y: 890, name: "Power (O2)", type: "task"},
    {x: 2594, y: 920, name: "Depletion (O2)", type: "task"},
    {x: 2524, y: 931, name: "Filter (O2)", type: "task"},
    {x: 2450, y: 956, name: "Chute (O2)", type: "task"},
    {x: 3219, y: 993, name: "Wiring (NAV)", type: "task"},
    {x: 3338, y: 886, name: "Power (NAV)", type: "task"},
    {x: 3417, y: 886, name: "Data (NAV)", type: "task"},
    {x: 3498, y: 950, name: "Course (NAV)", type: "task"},
    {x: 3558, y: 1062, name: "Steer (NAV)", type: "task"},
    {x: 2914, y: 1501, name: "Power (SHIELDS)", type: "task"},
    {x: 2662, y: 1828, name: "Prime (SHIELDS)", type: "task"},
    {x: 2557, y: 1194, name: "Data (ADMIN)", type: "task"},
    {x: 2572, y: 1207, name: "Depletion (ADMIN)", type: "task"},
    {x: 2504, y: 1384, name: "Card (ADMIN)", type: "task"},
    {x: 2548, y: 1818, name: "Power (COMMS)", type: "task"},
    {x: 2367, y: 1807, name: "Data (COMMS)", type: "task"},
    {x: 2388, y: 2035, name: "Comms (COMMS)", type: "task"},
    {x: 2123, y: 2035, name: "Garbage (STORAGE)", type: "task"},
    {x: 1901, y: 1390, name: "Wiring (STORAGE)", type: "task"},
    {x: 1829, y: 1805, name: "Fuel (STORAGE)", type: "task"},
    {x: 1273, y: 1485, name: "Lights (ELECTRICAL)", type: "task"},
    {x: 1335, y: 1275, name: "Power (ELECTRICAL)", type: "task"},
    {x: 1437, y: 1305, name: "Wires (ELECTRICAL)", type: "task"},
    {x: 1585, y: 1293, name: "Calibrate (ELECTRICAL)", type: "task"},
    {x: 1567, y: 1026, name: "Sample (MEDBAY)", type: "task"},
    {x: 1475, y: 1109, name: "Scan (MEDBAY)", type: "task"},
    {x: 811, y: 1061, name: "Wires (SECURITY)", type: "task"},
    {x: 1010, y: 891, name: "Cameras (SECURITY)", type: "task"},
    {x: 616, y: 1430, name: "Power (L ENGINE)", type: "task"},
    {x: 522, y: 1701, name: "Align (L ENGINE)", type: "task"},
    {x: 596, y: 1695, name: "Fuel (L ENGINE)", type: "task"},
    {x: 355, y: 800, name: "Meltdown (REACTOR)", type: "task"},
    {x: 355, y: 1407, name: "Meltdown (REACTOR)", type: "task"},
    {x: 457, y: 945, name: "Power (REACTOR)", type: "task"},
    {x: 256, y: 894, name: "Unlock (REACTOR)", type: "task"},
    {x: 314, y: 1138, name: "Start (REACTOR)", type: "task"},
]
var SPECIAL_ITEMS_CREW = [
    {x: 1987, y: 612, name: "Meeting", type: "meeting"}
]
var SPECIAL_ITEMS_IMPOSTOR = [
    {x: 834, y: 496, name: "Vent", type: "vent", tx: 308, ty: 940},
    {tx: 834, ty: 496, name: "Vent", type: "vent", x: 308, y: 940},
    {x: 2760, y: 430, name: "Vent", type: "vent", tx: 3338, ty: 948},
    {tx: 2760, ty: 430, name: "Vent", type: "vent", x: 3338, y: 948},
    {x: 3338, y: 1206, name: "Vent", type: "vent", tx: 2818, ty: 1842},
    {tx: 3338, ty: 1206, name: "Vent", type: "vent", x: 2818, y: 1842},
    {x: 2398, y: 720, name: "Vent", type: "vent", tx: 2808, ty: 1210},
    {tx: 2259, ty: 1495, name: "Vent", type: "vent", x: 2808, y: 1210},
    {x: 2259, y: 1495, name: "Vent", type: "vent", tx: 2398, ty: 720},
    {x: 1274, y: 1338, name: "Vent", type: "vent", tx: 1207, ty: 1032},
    {tx: 1053, ty: 1253, name: "Vent", type: "vent", x: 1207, y: 1032},
    {x: 1053, y: 1253, name: "Vent", type: "vent", tx: 1274, ty: 1338},
    {x: 392, y: 1252, name: "Vent", type: "vent", tx: 837, ty: 1787},
]
var ALL_ITEMS = TASKS.concat(SPECIAL_ITEMS_CREW).concat(SPECIAL_ITEMS_IMPOSTOR);

var nick = getCookie("nick") || "";

if (nick) {
    var nickInput = Q("#name");
    nickInput.value = nick;
}
var color = getCookie("color") || "blue";
if (color) {
    var colorInput = Q("#color");
    colorInput.value = color;
}

var mousePos = {
    x: window.innerWidth/2,
    y: window.innerHeight/2
};

function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

if (isTouchDevice()) {
    var div = Q("#joyDiv");
	show(div);
    div.style.left=window.innerWidth/2-60;
    var joy = new JoyStick('joyDiv');
} else {
    window.addEventListener('mousemove', e => {
        mousePos.x = e.offsetX;
        mousePos.y = e.offsetY;
    });
}
let app = new PIXI.Application();
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;

app.renderer.resize(window.innerWidth, window.innerHeight);
//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);
app.loader.add([
        "img/blue-among-us.png",
        "img/black-among-us.png",
        "img/brown-among-us.png",
        "img/green-among-us.png",
        "img/light-blue-among-us.png",
        "img/lime-among-us.png",
        "img/orange-among-us.png",
        "img/red-among-us.png",
        "img/rose-among-us.png",
        "img/violet-among-us.png",
        "img/yellow-among-us.png",
        "img/white-among-us.png",
        "img/bckg.png",
        "img/map.png",
        "img/item.png"
    ])
var trees = [];
for(var i=0; i<50; i++) {
    var num = ""+(i+1);
    trees.push("img/"+num.padStart(3, "0")+"-tree.png");
}
app.loader.add(trees);
app.loader.load(setup);
var g_loaded=0;
var g_total_resources = 64;
app.loader.onProgress.add(() => {
    g_loaded++;
    if(g_loaded < g_total_resources)
        showMessage("Loading... "+g_loaded+"/"+g_total_resources, 0, "gray");
    else
        showMessage("DONE", 500, "red");
}); // called once per loaded/errored file

app.stage.sortableChildren = true;

function setup() {


    container = new PIXI.Container();
	container.zIndex=1;

    var host = window.document.location.host.replace(/:.*/, '');
    var client = new Colyseus.Client(location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ''));
    client.joinOrCreate("amongus-chase").then(room => {
        console.log("joined with ", room.sessionId);
        g_room = room;
        state = room.state;
        mySessionId = room.sessionId;
		room.onError((code, message) => {
			console.log("oops, error ocurred:");
			console.log(message);
		});
        room.onStateChange.once(function (state) {
            console.log("initial room state:", state);
            state.players.$items.forEach(addPlayer);
			startWhenReady();
        });

		function startWhenReady() {
			if(g_map) {
				app.ticker.add(delta => gameLoop(delta));
                show(Q("#form"));
			} else {
				setTimeout(startWhenReady, 100)
			}
		}
        room.onMessage("obstacles", (obstacles) => {
			console.log("obstacles received");
            if(g_obstacles) {
                g_obstacles.forEach((o) => {
                    container.removeChild(o.sprite);
                })
            }
			g_obstacles = obstacles;
			obstacles.forEach((obstacle) => {
                obstacle.getBounds = getBounds;
                var textureKey = "img/"+(""+(Math.floor(Math.random()*50)+1)).padStart(3, "0")+"-tree.png";
                const tree = new PIXI.Sprite(app.loader.resources[textureKey].texture);
                tree.anchor.set(0.5);
                tree.x =obstacle.x-offset.x;
                tree.y = obstacle.y-offset.y;
                tree.width = tree.height = 30;
				tree.zIndex = 2;
                container.addChild(tree);
                obstacle.sprite = tree;
			})

		});
		room.onMessage("meeting", () => {
            positionToLoby();
			prepareMeeting();
		})
        function positionToLoby() {
            newx = Math.random() * 484 + 1734;
		    newy = Math.random() * 78 + 236;
			var s = {x: newx - me.lx, y: newy - me.ly}
			me.lx = me.x = newx;
			me.ly = me.y = newy;
			send('pos', {
			    x: me.x,
			    y: me.y
			});

			moveMySprite(s);
        }
		room.onMessage("vote", (vote) => {
			var votesSpan = Q("#votes_"+vote.voted_id);
			var p = g_players[vote.id];
			votesSpan.innerHTML = votesSpan.innerHTML+'<img src="img/' + (p.color) + '-among-us.png" width="24" height="24" style="vertical-align: middle"/>'
		})

        room.onMessage("chat", (msgObj) => {
			var chat_output = Q("#chat_output");
			var p = g_players[msgObj.id];
			chat_output.innerHTML = '<div>'+p.name+': '+msgObj.msg+'</div>' + chat_output.innerHTML;
		})

		room.onMessage("IMPOSTOR WON", () => {
		    showMessage("IMPOSTOR WON!", 5000, "red")
		    console.log("IMPOSTOR WON");
		})
		room.onMessage("IMPOSTOR FAILED", () => {
		    showMessage("CREWMATE WIN!!!", 5000, "gold")
		    console.log("IMPOSTOR FAILED");
		})
		room.onMessage("IMPOSTOR LEFT", () => {
		    showMessage("IMPOSTOR LEFT!<br>CREWMATE WIN!!!", 5000, "gold")
		    console.log("IMPOSTOR LEFT");
		})
		room.onMessage("TASKS COMPLETED", () => {
		    showMessage("TASKS COMPLETED!<br>CREWMATE WIN!!!", 5000, "gold")
		    console.log("TASKS COMPLETED");
		})
		room.onMessage("TIE", () => {
		    showMessage("TIE!", 2000, "gray")
		    console.log("TIE");
			hide(Q("#meeting"));
		})
		room.onMessage("IMPOSTOR VOTED", (id) => {
			var p = g_players[id];
		    showMessage(p.name + " WAS THE IMPOSTOR!<br>CREWMATE WIN!!!", 5000, "gold")
		    console.log(p.name + " WAS THE IMPOSTOR!<br>CREWMATE WIN!!!");
			hide(Q("#meeting"));
		})
		room.onMessage("CREWMATE VOTED", (id) => {
			var p = g_players[id];
            p.reported = true;
            if(p!=me) {
                p.sprite.visible = false;
                p.tag.visible = false;
            }
		    showMessage(p.name + " WAS NOT THE IMPOSTOR!<br>:-(", 5000, "brown")
		    console.log(p.name + " WAS NOT THE IMPOSTOR!<br>:-(");
			hide(Q("#meeting"));
		})

		room.state.players.onAdd = addPlayer;
        room.state.players.onRemove = removePlayer;
        room.state.onChange = stateChangeHandler;
        function stateChangeHandler(changes) {
			if (!g_game) {
			    g_game = state.game;
			    if (state.game == "amongus") {
			        INPUT_RESPONSE_RATE = 0.5;
			        NON_SCROLLING_RATIO = 0.3;
			        PLAYER_SIZE = 48;
			        TEXT_COLOR = "white";
			        KILL_DISTANCE = 60;
					app.renderer.backgroundColor = "0x000000";
                    hide(Q("#time"));
			    } else {
			        INPUT_RESPONSE_RATE = 0.02;
			        NON_SCROLLING_RATIO = 0.25;
			        PLAYER_SIZE = 32;
			        TEXT_COLOR = "black";
					app.renderer.backgroundColor = "0xffffff";
                    show(Q("#time"));
			    }
			    style = new PIXI.TextStyle({
			        fontFamily: "Arial",
			        fontSize: PLAYER_SIZE / 2,
			        fill: TEXT_COLOR,
                    strokeThickness: 2
			    });
			    styleImpostor = new PIXI.TextStyle({
			        fontFamily: "Arial",
			        fontSize: PLAYER_SIZE / 2,
			        fill: "red",
                    strokeThickness: 4
			    });
			}
			for (var i = 0; i < changes.length; i++) {
                console.log("stateChangeHandler:", changes[i].field);
                if (changes[i].field == "started") {
                    if (changes[i].value == true) {
                        console.log("GAME STARTED");
                        hide(Q("#startGame"));
                        if(me) {
                            positionToLoby();
                            if(me.impostor) {
                                showMessage("YOU ARE <br>THE IMPOSTOR!", 2000, "red")
                                if (g_game == "amongus") {
                                    g_next_kill_time = time() + KILL_TIMEOUT * 1000;
                                    show(Q("#time-to-kill"))
                                    prepareItems();
                                }
                            } else {
                                showMessage("YOU ARE<br>CREWMATE", 2000, "brown")
                                if (g_game == "amongus") {
                                    prepareItems(me.tasks);
                                }
                            }
                        } else {
                            showMessage("GAME ALREADY STARTED<br>YOU CAN WATCH", 0, "gray")
                        }

                    } else {
                        show(Q("#startGame"));
                    }
                } else if (changes[i].field == "elapsed") {
                    var timeDiv = Q("#time");
                    timeDiv.innerHTML = 100 - changes[i].value;
                }

            }

        }
        // new room state
        room.onStateChange(function (state) {
            // console.log("State changed: ", state);
        });

        function addPlayer(player, sessionId) {
            if (g_players[sessionId])
                return;
            console.log("addPlayer", player, sessionId);
            player.color = player.color || "blue";
            g_players[sessionId] = player;
            player.onChange = (changes) => {
                playerChanged(player, changes)
            };
			player.getBounds = getBoundsPlayer;
            let sprite = new PIXI.Sprite(app.loader.resources["img/" + (player.color) + "-among-us.png"].texture);
            sprite.width = PLAYER_SIZE;
            sprite.height = PLAYER_SIZE;
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            sprite.zIndex = 5;
            player.sprite = sprite;

            var name = new PIXI.Text(nick || player.name || player.id, style);
            player.tag = name;
            player.tag.zIndex = 5;
            if(state.started) {
                player.sprite.visible = false;
                player.tag.visible = false;
            }

            if (player.id == mySessionId) {
                if(state.started) {
                    showMessage("GAME ALREADY STARTED<br>YOU CAN WATCH", 0, "gray")
                }
                player.sprite.visible = true;
                player.tag.visible = true;
                me = player;
                me.s = new Victor(0, 0);
                sprite.x = app.screen.width / 2;
                sprite.y = app.screen.height / 2;
                sprite.zIndex = 10;
                player.tag.zIndex = 10;
                me.lx = me.x;
                me.ly = me.y;
                offset = {
                    x: me.x - sprite.x,
                    y: me.y - sprite.y
                }
                for (const id in g_players) {
                    if (id != mySessionId) {
                        var p = g_players[id];
                        p.sprite.x = p.x - offset.x;
                        p.sprite.y = p.y - offset.y;
                        p.tag.x = p.sprite.x;
                        p.tag.y = p.sprite.y - p.sprite.height;
                    }
                }
				if (state.game == "amongus") {
					var bckg = "img/map.png";
                    prepareItemSprites();
				} else {
				    graphics = new PIXI.Graphics();
				    graphics.zIndex = 0;
				    graphics.lineStyle(10, 0x00ff00, 0.2);
				    graphics.beginFill(0xffffff, 0.0);
				    //graphics.beginTextureFill({texture: app.loader.resources["img/map.png"].texture});
				    graphics.drawRect(-offset.x - PLAYER_SIZE / 2, -offset.y - PLAYER_SIZE / 2, state.world_size_x + PLAYER_SIZE, state.world_size_y + PLAYER_SIZE);
				    graphics.endFill();
				    container.addChild(graphics);
					var bckg = "img/bckg.png";
				}
			    tilingSprite = new PIXI.Sprite(app.loader.resources[bckg].texture);
				tilingSprite.zIndex=0;
				tilingSprite.width = state.world_size_x;
				tilingSprite.height = state.world_size_y;
				tilingSprite.anchor.x = offset.x/tilingSprite.width;
				tilingSprite.anchor.y = offset.y/tilingSprite.height;
				app.stage.addChild(tilingSprite);
                app.stage.addChild(container);
            } else if (offset) {
                sprite.x = player.x - offset.x + tilingSprite.x;
                sprite.y = player.y - offset.y + tilingSprite.y;
            } else {
                sprite.x = app.screen.width / 2;
                sprite.y = app.screen.height / 2;
            }
            name.x = sprite.x;
            name.y = sprite.y - sprite.height;
            name.anchor.x = 0.5;
            name.anchor.y = 0.5;
            app.stage.addChild(sprite);
            app.stage.addChild(name);
            showPlayers();
        }
        function removePlayer(player, sessionId) {
            console.log("removePlayer", player, sessionId);
            var p = g_players[sessionId];
            if (p) {
                app.stage.removeChild(p.sprite);
                app.stage.removeChild(p.tag);
                delete g_players[sessionId];
            }
            showPlayers();
        }
        function playerChanged(player, changes) {
            //            console.log("playerChanged", changes.length);
            for (var i = 0; i < changes.length; i++) {
                if (changes[i].field == 'x' || changes[i].field == 'y') {
                    continue;
                } else if (changes[i].field == 'name') {
                    player.name = changes[i].value;
					player.tag.text = player.name;
                    showPlayers();
                } else if (changes[i].field == 'tasks') {
                } else if (changes[i].field == 'color') {
                    player.color = changes[i].value;
                    player.sprite.texture = app.loader.resources["img/" + (player.color || "blue") + "-among-us.png"].texture;
                    showPlayers();
                } else if (changes[i].field == 'impostor') {
                    if (player.id != mySessionId)
                        continue;
                    player.impostor = changes[i].value;
                    if (player.impostor)
                        player.tag.style = styleImpostor;
                    else
                        player.tag.style = style;
                } else if (changes[i].field == 'alive') {
                    if (!player.alive) {
                        player.sprite.rotation = Math.PI / 2;
					} else {
						if(player.me != player) {
							player.sprite.visible=true;
							player.tag.visible=true;
						}
                        player.sprite.rotation = 0;
					}
                } else {
                    console.log("playerChanged", changes[i].field);
                }
            }
        }
        var counter = 0;
        var collision_flag;
        function gameLoop(delta) {
			try {
            g_delta = delta;
            counter++;
            if (!offset)
                return;
			var futureMePos = {x: me.lx, y: me.ly, getBounds: getBoundsPlayer};
			if (state.game == "chase") {
				futureMePos.x += me.s.x*2;
				futureMePos.y += me.s.y*2;
			    if (me.alive && g_obstacles && g_obstacles.length) {
			        g_obstacles.forEach((obstacle) => {
			            var collision = colisionTest(futureMePos, obstacle);
			            if (collision) {
			                if (collision.x > collision.y)
			                    me.s.x *= 0;
			                else
			                    me.s.y *= 0;
			            }
			        })
			    }

			} else {
				if(me.impostor)
					updateTime2Kill();
			    checkActions();
			    if (me.alive) {
			        futureMePos.x += me.s.x * 2;
			        if (me.alive && !isCorridor(futureMePos.x, futureMePos.y))
			            me.s.x *= 0;
			        futureMePos.y += me.s.y * 2;
			        if (!isCorridor(futureMePos.x, futureMePos.y))
			            me.s.y *= 0;
			    }
			}
			me.lx += me.s.x;
            me.ly += me.s.y;
            if (me.lx < 0) {
                me.lx = 0;
            }
            if (me.ly < 0) {
                me.ly = 0;
            }
            if (me.lx > state.world_size_x) {
                me.lx = state.world_size_x;
            }
            if (me.ly > state.world_size_y) {
                me.ly = state.world_size_y;
            }
			if (me.alive) {
			    me.x = me.lx;
			    me.y = me.ly;
			    send('pos', {
			        x: me.x,
			        y: me.y
			    });
			}
			var flagJump = moveMySprite(me.s);
			movePlayers(flagJump);
			var dv = getSpeed();
            if (dv.length() > 1)
                dv.normalize();
            dv.x *= rate * delta;
            dv.y *= rate * delta;
            me.s.mix(dv, INPUT_RESPONSE_RATE)
            if (counter % 120 == 0) {
                //var info = Q("#players");
                //info.innerHTML = "me.s: " + me.s.length();
            }
			} catch(e) {
				alert(e);
			}
        }

		function movePlayers(jump) {
			var flagCanKill = false;
			var flagCanReport = false;

            for (const id in g_players) {
                if (id != mySessionId) {
                    var p = g_players[id];
					if (me.impostor) {
						if(canKill(p)) {
							if(g_game == "chase") {
								if(p.alive)
									send('killed', p.id)
							} else {
								flagCanKill = true;
							}
						}
					} else {
						if(g_game == "amongus" && canReport(p)) {
							flagCanReport = true;
						}
					}
					if(jump) {
						p.sprite.x = lerp(p.sprite.x, p.x - offset.x + tilingSprite.x, 1);
						p.sprite.y = lerp(p.sprite.y, p.y - offset.y + tilingSprite.y, 1);
					} else {
						if (p.sprite.x < p.x - offset.x + tilingSprite.x) {
						    p.sprite.scale.x = -Math.abs(p.sprite.scale.x);
						} else if (p.sprite.x > p.x - offset.x + tilingSprite.x) {
						    p.sprite.scale.x = Math.abs(p.sprite.scale.x);
						}
						p.sprite.x = lerp(p.sprite.x, p.x - offset.x + tilingSprite.x, 0.3);
						p.sprite.y = lerp(p.sprite.y, p.y - offset.y + tilingSprite.y, 0.3);
					}
                    p.tag.x = p.sprite.x;
                    p.tag.y = p.sprite.y - p.sprite.height;
                }
            }
			if(flagCanKill) {
				show(g_killPlayerButton);
			} else {
				hide(g_killPlayerButton);
			}
			if(flagCanReport) {
				show(g_reportBodyButton);
			} else {
				hide(g_reportBodyButton);
			}
		}

		function checkActions(p) {
            var canUse = false;
			g_my_items.forEach((task) => {
                var distance = USE_DISTANCE;
                if(me.impostor) {
                    if(task.type == "vent") {
                        if(Math.abs(me.lx - task.x) < distance && Math.abs(me.ly - task.y) < distance) {
                            g_useButton.dataset.index = task.index;
                            task.sprite.visible = true;
                            canUse=true;
                        } else {
                            task.sprite.visible = false;
                        }
                    }
                } else {
                    if(task.type == "meeting") {
                        distance = MEETING_DISTANCE;
                    }
                    if(!task.solved && !(task.type == "meeting" && !me.alive)) {
                        if(Math.abs(me.lx - task.x) < distance && Math.abs(me.ly - task.y) < distance) {
                            g_useButton.dataset.index = task.index;
                            task.sprite.width = task.sprite.height = USE_SPRITE_SIZE;
                            task.sprite.visible = true;
                            canUse=true;
                        } else if(Math.abs(me.lx - task.x) < VIEW_TASK_DISTANCE && Math.abs(me.ly - task.y) < VIEW_TASK_DISTANCE) {
                            task.sprite.width = task.sprite.height = USE_SPRITE_SIZE/2;
                            task.sprite.visible = true;
                        } else {
                            task.sprite.visible = false;
                        }
                    }
                }
			});
            if(canUse)
                show(g_useButton);
            else
                hide(g_useButton);
		}

        const rate = 4;
        var curr_vec = new Victor(0, 0);
        function getSpeed() {
            if (joy) {
                curr_vec.x = (joy.GetX());
                curr_vec.y =  - (joy.GetY());
                return curr_vec;
            } else {
                curr_vec.x = (mousePos.x - me.sprite.x);
                curr_vec.y = (mousePos.y - me.sprite.y);
                return curr_vec;
            }
        }
        // send message to room on submit
        Q("#form").onsubmit = function (e) {
            e.preventDefault();

            var input = Q("#name");
            var select = Q("#color");

            console.log("name:", input.value);

            // send data to room
            send("name", input.value);
            setCookie("nick", input.value);
            send("color", select.value);
            setCookie("color", select.value);

            hide(Q("#form"));
			if(!state.started)
				show(Q("#startGame"));
        }
    });
}

function moveMySprite(s) {
    if(me.s.x>0) {
        me.sprite.scale.x = -Math.abs(me.sprite.scale.x);
    } else if(me.s.x<0) {
        me.sprite.scale.x = Math.abs(me.sprite.scale.x);
    }
    me.sprite.skew.x = -me.s.x/30;
    var flagJump = false;
    var newx = me.lx - offset.x + tilingSprite.x;
    var newy = me.ly - offset.y + tilingSprite.y;
    if (newx > app.screen.width * NON_SCROLLING_RATIO && newx < app.screen.width * (1-NON_SCROLLING_RATIO)) {
        me.sprite.x = newx;
        me.tag.x = me.sprite.x;
    } else {
        tilingSprite.x -= s.x;
        container.position.x -= s.x;
        flagJump = true;
    }
    if (newy > app.screen.height * NON_SCROLLING_RATIO && newy < app.screen.height * (1-NON_SCROLLING_RATIO)) {
        me.sprite.y = newy;
        me.tag.y = me.sprite.y - me.sprite.height;
    } else {
        tilingSprite.y -= s.y;
        container.position.y -= s.y
        flagJump = true;
    }
    return flagJump;
}

var g_useButton = Q("#useItem");
var g_killPlayerButton = Q("#killPlayer");
var g_reportBodyButton = Q("#reportBody");

function prepareItemSprites() {
    ALL_ITEMS.forEach((item, i) => {
        const sprite = new PIXI.Sprite(app.loader.resources["img/item.png"].texture);
        sprite.anchor.set(0.5);
        sprite.x = item.x - offset.x;
        sprite.y = item.y - offset.y;
        sprite.width = sprite.height = USE_SPRITE_SIZE;
        sprite.visible = false;
        container.addChild(sprite);
        item.sprite = sprite;
    });

}
function prepareItems(tasksString) {
    var tasksDiv = Q('#tasks');
    g_my_items = [];
    if(me.impostor) {
        SPECIAL_ITEMS_IMPOSTOR.forEach((task, i) => {
            task.index = i;
            g_my_items.push(task);
        });
        hide(tasksDiv);
    } else {
        var html = '';
        var tasksIndexes = tasksString.split(",");
        tasksIndexes.forEach((index, i) => {
            var task = TASKS[index];
            task.index = i;
            task.solved = false;
            g_my_items.push(task);
            html+='<div id="task_'+i+'" style="font-size: 18px">'+task.name+'</div>';
        });
        tasksDiv.innerHTML = html;
        show(tasksDiv);
        var i = g_my_items.length;
        SPECIAL_ITEMS_CREW.forEach((item) => {
            item.index = i;
            g_my_items.push(item);
            i++;
        });
    }
}

function prepareMeeting() {
    var div = Q("#meeting");
    hide(Q("#task"));
    show(div);
    var html = "";
    html+= "<ul>"
    for (const id in g_players) {
        var p = g_players[id];
        if (id != mySessionId) {
            var p = g_players[id];
            if(!p.alive) {
                p.reported = true;
                if(p != me) {
                    p.sprite.visible = false;
                    p.tag.visible = false;
                }
            }
        }
        html+="<li>"
        html+="<span>"
        html+='<img src="img/' + (p.color || "blue") + '-among-us.png" width="48" height="48" style="vertical-align: middle"/>'
        html+='<span>'+p.name+' : </span>'
        html+='<span id="votes_'+id+'"></span>'
        if(p.alive && me.alive)
            html+='<input id="vote#'+id+'" class="vote" type="submit" value="&#10004;" onClick="vote(event)" style="float: right;"/>'
        html+="</span>"
        html+="</li>"
    }
    html+= "</ul>"
    html+= '<div id="chat_output" style="font-size: 20px;"/>'
    html+= '<div style="position: absolute; bottom: 15px; left:10px; right: 10px; display: table;">'
    html+='<input id="skip" type="submit" value="&#10060;" onClick="vote(event)" style="display: table-cell"/>'
    html+='<input id ="chat_input" type="text" style="width: 70%; display: table-cell">'
    html+='<input id="send_chat" type="submit" value="&#10132;" onClick="sendChat(event)" style="display: table-cell"/>'
    html+="</div>"
    div.innerHTML = html;
}

function sendChat() {
    var text = Q("#chat_input").value;
    send('chat', text);
}
function vote(event) {
    var voteButton = event.target;
    if(voteButton.id == "skip") {
        send("vote", '')
        voteButton.disabled = true;
    } else {
        var tmp = voteButton.id.split("#");
        send("vote", tmp[1])
        Q("#skip").disabled = true;
    }
    var inputs = QA("#meeting input.vote");
    [...inputs].forEach((input) => {
        input.disabled = true;
    });
}

var g_disconnected = false;
function send(type, data) {
	if(g_room.connection.transport.ws.readyState == 1) {
		g_room.send(type, data);
	} else {
		if(g_disconnected != true) {
			console.log("SERVER is disconnected!")
			showMessage("SERVER is disconnected!<br>Try refreshing the browser.", 0, "red")
			g_disconnected = true;
		}
	}
}

function canKill(p) {
    if (g_next_kill_time == 0 && Math.abs(me.lx - p.x) < KILL_DISTANCE && Math.abs(me.ly - p.y) < KILL_DISTANCE)
        return true;
    else
        return false;
}
function canReport(p) {
    if (me.alive && !p.alive && !p.reported && Math.abs(me.lx - p.x) < KILL_DISTANCE*2 && Math.abs(me.ly - p.y) < KILL_DISTANCE*2)
        return true;
    else
        return false;
}

function killPlayer() {
    for (const id in g_players) {
        if (id != mySessionId) {
            var p = g_players[id];
            if (canKill(p)) {
                send('killed', p.id)
				g_next_kill_time = time() + KILL_TIMEOUT * 1000;
            }
        }
    }
}

function reportBody() {
    for (const id in g_players) {
        if (id != mySessionId) {
            var p = g_players[id];
            if (canReport(p)) {
                send('meeting', '')
            }
        }
    }
}

function useVent(item) {
    var newx = item.tx;
    var newy = item.ty;
    var s = {x: newx - me.lx, y: newy - me.ly}
    me.lx = me.x = newx;
    me.ly = me.y = newy;
    send('pos', {
        x: me.x,
        y: me.y
    });
    moveMySprite(s);
}

function useItem(event) {
    var useButton = event.target;
    var item = g_my_items[useButton.dataset.index];
    if(item.type == "meeting")
        send("meeting");
    else if(item.type == "task")
        solveTask(item);
    else if(item.type == "vent")
        useVent(item);
    else {
        console.log("Unknown item type:", item.type);
    }
}

var g_delta;
function startGame() {
    send("start", "");
    var startDiv = Q("#startGame");
    startDiv.style.display = 'none';
}
var my_cookies;
function getCookie(name) {
    try {

        if (!my_cookies) {
            my_cookies = {};
            var c = document.cookie;
            var a = c.split(";");
            a.forEach((key_value) => {
                var tmp = key_value.split("=");
                my_cookies[tmp[0].trim()] = tmp[1].trim();
            });
        }
        return my_cookies[name];
    } catch (e) {}
}
function setCookie(name, val) {
    document.cookie = name + "=" + val;
}
const lerp = (a, b, t) => (b - a) * t + a;

function colisionTest(object1, object2) {
    var bounds1 = object1.getBounds();
    var bounds2 = object2.getBounds();
    var flagx = 1, flagy = 1;
    if (bounds1.x >= bounds2.x + bounds2.width || bounds2.x >= bounds1.x + bounds1.width)
        return false;
    if (bounds1.y >= bounds2.y + bounds2.height || bounds2.y>= bounds1.y+ bounds1.height)
        return false;

    return {x: Math.abs(object1.x - object2.x), y: Math.abs(object1.y - object2.y)};
}

function getBounds() {
	return {x: this.x-5, y:this.y-5, width: 10, height: 10};
}
function getBoundsPlayer() {
	return {x: this.x-PLAYER_SIZE/2, y:this.y-PLAYER_SIZE/2, width: PLAYER_SIZE, height: PLAYER_SIZE};
}

function isCorridor(x, y) {
	var rgbt = g_map.getImageData(x, y, 1, 1).data;
	if(rgbt[0] == corridorR && rgbt[1] == corridorG && rgbt[2] == corridorB)
		return true;
	else
		return false;
}

function updateTime2Kill() {
	if(g_next_kill_time==0)
		return;
	var remaining = Math.floor((g_next_kill_time-time())/1000)
	if(remaining != g_time_to_kill_sec) {
        var time_to_kill_button = Q("#time-to-kill");
		time_to_kill_button.innerHTML = remaining;
        show(time_to_kill_button);
		if(remaining <= 0) {
			g_next_kill_time = 0;
			hide(time_to_kill_button);
		}
	}

}

function showPlayers() {
    var info = Q("#players");
    info.innerHTML = "";
    for (const id in g_players) {
        var p = g_players[id];
        info.innerHTML += '<div style="font-size: 16px; color:' + p.color + '">' + p.name + '</div>';
    }

}
var g_showMessageTimeout;
function showMessage(msg, timeout, color) {
    if(g_showMessageTimeout)
        clearTimeout(g_showMessageTimeout)
    var messageDiv = Q("#message");
    show(messageDiv);
    messageDiv.innerHTML = msg;
    messageDiv.style.color = color || "blue";
    if(timeout) {
        g_showMessageTimeout =  setTimeout(() => {
            hide(Q("#message"));
            g_showMessageTimeout = null;
        }, timeout);
    }
}
function hide(el) {
    if(el.target)
        el = el.target;
	el.style.display = "none";
}
function show(el) {
	el.style.display = "inline-block";
}

function time() {
	return new Date().getTime();
}

document.getElementById("mapCorridorsImg").onload = function () {
	loadMap();
};
function loadMap() {
	if(g_map)
		return;
    var c = document.createElement("CANVAS");
    var ctx = c.getContext("2d");
    var img = document.getElementById("mapCorridorsImg");
    c.width = img.width;
    c.height = img.height;
    ctx.drawImage(img, 0, 0);
    g_map = ctx;
}
setTimeout(loadMap, 5000);

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
