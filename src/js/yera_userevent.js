with (Yera) {

    var usereventFire = function (ev) {
	throw "uninitialized fire action";
    };

    var YeraUserevent = function () {
	
	var removeRole = function (ls, m) {
	    var r = [];
	    for (var j = 0; j < ls.length; j++) {
		var l = ls [j];
		if (l . from != m.from || l.role != m.role) r.push (l);
	    }
	    return r;
	};
	
	var YeraUserevent = function (ev) {
	    this.event = ev;
	};

	YeraUserevent.prototype.name = "YeraUserevent";

	var usereventUpdate = function (ls) {
	    recv(
		cond (
		    hasType (Register, function (m) {
			send (m.from, new Update (m.role, null));
			usereventUpdate (ls.concat ([m]));
		    }),
		    hasType (Unregister, function (m) {
			usereventUpdate (removeRole (ls, m));
		    }),
		    hasType (YeraUserevent, function (m) {
			for (var j = 0; j < ls.length; j++) {
			    var l = ls [j];
			    send (l.from, new Update (l.role, m.event));
			    send (l.from, new Update (l.role, null));
			}
			usereventUpdate (ls);
		    }),
		    otherwise (function (m) {
			usereventUpdate (ls);
		    })));
	};
	
	var usereventSource = src (function () {
	    var me = currentActor ();
	    usereventFire = function (m) {
		send (me, new YeraUserevent (m));
	    };	    
	    usereventUpdate ([]);
	});
	
	var usereventState = function (v0) {
	    var r = st (v0);
	    r.addSource (usereventSource, be (usereventState));
	    // r.isEvent = true;
	    r.getFuture = function () {
		return be (function (ev) {
		    return usereventState(null);
		});
	    };
		    
	    return r;
	};

	var userevent = be (usereventState);
	
	return new Struct (
	    new Interface (["uevent"]),
	    {
		userevent: userevent
	    });
    }();
}
