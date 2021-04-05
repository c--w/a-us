var Q = document.querySelector.bind( document );
var INPUT_RESPONSE_RATE = 1;
var NON_SCROLLING_RATIO = 0.3;
var corridorR = 1;
var corridorG = 2;
var corridorB = 2;
var PLAYER_SIZE = 48;
var TEXT_COLOR = "black";
var players = {};
var players_length;
var mySessionId;
var me;
var offset;
var state;
var tilingSprite;
var container;
var myRoom;
var graphics;
var g_map;
var g_obstacles;
var style, styleImpostor;
var g_game;

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
    var joyDiv = Q("#joyDiv");
    joyDiv.style.display = 'block';
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
app.renderer.backgroundColor = "0xffffff";

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
app.stage.sortableChildren = true;

function setup() {
    container = new PIXI.Container();
	container.zIndex=1;

    var host = window.document.location.host.replace(/:.*/, '');
    var client = new Colyseus.Client(location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ''));
    client.joinOrCreate("amongus-chase").then(room => {
        console.log("joined with ", room.sessionId);
        myRoom = room;
        state = room.state;
        mySessionId = room.sessionId;
        room.onStateChange.once(function (state) {
            console.log("initial room state:", state);
            var info = Q("#players");
            info.innerHTML = "Players: " + state.players.$items.size;
            state.players.$items.forEach(addPlayer);
            app.ticker.add(delta => gameLoop(delta));
        });
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
        room.state.players.onAdd = addPlayer;
        room.state.players.onRemove = removePlayer;
        room.state.onChange = stateChangeHandler;
        function stateChangeHandler(changes) {
			if(!g_game) {
				g_game = state.game;
            if (state.game == "amongus") {
                INPUT_RESPONSE_RATE = 1;
                NON_SCROLLING_RATIO = 0.3;
                PLAYER_SIZE = 48;
                TEXT_COLOR = "white";
            } else {
                INPUT_RESPONSE_RATE = 0.01;
                NON_SCROLLING_RATIO = 0.1;
                PLAYER_SIZE = 32;
                TEXT_COLOR = "black";
            }
            style = new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: PLAYER_SIZE/2,
                fill: TEXT_COLOR
            });
            styleImpostor = new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: PLAYER_SIZE/2,
                fill: "red"
            });
				
			}
            for (var i = 0; i < changes.length; i++) {
                console.log("stateChangeHandler:", changes[i].field);
                if (changes[i].field == "started") {
                    if (changes[i].value == true) {
                        console.log("GAME STARTED");
                        var message = Q("#message");
                        message.style.display = "none";
                    } else {
                        var startDiv = Q("#startGame");
                        startDiv.style.display = 'block';
                        if (!me)
                            return;
                        console.log("GAME FINISHED");
                        var message = Q("#message");
                        message.style.display = "block";
                        if (state.elapsed >= 100) {
                            message.innerHTML = "IMPOSTOR FAILED";
                            console.log("IMPOSTOR FAILED");
                        } else {
                            message.innerHTML = "IMPOSTOR WON";
                            console.log("IMPOSTOR WON");
                        }
                        setTimeout(() => {
                            var message = Q("#message");
                            message.style.display = "none";
                        }, 5000);
                    }
                } else if (changes[i].field == "elapsed") {
                    var timeDiv = Q("#time");
                    time.innerHTML = 100 - changes[i].value;
                }

            }

        }
        // new room state
        room.onStateChange(function (state) {
            // console.log("State changed: ", state);
            if (players_length != state.players.$items.size) {
                var info = Q("#players");
                info.innerHTML = "Players: " + state.players.$items.size;
                players_length = state.players.$items.size;
            }
        });
        function addPlayer(player, sessionId) {
            if (players[sessionId])
                return;
            console.log("addPlayer", player, sessionId);
            players[sessionId] = player;
            player.onChange = (changes) => {
                playerChanged(player, changes)
            };
			player.getBounds = getBoundsPlayer;
            let sprite = new PIXI.Sprite(app.loader.resources["img/" + (player.color || color) + "-among-us.png"].texture);
            sprite.width = PLAYER_SIZE;
            sprite.height = PLAYER_SIZE;
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            sprite.zIndex = 5;
            player.sprite = sprite;

            var name = new PIXI.Text(player.name || nick, style);
            player.tag = name;
            name.zIndex = 1;
            if (player.id == mySessionId) {
                me = player;
                me.s = new Victor(0, 0);
                sprite.x = app.screen.width / 2;
                sprite.y = app.screen.height / 2;
                sprite.zIndex = 10;
                name.zIndex = 10;
                me.lx = me.x;
                me.ly = me.y;
                offset = {
                    x: me.x - sprite.x,
                    y: me.y - sprite.y
                }
                for (const id in players) {
                    if (id != mySessionId) {
                        var p = players[id];
                        p.sprite.x = p.x - offset.x;
                        p.sprite.y = p.y - offset.y;
                        p.tag.x = p.sprite.x;
                        p.tag.y = p.sprite.y - p.sprite.height;
                    }
                }
                graphics = new PIXI.Graphics();
                graphics.zIndex=0;
                graphics.lineStyle(10, 0x00ff00, 0.2);
                graphics.beginFill(0xffffff, 0.0);
                //graphics.beginTextureFill({texture: app.loader.resources["img/map.png"].texture});
                graphics.drawRect(-offset.x - PLAYER_SIZE/2, -offset.y - PLAYER_SIZE/2, state.world_size_x + PLAYER_SIZE, state.world_size_y + PLAYER_SIZE);
                graphics.endFill();
                container.addChild(graphics);
				if(state.game == "amongus")
					var bckg = "img/map.png";
				else
					var bckg = "img/bckg.png";
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
        }
        function removePlayer(player, sessionId) {
            console.log("removePlayer", player, sessionId);
            var p = players[sessionId];
            if (p) {
                app.stage.removeChild(p.sprite);
                app.stage.removeChild(p.tag);
                delete players[sessionId];
            }
        }
        function playerChanged(player, changes) {
            //            console.log("playerChanged", changes.length);
            for (var i = 0; i < changes.length; i++) {
                if (changes[i].field == 'x' || changes[i].field == 'y') {
                    continue;
                } else if (changes[i].field == 'name') {
                    player.name = changes[i].value;
                    player.tag.text = player.name;
                } else if (changes[i].field == 'color') {
                    player.color = changes[i].value;
                    player.sprite.texture = app.loader.resources["img/" + (player.color || "blue") + "-among-us.png"].texture;
                } else if (changes[i].field == 'impostor') {
                    if (player.id != mySessionId)
                        continue;
                    player.impostor = changes[i].value;
                    if (player.impostor)
                        player.tag.style = styleImpostor;
                    else
                        player.tag.style = style;
                } else if (changes[i].field == 'alive') {
                    if (!player.alive)
                        player.sprite.rotation = Math.PI / 2;
                    if (player.alive)
                        player.sprite.rotation = 0;
                } else {
                    console.log("playerChanged", changes[i].field);
                }
            }
        }
        var counter = 0;
        var collision_flag;
        function gameLoop(delta) {
            g_delta = delta;
            counter++;
            if (!offset)
                return;
            for (const id in players) {
                if (id != mySessionId) {
                    var p = players[id];
                    //var new_sprite_x = p.x - offset.x + tilingSprite.tilePosition.x;
                    //var new_sprite_y = p.y - offset.y + tilingSprite.tilePosition.y;
                    p.sprite.x = lerp(p.sprite.x, p.x - offset.x + tilingSprite.x, 0.3);
                    p.sprite.y = lerp(p.sprite.y, p.y - offset.y + tilingSprite.y, 0.3);
                    //var diffx = new_sprite_x - p.sprite.x;
                    //var diffy = new_sprite_y - p.sprite.y;
                    //p.sprite.x = lerp(new_sprite_x, p.sprite.x+diffx*2, 0.2);
                    //p.sprite.y = lerp(new_sprite_y, p.sprite.y+diffy*2, 0.2);
                    //p.sprite.x = new_sprite_x;
                    //p.sprite.y = new_sprite_y;
                    p.tag.x = p.sprite.x;
                    p.tag.y = p.sprite.y - p.sprite.height;
                }
            }
            if (!me.alive) {
                return;
            }
			
			var futureMePos = {x: me.x, y: me.y, getBounds: getBoundsPlayer};
			if (state.game == "chase") {
				futureMePos.x += me.s.x;
				futureMePos.y += me.s.y;
			    if (g_obstacles && g_obstacles.length) {
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
				futureMePos.x += me.s.x*2;
				if(!isCorridor(futureMePos.x, futureMePos.y))
					me.s.x*= 0;
				futureMePos.y += me.s.y*2;
				if(!isCorridor(futureMePos.x, futureMePos.y))
					me.s.y*= 0;
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
            me.x = me.lx;
            me.y = me.ly;
            room.send('pos', {
                x: me.x,
                y: me.y
            });
            //            var newx = me.sprite.x + me.s.x;
            //            var newy = me.sprite.y + me.s.y;
            var newx = me.lx - offset.x + tilingSprite.x;
            var newy = me.ly - offset.y + tilingSprite.y;
            if (newx > app.screen.width * NON_SCROLLING_RATIO && newx < app.screen.width * (1-NON_SCROLLING_RATIO)) {
                me.sprite.x = newx;
                me.tag.x = me.sprite.x;
            } else {
                tilingSprite.x -= me.s.x;
                container.position.x -= me.s.x
            }
            if (newy > app.screen.height * NON_SCROLLING_RATIO && newy < app.screen.height * (1-NON_SCROLLING_RATIO)) {
                me.sprite.y = newy;
                me.tag.y = me.sprite.y - me.sprite.height;
            } else {
                tilingSprite.y -= me.s.y;
                container.position.y -= me.s.y
            }
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
            room.send("name", input.value);
            setCookie("nick", input.value);
            room.send("color", select.value);
            setCookie("color", select.value);

            var form = Q("#form");
            form.style.display = 'none';
            var startDiv = Q("#startGame");
			startDiv.style.display = 'block';
        }
    });
}
var g_delta;
function startGame() {
    myRoom.send("start", "");
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

document.getElementById("mapCorridorsImg").onload = function () {
    var c = document.createElement("CANVAS");
    var ctx = c.getContext("2d");
    var img = document.getElementById("mapCorridorsImg");
	c.width = img.width;
	c.height = img.height;
    ctx.drawImage(img, 0, 0);
    g_map = ctx;
};

function isCorridor(x, y) {
	var rgbt = g_map.getImageData(x, y, 1, 1).data;
	if(rgbt[0] == corridorR && rgbt[1] == corridorG && rgbt[2] == corridorB)
		return true;
	else
		return false;
}
