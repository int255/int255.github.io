
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

function loadFontFile(fontfile)
{
    msg.clear();
    msg.log('Font file: ' + fontfile + ' exists? ' + Module.tp_file_exists(fontfile));
    var count = Module.tp_count_faces(fontfile);
    msg.log('Number of faces: ' + count);
    for (var i=0; i<count; ++i)
    {
        var hface = Module.tp_open_face(fontfile, i);
        var info = Module.tp_get_face_info(hface);
        msg.log(info);
        Module.tp_close_face(hface);
    }
}


function mountFile(fileObject, onFileMounted)
{
    var reader = new FileReader();
    reader.onload = function ()
    {
        var filename = fileObject.name;
        var data = new Uint8Array(reader.result);
        FS.createDataFile('/', filename, data, true /*read*/, false/*write*/, false/*own*/);
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
        //alert('preInit');
    },
    
    preRun : [function() {
              //alert('preRun');
              }],
    
    postRun : [],
    
    print : function(text) {
        console.log(text);
    },
    
    printErr : function(text) {
        console.error(text);
    },
    
    onAbort : function(what) {
        alert(what);
    },
    
    // NEXU: fix initialize problem, when logReadFiles set to true
    // it will cause execution fail of the output: js function err() redefined and conflict with FS return code
    // Which seems to be an emscripten bug, change to false for now
    logReadFiles : false,
    
    onRuntimeInitialized : function() {
        //alert('onRuntimeInitialized');
        loadFontFile('Futura.ttc');
    },
};
