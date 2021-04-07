var Q = document.querySelector.bind(document);
var QA = document.querySelectorAll.bind(document)
var INPUT_RESPONSE_RATE = 1;
var NON_SCROLLING_RATIO = 0.3;
var KILL_TIMEOUT=20;
var corridorR = 1;
var corridorG = 2;
var corridorB = 3;
var PLAYER_SIZE = 48;
var TEXT_COLOR = "black";
var KILL_DISTANCE = 30;
var TASKS
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
var g_my_tasks = [];
var TASKS = [
  {x: 1633, y: 273, name: "Wires", type: "task"},
  {x: 2332, y: 300, name: "Download", type: "task"},
  {x: 811, y: 1061, name: "Wires", type: "task"},
  {x: 2413, y: 381, name: "Garbage", type: "task"},
  {x: 1585, y: 1293, name: "Distributor", type: "task"},
  {x: 1335, y: 1276, name: "Power", type: "task"},
  {x: 2914, y: 1501, name: "Accept Power", type: "task"},
  {x: 3566, y: 1049, name: "Steering", type: "task"},
  {x: 2524, y: 931, name: "O2 filter", type: "task"}
]
var SPECIAL_ITEMS = {
    {x: 1987, y: 612, name: "Meeting", type: "meeting"}
}
var ALL_ITEMS = TASKS.concat(SPECIAL_ITEMS);

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
	show(Q("#joyDiv"))
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
        "img/map.png"
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
        showMessage("Loading... "+g_loaded+"/"+g_total_resources);
    else
        showMessage("DONE", 1000);
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
			prepareMeeting();
		})

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
		    showMessage("IMPOSTOR WON!", 5000)
		    console.log("IMPOSTOR WON");
		})
		room.onMessage("IMPOSTOR FAILED", () => {
		    showMessage("CREWMATE WIN!!!", 5000)
		    console.log("IMPOSTOR FAILED");
		})
		room.onMessage("IMPOSTOR LEFT", () => {
		    showMessage("IMPOSTOR LEFT!<br>CREWMATE WIN!!!", 5000)
		    console.log("IMPOSTOR LEFT");
		})
		room.onMessage("TASKS COMPLETED", () => {
		    showMessage("TASKS COMPLETED!<br>CREWMATE WIN!!!", 5000)
		    console.log("TASKS COMPLETED");
		})
		room.onMessage("TIE", () => {
		    showMessage("TIE!", 2000)
		    console.log("TIE");
			hide(Q("#meeting"));
		})
		room.onMessage("IMPOSTOR VOTED", (id) => {
			var p = g_players[id];
		    showMessage(p.name + " WAS THE IMPOSTOR!<br>CREWMATE WIN!!!", 5000)
		    console.log(p.name + " WAS THE IMPOSTOR!<br>CREWMATE WIN!!!");
			hide(Q("#meeting"));
		})
		room.onMessage("CREWMATE VOTED", (id) => {
			var p = g_players[id];
            p.reported = true;
            p.sprite.zIndex = -1;
		    showMessage(p.name + " WAS NOT IMPOSTOR!<br>:-(", 5000)
		    console.log(p.name + " WAS NOT IMPOSTOR!<br>:-(");
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
                        hide(Q("#message"));
                        hide(Q("#startGame"));
                        if (g_game == "amongus" && me.impostor) {
                            g_next_kill_time = time() + KILL_TIMEOUT * 1000;
                            show(Q("#time-to-kill"))
                            showMessage("IMPOSTOR", 2000)
                        }
                        if(me.impostor)
                            showMessage("IMPOSTOR", 2000)
                        else
                            showMessage("CREWMATE", 2000)

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
            if (player.id == mySessionId) {
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
				if (state.game == "chase") {
				}
				if (state.game == "amongus")
					var bckg = "img/map.png";
				else {
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
							player.sprite.zIndex=5;
							player.tag.zIndex=5;
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
				show(Q("#killPlayer"));
			} else {
				hide(Q("#killPlayer"));
			}
			if(flagCanReport) {
				show(Q("#reportBody"));
			} else {
				hide(Q("#reportBody"));
			}
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

		function checkActions(p) {
			g_my_tasks.forEach((task) => {

			});
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
			if(!state.game.started)
				show(Q("#startGame"));
        }
    });
}
function prepareMeeting() {
    var div = Q("#meeting");
    show(div);
    var html = "";
    html+= "<ul>"
    for (const id in g_players) {
        var p = g_players[id];
        if (id != mySessionId) {
            var p = g_players[id];
            if(!p.alive) {
                p.reported = true;
                p.sprite.zIndex = -1;
                p.tag.zIndex = -1;
            }
        }
        html+="<li>"
        html+="<span>"
        html+='<img src="img/' + (p.color || "blue") + '-among-us.png" width="48" height="48" style="vertical-align: middle"/>'
        html+='<span>'+p.name+' : </span>'
        html+='<span id="votes_'+id+'"></span>'
        if(p.alive && me.alive)
            html+='<input id="vote_'+id+'" class="vote" type="submit" value="&#10004;" onClick="vote(event)" style="float: right;"/>'
        html+="</span>"
        html+="</li>"
    }
    html+= "</ul>"
    html+= '<div id="chat_output" />'
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
    } else {
        var tmp = voteButton.id.split("_");
        send("vote", tmp[1])
    }
    var inputs = QA("#meeting input.vote");
    [...inputs].forEach((input) => {
        input.disabled = true;
    });
    hide(Q("#skip"))
    voteButton.disabled = true;
}

var g_disconnected = false;
function send(type, data) {
	if(g_room.connection.transport.ws.readyState == 1) {
		g_room.send(type, data);
	} else {
		if(g_disconnected != true) {
			console.log("SERVER is disconnected!")
			showMessage("SERVER is disconnected!<br>Try refreshing the browser.", 10000)
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
		Q("#time-to-kill").innerHTML = remaining;
		if(remaining == 0) {
			g_next_kill_time = 0;
			hide(Q("#time-to-kill"));
		}
	}

}

function showPlayers() {
    var info = Q("#players");
    info.innerHTML = "";
    for (const id in g_players) {
        var p = g_players[id];
        info.innerHTML += '<div style="color:' + p.color + '">' + p.name + '</div>';
    }

}
function showMessage(msg, timeout) {
    var messageDiv = Q("#message");
    show(messageDiv);
    messageDiv.innerHTML = msg;
    if(timeout) {
        setTimeout(() => {
            hide(Q("#message"));
        }, timeout);
    }
}
function hide(el) {
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
