
		var socket = io.connect(location.protocol+"//"+location.hostname+":"+location.port);
		socket.on("connect", function(data){
		});
		var updateLoop={};
sceneOne = scene_one(true)

runScene(sceneOne);

document.getElementById("renderCanvas").addEventListener("keydown", function(k){
	socket.emit("key", [k.key, true]);
});
document.getElementById("renderCanvas").addEventListener("keyup", function(k){
	socket.emit("key", [k.key, false]);
});

socket.on("motion", function(k){
	player.position=new BABYLON.Vector3(k[0], k[1],
	k[2]);
});

var camZoom=0.1;
document.getElementById("renderCanvas").addEventListener("keydown", function(k){
	if (k.key=="c"){
		camera.fov=camZoom;
	};
});
document.getElementById("renderCanvas").addEventListener("keyup", function(k){
	if (k.key=="c"){
		camera.fov=1;
	};
});

socket.on("healthUpdate", function(k){
	var p = document.getElementById("healthBar");
	var percent = k[0]/k[1];
	p.style.width=200*percent;
	if (percent>0.5){
		p.style.backgroundColor="green";
	} else if (percent > 0.25){
		p.style.backgroundColor="yellow";
	} else {
		p.style.backgroundColor="red";
	};
});

player.isPickable=false;
function namePlayer(ply, name, height){
	var plane = BABYLON.Mesh.CreatePlane("plane", 2);
	plane.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL;
	var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);
	var label = new BABYLON.GUI.TextBlock();
	label.text=String(name);
	label.width=1;
	label.height=0.4;
	label.color="white";
	label.background="green";
	label.fontSize="100px";
	advancedTexture.addControl(label);
	ply.position=new BABYLON.Vector3(0,0,0);
	plane.parent=ply;
	plane.position.y = ply.position.y+height;
	return plane;
};

function dispPlayerHealth(ply, maxHealth, height){

	var plane = BABYLON.Mesh.CreatePlane("plane", 0.125, sceneOne, true);
	plane.scaling.x=8;
	plane.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL;
	ply.position=new BABYLON.Vector3(0,0,0);
	plane.parent=ply;
	plane.position.y = ply.position.y+height;
	return plane;
	
};
var mat_green = new BABYLON.StandardMaterial("greenMaterial", sceneOne);
mat_green.diffuseColor=new BABYLON.Color3(0,1,0);
mat_green.specularColor=new BABYLON.Color3(0,1,0);

var mat_yellow = new BABYLON.StandardMaterial("yellowMaterial", sceneOne);
mat_yellow.diffuseColor=new BABYLON.Color3(1,1,0);
mat_yellow.specularColor=new BABYLON.Color3(1,1,0);

var mat_red = new BABYLON.StandardMaterial("redMaterial", sceneOne);
mat_red.diffuseColor=new BABYLON.Color3(1,0,0);
mat_red.specularColor=new BABYLON.Color3(1,0,0);

var mat_blue = new BABYLON.StandardMaterial("blueMaterial", sceneOne);
mat_blue.diffuseColor=new BABYLON.Color3(0,0,1);
mat_blue.specularColor=new BABYLON.Color3(0,0,1);
function setHealth(plane, maxHealth, currHealth){

	var healthOne=currHealth/maxHealth;
	plane.scaling.x=healthOne*8;
	if (healthOne>0.5){
		plane.material=mat_green;
	} else if (healthOne>0.25){
		plane.material=mat_yellow;
	} else {
		plane.material=mat_red;
	};
	
};

