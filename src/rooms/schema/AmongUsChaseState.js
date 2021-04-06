const schema = require('@colyseus/schema');

Player = class Player extends schema.Schema {
    constructor() {
        super();
        this.completed = 0;
    }
}
schema.defineTypes(Player, {
    x: "number",
    y: "number",
    impostor: "boolean",
    alive: "boolean",
    name: "string",
    id: "string",
    color: "string",
    tasks: "string",
    completed: "uint8"
});

// Our custom game state, an ArraySchema of type Player only at the moment
State = class State extends schema.Schema {
    constructor(game) {
        super();
        this.players = new schema.MapSchema();
        this.started = false;
        this.elapsed = 0;
		this.game = game;
    }
}
schema.defineTypes(State, {
    players: { map: Player },
    world_size_x: "number",
    world_size_y: "number",
    started: "boolean",
    elapsed: "uint8",
	game: "string",
});

exports.State = State;
exports.Player = Player;
