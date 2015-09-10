var hasType = function (t, f) {
    return when (
	function (c) {return c instanceof t;},
	function (c, r) { f (c); });
};

var Yera = function () {
    function Be (fn) {
	this.apply = fn;
    }
    
    Be.prototype.name = "behavior";
    
    var mem_ids = 0;
    var mems = [];
    
    var be = function (fn) {
	var id = mem_ids++;
	return (new Be (function (ev) {
	    var d = mems [id];
	    return d ? d : (mems [id] = fn (ev));
	}));
    };
    
    var clearMemo = function () {
	mems = [];
    };
    
    var St = function (v) {
	this.value = v;
	this.then = [];
    };
    St.prototype.name = "state";
    St.prototype.addSource = function (s, b) {
	this.then [s.role] = {
	    source: s,
	    behavior: b
	};
    };
    
    var st = function (v) {
	return new St (v);
    };
    
    var src_ids = 0;
    
    var src = function (f) {
	var r = actor (f);
	r.role = src_ids++;
	return r;
    };

    // events;
    function Register (a, r) {
	this.from = a;
	this.role = r;
    };
    Register.prototype.name = "register";

    function Unregister (a, r) {
	this.from = a;
	this.role = r;
    };
    Unregister.prototype.name = "unregister";

    function Update (r, v) {
	this.role = r;
	this.value = v;
    }
    Update.prototype.name = "update";
    
    var removeRole = function (ls, m) {
	var r = [];
	for (var j = 0; j < ls.length; j++) {
	    var l = ls [j];
	    if (l . from != m.from || l.role != m.role) r.push (l);
	}
	return r;
    };
    
    var reactimateChange = function (s0, s1, ls) {

	for (var j in s1.then) 
	    if (! s0.then [j]) 
		send (s1.then[j].source , new Register (currentActor (), j));
	
	for (var j in s0.then)
	    if (! s1.then [j])
		send (s0.then[j].source , new Unregister (currentActor (), j));
	
	for (var j = 0; j < ls.length; j++) {
	    var l = ls [j];
	    send (l.from, new Update (l.role, s1.value));
	}
	clearMemo ();
	reactimate (s1, ls);
    };
    
    var reactimate = function (s0, ls) {
	recv (
	    cond (
		hasType (Register, function (m) {
		    send (m.from, new Update (m.role, s0.value));
		    reactimate (s0, ls.concat ([m]));
		}),
		hasType (Unregister, function (m) {
		    var ls1 = removeRole (ls, m);
		    if (ls1.length) reactimate (s0, ls1);
		}),
		hasType (Update, function (m) {
		    if (s0.then[m.role]) {
			var s1 = s0.then[m.role].behavior.apply (m.value);
			reactimateChange (s0, s1, ls);
		    } else {
			// alert ("update unknow source");
			reactimate (s0, ls);
		    }
		}),
		otherwise (function (m) {
		    // alert ("otherwise reactimate");
		    reactimate (s0, ls1);
		})));
    };

    var reactimateInit = function (s) {
	recv (hasType (Register, function (m) {
	    for (var j in s.then) {
		send (s.then[j].source , new Register (currentActor (), j));
	    }
	    send (m.from, new Update (m.role, s.value));
	    reactimate (s, [m]);
	}));
    };
    
    var react = function (b) {
	return src (function () {
	    reactimateInit (b.apply (null));
	});
    };

    var idUpdater = function (nm) {
	var child = document.getElementById (nm);
	var father = child.parentNode;
	var value0 = null;
	var updater = function () {
	    recv (
		otherwise (function (value) {
		    var c = patchNode (value, value0, child);
		    if (c != child) father.replaceChild (c, child);
		    // father.replaceChild (c, child);
		    value0 = value;
		    child = c;
		    updater ();
		}));
	};
	return src (updater);
    };
    
    // convert messages of type Update to normal json values that are in this encapsulated
    var control = function (updater) {
	recv (
	    hasType (Update, function (m) {
		send (updater, m.value);
		control(updater);
	    }));
    };

    var connect = function (b, id) {
	var b_ = react (b);
	var ud = idUpdater (id);
	var ct = src (function () {control (ud);});

	send (b_, new Register (ct, "connect"));
    };

    var Interface = function (d) {
	this.symbols = d;
    };
    Interface.prototype.name = "interface";

    var Struct = function (i, d) {
	this['interface'] = i;
	this.bindings = d;
    };
    Struct.prototype.name = "struct";
    
    var $dlunion = function (a) { 
	return function (b) { 
	    return new Interface (a.symbols.concat(b.symbols));
	}
    };
    
    return {
	Be : Be,
	be : be,
	St : St,
	st : st,
	src : src,
	react: react,
	Register: Register,
	Unregister: Unregister,
	Update: Update,
	connect: connect,
	idUpdater: idUpdater,
	Struct: Struct,
	Interface: Interface,
	$dlunion: $dlunion
    };
}();