otherPlayers={};
socket.on("ply", function(k){
	var vars = k[5];
	if (k[1]=="terminate"){
		if (k[0] in otherPlayers){
			try{
			var curMesh = otherPlayers[k[0]];
			curMesh.dispose();
			curMesh.customLabel.dispose();
			curMesh.healthLabel.dispose();
			} catch(err){};
			delete curMesh;
		};
	} else{
		if (k[0] in otherPlayers){
			var curMesh = otherPlayers[k[0]];
			curMesh.position=new BABYLON.Vector3(k[1],k[2],k[3]);
			console.log(vars["name"]+"/"+curMesh.name+":["+k[1]+","+k[2]+","+k[3]+"]");
			curMesh.rotation.y=k[4];
			try{
			setHealth(curMesh.healthLabel, 100, vars.health);
			} catch (err){
			};
		} else {
			otherPlayers[k[0]] = new BABYLON.MeshBuilder.CreateBox(String(k[0]), {width:1, depth:1, height:2}, sceneOne);
			console.log("NEW");
			var curMesh = otherPlayers[k[0]];
			curMesh.isPickable=false;
			curMesh.healthLabel = dispPlayerHealth(otherPlayers[k[0]], 100, 1.25);
			if (vars.team=="red"){
			curMesh.material=mat_red;
			} else {
			curMesh.material=mat_blue;
			};
		};
		
	};
	if (typeof(vars)!=="undefined"){
	if (typeof(vars["name"])!=="undefined"){
		if (typeof(otherPlayers[k[0]].customLabel)=="undefined"){
			otherPlayers[k[0]].customLabel = namePlayer(otherPlayers[k[0]], vars["name"], 1.5);
			otherPlayers[k[0]].name=vars["name"];
		};
	};
	};
});





// menu

function showMenu(){
	document.getElementById("mainMenu").style.display="flex";
};
function hideMenu(){
	document.getElementById("mainMenu").style.display="none";
};


$("#nameInput").on('keydown', function (e) {
	if (e.key === 'Enter' || e.keyCode === 13) {
		var elem = document.getElementById("nameInput");
		socket.emit("ready", [elem.value]);
	};
});
showMenu();
socket.on("dead", function(){
	showMenu();
});

socket.on("alive", function(){
	hideMenu();
});



//weaponSelection
var lazTypes={"w1":"reg", "w2":"mag1", "w3":"shog1", "w4":"snip1"};
var w1 = document.getElementById("weapon1");
var w2 = document.getElementById("weapon2");
var w3 = document.getElementById("weapon3");
var w4=document.getElementById("weapon4");
var htmlLaztypes=[w1,w2,w3,w4];
var currWeapon="w1";
document.getElementById("weapon2").style.backgroundColor="rgba(0.3,0.3,0.3,0.3)";
document.getElementById("weapon3").style.backgroundColor="rgba(0.3,0.3,0.3,0.3)";
document.getElementById("weapon1").style.backgroundColor="rgba(0.7,0.7,0.7,0.7)";
function deSelWeapon(k){k.style.backgroundColor="rgba(0.3,0.3,0.3,0.3)"};
function selWeapon(k){k.style.backgroundColor="rgba(0.7,0.7,0.7,0.7)";
for (i=0;i<htmlLaztypes.length;i++){
	if (htmlLaztypes[i]!=k){
	deSelWeapon(htmlLaztypes[i]);
	};
};
};
canvas.addEventListener("keydown", function(k){
	if (k.key=="1"){
		currWeapon="w1";
		selWeapon(w1);
	} else if (k.key=="2") {
		currWeapon="w2";
		selWeapon(w2);
	} else if (k.key=="3") {
		currWeapon="w3";
		selWeapon(w3);
	} else if (k.key=="4"){
		currWeapon="w4";
		selWeapon(w4);
	};
});




// chat

function sendMessage(msg){
	socket.emit("newMessage", String(msg));
};

$("#chat").on('keydown', function (e) {
	if (e.key === 'Enter' || e.keyCode === 13) {
		var elem = document.getElementById("chat");
		sendMessage(elem.value);
		elem.value="";
	}
});

socket.on("message", function(data){
	var chatCont=document.getElementById("chatCont");
	var scrollBot=false;
	if (chatCont.scrollHeight-120<=chatCont.scrollTop){
		scrollBot=true;
	};
	var para = document.createElement("p");
	var boldP=document.createElement("b");
	var tNode=document.createTextNode(String(data[1]));
	var tNodeName=document.createTextNode(String(data[0])+": ");
	boldP.appendChild(tNodeName);
	para.appendChild(boldP);
	para.appendChild(tNode);
	para.style.overflowWrap="break-word";
	para.style.width="175px";
	para.style.color="white";
	para.style.margin="0 5 0px"
	para.style.fontSize="10px";
	chatCont.appendChild(para);
	if (scrollBot){
		chatCont.scrollTop=chatCont.scrollHeight-90;
	};
});

