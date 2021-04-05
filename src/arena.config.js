const Arena = require("@colyseus/arena").default;
const { monitor } = require("@colyseus/monitor");
const express = require("express");

/**
 * Import your Room files
 */
const { AmongUsChase } = require("./rooms/AmongUsChase");

module.exports = Arena({
    getId: () => "Your Colyseus App",

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('amongus-chase', AmongUsChase);
    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.sendFile(__dirname+'/index.html')
        });

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor());
        app.use('/', express.static(__dirname));
    },

    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }

});
