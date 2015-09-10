var Dom = function () {
    var makeElementNode = function (ns, n) {
	if (ns == null) {
	    var node = document.createElement (n);
	    return node;
	} else  {
	    var node = document.createElementNS (ns, n);
	    return node;
	};
    };

    var makeTextNode = function (t) {
	var node = document.createTextNode (t);
	return node;
    };
	    
    var setAttribute = function (node, namespace, name, value) {
	if (name == 'class') {
	    node.className = value;
	} else if (name == 'style' && value instanceof Object) {
	    node.style.cssText = '';
	    for (var j in value) node.style [j] = value [j];
	} else if (name == 'src') {
	    node.src = value;
	} else {
	    if (namespace) {
		node.setAttributeNS (namespace, name, value);
	    } else {
		node.setAttribute (name, value);
	    }
	}
    };
    
    var delAttribute = function (node, namespace, name) {
	if (name == 'class') {
	    node.className = '';
	} else if (name == 'style') {
	    node.style.cssText = "";
	} else {
	    if (namespace) {
		node.removeAttributeNS (namespace, name);
	    } else {
		node.removeAttribute (name);
	    }
	}
    };
	
    return {
	makeElementNode: makeElementNode,
	makeTextNode: makeTextNode,
	setAttribute: setAttribute,
	delAttribute: delAttribute
    };
}();


