var scrobble = {
	baseurl: 'http://libre.fm/2.0/',
	username: '',
	password: '',
	send: false,
	session: false,
	
	setup: function(){
		config.register(scrobble);
		$("body").on('click', 'button.scrobble', scrobble.go);
		$("body").on('jrp.end', scrobble.scrobble);
		$("body").on("jrp.optsupdate", scrobble.opts_updated);
		scrobble.opts_updated();
	},

	go: function(event) {
		config.get_opts();
		config.show();
	},
	
	scrobble: function(event) {
		if (!scrobble.send) return;
		if (!scrobble.session) { 
            scrobble.opts_updated(); // if session is null, could be expired. try to auth again
            return; // lose this track...
        }
        
		
		var item = JRP.current_track_info();
        if (JRP.test) item = { artist_name: "The Wavers", name : "Three minutes to escape" };
        console.log(item)
        if (item == undefined ) return;
        
		var args = {
            method : "track.love",
            artist : item.artist_name,
            track : item.name,
            sk : scrobble.session,
            format : 'json'
        }
        
        console.log("I can't scrobble because I need to to a jsonp request, but API wants POST.");
        return;
        
        $.ajax({
            url: scrobble.baseurl,
            data: args,
            dataType: 'json',
            type: "POST",
            success: function (data){
                console.log(data);
                if (data.error !=0) {
                    console.log("Scrobble error: " + data.message);
                } else {
                    console.log("Scrobbled!");
                }
            },
            error: function(data) {
                console.log("Scrobble error!", data);
                //scrobble.session = false;
            }
        });
        
        
	},

	opts_updated : function() {
		//console.log("scrobble.opts_updated");
		config.get_opts();
		if (scrobble.username!='' && scrobble.password!='' && scrobble.session==false) {
			//var timestamp = Math.round(new Date().getTime() / 1000);
			//var auth = hex_md5(hex_md5(scrobble.password) + timestamp);
            var passmd5 = hex_md5(scrobble.password);
            var token =  hex_md5(scrobble.username + passmd5);
			var args = {
                method:'auth.getMobileSession',
                username: scrobble.username,
                authToken: token,
                format : 'json',
				/*hs: true,
				p : 1.2,
				c: "JRP",
				v: JRP._version_,
				u: scrobble.username,
				t: timestamp,
				a: auth*/
			}

			//console.log(args);
			
            $.ajax({
				url: scrobble.baseurl,
				data: args,
				dataType: 'jsonp',
                type: "GET",
				success: function (data){
                    scrobble.session = data.session.key;
                    //console.log(scrobble.session);
				},
                error: function(data) {
                    //console.log(data);
                    alert("Error login to libre.fm.");
                }
			});
			
			
		}
	},
	
	opts : [
		['username', 'Username', 'input'],
		['password', 'Password', 'password'],
		['send', 'Send tracks', 'checkbox']
	],	
	tool : 'scrobble',
	name : 'Libre.fm',
	desc : 'Send tracks to Libre.fm',
	icon : {big:'imgs/librefm.png',small:'imgs/librefm.png'}
}