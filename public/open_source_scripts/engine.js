var canvas = document.getElementById("renderCanvas");

var engine = new BABYLON.Engine(canvas, true);

function runScene(scene){
	engine.runRenderLoop(function(){scene.render()});
};

window.addEventListener("resize", function () {
	engine.resize();
});