
function extract(filePath)
{
    if (!Module.is_supported_format(filePath))
    {
        alert('Only TIFF and JPEG are supported. \nUnsupported file format: ' + filePath);
        return;
    }
    
    var iccData = Module.extract_icc(filePath);
    console.log('iccData len: ' + iccData.length);
    if ( 0 == iccData.length)
    {
        alert('No embedded icc profile.');
        return;
    }
    
    var blob = new Blob([iccData], {type: "octet/stream"});
    var filename = "embedded.icc";
    saveAs(blob, filename);
}
