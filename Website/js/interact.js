var ctx = {};

hostPrototype = {
	init: ()=>{},
	hello : ()=>{ alert("TODO: Say Hello!");},
	highlight : (rect)=>{ 
		alert("TODO: Unhandled highlight rect:" + JSON.stringify(rect));
	},
	highlightPage : ()=> { 
		alert("TODO: Unhandled highlightPage()");
	}
};

function log(text)
{
	console.log(text);
}

function initEventHandlers()
{
	$("#hello").on("click", ()=>{
		ctx.host.hello();
	});
	$("#highlight_mediabox").on("click", ()=>{
		log("highlight_mediabox clicked");
		ctx.host.highlightPage();
	});
	$("#highlight_area1").on("click", ()=>{
		log("highlight_area1 clicked");
		ctx.host.highlight({x:0, y:0, width: 100, height:100});
	});
	$("#highlight_custom").on("click", ()=>{
		var x = $("#custom_x").val();
		var y = $("#custom_y").val();
		var w = $("#custom_width").val();
		var h = $("#custom_height").val();
		var rect = { x: x, y:y, width: w, height: h};
		ctx.host.highlight(rect);
		log("highlight_custom clicked: " + JSON.stringify(rect));
	});
}

function checkHostApp()
{
	if ( typeof window.cep != "undefined" )
	{
		ctx.hostApp = "Adobe";
	} else if ( false ) {
		// TODO: detect ArtProPlus
		ctx.hostApp = "ArtProPlus";
	} else {
		ctx.hostApp = window.navigator.userAgent;
	}
	ctx.host = hostPrototype;	
	log("checkHostApp(): hostApp=" + ctx.hostApp);

	// init host app implementations
	if (ctx.hostApp == "Adobe")
	{
		ctx.host = hostAI;
		ctx.host.init();
	}
		
}

function init()
{
	checkHostApp();
	initEventHandlers();
}

$(()=>{
	log("Loaded");
	init();
});

