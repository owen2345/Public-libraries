/**
 * Author: Owen Peredo Diaz
 * This is a jquery plugin that add two new methods to load image (start, progress)
 * With these new functions you can capture the progress status and show its progress bar
 * PARAMS: complete: function(img){}, progress: function(e, img){}, start: function(img){}
 * samples:
 <script>
 function load_img(url)
 {
     var image_to_load =$("<img src='"+url+"'>");
     var loading = $(".loading");
     image_to_load.load_img({start: function(img)
         {
             loading.show().html("0%");
         }, progress: function(e, img)
         {
             loading.html(Math.round(e.loaded / e.total * 100)+"%");
         }, complete: function(){
             $("body").append(image_to_load);
             loading.html("complete").hide();
         }});
 }

 jQuery(function($)
 {
     load_img('http://pinthis-fresh.pixelbeautify.com/wp-content/uploads/bfi_thumb/dfgdfgd-2w5cd0gybaqhcain892o74.jpg')
 });
 </script>
 <body>
 <div class='loading'></div>
 </body>
 */
jQuery(function($){
    $.fn.load_img = function(params){
        var settings = $.extend({complete: function(){}, progress: function(){}, start: function(){}}, params);
        $(this).each(function(){
            var img = $(this);
            if(typeof XMLHttpRequest === "undefined"){
                settings.start(img);
                img.load(settings.complete);
            }else{
                var request;
                request = new XMLHttpRequest();
                request.onloadstart = function(){ settings.start(img); };
                request.onprogress = function(e){ settings.progress(e, img); };
                request.addEventListener('progress',function(e){ settings.progress(e, img); }, false);
                request.onload = function(){  try{ img.attr("src", "data:image/jpeg;base64," + base64Encode_(request.responseText));  }catch(e){} };
                request.onloadend = function(){ settings.complete(img); };
                request.open("GET", img.attr("src"), true);
                //request.responseType = 'arraybuffer'; //with this param is not posible to get request.responseText
                try{ request.overrideMimeType('text/plain; charset=x-user-defined'); }catch(e){}
                request.send(null);
            }
        });

        // This encoding function is from Philippe Tenenhaus's example at http://www.philten.com/us-xmlhttprequest-image/
        function base64Encode_(inputStr)
        {
            var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var outputStr = "";
            var i = 0;

            while (i < inputStr.length)
            {
                //all three "& 0xff" added below are there to fix a known bug
                //with bytes returned by xhr.responseText
                var byte1 = inputStr.charCodeAt(i++) & 0xff;
                var byte2 = inputStr.charCodeAt(i++) & 0xff;
                var byte3 = inputStr.charCodeAt(i++) & 0xff;

                var enc1 = byte1 >> 2;
                var enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);

                var enc3, enc4;
                if (isNaN(byte2))
                {
                    enc3 = enc4 = 64;
                }
                else
                {
                    enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
                    if (isNaN(byte3))
                    {
                        enc4 = 64;
                    }
                    else
                    {
                        enc4 = byte3 & 63;
                    }
                }

                outputStr += b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4);
            }

            return outputStr;
        }
    }
});