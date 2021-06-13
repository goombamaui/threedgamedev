
function scene_one(eng){
	var scene = new BABYLON.Scene(engine);
	
	
	//host or client
	try {
		var serverLocation=location.host
	} catch (err){var serverLocation = serverLoc};
	
	
	//collisions
		
	var noColMeshes = [];
	
	// Meshes

	BABYLON.SceneLoader.LoadAssetContainer("http://"+serverLocation+"/babylonFiles/scene2_tests/", "scene2.glb", scene,function(container){
	var meshes=container.meshes;
	
	//Textures for imported mesh (only on client)
	
	if (eng){
		
		scene.autoClear = false; // Color buffer
		scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
		


	waterMaterial.bumpTexture = new BABYLON.Texture("images/waterbump.png", scene);
	
	waterMaterial.windForce = -10;
	waterMaterial.waveHeight = 0.5;
	waterMaterial.windDirection = new BABYLON.Vector2(1, 1);
	waterMaterial.waterColor = new BABYLON.Color4(0.1, 0.1, 0.6, 0.5);
	waterMaterial.colorBlendFactor = 0.2;
	waterMaterial.bumpHeight = 1;
	waterMaterial.waveLength = 0.1;
	waterMaterial.waveCount=1000;
	waterMaterial.waveSpeed=2;

	
	
	
	
	} else {scene.blockMaterialDirtyMechanism = true;
		scene.enableCollisions=true;
	};

	
	
	//Adding gravity and textures to meshes
	var i = 0;
	while (i<meshes.length){
		var k = meshes[i];
		i++;
		if (noColMeshes.indexOf(k.name)==-1){
			k.checkCollisions=true;
			k.isPickable=true;
		} else {
			k.checkCollisions=false;
			k.isPickable=false;
		};
		
		// Textures (Only for client);
		if (eng){
			
			
			
			
			
		if (k.name=="Ocean_mesh"){
			k.material=waterMaterial;
			k.backFaceCulling=false;
		} else if (k.name=="Ground"){
			ground=k;
			ground.material.specularIntensity=0;
			waterMaterial.addToRenderList(ground);
		} else if (k.name=="noColl_bg1"){
			k.backFaceCulling=false;
			waterMaterial.addToRenderList(k);
			k.material.specularIntensity=0;
		} else if (k.name=="Barrier"){
			k.material.alpha=0.01;
			k.material.specularIntensity=0;
		} else if (k.name.includes("wallset")){
			console.log(k.name);
			q=k;
		} else if (k.name=="waiting_red"){
			k.position.y=-308;
			k.checkCollisions=true;
		} else if (k.name=="waiting_blue"){
			k.position.y=-308;
			k.checkCollisions=true;
		}
		
		
		
		} else {
			if (k.name=="noColl_bg1"){
				k.checkCollisions=false;
				if (meshes.indexOf(k)>0){
				meshes.splice(meshes.indexOf(k), 1);
				i--;
				}
				
			} else if (k.name=="Ocean_mesh"){
				k.freezeWorldMatrix();
				k.doNotSyncBoundingInfo=true;
			} else if (k.name=="Barrier"){
				k.dispose();
			} else if (k.name=="waiting_red"){
				k.position.y=-303;
				k.checkCollisions=true;
			} else if (k.name=="waiting_blue"){
				k.position.y=-303;
				k.checkCollisions=true;
			} else if (k.name=="Ground"){
				k.freezeWorldMatrix();
				k.doNotSyncBoundingInfo=true;
			};
			
			try{
			if (k.material.name.includes("Green")){
				k.checkCollisions=false;
				if (meshes.indexOf(k)>0){
				meshes.splice(meshes.indexOf(k), 1);
				i--;
				}
			};
			} catch(err){};
		};
	};
	
	
	for (i=0;i<container.meshes.length;i++){
		if (container.meshes[i].name=="noColl_bg1"){
			console.log("BAD");
		};
	};
	//putting meshes into scene;
	container.addAllToScene()
	});
	
	

	
	if (eng) {
		[camera, player]=defineCamera(scene, canvas);	
		var light = new BABYLON.HemisphericLight("light1",
		new BABYLON.Vector3(1,1,0), scene);
		light.diffuse = new BABYLON.Color3(0.8,0.8,0.8);
		light.specular = new BABYLON.Color3(3,3,0);
		light.intensity=0.1;
		
		var sun  = new BABYLON.DirectionalLight("Sun", new BABYLON.Vector3(0.5,-1,0.5), scene);
		sun.diffuse = new BABYLON.Color3(1,1,1);
		light.specular = new BABYLON.Color3(1,1,1);
		light.intensity=1;
		
		var playerPointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(1, 10, 1), scene);
		playerPointLight.diffuse = new BABYLON.Color4(0.9, 0.9, 0.9, 1);
		
		//SKYBOX
		var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:10000.0}, scene);
		var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
		skybox.infiniteDistance = true;
		skyboxMaterial.backFaceCulling = false;
		skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("images/skybox_mountain/skybox4", scene);
		skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		skybox.material = skyboxMaterial;
		waterMaterial = new BABYLON.WaterMaterial("water", scene);
		//waterMaterial.addToRenderList(skybox);
		//Fog
		scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
		scene.fogStart = 300.0;
		scene.fogEnd = 1000.0;
		scene.fogDensity=0.0003
		scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);
		
		//Boundary
		
		
		


		scene.registerBeforeRender(function(){
			cameraLoop(scene,canvas);
			playerPointLight.position=player.position;
		});
	} else {
		camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, -800, -20), scene);
		scene.freezeActiveMeshes();
		setTimeout(function(k){k.freezeActiveMeshes()}, 3000, scene);
	};

	return scene;
};
console.log("DONE")