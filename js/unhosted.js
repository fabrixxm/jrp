/**
 * remoteStorage login
 */
 
// Accepting remoteStorage accounts in your web app
// ------------------------------------------------

var helper = (function() {
  var connected = false;
  var authorized = false;

  function setConnectionState(state) {
    connected = state;
    $("body").trigger('unhosted.connectionState');
  }

  function isConnected() {
    return localStorage.getItem('userStorageInfo') != null;
  }

  function disconnect() {
    localStorage.removeItem('userStorageInfo');
    localStorage.removeItem('userAddress');
    setConnectionState(false);
  }

  function setAuthorizedState(state) {
    authorized = state;
    console.log("helper.setAuthorizedState", state);
    $("body").trigger('unhosted.authorizedState');
  }

  function isAuthorized() {
    return localStorage.getItem('bearerToken') != null;
  }

  function deauthorize() {
    localStorage.removeItem('bearerToken');
    setAuthorizedState(false);
  }


  return {
    setConnectionState: setConnectionState,
    isConnected:        isConnected,
    disconnect:         disconnect,
    setAuthorizedState: setAuthorizedState,
    isAuthorized:       isAuthorized,
    deauthorize:        deauthorize,
  };
})();

// Accepting remoteStorage accounts in your web app
// ------------------------------------------------

var storage = (function() {
    
  // `getStorageInfo` takes a user address ("user@host") and a callback as its
  // arguments. The callback will get an error code, and a `storageInfo`
  // object. If the error code is `null`, then the `storageInfo` object will
  // contain data required to access the remoteStorage.
  function connect(userAddress, callback) {
    remoteStorage.getStorageInfo(userAddress, function(error, storageInfo) {
      if(error) {
        alert('Could not load storage info');
        console.log(error);
      } else {
        console.log('Storage info received:');
        console.log(storageInfo);
      }

      callback(error, storageInfo);
    });
  }

  // Getting data from the "public" category doesn't require any credentials.
  // For writing to a user's public data, or reading/writing any of the other
  // categories, we need to do an OAuth request first to obtain a token.

  // This method opens a popup that sends the user to the OAuth dialog of the
  // remoteStorage provider.
  function authorize(categories) {
    var storageInfo = JSON.parse(localStorage.getItem('userStorageInfo'));
    console.log(location);
    var redirectUri =  location.protocol+'//'+location.host+ location.pathname.replace("index.html","") + "get_token.html";

    // `createOAuthAddress` takes the `storageInfo`, the categories that we
    // intend to access and a redirect URI that the storage provider sends the
    // user back to after authorization.
    // That page extracts the token and sends it back to us, which is
    // [described here](token.html).
    localStorage.setItem('storage.category', categories[0]);
    var oauthPage = remoteStorage.createOAuthAddress(storageInfo, categories, redirectUri);
    var popup = window.open(oauthPage);
    }

  // To get the OAuth token we listen for the `message` event from the
  // receive_token.html that sends it back to us.
  window.addEventListener('message', function(event) {
    if(event.origin == location.protocol+'//'+location.host) {
      console.log('Received an OAuth token: ' + event.data);
      localStorage.setItem('bearerToken', event.data);
      console.log(helper);
      helper.setAuthorizedState(true);
    }
  }, false);

  // To get data from the remoteStorage, we need to create a client with
  // the `createClient` method. It takes the object that we got via the
  // `getStorageInfo` call and the category we want to access. If the
  // category is any other than "public", we also have to provide the OAuth
  // token.
  function getData(key, callback) {
    var category = localStorage.getItem('storage.category');
    var storageInfo = JSON.parse(localStorage.getItem('userStorageInfo'));
    var client;

    if (category == 'public') {
      client = remoteStorage.createClient(storageInfo, 'public');
    } else {
      var token = localStorage.getItem('bearerToken');
      client = remoteStorage.createClient(storageInfo, category, token);
    }

    // The client's `get` method takes a key and a callback. The callback will
    // be invoked with an error code and the data.
    client.get(key, function(error, data) {
      if(error) {
        alert('Could not find "' + key + '" in category "' + category + '" on the remoteStorage');
        console.log(error);
      } else {
        if (data == undefined) {
          console.log('There wasn\'t anything for "' + key + '" in category "' + category + '"');
        } else {
          console.log('We received this for key "' + key + '" in category "' + category + '": ' + data);
        }
      }

      callback(error, key, data);
    });
  }

  // For saving data we use the client's `put` method. It takes a key, the
  // value and a callback. The callback will be called with an error code,
  // which is `null` on success.
  function putData(key, value, callback) {
    var category =  localStorage.getItem('storage.category');
    var storageInfo = JSON.parse(localStorage.getItem('userStorageInfo'));
    var token = localStorage.getItem('bearerToken');
    var client = remoteStorage.createClient(storageInfo, category, token);
      
    client.put(key, value, function(error) {
      if (error) {
        alert('Could not store "' + key + '" in "' + category + '" category');
        console.log(error);
      } else {
        console.log('Stored "' + value + '" for key "' + key + '" in "' + category + '" category');
      }

      callback(error);
    });
  }
  
  function delData(key, callback) {
    var category =  localStorage.getItem('storage.category');
    var storageInfo = JSON.parse(localStorage.getItem('userStorageInfo'));
    var token = localStorage.getItem('bearerToken');
    var client = remoteStorage.createClient(storageInfo, category, token);

    client.delete(key, function(error) {
      if (error) {
        alert('Could not delete "' + key + '" in "' + category + '" category');
        console.log(error);
      } else {
        console.log('Deleted key "' + key + '" in "' + category + '" category');
      }

      callback(error);
    });      
      
  }
  
  // Now all that's left is to bind the events from the UI elements to
  // these actions, as can be seen [here](app.html).

  return {
    connect:   connect,
    authorize: authorize,
    getData:   getData,
    putData:   putData,
    delData:    delData
  };

})();