function hideChat(){
	document.getElementById("chatDiv").style.display="none";
	document.getElementById("openChat").style.display="flex";
};

function showChat(){
	document.getElementById("chatDiv").style.display="flex";
	document.getElementById("openChat").style.display="none";
};

//shooting lazers

function lazerBlast(){
	var direction = [parseFloat(Math.sin(camera.rotation.y)*Math.cos(-1*camera.rotation.x)),
	parseFloat(Math.sin(-1*camera.rotation.x)),
	parseFloat(Math.cos(camera.rotation.y)*Math.cos(-1*camera.rotation.x)), String(lazTypes[currWeapon])];
	socket.emit("lazerBlast", direction);
};

canvas.addEventListener("mousedown", function(){
	updateLoop["lazer"]=true;
});

canvas.addEventListener("mouseup", function(){
	updateLoop["lazer"]=false;
});



//reusing particle systems
var partSystems=[];
function getPartSystem(){
	if (partSystems.length>0){return partSystems.pop()} else{console.log("nPart");
		var particleSystem=new BABYLON.ParticleSystem("particles", 10);
		particleSystem.particleTexture = new BABYLON.Texture("images/flare2.png");
		partSystems.push(particleSystem);
		return particleSystem;
	};
};


//seeing projectiles
socket.on("projectile", function(data){
	var pos = data[0];
	var partType=data[2]
	var direc = new BABYLON.Vector3(data[1][0], data[1][1], data[1][2]);
	if (partType=="reg"){
	var particleSystem=getPartSystem();
	particleSystem.emitter = new BABYLON.Vector3(pos[0],pos[1],pos[2]);
	particleSystem.blendMode=0;
	particleSystem.minEmitPower=20;
	particleSystem.maxEmitPower=40;
	particleSystem.emitRate=300;
	particleSystem.minSize=0.5;
	particleSystem.maxSize=0.5;
	particleSystem.createDirectedSphereEmitter(0.05, direc,direc);
	particleSystem.minLifeTime=0.5;
	particleSystem.maxLifeTime=0.5;
	particleSystem.color1=new BABYLON.Color3(1,1,0);
	particleSystem.color2=new BABYLON.Color3(1,1,0);
	particleSystem.start();
	setTimeout(function(k){k.stop();k.reset();partSystems.push(k)},100, particleSystem);
	} else if (partType=="snip1"){
	var particleSystem=getPartSystem();
	particleSystem.blendMode=0;
	particleSystem.emitter = new BABYLON.Vector3(pos[0],pos[1],pos[2]);
	particleSystem.minEmitPower=20;
	particleSystem.maxEmitPower=40;
	particleSystem.emitRate=300;
	particleSystem.minSize=1.2;
	particleSystem.maxSize=1.2;
	particleSystem.minLifeTime=0.4;
	particleSystem.maxLifeTime=0.4;
	particleSystem.createDirectedSphereEmitter(0.05, direc,direc);
	particleSystem.color1=new BABYLON.Color4(1,0.5,0,1);
	particleSystem.color2=new BABYLON.Color4(1,0.5,0,1);
	particleSystem.start();
	setTimeout(function(k){k.stop();k.reset();partSystems.push(k)},100, particleSystem);
	} else if (partType=="mag1"){
	var particleSystem=getPartSystem();
	particleSystem.blendMode=0;
	particleSystem.emitter = new BABYLON.Vector3(pos[0],pos[1],pos[2]);
	particleSystem.minEmitPower=30;
	particleSystem.maxEmitPower=30;
	particleSystem.emitRate=100;
	particleSystem.minSize=0.5;
	particleSystem.maxSize=0.5;
	particleSystem.createDirectedSphereEmitter(0.05, direc,direc);
	particleSystem.minLifeTime=0.05;
	particleSystem.maxLifeTime=0.05;
	particleSystem.color1=new BABYLON.Color3(0.5,1,0.5);
	particleSystem.color2=new BABYLON.Color3(0.5,1,0.5);
	particleSystem.start();
	setTimeout(function(k){k.stop();k.reset();partSystems.push(k)},75, particleSystem);
	} else if (partType=="shog1"){
		var particleSystem=getPartSystem();
		particleSystem.blendMode=0;
		particleSystem.emitter = new BABYLON.Vector3(pos[0],pos[1],pos[2]);
		particleSystem.minEmitPower=10;
		particleSystem.maxEmitPower=20;
		particleSystem.emitRate=200;
		particleSystem.minSize=0.125;
		particleSystem.maxSize=0.125;
		particleSystem.createDirectedSphereEmitter(0.05, direc,direc);
		particleSystem.minLifeTime=0.1;
		particleSystem.maxLifeTime=0.1;
		particleSystem.color1=new BABYLON.Color3(1,0,1);
		particleSystem.color2=new BABYLON.Color3(1,0,1);
		particleSystem.start();
		setTimeout(function(k){k.stop();k.reset();partSystems.push(k)},50, particleSystem);
	};
	try{
	
	} catch(err){};
});

