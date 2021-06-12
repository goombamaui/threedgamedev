//Pointer Lock
var movementX=0;
var movementY=0;
canvas.requestPointerLock = canvas.requestPointerLock ||
canvas.mozRequestPointerLock ||
canvas.webkitRequestPointerLock;
function moveCallback(e) {
	movementX = e.movementX ||
	e.mozMovementX          ||
	e.webkitMovementX       ||
	0;
	movementY = e.movementY ||
	e.mozMovementY      ||
	e.webkitMovementY   ||
	0;
};

//Player Vars
playerSpeed=20;

//Player Jump & gravity
jumpList=[];
jumpStep=-1;
for (i=0;i<30;i++){
	jumpList.push((30-i)/100);
};
for (i=0;i<10;i++){
	jumpList.push(0);
};
gravityAcceleration=0.015;
gravity=0.1;

//Player Code
function defineCamera(scene, canvas){
	var camera = new BABYLON.FreeCamera("camera", 
	new BABYLON.Vector3(0,10,10), scene);

	camera.setTarget(new BABYLON.Vector3.Zero());
	
	camera.attachControl(canvas, false);

	camera.inputs.clear();
	
	camera.minZ=0.1;
	camera.maxZ=10000;
	
	player = BABYLON.MeshBuilder.CreateBox("player", {width:1, depth:1, height:2}, scene);
	var redMaterial = new BABYLON.StandardMaterial("redMaterial", scene);
	redMaterial.diffuseColor=new BABYLON.Color3(1, 0, 0);
	redMaterial.specularColor=new BABYLON.Color3(0.5, 0.1, 0.5);
	player.material=redMaterial;
	player.position.x=camera.position.x;
	player.position.y=camera.position.y-3;
	player.position.z=camera.position.z;
	player.checkCollisions=true;
	player.isVisible=false;

	canvas.addEventListener("click", function(){
		canvas.requestPointerLock()
	});

	return([camera, player]);
};

prevPositionPlayer=[0,0,0];

function cameraLoop(scene,canvas){
	
	var cameraRotation = [camera.rotation.x, 
	camera.rotation.y, camera.rotation.z];
	
	var playerPosition = [player.position.x,
	player.position.y, player.position.z];
	
	var moveFactor=[0,gravity*-1,0]
	
	if (document.pointerLockElement === canvas ||
		document.mozPointerLockElement === canvas ||
		document.webkitPointerLockElement === canvas) {
		document.onmousemove=moveCallback;
	} else {
		document.onmousemove=function(){};
	};
	
	// Rotation for Camera
	
	if (movementX){
		cameraRotation[1]+=Math.atan(movementX/2000);
	};
	if (movementY){
		cameraRotation[0]+=Math.atan(movementY/1500);
		if (cameraRotation[0]>=Math.PI/2-0.001) {
			cameraRotation[0]=Math.PI/2-0.001;
		} else if (cameraRotation[0]<=(-1*Math.PI/2+0.001)){
			cameraRotation[0]=(-1*Math.PI/2)+0.001;
		};
	};
	
	// Position
	
	
	

		
	
	camera.rotation.x=cameraRotation[0];
	camera.rotation.y=cameraRotation[1];
	camera.rotation.z=cameraRotation[2];
	
	camera.position.x=player.position.x;
	camera.position.y=player.position.y+0.75;
	camera.position.z=player.position.z;

	
	
	
	movementX=0;
	movementY=0;
	
};