// log div

function toString(obj)
{
    if (typeof obj == 'object') {
        return (JSON && JSON.stringify ? JSON.stringify(obj, null, '    ') : obj) ;
    } else {
        return obj;
    }
}
var msg = {
    log : function(obj) {
        var logger = document.getElementById('log');
        if (typeof obj == 'object') {
            logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(obj, null, '    ') : obj) + '<br />';
        } else {
            logger.innerHTML += obj + '<br />';
        }
        
        $('#log').hide().show(0);
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
    
    $('#font_info').html('');
    $('#font_info').html(JSON.stringify(info, null, '    '));

    var fontSize = 36.0;
    var leading = 1.2 * fontSize;
    var svg_str = Module.tp_get_svg(hface, "A case to end all cases. ", fontSize);
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
    svg_root.setAttribute('height',  bbox.height + 4*margin + 10);
    Module.tp_close_face(hface);
    
    loadLigatures(fontfile, index);
    loadGlyphs_v2(fontfile, index);

}

function createFace(fontfile, index)
{
    var hface = Module.tp_open_face(fontfile, index);
    return
}

function showProgress(percentage)
{
    $( "#progressbar" ).progressbar(
                                    { value: percentage }
                                    );
    
    if (percentage==100)
    {
        $( "#progressbar" ).fadeOut();
    } else {
        $( "#progressbar" ).fadeIn();
    }
    
}


var FaceLoader = {
    _face : 0,
    _glyphs : [],
    _info : {},
    _numGlyphs : 0,
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
        this._numGlyphs = Module.tp_get_glyph_count(this._face);
        this._glyphs = new Array(this._numGlyphs);
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
            if (this._glyphs[gid] == null )
            {
                this._glyphs[gid] = Module.tp_get_svg_glyph(FaceLoader.face(), gid, fontSize);
            }
        }
        this._glyphsLoaded = true;
        this._glyphsLoadSize = fontSize;
    },
    glyphs : function()
    {
        return this._glyphs;
    },
    glyphSVG : function(gid, fontSize)
    {
        if (this._glyphs[gid] == null )
        {
            this._glyphs[gid] = Module.tp_get_svg_glyph(FaceLoader.face(), gid, fontSize);
        }
        return this._glyphs[gid];
    },
    glyphInfo : function(gid)
    {
        return Module.tp_get_glyph_info(this._face, gid);
    },
    numGlyphs : function()
    {
        return this._numGlyphs;
    },
    ligatures : function()
    {
        var gidObjs = Module.tp_get_ligatures(FaceLoader.face());
        var gids = new Array(gidObjs.size());
        for (var i = 0; i<gidObjs.size(); ++i)
        {
            gids[i] = gidObjs.get(i);
        }
        return gids;
    }
};

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function toUnicodeString(ch)
{
    return ch == 0 ? 'none' : 'U+' + pad(ch.toString(16).toUpperCase(), 4);
}

