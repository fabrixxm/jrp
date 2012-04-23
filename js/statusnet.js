var statusnet = {
	baseurl: '',
	username: '',
	password: '',

	setup: function(){
		config.register(statusnet, ['tool']);
		$("body").on('click', 'button.statusnet', statusnet.go);
	},

	go: function(event) {
		config.get_opts(statusnet.id);
		if (statusnet.baseurl=='' ||statusnet.username=='' || statusnet.password==''){ 
			config.show();
			return;
		}
		
		url = statusnet.baseurl.replace(/(https*:\/\/)/,"$1{0}:{1}@").format(statusnet.username,statusnet.password);
		url = url + "/api/statuses/update";
		
		item = JRP.current_track_info();
		var status_text="{0} by {1}, from {2} - {3}".format(
			item.name,
			item.artist_name,
			item.album_name,
			item.album_url
		);
		
		var status_html="<strong>{4}</strong><br><p>from <a href='{0}'>{1}</a>, by <a href='{2}'>{3}</a></p><br><img src='{5}'>".format(
			item.album_url,
			item.album_name,
			item.artist_url,
			item.artist_name,
			item.name,
			item.album_image		
		);
		
		
		
		$.post(
			url,
			{
				source:'Jamendo Random Player', 
				htmlstatus: status_html,
				status: status_text
			},
			function() {
				alert("Shared!");
			}
		);
	},
	

	
	opts : [
		['baseurl', 'Site url', 'input'],
		['username', 'Username', 'input'],
		['password', 'Password', 'password'],
	],	
	id : 'statusnet',
	name : 'Share track',
	desc : 'Share track on statusnet/friendica',
	icon : {big:'imgs/sn_big.jpg',small:'imgs/sn.jpg'}, 
}
