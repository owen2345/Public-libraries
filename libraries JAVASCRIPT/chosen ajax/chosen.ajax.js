/**
 plugin attributes:
 ddata-selected: options selected splitted by ,
 data-case: selector key, sometimes this is the funtion name on the server
 data-extra: extra data value sent by ajax as extra

 plugin params:
 url: "", 
 method: "get", 
 ajax: custom ajax params
 width: selector width, default 300

 exmaple for the answer from server:
 <option value='aa'>AAA</option>
 <option value='bb' selected='true'>BBB</option>
 <option value='cc' data-after='<i>icon here</i>'>CCC</option> //this option is shown only on chosen list because the native dropdown doesn't support html/icons/images
*/
$.fn.chosen_ajax = function(params)
    {
        this.each(function()
        {
            var selector = $(this);
            var settings = { url: "", method: "get", width: "300px", ajax: {} }
            settings = $.extend(settings, params);
            settings.ajax = $.extend({selected: selector.data("selected"), 'case': selector.data("case"), extra: selector.data("extra")}, settings.ajax);
            $.ajax({
                type: settings.method,
                url: settings.url,
                data: settings.ajax,
                success: function(res)
                {
                    selector.append(res).chosen({width: settings.width});
                }
            })
        });
        return this;
    }