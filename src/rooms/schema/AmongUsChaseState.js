const schema = require('@colyseus/schema');

Player = class Player extends schema.Schema {
    constructor() {
        super();
    }
}
schema.defineTypes(Player, {
    x: "number",
    y: "number",
    impostor: "boolean",
    alive: "boolean",
    name: "string",
    id: "string",
    color: "string"
});

// Our custom game state, an ArraySchema of type Player only at the moment
State = class State extends schema.Schema {
    constructor() {
        super();
        this.players = new schema.MapSchema();
        this.started = false;
        this.world_size = 1000;
        this.elapsed = 0;
    }
}
schema.defineTypes(State, {
    players: { map: Player },
    world_size: "number",
    started: "boolean",
    elapsed: "uint8"
});

exports.State = State;
exports.Player = Player;
