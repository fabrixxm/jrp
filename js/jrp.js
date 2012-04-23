/**
* sprintf in javascript
* "{0} and {1}".format('zero','uno');
**/
String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

/**
* Jamendo Random Player
**/
var JRP = {

	//query='http://api.jamendo.com/get2/id+stream+name+duration+album_name+album_url+album_image+artist_name+artist_url/track/json/track_album+album_artist/?n=5&order=random&streamencoding=ogg2';
	query : 'http://api.jamendo.com/it/?m=get2&m_params=id+stream+name+duration+album_name+album_url+album_image+artist_name+artist_url%2Ftrack%2Fjsoncallback%2Ftrack_album+album_artist%2F&n={0}&order=random&streamencoding={1}',
	n : 50,
	encoding : 'ogg2',
	playlist : [],
	cursor : 0,
	player : null,
	info : null,

	_version_:"1.0",
	
	setup : function(){
		if(!document.createElement('audio').canPlayType) {
			$("#loader").hide();
			$("#nav").hide();
			$("#player").html("<p class='error'>You need a recent browser with HTML5 audio support</p>");
			return false;
		}
		
		
		if (!!document.createElement('audio').canPlayType('audio/ogg')) {
			JRP.encoding='ogg2';
		} else {
			JRP.encoding='mp31'; 
		}
		
		
		$("#player").html("<audio></audio>");
		JRP.player = $("#player").children();
		JRP.player.on("ended", JRP.play_next);
		JRP.player.on("error",  JRP.play_next);
		
		JRP.info = unescape($("#info").html());
		
		$("#skip").on("click", JRP.play_next);
		$("#pp").on("click",  JRP.playpause);
		
		if (JRP.test) {
			$("#loader").hide();
			$("#info").show();
			return false;
		}
		return true;
	},

	playpause : function(event){
		var bt = $("#pp");

		var audio = JRP.player[0];
		if (audio.paused) { 
			audio.play(); 
			bt.removeClass('pause');   
			bt.addClass('play');   
		}  else { 
			audio.pause(); 
			bt.removeClass('play');   
			bt.addClass('pause');   
		}
	},
	play_next : function(event){
		//console.log("play_next", this, event);
		$("#info").hide();
		$("body").trigger('jrp.end');
		
		JRP.cursor++;
		var item = JRP.playlist[JRP.cursor];

		JRP.player.attr("src", item.stream);
		JRP.player[0].play();

		
		var info = JRP.info.format(
			item.album_url,
			item.album_name,
			item.artist_url,
			item.artist_name,
			item.name,
			item.album_image
		);
		$("#info").html(info).show();

		$("#pp").removeClass('pause');   
		$("#pp").addClass('play');   

		$("body").trigger('jrp.start');
		
		if (JRP.cursor > (JRP.playlist.length-2)){
			JRP.get_tracks();
		}
	},

	get_tracks : function(start){
		$.ajax({
			url: JRP.query.format(JRP.n, JRP.encoding),
			dataType: 'jsonp',
			jsonp: 'jsoncallbackfunction',
			success:  function(data) {
				$("#loader").hide();
				JRP.playlist = data;
				JRP.cursor = -1;
				if (start) JRP.play_next();
			},
			error: function() {
				console.log(arguments);
				//setTimeout('JRP.get_tracks({0})'.format( (start)?'true':'false' ), 1000);
			}
		});
	},
	
	current_track_info : function() {
		return JRP.playlist[JRP.cursor];
	},
	
	test: false	
}





$(document).ready(function(){
	// tools
	config.setup();
	//scrobble.setup();
	statusnet.setup();
	//unhosted.setup();
	
	// player
	//JRP.test=true;
	if (JRP.setup()) JRP.get_tracks(true);	  
	

});