/**
 * sync localStorage-like api object, iterface to async storage object
 */
var syncStorage = {
    data : {},
        
    cb: function(error, key, data){
        if (error==null) syncStorage.data[key] = {data:data, timestamp: new Date().getTime };
        config.reload();
    },
    getItem: function(key) {
        if (syncStorage.data[key]==undefined ) {
            storage.getData(key, syncStorage.cb);
            return null;
        }   
        if (syncStorage.data[key].timestamp > (new Date().getTime+10000) ) {
            storage.getData(key, syncStorage.cb);
        }
        return syncStorage.data[key].data;
    },
    setItem: function(key, value) {
        syncStorage.data[key] = {data:value, timestamp: new Date().getTime };
        storage.putData(key, value, function(error) {} );
    },
    removeItem: function(key) {
        delete syncStorage.data[key];
        storage.delData(key, function(error) { } );
    }
}

/**
 * JRP unhosted plugin
 */
var unhosted = {
    userAddress : false,
    status : 0, // 0-normal, 1-wait token
    
	setup : function(){
		config.register(unhosted, []);
        /* ui callbacks */
        $('#config').on('click', '#uhlogout', function(event){
            helper.deauthorize();
            helper.disconnect();
        });
		$('#config').on('click', '#uhlogin', function(event){
			var uhid = $("#uhid").val();
			console.log(uhid);
            unhosted.do_login(uhid);
		});
        
        // changed connection state
        $('body').on('unhosted.connectionState', function() {
            if (helper.isConnected()){
                storage.authorize(['jrp']);
            }
            config.redraw();
        });
        
        // changed auth state
        $('body').on('unhosted.authorizedState', function() {
            unhosted.status=0;
            if (helper.isAuthorized()) {
                console.log("unhosted logged and authorized",storage);
                config.storage = syncStorage;
            } else {
                config.storage = localStorage;
            }
            console.log('unhosted.authorizedState');
            config.reload();
        });

        // autologin
        unhosted.userAddress = localStorage.getItem('userAddress');
        if (localStorage.getItem('userAddress')!=null && !helper.isAuthorized() && !helper.isConnected()) {
            unhosted.do_login(localStorage.getItem('userAddress'));
        }
        if (localStorage.getItem('userAddress')!=null && helper.isAuthorized() && helper.isConnected()) {
            config.storage = syncStorage;
            config.reload();
        }
        
		
	},

    do_login : function(userAddress) {
            if (unhosted.status==1) return;
            unhosted.status=1;
            remoteStorage.getStorageInfo(userAddress, function(error, storageInfo) {
                if(error) {
                   helper.setConnectionState(false);
                    localStorage.removeItem('userAddress');
                } else {
                    localStorage.setItem('userStorageInfo', JSON.stringify(storageInfo));
                    localStorage.setItem('userAddress', userAddress);
                    unhosted.userAddress = userAddress;
                    helper.setConnectionState(true);
                }
            });        
    },
	
	render_list : function(){
        if (helper.isConnected() & helper.isAuthorized()) {
            var html="<img src='{0}'><h3>{1}</h3><p>{2}</p>"+unhosted.userAddress+" <button id='uhlogout'>Logout</button>";
        } else {
            var html="<img src='{0}'><h3>{1}</h3><p>{2}</p><input id='uhid'><button id='uhlogin'>Login</button>";
        }
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