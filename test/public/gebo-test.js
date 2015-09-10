with (Actors) with (ActorsTest) with (ActorsRemote){

    ActorsRemote.init ();
    
    var echo = get ("registry/echo");

    var write = function (n) {
	if (n >= 0) {
	    send (echo, [self (), "ciao " + n]);
	    document.getElementById ("main").appendChild (document.createTextNode ("I've sent: ciao" + n));
	    document.getElementById ("main").appendChild (document.createElement ("br"));
	    
	    suspend (function () {
		var m = current ();
		consume ();
		document.getElementById ("main").appendChild (document.createTextNode ("SERVER RESPONSE: "));
		document.getElementById ("main").appendChild (document.createTextNode (m));
		document.getElementById ("main").appendChild (document.createElement ("br"));
		write (n - 1);
	    });
	};
    };
    window.onload = function () {actor (function () {write (10)})};
}