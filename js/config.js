
var config = {
	plugins : {},
	tool_tpl :' ',
	list_tpl : '',
	elm: null,
	
	setup : function() {
		config.elm = $("#config");
		config.list_tpl = unescape($("#config .tool").html());
		config.elm.html('');
		config.tool_tpl = unescape($("#tools").html());
		$("#tools").html('');
		
		$("#config-container").on('click',  function() { config.hide(); });
		$("#config").on('click',  function(event) { event.stopPropagation(); });
		$("#settings").on('click', function(event) { event.stopPropagation(); config.show() });
		
		config.elm.on('click','#page_save', function() {
			$("input").each(function(i,elm){
				var oid = $(elm).attr('id');
				var otype = $(elm).attr('type');
				switch(otype){
					case "checkbox":
						var val = $(elm).is(":checked")
						break;
					default:
						var val = $(elm).val();
				}
				
				s = oid.split(".");
				prefix = s[0]; plugin = s[1]; opt = s[2];
				
				config.plugins[plugin][opt] = val;
				localStorage.setItem(oid, val);
			});
			$("body").trigger('jrp.optsupdated');
			config.show();
			
		});
		
		config.elm.on('click','#page_delete', function() {
			$("input").each(function(i,elm){
				var oid = $(elm).attr('id');
				var otype = $(elm).attr('type');
				switch(otype){
					case "checkbox":
						var val = false;
						break;
					default:
						var val = '';
				}				
				s = oid.split(".");
				prefix = s[0]; plugin = s[1]; opt = s[2];
				config.plugins[plugin][opt] = val;
				localStorage.removeItem(oid);
				
			});
			$("body").trigger('jrp.optsupdated');
			config.show();
		});
		
		config.elm.on('click','.tool a', function(evt) {
			config.show_page( $(this).parent().attr('id'));
			return false;
		});
	},
	register: function(obj, type) {
		config.plugins[obj.id] = obj;

		$(type).each(function(i){
			switch(type[i]){
				case 'tool':
					var html = config.tool_tpl.format( obj.id, obj.desc, obj.icon.small );
					$("#tools").append(html);
					break;
			}		
		});		

		config.get_opts(obj.id);
		
	},
	
	hide: function() {
		$("#config-container").addClass('hidden');
	},
	
	show: function() {
		config.elm.html('');
		for (k in config.plugins){
			var plug = config.plugins[k];
			var html="";
			if (!!plug['render_list']) {
				html = plug.render_list();
			} else {
				html = config.list_tpl.format(plug.icon.big, plug.name, plug.desc);
			}
			config.elm.append("<li id='"+plug.id+"' class='tool'>"+html+"</li>");
		};
		$("#config-container").removeClass('hidden');
	},
		
	show_page: function(name) {
		var plug = config.plugins[name];
		if (!plug) return;
		
		var page = config.elm.html("<li class='page'></li>").children();

		if (plug['render_page']) {
			html = plug.render_page();
			page.append(html);
			return;
		}
		
		$(plug.opts).each(function(i){
			s = plug.opts[i];
			oid = s[0]; olabel = s[1]; otype = s[2];
			var value = plug[oid];
			if (value==null) value='';
			longid='jrp.'+name+"."+oid;
			switch(otype){
				case 'checkbox':
					value = (value) ? "checked='checked'" : "";
					page.append("<label for='{0}'>{1}</label><input id='{0}' type='{2}' {3}>".format(longid, olabel, otype, value));
					break;
				default:
					page.append("<label for='{0}'>{1}</label><input id='{0}' type='{2}' value='{3}'>".format(longid, olabel, otype, value));
			}
		});
		
		page.append("<button id='page_delete'>Delete</button><button id='page_save'>Save</button>");
	},
	
	get_opts: function(name) {
		var plug = config.plugins[name];
		if (!plug) return;
		$(plug.opts).each(function(i){
			s = plug.opts[i];
			oid = s[0]; olabel = s[1]; otype = s[2];
			var longid='jrp.'+name+"."+oid;
			var value = plug[oid];
			if (value=='' || value==null) {
				value = localStorage.getItem(longid);
			}
			if (value==null) {
				switch(otype){
					case 'checkbox':
						value = false
						break;
					default:
						value = '';
				}
			}
			plug[oid] = value;
			
		});
		
	}
}
