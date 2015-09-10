var YeraDom = function () {
    with (Yera) with (YeraCore.bindings) {
	
	var ismsie = navigator.appName == "Microsoft Internet Explorer";

	var now = function () {return (new Date ()).getTime ();};
	
	var removeRole = function (ls, m) {
	    var r = [];
	    for (var j = 0; j < ls.length; j++) {
		var l = ls [j];
		if (l . from != m.from || l.role != m.role) r.push (l);
	    }
	    return r;
	};
	
	var __ticks__ = 1000 / 30;

	var timeUpdateSuspended = function () {
	    recv(
		hasType (Register, function (m) {
		    var me = currentActor ();
		    var h = setInterval (function () {
			send (me, new YeraEvent ("ciao"));
		    }, __ticks__);
		    var t = now ();
		    send (m.from, new Update (m.role, t));
		    timeUpdate (t, h, [m]);
		}));
	};
		
	var timeUpdate = function (t, h, ls) {
	    recv ( 
		cond (
		    hasType (Register, function (m) {
			send (m.from, new Update (m.role, t));
			timeUpdate (t, h, ls.concat ([m]));
		    }),
		    hasType (Unregister, function (m) {
			var ls1 = removeRole (ls, m);
			if (ls1.length > 0)
			    timeUpdate (t, h, ls1);
			clearInterval (h);
			timeUpdateSuspended ();
		    }),
		    hasType (YeraEvent, function (m) {
			var t1 = now ();
			for (var j = 0; j < ls.length; j++) {
			    var l = ls [j];
			    send (l.from, new Update (l.role, t1));
			}
			timeUpdate (t1, h, ls);
		    })));
	};

	var timeSource = src (timeUpdateSuspended);

	var timeState = function (v) {
	    var r = st (v);
	    r.addSource(timeSource, be (timeState));
	    return r;
	};
	
	var time = be (function (ev) {
	    return timeState (now ());
	});

	var YeraEvent = function (ev) {
	    this.event = ev;
	    this.name = "YeraEvent";
	};
	
	var event_sources = {};

	var eventSource = function (x) {
	    return src (function () {eventUpdateSuspended (x);});
	};
	
	var registerEvent = window.addEventListener ? 
	    function (x, h) {
		window.addEventListener (x, h, false);
	    }: 
            function (x, h) {
		document.attachEvent ("on" + x, h);
	    };
	
	var unregisterEvent = window.removeEventListener ? 
	    function (x, h) {
		window.removeEventListener (x, h, false);
	    }:
            function (x, h) {
		document.detachEvent ("on" + x, h);
	    };
	    
// 	var eventUpdateSuspended = function (x) {
// 	    recv(
// 		hasType (Register, function (m) {
// 		    var me = currentActor ();
// 		    var h = function (ev) {
// 			if (! ev) ev = window.event;
// 			if (ev.preventDefault) ev.preventDefault ();
// 			else try {
// 			    ev.returnValue = false;
// 			}catch (ex) {
// 			    null;
// 			};
			
// 			if (ev.srcElement) try {
// 			    ev.target = ev.srcElement;
// 			}catch (ex) {
// 			    null;
// 			};

// 			if (ev.toElement) {
// 			    if (ev.type == 'mouseout') try {
// 				ev.relatedTarget = ev.toElement;
// 			    } catch (ex) {
// 				null;
// 			    };
// 			} else try {
// 			    ev.target = ev.toElement;
// 			} catch (ex) {
// 			    null;
// 			};

// 			if (ev.fromElement) {
// 			    if (ev.type == 'mouseover') try {
// 				ev.target = ev.fromElement;
// 			    } catch (ex) {
// 				null;
// 			    };
// 			} else try {
// 			    ev.relatedTarget = ev.fromElement;
// 			} catch (ex) {
// 			    null;
// 			};

// 			send (me, new YeraEvent (ev));
// 		    };
// 		    send (m.from, new Update (m.role, null));
// 		    registerEvent (x, h);
// 		    eventUpdate (x, h, [m]);
// 		}));
// 	};

	var eventUpdateSuspended = function (x) {
	    recv(
		hasType (Register, function (m) {
		    var me = currentActor ();
		    var h = function (ev) {
			if (ismsie) {
			    // msie incompatibility issue
			    ev = window.event;
			    ev.returnValue = false;
			    ev.target = ev.srcElement;
			    ev.relatedTarget = ev.type == 'mouseover' ? ev.fromElement : ev.toElement;
			} else  {
			    ev.preventDefault ();
			}
			send (me, new YeraEvent (ev));
		    };
		    send (m.from, new Update (m.role, null));
		    registerEvent (x, h);
		    eventUpdate (x, h, [m]);
		}));
	};
	
   
	var eventUpdate = function (x, h, ls) {
	    recv(
		cond (
		    hasType (Register, function (m) {
			send (m.from, new Update (m.role, null));
			eventUpdate (x, h, ls.concat ([m]));
		    }),
		    hasType (Unregister, function (m) {
			var ls1 = removeRole (ls, m);
 			if (ls1.length) 
			    eventUpdate (x, h, ls1);
			unregisterEvent (x, h);
			eventUpdateSuspended (x);
		    }),
		    hasType (YeraEvent, function (m) {
			for (var j = 0; j < ls.length; j++) {
			    var l = ls [j];
			    send (l.from, new Update (l.role, m.event));
			    send (l.from, new Update (l.role, null));
			}
			eventUpdate (x, h, ls);
		    })));
	};
	
// 	var event = box (function () {
// 	    return function (x) {
// 		return be (function (ev) {
// 		    var x0 = unbox (x).apply (ev);
// 		    return eventState (null, eventSource (x0.value), x0);
// 		});
// 	    }});
	 	        
	var mousedownSource = eventSource ("mousedown");
	var mouseupSource = eventSource ("mouseup");
	var mouseclickSource = eventSource ("click");
	var mouseoutSource = eventSource ("mouseout");
	var mouseoverSource = eventSource ("mouseover");
	var mousemoveSource = eventSource ("mousemove");
	
	var keyupSource = eventSource ("keyup");
	var keydownSource = eventSource ("keydown");
	var keypressSource = eventSource ("keypress");
    
	var mousedown = be (function (ev) {return eventState (null, mousedownSource); });
	var mouseup = be (function (ev) {return eventState (null, mouseupSource); });
	var mouseclick = be (function (ev) {return eventState (null, mouseclickSource); });
	var mouseout = be (function (ev) {return eventState (null, mouseoutSource); });
	var mouseover = be (function (ev) {return eventState (null, mouseoverSource); });
	var mousemove = be (function (ev) {return eventState (null, mousemoveSource); });

	var keyup = be (function (ev) {return eventState (null, keyupSource); });
	var keydown = be (function (ev) {return eventState (null, keydownSource); });
	var keypress = be (function (ev) {return eventState (null, keypressSource); });

	var eventState = function (v, s) {
	    var r = st (v);
	    r.addSource (s, be (function (e) {
		return eventState (e, s);
	    }));
	     
// 	    r.getFuture = function () {
// 		return be (function (ev) {
// 		    return eventState (null, s);
// 		});
// 	    }
	    
	    return r;
	};
	
	var really_relative = function (t, x) {
	    if (! (t && t.yera_value)) return false;
	    if (! x) return false;
	    if (t.yera_value == x) return true;
	    if (t.parentNode) return really_relative (t.parentNode, x);
	    return false;
	};
	var $unrelative$un =really_relative;

	var relative = lift ($unrelative$un);
	
	var bindings = {
	    time: time,
	    $unrelative$un: $unrelative$un,
	    relative: relative,
	    mousedown: mousedown,
	    mouseup: mouseup,
	    mouseclick: mouseclick,
	    mouseout: mouseout,
	    mouseover: mouseover,
	    mousemove:mousemove,
	    
	    keyup: keyup,
	    keydown: keydown,
	    keypress: keypress
	};
	
	var iface = [];
	for (var j in bindings) iface.push (bindings [j]);
	
	return new Struct (new Interface (iface), bindings);
    }}();
