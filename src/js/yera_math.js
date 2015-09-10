var YeraMath = function () {
	with (Yera) with (YeraCore.bindings) {
	    
	    var $unpi$un = Math.PI;

	    var pi = $const ($unpi$un);

	    var $une$un = Math.E;

	    var e = $const ($une$un);

	    var $unminValue$un = Number.MIN_VALUE;

	    var minValue = $const ($unminValue$un);

	    var $unmaxValue$un = Number.MAX_VALUE;

	    var maxValue = $const ($unmaxValue$un);
	    
	    var $unNaN$un = Number.NaN;

	    var NaN = $const ($unNaN$un);

	    var $uninfinity$un = Number.POSITIVE_INFINITY;

	    var infinity = $const ($uninfinity$un);

	    var abs$un = Math.abs;
	    
	    var abs = lift (abs$un);

	    var sin$un = Math.sin;

	    var sin = lift (sin$un);

	    var cos$un = Math.cos;

	    var cos = lift (cos$un);
	    
	    var tan$un = Math.tan;

	    var tan = lift (tan$un);
	    
	    var asin$un = Math.asin;

	    var asin = lift (asin$un);

	    var acos$un = Math.acos;

	    var acos = lift (acos$un);
	    
	    var atan$un =Math.atan;

	    var atan = lift (atan$un);

	    var atan2$un = Math.atan2

	    var atan2 = lift (atan2$un);

	    var exp$un = Math.exp;

	    var exp = lift (exp$un);

	    var log$un = Math.log;

	    var log = lift (log$un);

	    var ceil$un = Math.ceil;

	    var ceil = lift (ceil$un);

	    var floor$un = Math.floor;

	    var floor = lift (floor$un);

	    var round$un = Math.round;

	    var round = lift (round$un);
	    
	    var $unsqrt$un = Math.sqrt;
	    
	    var sqrt = lift ($unsqrt$un);

	    var $unmax$un = Math.max;

	    var max = lift ($unmax$un);
	    
	    var $unmin$un = Math.min;

	    var min = lift ($unmin$un);

	    var $unpow$un = Math.pow;

	    var pow = lift ($unpow$un);
	    
	    var bindings = {

		$unpi$un: $unpi$un,
		$une$un: $une$un, 
		$unmaxValue$un: $unmaxValue$un,
		$unminValue$un: $unminValue$un,
		$unNaN$un: $unNaN$un,
		$uninfinity$un: $uninfinity$un,

		pi:pi,
		e:e, 
		maxValue:maxValue,
		minValue:minValue,
		NaN:NaN,
		infinity: infinity,
		
	 	abs$un: abs$un,
		sin$un: sin$un,
		cos$un: cos$un,
		tan$un: tan$un,
		asin$un: asin$un,
		acos$un: acos$un,
		atan$un: atan$un,
		atan2$un :atan2$un,
		exp$un: exp$un,
		log$un: log$un,
		ceil$un: ceil$un,
		floor$un: floor$un,
		round$un: round$un,

		abs:abs,
		sin:sin,
		cos:cos,
		tan:tan,
		asin:asin,
		acos:acos,
		atan:atan,
		atan2:atan2,
		exp:exp,
		log:log,
		ceil:ceil,
		floor:floor,
		round:round,

		$unsqrt$un: $unsqrt$un,
		$unmin$un: $unmin$un,
		$unmax$un: $unmax$un,
		$unpow$un: $unpow$un,

		sqrt:sqrt,
		min:min,
		max:max,
		pow:pow
	    };
	    
	    var iface = [];
	    for (var j in bindings) iface.push (j);
	    
	    return new Struct (new Interface (iface), bindings); 
	}
}();
