/*
 * created by Owen Peredo
 * params:
 * app_id
 * scope => perms splitted by ,
 * after_init = function

 * functions:
 * login = function(after_login(user, insufficient_permissions)) // (check login status if not logged, then start login) return FB user (object) or not_authorized (string) or false (boolean)
 * check_status = function(callback) //check if user is logged in (user object or false)
 * validatePermissions = function(callback) // check if app was installed and accepted all perms return ("insufficient_permissions", permsToPrompt) or (user object)
 * load_pages_list = function(callback) // return user fan pages
 * install_tab = function(page, app_id, callback) // install app_id as tab on fan page
 * install_tab_simple = function(tab_url, callback) //install current app in any fan pages from current user
 * update_tab = function(page_id, app_id, params, callback) //update tab on a fanpage   (params: { "position": 3, "custom_name": "Newtabname" })
 * shareFeedVideoFB = function(targetID, title, description, image_url, video_url, callbak)
 * shareFeedPhotoFB = function(title, description, caption, link_app, url_picture, callback)
 * shareFeedTextFB = function(title, description, link_app, callback)
 * inviteFriendsFB = function(message, data, saveUrl, callback) //show friends list and then call to saveUrl with users id invited to save on database if necessary
 * NEED JQUERY to use this library
 * example:
 face = new FaceOwen({app_id: 21312312321, scope: "publish_actions,email,manage_pages", after_init: after_ini})
 function after_ini()
 {
 user = face.check_status();
 if(!user)
 face.login(after_login);
 else
 alert("you are logged" + user.name);
 }

 function after_login(user, insufficient_permissions)
 {
 if(user == "not_authorized")
 {
 alert("You need accept the application to access...");
 }else if(user && insufficient_permissions)
 {
 alert("You need accept the follow permissions: "+insufficient_permissions.join(", "));
 }
 else if(user)
 {
 alert("logged successfully");
 }
 else
 {
 alert("you need to be logged in to continue");
 }
 }
 */

function FaceOwen(params)
{
    var settings = {url: "https://graph.facebook.com/", scope: "publish_actions", after_init: function(){}};
    settings = $.extend(settings, params);

    var self = this;
    self.do_after_init = function(){ settings.after_init(); }

    // return FB user or not_authorized or false
    // user: Logged into your app and Facebook.
    // not_authorized: The person is logged into Facebook, but not your app.
    // false: The person is not logged into Facebook, so we're not sure if they are logged into this app or not.
    self.login = function(callback)
    {
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected')
                self.validatePermissions(callback);
            else
                self.do_login_fb(callback);
        });
    }

    self.check_status = function(callback){
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') self.validatePermissions(callback, true);
            else callback(false);
        });
    }

    //boolean: true|false => return true or false
    self.validatePermissions = function(callback, boolean_mode) {
        var permsNeeded = settings.scope.split(",");
        FB.api('/me/permissions', function(response) {
            var permsToPrompt = [];
            $.each(settings.scope.split(","), function(i, n_perm)
            {
                var band = false;
                $.each(response.data, function(i, perm){ if(perm.permission.toLowerCase() == n_perm.toLowerCase()) band = true;  });
                if(!band) permsToPrompt.push(n_perm);
            });

            if(permsToPrompt.length > 0){
                if(boolean_mode) callback(false);
                else callback("insufficient_permissions", permsToPrompt);
            }
            else self.get_user(callback);
        });
    }

    self.current_fanpage_details = function(callback){
        console.log(FB.getAuthResponse());
        var signedRequest = FB.getAuthResponse().signedRequest
        var data = signedRequest.split('.')[1];
        data = JSON.parse(decode_base64(data));
        console.log(data);

    }

    self.do_login_fb = function(callback)
    {
        FB.login(function(response) {
            if (response.status === 'connected') { // Logged into your app and Facebook. and return user data
                self.validatePermissions(callback);
            } else if (response.status === 'not_authorized') {
                // The person is logged into Facebook, but not your app.
                callback(response.status);
            } else {
                // The person is not logged into Facebook, so we're not sure if
                // they are logged into this app or not.
                callback(false);
            }
        }, {scope: settings.scope, auth_type: 'rerequest' });
    }

    self.get_user = function(callback){
        FB.api('/me', function(response) {
            if(callback) callback(response);
        });
    }

    self.load_pages_list = function(callback){
        FB.api("me/accounts", function(response){ if(callback) callback(response.data); });
    }

    self.install_tab = function(page, app_id, callback){
        $.getJSON(settings.url+page.id+"/tabs?app_id="+app_id+"&method=POST&access_token="+page.access_token+"&callback=?", function(res){if(callback) callback(res);});
    }

    self.install_tab_simple = function(tab_url, callback){
        FB.ui({
            method: 'pagetab',
            redirect_uri: tab_url,
            display: "popup"
        }, function(response){ if(callback()) callback(response); });
    }

    // params: { "position": 3, "custom_name": "Newtabname" }
    self.update_tab = function(page_id, app_id, params, callback){
        FB.api( "/"+page_id+"/tabs/app_"+app_id, "POST", { "object": $.extend({}, params)}, function (response) { if(callback) callback(response); });
    }

    self.shareFeedVideoFB = function(targetID, title, description, image_url, video_url, callbak){
        FB.ui({
            method: 'stream.publish',
            display: 'dialog',
            target_id: targetID,
            attachment:
            {
                name: title,
                description: description,
                media: [{ 'type': 'flash',
                    'swfsrc': video_url,
                    "imgsrc": image_url,
                    "width": "398",
                    "height": "398",
                    "expanded_width": "398",
                    "expanded_height": "398"
                }]
            }
        }, function(res){ if(callbak) callbak(res); });
    }

    self.shareFeedPhotoFB = function(title, description, caption, link_app, url_picture, callback){
        FB.ui({ method: 'feed',
            name: title,
            link: link_app,
            picture: url_picture,
            caption: caption,
            description: description
        }, function(res){ if(callback) callback(res); });
    }

    self.shareFeedTextFB = function(title, description, link_app, callback){
        FB.ui({     display: 'iframe',
            method: 'stream.publish',
            name: title,
            link: link_app,
            description:description,
            picture: ''
        }, function(res){ if(callback) callback(res); });
    }

    self.inviteFriendsFB = function(message, data, saveUrl, callback){
        FB.ui({     method: 'apprequests',
            message: message,
            data: data,
            display:'popup',
            next: saveUrl
        }, function(res){ if(callback) callback(res); });
    }

    window.fbAsyncInit = function() {FB.init({ appId : settings.app_id, xfbml : true, version: 'v2.0'}); self.do_after_init();}; (function(d, s, id){        var js, fjs = d.getElementsByTagName(s)[0];        if (d.getElementById(id)) {return;}        js = d.createElement(s); js.id = id;        js.src = "//connect.facebook.net/en_US/sdk.js";        fjs.parentNode.insertBefore(js, fjs);    }(document, 'script', 'facebook-jssdk'));
    function decode_base64(s) { var e={},i,k,v=[],r='',w=String.fromCharCode; var n=[[65,91],[97,123],[48,58],[43,44],[47,48]]; for(z in n){for(i=n[z][0];i<n[z][1];i++){v.push(w(i));}}
        for(i=0;i<64;i++){e[v[i]]=i;}

        for(i=0;i<s.length;i+=72){
            var b=0,c,x,l=0,o=s.substring(i,i+72);
            for(x=0;x<o.length;x++){
                c=e[o.charAt(x)];b=(b<<6)+c;l+=6;
                while(l>=8){r+=w((b>>>(l-=8))%256);}
            }
        }
        return r;
    }
}