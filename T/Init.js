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
    var baseline = 1.2 * fontSize;
    var svg_str = Module.tp_get_svg(hface, "A case to end all cases. ", fontSize);
    document.getElementById('svg_path').setAttribute('d', svg_str);
    var margin = 5;
    document.getElementById('svg_path').setAttribute('transform', 'translate(' + margin + ', ' + (baseline+ margin) +')');
    var bbox = document.getElementById('svg_path').getBBox();
    console.log('bounds: ' + bbox);
    var svg_border = document.getElementById('svg_path_border');
    
    svg_border.setAttribute('x', bbox.x + 1);
    svg_border.setAttribute('y', bbox.y + 1);
    svg_border.setAttribute('width', bbox.width + 2*margin);
    svg_border.setAttribute('height', bbox.height+ 2*margin);
    svg_border.setAttribute('transform', 'translate(0, ' + baseline +')');
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
    _fontFile : '',
    _fontFileIndex : 0,
    _numGlyphs : 0,
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
        if (this._fontFile == fontfile  && this._fontFileIndex == index)
            return;
        
        if (this._face != 0)
        {
            this.terminate();
        }
        this._face = Module.tp_open_face(fontfile, index);
        this._fontFile = fontfile;
        this._fontFileIndex = index;
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
    fontfile:function()
    {
        return this._fontFile;
    },
    index: function()
    {
        return this._fontFileIndex;
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
    },
    decompose : function(gid)
    {
        var decomps = Module.tp_get_glyph_decompositions(FaceLoader.face(), gid);
        return decomps;
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

function createGlyphDrawer(faceLoader, fontSize)
{
    var o = new Object();
    o.loader = faceLoader;
    o.fontfile = o.loader.fontfile();
    o.index = o.loader.index();
    o.fontSize = fontSize;
    o.baseline = 1.4 * fontSize;
    o.frameSize = 2.4 * fontSize;
    o.bottom = o.frameSize
    o.text_size = 0.2 * fontSize;
    o.metrics_text_size = 0.75 * o.text_size;
    o.text_bottom_baseline = o.bottom - 0.5 * o.text_size
    o.text_left_indent = 0.3 * fontSize;
    o.text_upper_margin = o.baseline + 2 * o.text_size;
    o.left_indent = (0.7 ) * fontSize;
    o.drawGlyphSpan = function (gid) {
        var span = '';
        var svg = FaceLoader.glyphSVG(gid, fontSize);
        //alert('GID'+gid +' ' + svg);
        var glyphName = Module.tp_get_glyph_name(FaceLoader.face(), gid);
        var unicode = Module.tp_get_unicode(FaceLoader.face(), gid);
        var glyph_info = FaceLoader.glyphInfo(gid);
        var tooltip = 'Glyph Index: ' + gid + ' Glyph Name: ' + glyphName;
        var title_attr = 'title="' + tooltip+ '"';
        title_attr=''; // don't show tooltip
        var onclick_attr = 'onclick="showGlyph(\''+ this.fontfile +'\', '+ this.index +', ' + gid+');"';
        var width_height_attr = 'width=' + this.frameSize +' height=' + this.frameSize;
        var simple = false;
        
        span +=
        '<span ' + title_attr +'>\
        <svg class="my_glyph" ' + onclick_attr + width_height_attr + ' >\
        <path transform="translate('+ this.left_indent + ', ' + this.baseline +')" d="'+ svg + ' " fill="black" stroke="black" stroke-width="0"/>';
        if (!simple)
        {
            var bearingY = this.fontSize* glyph_info.metrics.bearingY;
            var stroke_attr ='';
            if (bearingY ==0)
            {
                bearingY = this.fontSize;
                stroke_attr='stroke-dasharray="4"';
            }
            span+='<line x1="0" y1="' + this.baseline+ '" x2="' + this.frameSize +'" y2="' + this.baseline +'" stroke="#C0C0C0" stroke-dasharray="4" style="stroke-width:0.5;"/>\
            <line x1="'+this.left_indent +'" y1="'+this.baseline+'" x2="'+this.left_indent +'" y2 ="'+(this.baseline- bearingY)+'" stroke="#E0E0E0" style="stroke-width:1.5;" '+stroke_attr + '/>\
            <line x1="'+ (this.left_indent + this.fontSize * glyph_info.metrics.advanceX)+'" y1="'+this.baseline+'" x2="'+(this.left_indent + this.fontSize * glyph_info.metrics.advanceX) +'" y2 ="'+(this.baseline-bearingY)+'" stroke="#E0E0E0" style="stroke-width:1.5;" ' +stroke_attr+'/>\
            <text font-size="'+ this.metrics_text_size +'" x="' + (this.left_indent + this.fontSize * glyph_info.metrics.advanceX) + '" y="'+ (this.baseline)+'">' + glyph_info.metrics.advanceX + '</text>\
            <text font-size="'+ this.text_size +'" x="' + this.text_left_indent + '" y="'+ (this.text_bottom_baseline - 2 *(1.2 * this.text_size) )+'">index: ' + gid + '</text>\
            <text font-size="'+ this.text_size +'" x="' + this.text_left_indent + '" y="'+ (this.text_bottom_baseline - 1 *(1.2 * this.text_size) )+'">' + glyphName + '</text>\
            <text font-size="'+ this.text_size +'" x="' + this.text_left_indent + '" y="'+ (this.text_bottom_baseline - 0 *(1.2 * this.text_size) )+'">' + toUnicodeString(unicode) + '</text>';
        }
        span+='</svg></span>';
        
        return span;
    }
    return o;
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
    var fontSize = 60.0;
    var glyphs_div = $('#all_glyphs');
    glyphs_div.html('');
    
    var drawer = createGlyphDrawer(FaceLoader, fontSize);
    var iii = 0;
    gIntervalID = setInterval(function(){
                              if (iii<FaceLoader.numGlyphs())
                              {
        
                                var glyphs_div_str = ''
                              
                                var steps = 50;
                                for (var j = 0; j<steps && iii <FaceLoader.numGlyphs(); ++j, ++iii)
                                {
                                    var percentage = Math.floor(100* (1+iii) / FaceLoader.numGlyphs());
                                    showProgress(percentage);
                                    var span = drawer.drawGlyphSpan(iii);
                                    glyphs_div_str+=span;
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


function toReadableFeatures(features)
{
    var innerText='';
    for ( var k=0; k<features.size(); ++k)
    {
        var feature = features.get(k);
        // little endian
        var byte0 = feature >>24;
        var byte1 = feature << 8 >> 24;
        var byte2 = feature << 16 >> 24;
        var byte3 = feature << 24 >> 24;
        var featureString = String.fromCharCode(byte0) + String.fromCharCode(byte1) + String.fromCharCode(byte2) + String.fromCharCode(byte3) + ' ';
        innerText += featureString;
    }
    return innerText;
}

function toReadableCodePoints(codePoints)
{
    var innerText='';
    for ( var k=0; k<codePoints.size(); ++k)
    {
        var codePoint = codePoints.get(k);
        if (codePoint<127)
        {
            innerText += '&#'+ toString(codePoint) + '; ';
        } else {
            innerText += 'U+'+ codePoint.toString(16) + ' ';
        }
    }
    return innerText;
}

function loadLigatures(fontfile, index)
{
    
    FaceLoader.init(fontfile, index);
    var gids = FaceLoader.ligatures();

    var drawer = createGlyphDrawer(FaceLoader, 36);
    var lig_div = '';
    for (var i =0; i< gids.length; ++i)
    {
        //alert('[' +i +']' + gids[i]);
        var glyph_span = drawer.drawGlyphSpan(gids[i]);
        var decomps = FaceLoader.decompose(gids[i]);
        var decomps_span = '<span style="display:inline-block;">';
        for (var j =0; j< decomps.size(); ++j)
        {
            var decomp = decomps.get(j);
            decomps_span += ' <-('+ decomp.steps +')- ' + toReadableCodePoints(decomp.codePoints) + '&emsp;&emsp;' + toReadableFeatures(decomp.features) + '<br>';
        }
        decomps_span+='</span>';
        var elem = '<p>' + glyph_span + decomps_span + '</p>';
        lig_div+=elem;
        
        console.log(toString(decomps));
    }
    $('#ligatures').html(lig_div);
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
