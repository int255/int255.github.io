
var msg = {
    log : function(obj) {
        var logger = document.getElementById('log');
        if (typeof obj == 'object') {
            logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(obj, null, '    ') : obj) + '<br />';
        } else {
            logger.innerHTML += obj + '<br />';
        }
    },
    
    clear : function(obj)
    {
        var logger = document.getElementById('log');
        logger.innerHTML = '';
    }
};


function loadFace(fontfile, index)
{
    var hface = Module.tp_open_face(fontfile, index);
    var info = Module.tp_get_face_info(hface);
    msg.clear();
    msg.log(info);
    
    // dump some glyphs
    //var gid = Module.tp_get_gid(hface, "f".charCodeAt(0));
    var fontSize = 48.0;
    var leading = 1.2 * fontSize;
    //var svg_str = Module.tp_get_svg_glyph(hface, gid, fontSize);
    var svg_str = Module.tp_get_svg(hface, "fi fj ffi The quick brown fox jumps over the lazy dog.", fontSize);
    document.getElementById('svg_path').setAttribute('d', svg_str);
    var margin = 5;
    document.getElementById('svg_path').setAttribute('transform', 'translate(' + margin + ', ' + (leading+ margin) +')');
    var bbox = document.getElementById('svg_path').getBBox();
    console.log('bounds: ' + bbox);
    var svg_border = document.getElementById('svg_path_border');
    
    svg_border.setAttribute('x', bbox.x + 1);
    svg_border.setAttribute('y', bbox.y + 1);
    svg_border.setAttribute('width', bbox.width + 2*margin);
    svg_border.setAttribute('height', bbox.height+ 2*margin);
    svg_border.setAttribute('transform', 'translate(0, ' + leading +')');
    svg_root =  document.getElementById('svg_root');
    svg_root.setAttribute('width',  bbox.width + 4*margin + 6);
    svg_root.setAttribute('height',  bbox.height + 4*margin + 6);
    Module.tp_close_face(hface);
    
    loadGlyphs(fontfile, index);
}

function createFace(fontfile, index)
{
    var hface = Module.tp_open_face(fontfile, index);
    return
}

var Face = {
    _face : 0,
    _glyphs : [],
    _info : {},
    _fontFile : '',
    _index : 0,
    _glyphsLoaded : false,
    _glyphsLoadSize : 0.0,
    terminate : function()
    {
        Module.tp_close_face(this._face);
        this._info = {};
        this._glyphs = [];
        this._face = 0;
        this._fontFile = '';
        this._index = 0;
        this._glyphsLoaded = false;
        this._glyphsLoadSize = 0.0;
    },
    init : function (fontfile, index)
    {
        if (this._fontFile == fontfile  && this._index == index)
            return;
        
        if (this._face != 0)
        {
            this.terminate();
        }
        this._face = Module.tp_open_face(fontfile, index);
        this._info = Module.tp_get_face_info(this._face);
    },
    face : function()
    {
        return this._face;
    },
    info:function()
    {
        return this._info;
    },
    loadGlyphs : function(fontSize)
    {
        if (this._glyphsLoaded && this._glyphsLoadSize == fontSize)
            return;

        console.log('num of loaded glyphs ' + this._glyphs.length)
        for (var gid =0; gid<this._info.numGlyphs; ++gid)
        {
            this._glyphs.push(Module.tp_get_svg_glyph(Face.face(), gid, fontSize));
        }
        _glyphsLoaded = true;
        _glyphsLoadSize = fontSize;
    },
    glyphs : function()
    {
        return this._glyphs;
    },
    glyphInfo : function(gid)
    {
        return Module.tp_get_glyph_info(this._face, gid);
    },
};

function showGlyph(fontfile, index, gid)
{
    Face.init(fontfile, index);
    var ginfo = Face.glyphInfo(gid);
    //alert(JSON.stringify(ginfo, null, '    ') );
    var ginfo_str =JSON.stringify(ginfo, function(key, val) {
                                  if (key == 'unicode' && val == 0)
                                  {
                                    // if unicode is 0, means we don't know
                                  return 'none';
                                  }
                                  
                                    return val.toFixed ? Number(val.toFixed(3)) : val;
                                  }, '  ' /*indent*/) ;
    
    var div = $("#glyph_info");
    div.html('<pre>' + ginfo_str + '</pre>');
    div.dialog({
               modal: true,
               buttons: { Ok: function() { $( this ).dialog( "close" );}}
               });
    //.position({at: ['left', 'center'], my: 'center'}); // no use?
    Face.terminate();
}

