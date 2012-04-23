var scrobble = {
	baseurl: 'http://turtle.libre.fm/',
	username: '',
	password: '',
	send: false,
	session: "a4760b7051c74edfd6756225c6eca083",
	
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
		if (!scrobble.session) return;
		
		var item = JRP.current_track_info();
		
		var args = {
			s: scrobble.session,
			a: Array(item.artist_name),
			t: Array(item.name),
			i: scr
t[0]=<track>
The track title. Required.
i[0]=<time>
The time the track started playing, in UNIX timestamp format (integer number of seconds since 00:00:00, January 1st 1970 UTC). This must be in the UTC time zone, and is required.
o[0]=<source>
The source of the track. Required, must be one of the following codes: 
P
Chosen by the user
R
Non-personalised broadcast (e.g. Shoutcast, BBC Radio 1)
E
Personalised recommendation except Last.fm (e.g. Pandora, Launchcast)
L
Last.fm (any mode). In this case, the 5-digit Last.fm recommendation key must be appended to this source ID to prove the validity of the submission (for example, "o[0]=L1b48a").
U
Source unknown

Please note, for the time being, sources other than P and L are not supported.
r[0]=<rating>
A single character denoting the rating of the track. Empty if not applicable. 
L
Love (on any mode if the user has manually loved the track). This implies a listen.
B
Ban (only if source=L). This implies a skip, and the client should skip to the next track when a ban happens.
S
Skip (only if source=L)

Note: Currently, a web-service must also be called to set love/ban status. We anticipate that this will be phased out soon, and the submission service will handle the whole process.
l[0]=<secs>
The length of the track in seconds. Required when the source is P, optional otherwise.
b[0]=<album>
The album title, or empty if not known.
n[0]=<tracknumber>
The position of the track on the album, or empty if not known.
m[0]=<mb-trackid>
		
	},

	opts_updated : function() {
		console.log("scrobble.opts_updated");
		config.get_opts();
		if (scrobble.username!='' && scrobble.password!='' && scrobble.session==false) {
			var timestamp = Math.round(new Date().getTime() / 1000);
			var auth = hex_md5(hex_md5(scrobble.password) + timestamp);
			var args = {
				hs: true,
				p : 1.2,
				c: "JRP",
				v: JRP._version_,
				u: scrobble.username,
				t: timestamp,
				a: auth
			}

			console.log(args);
			$.ajax({
				url: scrobble.baseurl,
				data: args,
				dataType: "text",
				type: "GET",
				headers: { Host: "turtle.libre.fm" },
				success: function (data){
					alert(data);
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