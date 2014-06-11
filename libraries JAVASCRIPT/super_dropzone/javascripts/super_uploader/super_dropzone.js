jQuery(function()
{
    // samples: <div id="super_dropzone">    <div class="panel_dropzone"></div>    </div>
    // $("#super_dropzone").superDropzone({url: 'a.php', ....})
    // this is a extension of dropzone plugin with ie8,9 supports
    // for ie support, don't use this within a form
    // get all uploaded files: $(".super_dropzone").triggerHandler("get_uploaded_files");
    // custom event: $(".super_dropzone").trigger("startProcessQueue");
    // for callback action you can use: onSuccessFile = function(files){console.log(files[0])} // where files is a json of a unique file
    $.fn.superDropzone = function(settings)
    {
        var panel = $(this);
        var myDropzone;
        var config = {
            extensions: ["jpg", "png", "rar", "zip", "pdf"],
            url: "/",
            clickable:true,
            method: "post",
            maxFiles:2,
            uploadMultiple: false,
            parallelUploads:3,
            maxFilesize:2,
            addRemoveLinks:true,
            paramName:'files[]',
            forceFallback:false,
            createImageThumbnails:true,
            maxThumbnailFilesize:1,
            autoProcessQueue:true,
            message: "Drop here your files or click here",
            onSuccessFile: function(){},
            accept: function(file, done)
            {
                if(check_accept_files(file.name))
                    done();
                else
                    done("Please select only: "+config.extensions.join(","));
            }
        };

        config = $.extend(config, settings);
        config.success = success_upload;
        config.dictDefaultMessage = config.message;

        if(!panel.hasClass("super_dropzone_done"))
        {
            panel.bind("get_uploaded_files", function(){ var res = []; panel.find(".dz-preview.dz-success").each(function() { $.each($(this).data("response"), function(i, f){ res.push(f); }); }); return res; });
            panel.addClass("super_dropzone super_dropzone_done").bind("startProcessQueue", function(){ if(!isBadBrowser()) myDropzone.processQueue(); else panel.find(".dz-preview form").submit(); });
            if(isBadBrowser())
            {
                var add_more_files = "";
                if(config.maxFiles > 1) panel.prepend($("<a class='add_link' href='#'>Add file</a>").click(function(){ add_file_upload_IE(config.paramName, false); return false; }));
                panel.addClass("ie_version").find(".panel_dropzone").addClass("dropzone");
                add_file_upload_IE(config.paramName, true);
            }else
            {
                myDropzone = panel.find('.panel_dropzone').attr('class','dropzone').dropzone(config).get(0).dropzone;
            }
        }

        // return boolean
        function check_accept_files(file)
        {
            return $.inArray(file.split(".").pop().toLowerCase(), config.extensions) >= 0;
        }

        function add_file_upload_IE(name, mandatory)
        {
            if(panel.find(".panel_dropzone").find(".dz-preview").length >= config.maxFiles) return;
            var previewTemplate = $("<div class=\"dz-preview empty dz-file-preview "+(mandatory ? "cant_remove":"")+" \">\n  <div class=\"dz-details\">\n    <div class=\"dz-filename\"><span data-dz-name></span></div>\n    <div class=\"dz-size\" data-dz-size><form method='"+config.method+"'><input type='file' name='"+name+"'></form></div>\n    </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-success-mark\"><span>✔</span></div>\n  <div class=\"dz-error-mark\"><span>✘</span></div>\n <a href='#' class='dz-remove'>Remove</a> \n <div class=\"dz-error-message\"><span data-dz-errormessage></span></div> <div class='spz_progress'></div> \n</div>");
            panel.find(".panel_dropzone").append(previewTemplate);
            previewTemplate.find("input:file").change(function()
            {
                previewTemplate.removeClass("dz-success");
                if(!check_accept_files($(this).val()))//error format
                {
                    $(this).trigger("error_file", "Please select only: "+config.extensions.join(", "));
                    return false;
                }else
                {
                    previewTemplate.removeClass("dz-error").removeClass("empty").find(".dz-filename span").html($(this).val());
                    previewTemplate.find(".dz-error-message").hide();
                    if(config.autoProcessQueue) previewTemplate.find("form").submit();
                }
            }).bind("error_file", function(e, msg)
                {
                    previewTemplate.removeClass("dz-success").addClass("dz-error").find(".dz-error-message").show().find("span").html(msg);
                    previewTemplate.find(".spz_progress").html("");
                    $(this).val("");
                });
            previewTemplate.find(".dz-remove").click(function(){ previewTemplate.remove(); return false; });
            previewTemplate.find("form").submit(function(e){e.stopPropagation(); }).ajaxForm({url: config.url,
                error: function(response){ previewTemplate.find("input:file").trigger("error_file", response); },
                success: function(response){ success_upload(null, response, previewTemplate); },
                beforeSubmit: function(){  previewTemplate.removeClass("dz-success").removeClass("dz-error").find(".spz_progress").html("uploading...") }});
            return previewTemplate;
        }

        // success file uploaded
        function success_upload(fileIO, response, preview_template)
        {
            if(fileIO)
            {
                fileIO.previewElement.classList.add("dz-success");
                preview_template = $(fileIO.previewElement);
            }
            else
            {
                try
                {
                    response = eval("("+response+")");
                    preview_template.find(".spz_progress").html("");
                }catch(err)
                {
                    preview_template.find("input:file").trigger("error_file", response);
                    return;
                }
            }
            preview_template.removeClass("dz-error").addClass("dz-success").data("response", response);
            config.onSuccessFile(response, preview_template);
        }

        function isBadBrowser(){ return $.browser.msie && $.browser.version < 10; }
        return this;
    };
});