var YeraCore = function () {
    with (Yera){    
	var copy = function (o) {
	    var c = {};
	    for (var f in o) 
		c [f] = o [f];
	    return c;
	};
	var copyA = function (o) { 
	    return o.concat();
	};
	 
	var applyState = function (f, v) {
	    var r = f.value.apply (null, v.value);
	    var s = st (r);
	    
	    function setter (j) {
		var tf = f.then [j];
		var tv = v.then [j];
		return be(function (ev) {
		    return applyState (tf ? tf.behavior.apply(ev) : f, 
				       tv ? tv.behavior.apply(ev) : v);
		    });
	    };
	    
	    for (var j in f.then)
		s.addSource (f.then [j].source, setter (j));

	    for (var j in v.then)
		if (! s.then[j])
		    s.addSource (v.then[j].source, setter (j));
	    
// 	    s.getFuture = function () {
// 		return be (function (ev) {
// 		    return applyState (
// 			f.getFuture ().apply (ev),
// 			v.getFuture ().apply (ev));
// 		})
// 	    }
	    return s;
	};
 	
	var presState = function (v) {

	    var s = st (be (function (ev) {
		return st (v.value);
	    }));

	    function setter (j) {
		var b1 = v.then [j].behavior;
		return be (function (ev) {
		    return presState (b1.apply (ev));
		});
	    };
	    for (var j in v.then)
		s.addSource (v.then [j].source, setter (j));
	    
// 	    s.getFuture = function () {
// 		return be (function (ev) {
// 		    return presState (v.getFuture().apply (ev));
// 		});
// 	    }
	    return s;
	};
	

	var futrState = function (v) {

	    // var s = st (v.getFuture ());
	    var s = st (be (function (ev) {
		var sf = st(v.value);
		sf.then = v.then;
		return  sf;
	    }));

	    function setter (j) {
		var b = v.then [j].behavior;
		return be(function (ev) {
		    return futrState (b.apply (ev));
		});
	    }
	    
	    for (var j in v.then)
		s.addSource (v.then [j].source, setter (j));
	    
// 	    s.getFuture = function () {
// 		return be (function (ev) {
// 		    return futrState (v.getFuture().apply (ev));
// 		});
// 	    }
	    return s;
	};
	
	var untilState = function (i, e) {
	    var s = st (i.value);
	    
	    function setter (j0) {
		return be (function (ev) {
		    if (e.value){
			var k = e.value.apply (null);
			return k.then [j0] ? k.then [j0].behavior.apply(ev):k;
		    }
		    return untilState (
			(i.then[j0] ? i.then[j0].behavior.apply(ev) : i),
			(e.then[j0] ? e.then[j0].behavior.apply(ev) : e));
		});
	    };
	    
	    for (var j in i.then)
		s.addSource (i.then[j].source, setter (j));
	    
	    for (var j in e.then)
		if (! s.then[j])
		    s.addSource (e.then[j].source, setter (j));

// 	    s.getFuture = function () {
// 		be (function (ev) {
// 		    return e.value ? e.value.apply (ev).getFuture ():
// 			untilState (
// 			    i.getFuture().apply (ev), 
// 			    e.getFuture().apply (ev));
// 		});
// 	    }
	    return s;
	};

	var untilIState = function (i, e) {

	    if (e.value) return e.value.apply (null);

	    var s = st (i.value);

	    function setter (j0) {
		return be (function (ev) {
		    return untilIState (
			(i.then[j0] ? i.then[j0].behavior.apply(ev) : i),
			(e.then[j0] ? e.then[j0].behavior.apply(ev) : e));
		});
	    };
	    
	    for (var j in i.then)
		s.addSource (i.then[j].source, setter (j));
	    
	    for (var j in e.then)
		if (! s.then[j])
		    s.addSource (e.then[j].source, setter (j));
	    
// 	    s.getFuture = function () {
// 		return be (function (ev) {
// 		    return untilIState (
// 			i.getFuture().apply (ev), 
// 			e.getFuture().apply (ev));
// 		});
// 	    }
	    return s;
	};
    
	var arrayState = function (os) {
	    var r = [];
	    for (var j = 0; j < os.length; j++) 
		r [j] = os [j].value;
	    
	    var s = st (r);

	    function setter (j) {
		var fs = tix [j];
		return be(function (ev) {
		    var os1 = copyA (os);
		    
		    for (var i = 0; i < fs.length; i++) {
			var f = fs [i];
			os1 [f] = os [f].then[j].behavior.apply (ev);
		    }
		    return arrayState (os1);
		});
	    };
	    var tix = [];
	    for (var f = 0; f < os.length; f++)
		for (var j in os[f].then) 
		    tix [j] ? tix [j] . push (f) : tix [j] = [f];
		
	    for (var j in tix) {
		var f = tix [j] [0];
		s.addSource (os [f].then[j].source, setter (j));
	    }
	     
	    // s.getFuture = function () {
// 		return be (function (ev) {
// 		    var fa = [];
// 		    for (var j = 0; j < os.length; j++)
// 			fa [j] = os [j].getFuture () . apply (ev);
// 		    return arrayState (fa);
// 		});
// 	    }
	    return s;
	};
	
	var objectState = function (os) {
	    var r = {};
	    
	    for (var j in os) 
		r [j] = os [j].value;
	    
	    var s = st (r);

	    function setter (j) {
		var fs = tix [j];

		return be(function (ev) {
		    var os1 = copy (os);

		    for (var i = 0; i < fs.length; i++) {
			var f = fs [i];
			os1 [f] = os [f].then[j].behavior.apply (ev);
		    }
		    return objectState (os1);
		});
	    };
	    var tix = [];
	    for (var f in os) 
		for (var j in os[f].then) 
		    tix [j] ? tix [j] . push (f) : tix [j] = [f];
		
	    for (var j in tix) {
		var f = tix [j] [0];
		s.addSource (os [f].then[j].source, setter (j));
	    }
 
// 	    s.getFuture = function () {
// 		return be (function (ev) {
// 		    var fa = {};
// 		    for (var j in os)
// 			fa [j] = os [j].getFuture () . apply (ev);
// 		    return objectState (fa);
// 		});
// 	    }
	    return s;
	};
	 
	var apply = function (f, v) {
		return be (function (ev){ 
		    return applyState (
			f.apply (ev),
			v.apply (ev));
		});
	};

	var $const = function (v) {
	    return be (function (ev) {return st (v)});
	};

	var lift = function (f) {
	    return function () {
		return apply ($const (f), liftArray (arguments));
	    }
	};    

	var pres = function (v) {
	    return be (function (ev) {
		return presState (v.apply (ev));
	    });
	};

	var futr = function (v) {
	    return be (function (ev) {
		return futrState (v.apply (ev));
	    });
	};
	
	var until = function (i, e) {
	    return be (function (ev) {
		return untilState (
		    i.apply (ev),
		    e.apply (ev));
	    });
	};
	
	var untilI = function (i, e) {
	    return be (function (ev) {
		return untilIState (
		    i.apply (ev),
		    e.apply (ev));
	    });
	};
	
	var liftArray = function (os) {
	    return be (function (ev) {
		var s = [];
		for (var j = 0; j < os.length; j++)
		    s [j] = os [j].apply (ev);
		return arrayState (s);
	    });
	};
	
	var liftObject = function (os) {
	    return be (function (ev) {
		var s = {};
		for (var j in os) 
		    s [j] = os [j].apply (ev);
		return objectState (s);
	    });
	};

	var $em$un = function (x) {
	    return ! x;
	};
	
	var $em = lift ($em$un);

	var negate$un = function (x) {
		return  - x;
	};

	var negate = lift (negate$un);

	var length$un = function (x) {
	    return x . length; 
	};

	var length = lift (length$un);

	var $un$pl$un = function (x, y) {
	    return x + y;
	};

	var $pl = lift ($un$pl$un);

	var $un$mn$un = function (x, y) {
	    return x - y;
	};

	var $mn = lift ($un$mn$un);
	
	var $un$st$un = function (x, y){
	    return x * y;
	};
	
	var $st = lift ($un$st$un);
	
	var $un$sl$un = function (x, y) {
	    return x / y;
	};
    
	var $sl = lift ($un$sl$un);
	
	var $un$pr$un = function (x, y) {
	    return x % y; 
	};
	
	var $pr = lift ($un$pr$un);
	
	var $un$gt$un =function (x, y) {
	    return x > y;
	};
	
	var $gt = lift ($un$gt$un);
	
	var $un$lt$un = function (x, y) {
	    return x < y;
	};

	var $lt = lift ($un$lt$un);

	var $un$gt$eq$un = function (x, y) {
		return x >= y;
	};

	var $gt$eq = lift ($un$gt$eq$un);
	
	var $un$lt$eq$un = function (x, y) {
		return x <= y;
	};
	
	var $lt$eq = lift ($un$lt$eq$un);
    
	var $un$eq$eq$un = function (x, y) {
		return x == y;
	};

	var $eq$eq = lift ($un$eq$eq$un);

	var $un$vb$vb$un = function (x, y) {
	    return x || y;
	};

	var $vb$vb = lift ($un$vb$vb$un);

	var $un$nd$nd$un = function (x, y) {
	    return x && y;
	};

	var $nd$nd = lift ($un$nd$nd$un);
	
	var $unref$un = function (x, y) {
	    return (x && x [y]);
	};
	
	var ref = lift ($unref$un);
	
	var $unconcat$un = function (x, y) {
	    return x.concat (y);
	};   
	var concat = lift ($unconcat$un);
	
	var $un$ex$un = function (x, y) {
		return Math.pow(x, y);
	};
	
	var $ex = lift ($un$ex$un);
	
	var $unsubstring$un = function (x,y,z) {
	    return x.substring (y, z);
	};
	
	var substring = lift ($unsubstring$un);

	
	var map$un = function (f, a) {
	    var r = [];
	    for (var j = 0; j < a.length; j++)
		r [j] = f (a [j]);
	    return r;
	};
	
	var map = function (f, x) {
	    return lift (map$un) (lift0 (f)) (x);
	};

	var foldl$un = function (f, i, a) {
	    for (var j = 0; j < a.length; j++)
		i = f (i, a[j]);
	    return i;
	};

	var foldl = lift (foldl$un);

	var foldr$un = function (f, i, a) {
	    for (var j = a.length - 1; j >= 0; j--)
		i = f (i, a[j]);
	    return i;
	};
	
	var foldr = lift (foldr$un);

// 	var year$un = function (t) {
// 	    return (new Date (unbox(t))).getYear ();
// 	}

// 	var year = lift (year$un);

// 	var month$un = box (function () {
// 	    return function (t) {
// 		return (new Date (unbox(t))).getMonth ();
// 	    }
// 	});

// 	var month = box (function () {
// 	    return unbox (lift) (month$un);
// 	});

// 	var monthDay$un = box (function () {
// 	    return function (t) {
// 		return (new Date (unbox(t))).getDate ();
// 	    }
// 	});

// 	var monthDay = box (function () {
// 	    return unbox (lift) (monthDay$un);
// 	});

// 	var weekDay$un = box (function () {
// 	    return function (t) {
// 		return (new Date (unbox(t))).getDay ();
// 	    }
// 	});

// 	var weekDay = box (function () {
// 	    return unbox (lift) (weekDay$un);
// 	});
	
 
	var hour$un = function (t) {
	    return (new Date (t)).getHours ();
	};

	var hour = lift (hour$un);

	var minute$un =function (t) {
	    return (new Date (t)).getMinutes ();
	};

	var minute = lift (minute$un);

	var second$un = function (t) {
	    return (new Date (t)).getSeconds ();
	};

	var second = lift (second$un);

	var millisecond$un = function (t) {
	    return (new Date (t)).getMilliseconds ();
	};
	
	var millisecond = lift (millisecond$un);
	
	
	var bindings = {
// 	    lift0 : lift0,
// 	    apply : apply,
	    liftObject : liftObject,
	    liftArray : liftArray, 
// 	    lift1 : lift1,
// 	    lift2 : lift2,
// 	    lift3 : lift3,
// 	    lift4 : lift4,
	    $const: $const,
	    lift: lift,
	    pres : pres,
	    futr : futr,
	    until : until,
	    untilI : untilI,

	    $em$un: $em$un,
	    negate$un: negate$un,
	    length$un: length$un,
	    $un$pl$un: $un$pl$un,
	    $un$mn$un: $un$mn$un,
	    $un$st$un: $un$st$un,
	    $un$sl$un: $un$sl$un,
	    $unref$un: $unref$un,
	    $unconcat$un: $unconcat$un,
	    $un$ex$un: $un$ex$un,
	    $un$pr$un: $un$pr$un,
	    $un$gt$un: $un$gt$un,
	    $un$lt$un: $un$lt$un,
	    $un$gt$eq$un: $un$gt$eq$un,
	    $un$lt$eq$un: $un$lt$eq$un,
	    $un$eq$eq$un: $un$eq$eq$un,
	    $un$nd$nd$un: $un$nd$nd$un,
	    $un$vb$vb$un: $un$vb$vb$un,
	    $unand$un: $un$nd$nd$un,
	    $unor$un: $un$vb$vb$un,
	    $unsubstring$un: $unsubstring$un,

	    $em: $em,
	    negate: negate,
	    length: length,
	    $pl: $pl,
	    $mn: $mn,
	    $st: $st,
	    $sl: $sl,
	    ref: ref,
	    concat: concat,
	    $ex: $ex,
	    $pr: $pr,
	    $gt: $gt,
	    $lt: $lt,
	    $gt$eq: $gt$eq,
	    $lt$eq: $lt$eq,
	    $eq$eq: $eq$eq,
	    $nd$nd: $nd$nd,
	    $vb$vb: $vb$vb,
	    and : $nd$nd,
	    or : $vb$vb,
	    substring: substring,

	    map$un: map$un,
	    foldr$un: foldr$un,
	    foldl$un: foldl$un,

	    map: map,
	    foldr: foldr,
	    foldl: foldl,

// 	    year$un: year$un,
// 	    month$un: month$un,
// 	    monthDay$un: monthDay$un,
// 	    weekDay$un: weekDay$un, 
	    hour$un: hour$un,
	    minute$un: minute$un,
	    second$un: second$un,
	    millisecond$un: millisecond$un,
 
// 	    year: year,
// 	    month: month,
// 	    monthDay: monthDay,
// 	    weekDay: weekDay,
	    hour: hour,
	    minute: minute,
	    second: second,
	    millisecond: millisecond
	};
	
	var iface = [];
	for (var j in bindings) iface.push (j);
	
	return new Struct (new Interface (iface), bindings);
    }}();