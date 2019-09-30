
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
        var stat = FS.stat(filename);
        console.log(stat);
        if (stat.size == 0)
        {
            alert('Empty file: ' + filename + ' ' + stat.size +' bytes?');
        }
        
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
                     console.log(toString(e.originalEvent));
                     var files = e.originalEvent.dataTransfer.files;
                     console.log('dropped ' + files.length + ' files.');
                     var file = files.item(0);
                     
                     var onFileMounted = function (filename)
                     {
                     console.log('onFileMounted: ' + filename);
                     extract(filename)
                     };
                     
                     //clearUI();
                     // Async, when file mounted -> onFileMouted
                     mountFile(file, onFileMounted);
                     }
                     $(this).css("background", "#FFFFFF");
                     });
  });

