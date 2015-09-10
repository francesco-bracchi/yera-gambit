(function () {
    
    var Actor = function (b) {
	this.mailbox = [];
	this.pointer = 0;
	this.cont = b;
	this.running = false;
    };

    var ActorError = function (m) {
	if (m) this.message = m;
    };
    ActorError.prototype = new Error ("actor error");
    ActorError.prototype.name = "Actor Error";

    var EndOfMailbox = function (m) {
	if (m) this.message = m;
    };
    EndOfMailbox.prototype = new ActorError ("end of mailbox");
    EndOfMailbox.prototype.name = "End Of Mailbox Error";

    var TerminatedProcess = function (a) {
	if (a) this.actor = a;
    };

    TerminatedProcess.prototype = new ActorError ("this process is terminated");
    TerminatedProcess.prototype.name = "Terminated Process Error";

    var Suspension = function (ct) {
	this.cont = ct;
    };
    Suspension.prototype = new ActorError ("suspension");

    var runnings = [];

    var current_actor = 0;

    var currentM = function () {
	if (this.mailbox.length > this.pointer) 
	    return this.mailbox [this.pointer];
	throw new EndOfMailbox ();
    };

    var consumeM = function () {
	if (this.mailbox.length > this.pointer) 
	    return this.mailbox.splice(this.pointer, 1)[0];
	throw new EndOfMailbox ();
    };

    var rewindM = function () {
	this.pointer = 0;
    };

    var nextM = function () {
	this.pointer ++;
    };

    var resumeA = function () {
	current_actor = this;
	try {
	    this.cont ();
	    if (this.remote_actor_id) {
		// remove dangling pointer in actors
		delete actors [this.remote_actor_id];
		delete this.remote_actor_id;
	    }
	    this.cont = function () {throw new TerminatedProcess (this)};
	} catch (e) {
	    if (e instanceof Suspension) {
		this.cont = e.cont;
	    }
	    else {
		this.handleException && this.handleException (e);
	    }
	}
    };

    var current = function () {
	return current_actor.currentM ();
    };

    var consume = function () {
	return current_actor.consumeM ();
    };

    var next = function () {
	return current_actor.nextM ();
    };

    var rewind = function () {
	return current_actor.rewindM ();
    };

    var suspend = function (v) {
	throw new Suspension (v);
    };

    var resume = function (a) {
	if (! a) a = current_actor;
	if (! a.running) {
	    a.running = true;
	    runnings.push (a);
	}
	resumeAll ();
    };

    Actor.prototype.currentM = currentM;
    Actor.prototype.consumeM = consumeM;
    Actor.prototype.rewindM = rewindM;
    Actor.prototype.nextM = nextM;
    Actor.prototype.resumeA = resumeA;
    
    var send_actor = function (a, m) {
	a.mailbox.push (m);
	resume (a);
    };

    var resumeAll = function () {
	if (! current_actor) { 
	    while (runnings.length) {
		var a = runnings.shift ();
		a.running = false;
		a.resumeA ();
	    }
	    current_actor = null;
	}
    };

    var isRunning = function () {
	return runnings.length;
    };


    // remote actors
    
    var XHR;
    if (typeof XMLHttpRequest != 'undefined') {
    	XHR = function () {
    	    var req = new XMLHttpRequest();
    	    req.parseXml=function(){return req.responseXML};
    	    return req;
    	};
    } 
    else if (typeof ActiveXObject != 'undefined') {
    	XHR = function () {
    	    var req=new ActiveXObject("Microsoft.XMLHTTP");
    	    req.parseXml=function(){
    		var doc = new ActiveXObject ("Microsoft.XMLDOM");
    		doc.loadXML(req.responseText);
    		return doc;
    	    };
    	    return req;
    	}
    }
    else {
    	XHR = function () { throw "XMLHttpRequest unsupported"; };
    }
    
    var connection_id,
	send_data,
	mailbox = [],
	connectionFailHandler = null,
	connectionEstablishedHandler = null,
	connectionInterruptedHandler = null,
	dataSentHandler = null,
	dataReceivedHandler = null,
	actors = [],
	actor_ids = 0,
	ONLINE = 1,
	OFFLINE = 0,
	connectionState = OFFLINE;
    
    var http_uid = function () {
	var con = XHR ();
	con.open ("GET", "/gebo/uid");
	con.onreadystatechange = function () {
	    if (con.readyState == 4 && con.status == 200) {
		connection_id = JSON.parse (con.responseText);
		connectionState = ONLINE;
		http_init_in ();
		http_init_out ();
		connectionEstablishedHandler && connectionEstablishedHandler (con)
	    }
	    else if (con.readyState == 4){
		connectionState = OFFLINE;
		connectionFailHandler && connectionFailHandler (con);
	    }
	}
	con.send ('');
    };

    var http_init_in = function () {
	var con = XHR();
	con.open("GET", "/gebo/listen?uid=" + connection_id, true);
	con.onreadystatechange = function () {
	    if (con.readyState == 4 && con.status == 200) {
		con.onreadystatechange = null;
		http_init_in ();
		if (con.responseText) {
		    var ms = JSON.parse (con.responseText);
		    for (var j = 0; j < ms.length; j++) {
			var m = ms [j];
			javascript_send (m.P, m.M);
		    }
		}
		dataReceivedHandler && dataReceivedHandler (con);
	    }
	    else if (con.readyState == 4) {
		connectionState = OFFLINE;
		connectionInterruptedHandler && connectionInterruptedHandler (con);
	    }
	};
	con.send ('');
	return null;
    };

    var http_init_out = function () {
	var con = XHR();
	con.open ("POST", "/gebo/notify?" + connection_id, true);
	send_data = function () {
	    send_data = function () {};
	    var mb = JSON.stringify(mailbox);
	    mailbox = [];
	    // con.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
	    // con.setRequestHeader('Content-Length', mb.length);
	    con.onreadystatechange = function () {
		if(con.readyState == 4 && con.status == 200) {
		    con.dataSent = mb;
		    dataSentHandler && dataSentHandler (con);
		    con.onreadystatechange = null;
		    http_init_out ();
		}
		else if (con.readyState == 4) {
		    connectionState = OFFLINE;
		    connectionInterruptedHandler && connectionInterruptedHandler (con);
		}
	    };
	    con.send (mb);
	};
	if (mailbox.length > 0) send_data ();
    };


    var remote_send = function (pid, msg) {
	mailbox [mailbox.length] = {
	    P : pid, 
	    M: msg};

	if (connectionState == ONLINE)
	    send_data ();
	else
	    throw new ActorError ("System offline");
    };

    var local_send = function (id, msg) {
	send_actor (idToActor (id.P), msg);
    };

    var scheme_send = function (id, msg) {
	remote_send (id, actorToAddr (msg));
    };

    var javascript_send = function (id, msg) {
	local_send (id, addrToActor (msg));
    };

    var idToActor = function (id) {
	return actors [id];
    };

    var actorToId = function (a) {
	var id = a.remote_actor_id;
	if (! id) {
	    id = ++actor_ids;
	    a.remote_actor_id = id;
	    actors [id] = a;
	};
	return id;
    };

    var actorToAddr = function (msg) {
	if (msg instanceof Actor) {
	    return {
		T: 'j',
		C: connection_id, 
		P: actorToId(msg)
	    };
	    // return {"id-type": "javascript",
	    // 	"connection-id" : connection_id,
	    // 	"process-id" : actorToId(msg)
	    //        };
	} else if (msg instanceof Array) {
	    var r = [];
	    for (var j = 0; j < msg.length; j++)
		r [j] = actorToAddr (msg [j]);
	    return r;
	} else  if (msg instanceof Object) {
	    var r = {};
	    for (var j in msg)
		r [j] = actorToAddr (msg [j]);
	    return r;
	}
	return msg;    
    };

    var addrToActor = function (msg) {
      if (msg instanceof Object && msg.T == 'j') 
	return msg.C == connection_id ? idToActor (msg.P) : msg;
      // if (msg instanceof Object && msg["id-type"] == 'javascript')
      // 	return idToActor (msg ["process-id"]);
      if (msg instanceof Array) {
	var r = [];
	for (var j = 0; j < msg.length; j++)
	  r [j] = addrToActor (msg [j]);
	return r;
      }
      if (msg instanceof Object) {
	var r = {};
	for (var j in msg)
	  r [j] = addrToActor (msg [j]);
	return r;
      }
      return msg;
    };

    
    // var ___post = function (nm, what, ct) {
    // 	var con = XHR ();
    // 	con.open ("POST", nm, false);
    // 	con.send (what);
    // 	return stringToJson (con.responseText);
    // };


    var isVar = function (s) {
	return (typeof s == 'string') && (s.substring (0, 1) == '?');
    };

    var _matchVar = function (pat, val) {
	var r = {};
	r [pat.substring (1)] = val;
	return r;
    };

    var _matchConst = function (pat, val) {
	return pat == val ? {} : false;
    };

    var _matchArray = function (pat, val) {
	if (! (val instanceof Array)) return false;
	
	var r = {};
	for (var j = 0; j < pat.length; j++) {
	    var r1 = _match (pat [j], val [j]);
	    if (! r1) return false;
	    for (var f in r1) r [f] = r1 [f];
	}
	return r;
    };

    var _matchObject = function (pat, val) {
	if (! (val instanceof Object)) return false;
	
	var r = {};
	for (var j in pat) {
	    var r1 = _match (pat [j], val [j]);
	    if (! r1) return false;
	    for (var f in r1) r [f] = r1 [f];
	}
	return r;
    };

    var _match = function (pat, val) {
	if (pat == _) return {};
	
	if (isVar(pat))
	    return _matchVar (pat, val);
	
	if (typeof pat == 'number' ||
	    typeof pat == 'string' ||
	    typeof pat == 'boolean')
	    return _matchConst (pat, val);
	
	if (pat instanceof Array)
	    return _matchArray (pat, val);
	
	if (pat instanceof Object)
	    return _matchObject (pat, val);
	
	return false;
    };
    
    // test messages
    
    var now = function () {
	return (new Date ()).getTime();
    };
    
    var TestFailed = function (m) {
	if (m) this.message = m;
    };

    TestFailed.prototype = new ActorError ("Test Failed");
    
    var suspendDefault = function (m) {
	suspend (function () {
	    return recv (m);
	});
    };
    
    var suspendWithTimeout = function (m, t, a) {
	var me = currentActor ();
	var t0 = now ();
	var h = setTimeout (function () {
	    me.cont = a;
	    me.rewindM ();
	    resume (me);
	}, t);
	suspend (function () {
	    clearTimeout (h);
	    var t1 = now ();
	    var d = t1 - t0;
	    recv (m, t - d, a);
	});
    };
    
    var oneof = function (as) {
	return function () {
	    for (var j = 0; j < as.length; j++)
		try {
		    as [j] ();
		} catch (e) {
		    if (! (e instanceof TestFailed))
			    throw e;
		}
	    throw new TestFailed ();
	};
    };
    

    // export interface

    actor = function (b) {
	return new Actor (b);
    };

    startActor = function (a) {
	resume (a);
	return a;
    };

    send = function (id, msg) {
	if (id instanceof Actor) return send_actor (id, msg);
	return scheme_send (id, msg);
    };
    
    jsonGet = function (nm, cb) {
	var con = XHR ();
	con.open ("GET", nm, true);
	con.onreadystatechange = function () {
	    if (con.readyState == 4 && con.status == 200) {
		cb (con.responseText ? JSON.parse(con.responseText) : false);
	    }
	};
	con.send ('');
    };

    currentActor = function () {
	return current_actor;
    };

    initGebo = function (ps) {
	failHandler = ps.onFail;
	connectionEstablishedHandler = ps.onConnectionEstablished;
	connectionFailHandler = ps.onConnectionFail;
	dataReceivedHandler = ps.onDataReceive;
	dataSentHandler = ps.onDataSent;
	http_uid ();
    };
    
    recv = function (m ,t, a) {
	try{ 
	    m ();
	} catch (e) {
	    if (e instanceof TestFailed) {
		next ();
		recv (m, t, a);
	    } else if (e instanceof EndOfMailbox) {
		if (t != undefined) {
		    suspendWithTimeout (m, t, a);
		} 
		else {
		    suspendDefault (m);
		}
	    } 
	    else {
		throw e;
	    }
	}
    };
	
    when = function (t, ct) {
	return function () {
	    var c = current ();
	    var r = t (c);
	    if (! r) throw new TestFailed ();
	    consume ();
	    rewind ();
	    ct (c, r);
	    };
    };
    
    cond = function () {return oneof (arguments)};
    
    otherwise = function (f) {
	return when (
	    function () {return true;},
	    function (c, r) { f (c); });
    };

    match = function (t, ct) {
	return when (
	    function (c) {return _match (t, c, {})},
	    function (c, r) {ct (r)})
    };
    
    geboState = function () {return connectionState};

    _ = ['any'];
    
    // websocket

    if (window.WebSocket && false)
    {
	var ws;
	
	var ws_message_in = function (ev) {
	    var ms = JSON.parse(ev.data);
	    for (var j = 0; j < ms.length; j++) {
		var m = ms [j];
		javascript_send (m.P, m.M);
	    }
	    dataReceivedHandler && dataReceivedHandler (ev);
	}
    

	initGebo = function (ps) {
	    failHandler = ps.onFail;
	    connectionEstablishedHandler = ps.onConnectionEstablished;
	    connectionFailHandler = ps.onConnectionFail;
	    dataReceivedHandler = ps.onDataReceive;
	    dataSentHandler = ps.onDataSent;

	    ws = new WebSocket ("/gebo/websocket");
	    ws.onmessage = function (ev) {
		connection_id = JSON.parse(ev.data);
		connectionState = ONLINE;
		connectionEstablishedHandler && connectionEstablishedHandler ();
		ws.onmessage = ws_message_in;
	    }
	}

	send_data = function () {
	    var mb = JSON.stringify (mailbox);
	    mailbox = [];
	    ws.send (mb);
	}
    }

})();

