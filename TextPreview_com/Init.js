

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
        init();
    },
};
