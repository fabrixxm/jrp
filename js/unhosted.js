/**
 * remoteStorage login
 */
 
var unhosted = {
	setup : function(){
		config.register(unhosted, []);
		$('#config').on('click', '#uhlogin', function(event){
			var uhid = $("#uhid").val();
			console.log(uhid);
			remoteStorage.configure({
				userAddress: uhid
			});
		});
		
	},
	
	render_list : function(){
		var html="<img src='{0}'><h3>{1}</h3><p>{2}</p><input id='uhid'><button id='uhlogin'>Login</button>";
		html = html.format(
			unhosted.icon.big,
			unhosted.name,
			unhosted.desc
		);
		return html;
	},
	
	id:'unhosted',
	name: 'RemoteStorage Login',
	desc: 'Login with your id to save preferences to your storage',
	icon: {big:'imgs/uh_big.png', small:''},
	opts : []
}