//audio on new lazer blast
socket.on("newLazer", function(data){
	var pos = player.position;
	var bullPos=new BABYLON.Vector3(data[0][0],data[0][1],data[0][2]);
	var bullType=data[1];
	var distance = BABYLON.Vector3.Distance(pos,bullPos)/5+1;
	if (bullType=="reg"){
	var lazerBlastAudio = new Audio("audio/lazerBlast.mp3");
	lazerBlastAudio.volume=(1/distance);
	lazerBlastAudio.play();
	setTimeout(function(x){x.remove()}, 3000, lazerBlastAudio);
	} else if (bullType=="mag1"){
	var lazerBlastAudio = new Audio("audio/mag1Blast.mp3");
	lazerBlastAudio.volume=(1/(distance));
	lazerBlastAudio.play();
	setTimeout(function(x){x.remove()}, 50, lazerBlastAudio);
	} else if (bullType="shog1"){
	var lazerBlastAudio = new Audio("audio/shog1Blast.mp3");
	lazerBlastAudio.volume=(1/(distance));
	lazerBlastAudio.play();
	setTimeout(function(x){x.remove()}, 3000, lazerBlastAudio);
	};
});

var options = new BABYLON.SceneOptimizerOptions(45, 50);
//options.addOptimization(new BABYLON.HardwareScalingOptimization(2, 3));
options.addOptimization(new BABYLON.TextureOptimization(0, 512));
options.addOptimization(new BABYLON.PostProcessesOptimization(1));
options.addOptimization(new BABYLON.ShadowsOptimization(1));
// Optimizer
var lightOptimizer = new BABYLON.SceneOptimizer(sceneOne, options);

setInterval(function (k){k.stop(); k.start()}, 10000, lightOptimizer);
lightOptimizer.start();

var options2 = new BABYLON.SceneOptimizerOptions(45, 50);
options2.addOptimization(new BABYLON.HardwareScalingOptimization(1, 3));
options2.addOptimization(new BABYLON.RenderTargetsOptimization(1));
options2.addOptimization(new BABYLON.LensFlaresOptimization(1));
options2.addOptimization(new BABYLON.MergeMeshesOptimization(1));
options2.addOptimization(new BABYLON.TextureOptimization(1, 64));

//Hard optimizer
var hardOptimizer = new BABYLON.SceneOptimizer(sceneOne, options2);

canvas.addEventListener("keydown", function(k){
	if (k.key=="\\"){
		hardOptimizer.start();
	};
});

//game client to server update loop
updateLoop["lazer"]=false;
function updateLoopFunc(){
	//rotation
	socket.emit("rotation", [camera.rotation.x,camera.rotation.y, camera.rotation.z]);
	//lazers
	if (updateLoop["lazer"]){
		lazerBlast();
	};
	
	//Do it again!
	setTimeout(updateLoopFunc, 50);
};
updateLoopFunc();