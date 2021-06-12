const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const socket = require("socket.io")
const fs = require("fs")
const vm = require("vm")
const BABYLON = require("babylonjs");
const LOADERS = require("babylonjs-loaders");
const os = require("os");

global.XMLHttpRequest = require('xhr2').XMLHttpRequest;

const app = express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))

const server = app.listen(PORT, function () {
	console.log(`Listening on port ${PORT}`);
});

function importFile(f_path, abs){
	if (abs==true){
		var data = fs.readFileSync(f_path);
	} else {
		var data = fs.readFileSync(path.join(__dirname, f_path));
	};
	var scriptRunner = new vm.Script(data);
	scriptRunner.runInThisContext();
};



io = socket(server);

serverLoc = os.hostname+":"+PORT;
console.log("HOST:  "+serverLoc);	

	
nullEngineData=fs.readFileSync(path.join(__dirname,"/public/open_source_scripts/nullengine.js"));
nullEngineExecutor = new vm.Script(nullEngineData)
	.runInThisContext();


//Textures / outside stuff





sceneOneData = fs.readFileSync(path.join(__dirname,"/public/open_source_scripts/sc1.js"));
sceneOneExecutor = new vm.Script(sceneOneData)
	.runInThisContext();
	
bjsData=fs.readFileSync(path.join(__dirname,"babylonJSCollision.js"));
bjsExecutor = new vm.Script(bjsData)
	.runInThisContext();