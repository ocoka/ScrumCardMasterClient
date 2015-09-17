(function(debug){

    'use strict';

    function Request (socket, payload) {
        this.socket = socket;

        if (payload){
            this.currentId = payload.id;
            this.method = payload.method;
            this.params = payload.params;
        }

        this.session = socket.session;
    };

    Request.prototype.error = function (code, message) {
        try {
            var payload = {
                jsonrpc: '2.0',
                error: {
                    code: code,
                    message: message
                },
                id: this.currentId
            };
            debug('→ Error %s: %o', payload.error.code, payload.error.message);
            this.socket.send(JSON.stringify(payload));
        }  catch (e) {
            console.error('Something went wrong: ', e.stack);
        }
    };

    Request.prototype.result = function (result) {
        try {
            var payload = {
                jsonrpc: '2.0',
                result: result,
                id: this.currentId
            };
            debug('→ (%s) Result: %o', payload.id, payload.result);
            this.socket.send(JSON.stringify(payload));
        } catch (e) {
            console.error('Something went wrong: ', e.stack);
        }
    };

    function Protocol(socket, data) {



        // Try to parse data to JSON
        try {
            var payload = JSON.parse(data);
        } catch (e) {
            debug('Parse error: %s', e.stack);
            var request = new Request(socket);
            request.error(-32700, 'Parse error');
            return;
        }

        // Create request object
        var request = new Request(socket, payload);

        // Check if valid JSON-RPC 2.0 request
        if (!payload.jsonrpc && payload.jsonrpc !== '2.0') {
            debug('Wrong protocol: %s', payload.jsonrpc);
            request.error(-32600, 'Invalid request');
            return;
        }

        // We got a result
        if (payload.result && payload.id) {
            // Check if error
            if (payload.error) {
                debug('← (%s) Error %s: %o', payload.id, payload.error.code, payload.error.message);
                if (typeof this._awaitingResults[payload.id] === 'function') {
                    this._awaitingResults[payload.id].apply(this, [payload.error]);
                }
                return;
            }
            // Everything seems fine
            debug('← (%s) Result: %o', payload.id, payload.result);
            if (typeof this._awaitingResults[payload.id] === 'function') {
                this._awaitingResults[payload.id].apply(this, [null, payload.result]);
            }
            return;
        }

        // We got an error
        if (payload.error) {
            // Check if error
            debug('← (%s) Error %s: %o', payload.id, payload.error.code, payload.error.message);
            if (typeof this._awaitingResults[payload.id] === 'function') {
                this._awaitingResults[payload.id].apply(this, [payload.error]);
            }
            return;
        }

        // Check if there's a valid method (if no result was supplied)
        if (!payload.method) {
            debug('Missing method: %o', payload);
            request.error(-32600, 'Invalid request');
            return;
        }

        // Make sure params are object or array
        if (typeof payload.params !== 'undefined' && typeof payload.params !== 'object' && !Array.isArray(payload.params)) {
            debug('Invalid params: %o', payload.params);
            request.error(-32602, 'Invalid params');
            return;
        }

        // Check if method exists
        if (typeof this._methods[payload.method] === 'function') {
            debug('← (%s) %s: %o', payload.id, payload.method, payload.params);
            try {
                this._methods[payload.method].apply(request);
            } catch (e) {
                debug('Internal error: %s', e.stack);
                request.error(-32603, 'Internal error');
            }
        } else {
            debug('← (%s) Error %s: %o', payload.id, -32601, 'Method not found');
            request.error(-32601, 'Method not found');
        }

    };

    if (typeof WebSocket === 'undefined') {
        throw Error("Your browser doesn't support websocket, go away !!!");
    }

    function Client() {

        // Queue list for messages
        this._messageQueue = [];

        // Callback container for results
        this._awaitingResults = {};

        // Client-side methods
        this._methods = {};

        // Event handler containers
        this._events = {
            open: [],
            close: [],
            connection: [],
            message: []
        };

        // Options container
        this._options = {};

        // Session container
        this._session = null;



        var _this = this;
        // Listen for options
        this.register('options', function () {
            _this._options = this.params;
        });

        // Listen for session
        this.register('session', function () {
            _this._session = this.params;
        });
    }


    Client.prototype.onOpen = function (type,e) {
        debug('WebSocket opened');
        if (this._messageQueue.length) {
            var payload;
            while (this._messageQueue.length) {
                payload = this._messageQueue.shift();
                debug('→ %o', payload);
                this.socket.send(JSON.stringify(payload));
            }
        }
    };

    Client.prototype.onClose = function (type,e) {
        debug('WebSocket closed');
    };

    Client.prototype.onMessage = function (type,e) {
        // If heartbeat, respond
        if (e.data === '--thump--') {
            debug('← Thump!');
            setTimeout(function () {
                this.socket.send('--thump--');
            }.bind(this), this._options.heartbeatInterval || 5000);
        }else {
            Protocol.apply(this, [this.socket, e.data]);
        }
    };

    Client.prototype.connect = function (address) {

        address = address.replace('ws://', '');

        // Initialize WebSocket client
        debug('Connecting to server: ws://%s', address);
        this.socket = new WebSocket('ws://' + address);

        // Add helper handlers for the folowing events
        ['open', 'close', 'message']
            .forEach(function (type, i) {
                var handler = function (e) {
                    (this["on"+type[0].toUpperCase()+type.substr(1)]).apply(this, [type].concat(Array.prototype.slice.call(arguments)));
                }.bind(this);
                if (this.socket.on) {
                    this.socket.on(type, handler);
                } else if (!this.socket['on' + type]) {
                    this.socket['on' + type] = handler;
                }
            }.bind(this));
    };

    Client.prototype.disconnect = function (code, reason) {
        if (this.socket) {
            this.socket.close(code, reason);
        }
    };

// Register a client-side method
    Client.prototype.register = function (method, handler, expose) {
        var m;
        if (typeof method === 'object') {
            for (m in method) {
                this.register(m, method[m]);
            }
        } else if (typeof handler === 'object') {
            for (m in handler) {
                this.register(method + ':' + m, handler[m]);
            }
        } else if (typeof method === 'string') {
            debug('Registering method: %s', method);
            handler.expose = expose || false;
            this._methods[method] = handler;
        }
    };

// Call a server-side method
    Client.prototype.method = function () {
        var cb = null;
        var payload = {
            jsonrpc: '2.0',
            method: arguments[0],
            id: Math.random().toString(36).substr(2, 9) // Generate random id
        };

        if (typeof arguments[1] !== 'function' && typeof arguments[1] !== 'undefined') {
            payload.params = arguments[1];
            if (typeof arguments[2] === 'function') {
                cb = arguments[2];
            }
        } else if (typeof arguments[1] === 'function') {
            cb = arguments[1];
        }

        if (cb) {
            this._awaitingResults[payload.id] = function () {
                cb.apply(this, arguments);
                delete this._awaitingResults[payload.id];
            };
        }

        if (this.socket.readyState !== 1) {
            // WebSocket is not ready yet, push payload to messsage queue
            this._messageQueue.push(payload);
        } else {
            try {
                debug('→ (%s) %s: %o', payload.id, payload.method, payload.params);
                this.socket.send(JSON.stringify(payload));
            } catch (e) {
                if (cb) {
                    cb.call(this, e);
                }
            }
        }
    };

    window.koaws = new Client();


}).call(this,/*console.debug.bind(console)*/function(){});