function loadGlyphs(fontfile, index)
{
    //alert("Entry loadGlyphs()");
    Face.init(fontfile, index);
    var fontSize = 48.0;
    Face.loadGlyphs(fontSize);
    var svgs = Face.glyphs();
    
    var glyphs_div = $('#all_glyphs');
    glyphs_div.html('');
    var leading = 1.2 * fontSize;
    var outerSize = 2.0 * fontSize;
    var text_size = fontSize * 0.25;
    for (var i =0; i<svgs.length; ++i)
    {
        var glyphName = Module.tp_get_glyph_name(Face.face(), i);
        var tooltip = 'Glyph Index: ' + i + ' Glyph Name: ' + glyphName;
        var title_attr = 'title="' + tooltip+ '"';
        title_attr=''; // don't show tooltip
        var onclick_attr = 'onclick="showGlyph(\''+fontfile+'\', '+index+', ' + i+');"';
        var width_height_attr = 'width=' + outerSize +' height=' + outerSize;
        glyphs_div.append('<span ' + title_attr +'>\
                          <svg class="my_glyph" ' + onclick_attr + width_height_attr + ' >\
                            <path transform="translate(0, ' + leading +')" d="'+ svgs[i] + ' " fill="black" stroke="black" stroke-width="0"/>\
                          <line x1="0" y1="' + leading+ '" x2="100" y2="' + leading +'" stroke="#C0C0C0" stroke-dasharray="4" style="stroke-width:0.5;"/>\
                          <text font-size="'+text_size +'" x="' + (fontSize* 0.3) + '" y="'+ (leading + 1.5 *text_size )+'">index: ' + i + '</text>\
                          <text font-size="'+text_size +'" x="' + (fontSize* 0.3) + '" y="'+ (leading + 1.5 *text_size + 1.2 * text_size )+'">' + glyphName + '</text>\
                          </svg>\
                          </span>');
        
    }

    Face.terminate();
    //alert("Exit loadGlyphs()");
}

function loadFontFile(fontfile)
{
    msg.clear();
    msg.log('Font file: ' + fontfile + ' exists? ' + Module.tp_file_exists(fontfile));
    $("#dropped_filename").html(fontfile);
    var count = Module.tp_count_faces(fontfile);
    msg.log('Number of faces: ' + count);
    $('#font_collection').html('');
    for (var i=0; i<count; ++i)
    {
        var hface = Module.tp_open_face(fontfile, i);
        var info = Module.tp_get_face_info(hface);
        // Fill font_collection
        $('#font_collection').append('<div onclick=\'loadFace("'+fontfile+'", ' + i + ');\'>' + info['postscriptName'] + '</div>');
        Module.tp_close_face(hface);
    }
    
    if (count != 0)
    {
        loadFace(fontfile, 0);
    }
    
}


function mountFile(fileObject, onFileMounted)
{
    var reader = new FileReader();
    reader.onload = function ()
    {
        var filename = fileObject.name;
        var data = new Uint8Array(reader.result);
        try {
            FS.createDataFile('/', filename, data, true /*read*/, false/*write*/, false/*own*/);
        }catch (err)
        {
            console.log('Exception in FS.createDataFile(): ' + err.message);
        }
        console.log('file onload(): ' + filename);
        console.log(FS.stat(filename));
        msg.log(Module.tp_file_exists(filename));
        onFileMounted(filename);
    }
    reader.readAsArrayBuffer(fileObject);
}

    $(function(){
        $("#drop_zone").on('dragenter', function(e){
                         e.preventDefault();
                         $(this).css("background", "#AFAFFF");
                         });
        $("#drop_zone").on('dragleave', function(e){
                         e.preventDefault();
                         $(this).css("background", "#FFFFFF");
                         });
        $("#drop_zone").on('dragover', function(e){
                         e.preventDefault();
                         });
        $("#drop_zone").on('drop', function(e){
                           e.preventDefault();
                         
                           if (e.originalEvent.dataTransfer.files.length)
                           {
                           var files = e.originalEvent.dataTransfer.files;
                           var file = files.item(0);
                           
                           var onFileMounted = function (filename)
                           {
                            loadFontFile(filename);
                           };
                           mountFile(file, onFileMounted);
                           }
                           $(this).css("background", "#FFFFFF");
                           });
      });
var Module = {
    _runTimeInitBegin: null,
    preInit : function() {
        Module._runTimeInitBegin = performance.now();
        console.log('Module.preInit');
    },
    
    preRun : [function() {
              console.log('Module.preRun');
              }],
    
    postRun : [],
    
    print : function(text) {
        console.log(text);
    },
    
    printErr : function(text) {
        console.error(text);
    },
    
    onAbort : function(what) {
        alert('onAbort' + what);
    },
    
    // NEXU: fix initialize problem, when logReadFiles set to true
    // it will cause execution fail of the output: js function err() redefined and conflict with FS return code
    // Which seems to be an emscripten bug, change to false for now
    logReadFiles : false,
    
    onRuntimeInitialized : function() {
        console.log('Module.onRuntimeInitialized()');
        console.log('Built timestamp: ' + Module.tp_build_timestamp());
        loadFontFile('Futura.ttc');
    },
};