function showGlyph(fontfile, index, gid)
{
    FaceLoader.init(fontfile, index);
    var ginfo = FaceLoader.glyphInfo(gid);
    var ginfo_str =JSON.stringify(ginfo, function(key, val) {
                                  if (key == 'unicode')
                                  {
                                  return toUnicodeString(val);
                                    // if unicode is 0, means we don't know
                                  
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
    FaceLoader.terminate();
}

var gIntervalID = 0;
function loadGlyphs_v2(fontfile, index)
{
    if (gIntervalID != 0)
    {
        //stop loading first
        clearInterval(gIntervalID);
        console.log('Force terminate previous loadGlyphs_2().');
        FaceLoader.terminate();
        gIntervalID=0;
    }
    
    FaceLoader.init(fontfile, index);
    var fontSize = 48.0;
    var glyphs_div = $('#all_glyphs');
    glyphs_div.html('');
    
    var leading = 1.2 * fontSize;
    var outerSize = 2.4 * fontSize;
    var text_size = fontSize * 0.25;
    var text_left_indent = (fontSize* 0.3);
    var text_upper_margin = leading + 2 *text_size;
    
    var iii = 0;
    gIntervalID = setInterval(function(){
                              if (iii<FaceLoader.numGlyphs())
                              {
                              
                              var leading = 1.2 * fontSize;
                              var outerSize = 2.4 * fontSize;
                              var text_size = fontSize * 0.25;
                              var text_left_indent = (fontSize* 0.3);
                              var text_upper_margin = leading + 2 *text_size;
                              var glyphs_div_str = ''
                              
                              var steps = 50;
                              for (var j = 0; j<steps && iii <FaceLoader.numGlyphs(); ++j, ++iii)
                              {
                              var percentage = Math.floor(100* (1+iii) / FaceLoader.numGlyphs());
                              showProgress(percentage);
                              var svg = FaceLoader.glyphSVG(iii, fontSize);
                              //alert('GID'+iii +' ' + svg);
                              var glyphName = Module.tp_get_glyph_name(FaceLoader.face(), iii);
                              var unicode = Module.tp_get_unicode(FaceLoader.face(), iii);
                              var tooltip = 'Glyph Index: ' + iii + ' Glyph Name: ' + glyphName;
                              var title_attr = 'title="' + tooltip+ '"';
                              title_attr=''; // don't show tooltip
                              var onclick_attr = 'onclick="showGlyph(\''+fontfile+'\', '+index+', ' + iii+');"';
                              var width_height_attr = 'width=' + outerSize +' height=' + outerSize;
                              var simple = false;
                              if (simple)
                              {
                              glyphs_div_str +=
                              '<span ' + title_attr +'>\
                              <svg class="my_glyph" ' + onclick_attr + width_height_attr + ' >\
                              <path transform="translate(0, ' + leading +')" d="'+ svg + ' " fill="black" stroke="black" stroke-width="0"/>\
                              </svg>\
                              </span>';
                              } else {
                              glyphs_div_str +=
                              '<span ' + title_attr +'>\
                              <svg class="my_glyph" ' + onclick_attr + width_height_attr + ' >\
                              <path transform="translate(0, ' + leading +')" d="'+ svg + ' " fill="black" stroke="black" stroke-width="0"/>\
                              <line x1="0" y1="' + leading+ '" x2="' + outerSize +'" y2="' + leading +'" stroke="#C0C0C0" stroke-dasharray="4" style="stroke-width:0.5;"/>\
                              <text font-size="'+text_size +'" x="' + text_left_indent + '" y="'+ (text_upper_margin + 0 *(1.2 * text_size) )+'">index: ' + iii + '</text>\
                              <text font-size="'+text_size +'" x="' + text_left_indent + '" y="'+ (text_upper_margin + 1 *(1.2 * text_size) )+'">' + glyphName + '</text>\
                              <text font-size="'+text_size +'" x="' + text_left_indent + '" y="'+ (text_upper_margin + 2 *(1.2 * text_size) )+'">' + toUnicodeString(unicode) + '</text>\
                              </svg>\
                              </span>';
                              }
                              }
                              
                              glyphs_div.append(glyphs_div_str);
                              } else {
                              clearInterval(gIntervalID);
                              console.log('loadGlyphs_2(): Done');
                              FaceLoader.terminate();
                              gIntervalID=0;
                              }
                              
                              }, 0);
    
}


function loadLigatures(fontfile, index)
{
    
    FaceLoader.init(fontfile, index);
    var gids = FaceLoader.ligatures();

    $('#ligatures').html(toString(gids));
    FaceLoader.terminate();
     
}



function loadFontFile(fontfile, callback)
{
    
    msg.clear();
    msg.log('Font file: ' + fontfile + ' exists? ' + Module.tp_file_exists(fontfile));
    $("#dropped_filename").html(fontfile);
    var count = Module.tp_count_faces(fontfile);
    msg.log('Number of faces: ' + count);
    $('#font_collection').html('');
    for (var i=0; i<count; ++i)
    {
        try {
        var hface = Module.tp_open_face(fontfile, i);
        var info = Module.tp_get_face_info(hface);
        // Fill font_collection
        var on_click_attr_str = 'onclick=\'loadFace("'+fontfile+'", ' + i + ');\'';
        //var on_click_attr_str = '';
        $('#font_collection').append('<span style="margin:5px;"id="font_face" ' + on_click_attr_str + '>' + info['postscriptName'] + '</span>');

        Module.tp_close_face(hface);
        } catch (err){
            alert('Exception caught');
        }
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

function clearUI()
{
    $('#all_glyphs').html('');
    msg.clear();
}
// Drop zone
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
                       
                       var callback = function(percentage)
                       {
                        console.log('callback()' + percentage);
                       };
                       var onFileMounted = function (filename, callback)
                       {
                        loadFontFile(filename, callback);
                       };
                       
                       clearUI();
                       // Async, when file mounted -> onFileMouted
                       mountFile(file, onFileMounted);
                       }
                       $(this).css("background", "#FFFFFF");
                       });
  });

// Module initialization
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
        // Default font
        loadFontFile('ACaslonPro-Regular.otf');
    },
};
