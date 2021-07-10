var cs = new CSInterface();

function doEvalScript(script)
{
	log("cs.evalScript(): " + script );
	cs.evalScript(script);
}

hostAI = {
	init: () => {
		cs.addEventListener("documentAfterActivate", ()=>{
			alert("event documentAfterActivate");
		});
	},
	hello : ()=>{
		doEvalScript("hostHello();");
	},
	highlight : (rect)=>{ 
		var rectStr = JSON.stringify(rect);
		var script = ("highlight(" + rectStr + ");");
		doEvalScript(script);
	},
	highlightPage : ()=> {
		var script = ("highlightPage();");
		doEvalScript(script);
	}
};
