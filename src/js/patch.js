var patchNode = function () {

    var isElement = function (o) {
	return o instanceof Object && o.nodeName;
    };
    
    var isText = function (o) {
	return ! isElement (o);
    };
    
    var toText = function (o) {
	if (o instanceof Array) {
	    var s = "";
	    for (var j = 0; j < o.length; j++) {
		s += toText (o [j]) + ",";
	    }
	    return "[" + (s.length ? s.substring(0, s.length - 1) : "") + "]";
	}
	
	if (o instanceof Object) {
	    var s = "";
	    for (var j in o) {
		s+= j + ": " + toText (o [j]) + ",";
	    }
	    return "{" + (s.length ? s.substring (0, s.length - 1) : "") + "}";
	}
	return o + "";
    };

    var makeElement = function (t) {
	var node = Dom.makeElementNode (t.namespaceURI, t.nodeName),
	    as = t.attributes,
	    cs = t.childNodes;

	node.yera_value = t;

	for (var j = 0; j < as.length; j++) {
	    var a = as [j];
	    Dom.setAttribute (node, a.namespaceURI, a.name, a.value);
	}
	for (var j = 0; j < cs.length; j++) {
	    var c = cs [j];
	    node.appendChild (isElement (c) ? makeElement (c) : makeText (c));
	}
	return node;
    };

    var makeText = function (t) {
	var node = Dom.makeTextNode (toText (t));
	
	// node.yera_value = t;

	return node;
    };

    var updateElement = function (t, t0, e0) {
	var as = t.attributes,
	    as0 = t0.attributes,
	    lena = Math.max (as.length, as0.length),
	    cs = t.childNodes,
	    cs0 = t0.childNodes,
	    lenc = Math.max (cs.length, cs0.length);

	e0.yera_value = t;

	for (var j = 0; j < lena; j++) {
	    var a = as [j];
	    var a0 = as0 [j];
	    if (! a0) {
		Dom.setAttribute (e0, a.namespaceURI, a,name, a.value)
	    } else if (! a) {
		Dom.delAttribute (e0, a0.namespaceURI, a0.name)
	    } else if (a.namespaceURI != a0.namespaceURI || a.name != a.name) {
		Dom.delAttribute (e0,a0.namespaceURI, a0.name);
		Dom.setAttribute (e0, a.namespaceURI, a.name, a.value);
	    } else if (a.value != a0.value) {
		Dom.setAttribute (e0, a.namespaceURI, a.name, a.value);
	    }
	}

	for (var j = 0; j < lenc; j++) {
	    var c = cs [j];
	    var c0 = cs0 [j];
	    var ce = e0.childNodes [j];
	    if (c == undefined) {
		e0.removeChild (ce);
	    } else if (c0 == undefined) {
		e0.appendChild (isElement(c) ? makeElement (c) : makeText (c));
	    } else {
		var cf = patchNode (c, c0, ce);
		if (cf != ce) 
		    e0.replaceChild (cf, ce);
	    }
	}
	return e0;
    };
        
    var updateText = function (t, t0, e0) {
	if (t != t0) e0.nodeValue = t;
	// e0.yera_value = t;
	return e0;
    };
    
    var patchNode = function (t, t0, e0) {
	// sort better without repeated tests;
	if (t == t0) return e0;
	
	if (isElement (t) &&
	    isElement (t0) &&
	    t.namespaceURI == t0.namespaceURI &&
	    t.nodeName == t0.nodeName)
	    return updateElement (t, t0, e0);
	
	if (isText (t) &&
	    isText (t0))
	    return updateText (t, t0, e0);
	
	if (isElement (t))
	    return makeElement (t);

	if (isText (t))
	    return makeText (t);
	
	throw "patch Unknown";
    };
    
    return patchNode;
} ();
