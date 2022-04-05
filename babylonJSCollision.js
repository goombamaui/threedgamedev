ply={};



scene = scene_one(false)



plyMeshes={};

projectiles={};

blueTeam=[];
redTeam=[];

sockets=[]


//socket setups
io.on("connection", function (socket) {
	
	var spamBlock={};
	
	var team = "";
	var spamBanner=0;
	
	//Which team is player put on
	if (blueTeam.length>redTeam.length){
		redTeam.push(socket.id);
		var team = "red";
	} else if (redTeam.length>blueTeam.length){
		blueTeam.push(socket.id);
		var team = "blue";
	} else if (Math.floor(Math.random()*2)==1){
		redTeam.push(socket.id);
		var team = "red";
	} else {
		blueTeam.push(socket.id);
		var team = "blue";
	};
	
	console.log("Made socket connection to "+ socket.id);
	plyMeshes[socket.id] = BABYLON.MeshBuilder.CreateBox(String(socket.id), {width:1, depth:1, height:2}, scene);
	if (team=="red"){
		plyMeshes[socket.id].position=new BABYLON.Vector3(100,-300,100);
	} else {
		plyMeshes[socket.id].position=new BABYLON.Vector3(-100,-300,-100);
	};
	ply[socket.id]={"keys":[], "rotation":[], "prevPosition":[],
	"vars":{}, "custom":{}};
	projectiles[socket.id]=[];
	ply[socket.id]["vars"].team=team;
	ply[socket.id]["vars"]["health"]=100;
	ply[socket.id].vars.ready=false;
	
	

	
	socket.on("disconnect", function(j){
		delete ply[socket.id];
		plyMeshes[socket.id].dispose();
		delete plyMeshes[socket.id];
		if (redTeam.indexOf(socket.id)>-1){
			redTeam.splice(redTeam.indexOf(socket.id), 1);
		} else if (blueTeam.indexOf(socket.id)>-1){
			blueTeam.splice(blueTeam.indexOf(socket.id), 1);
		};
		io.emit("ply", [socket.id, "terminate"]);
		console.log("Disconnect: ", socket.id);
	});
	
	
	socket.on("key", function(data){
		spamBanner+=1;
		
		if (data[1]==true){
			if (ply[socket.id]["keys"].indexOf(data[0])<0){
				ply[socket.id]["keys"].push(data[0]);
			};
		} else {
			var index = ply[socket.id]["keys"].indexOf(data[0]);
			if (index>=0){ply[socket.id]["keys"].splice(index,1)};
		};
	});

	
	socket.on("rotation", function(data){
		spamBanner+=1;
		try{
		ply[socket.id]["rotation"] = data;
		} catch {};
	});
	
	
	
	//Chat
	
	spamBlock["messageBlock"]=new Date().getTime();
	
	socket.on("newMessage", function(data){
		spamBanner+=1;
		var time = new Date().getTime();
		if (spamBlock["messageBlock"]+500>time){
			return;
		} else {
			spamBlock["messageBlock"]=time;
		};
		if (ply[socket.id].vars.ready==false){
			return;
		};
		var newData = String(data).substring(0, 500);
		io.emit("message", [ply[socket.id]["custom"]["name"],newData]);
	});
	
	// lazer blasts
	//spam block
	spamBlock["lazerBlock"] = new Date().getTime();
	spamBlock["lazerBlockTime"] = 0;
	
	socket.on("lazerBlast", function(direc){
		spamBanner+=1;
		var time = new Date().getTime();
		if (spamBlock["lazerBlock"]+spamBlock["lazerBlockTime"]>time){
			return;
		} else {
			spamBlock["lazerBlock"]=time;
		};
		try {
		
		//position and direction
		var direction = new BABYLON.Vector3(direc[0], direc[1], direc[2]);
		var projType=direc[3];	
		if (projType=="reg") {
			spamBlock["lazerBlockTime"]=500;
			//creating projectile
			var projectile = {};
			projectile.speed=12; //Fixed speed for projectiles as of now
			var direc0=direction.clone().scale(projectile.speed);
			projectile.damage=function(){return 25};
			projectile.position = null;
			projectile.direction = direction;
			projectile.lifeTime=38; //Amount of frames projectile can last
			projectile.partType="reg"; //regular projectile
			projectiles[socket.id].push(projectile);
			var posPlayer=plyMeshes[socket.id].position;
			var pos = [posPlayer.x,posPlayer.y+0.75,posPlayer.z];
			var direc=[direc0.x,direc0.y,direc0.z];
			io.emit("projectile", [pos,direc, projType]);
			io.emit("newLazer", [pos, projType]);
			
		} else if (projType=="mag1"){
			spamBlock["lazerBlockTime"]=100;
			//creating projectile
			var projectile = {};
			projectile.speed=6; //Fixed speed for projectiles as of now
			var direc0=direction.clone().scale(projectile.speed);
			projectile.damage=function(){return 3.5};
			projectile.position = null;
			projectile.direction = direction;
			projectile.lifeTime=10; //Amount of frames projectile can last
			projectile.partType="mag1"; //machine gun projectile
			projectiles[socket.id].push(projectile);
			var posPlayer=plyMeshes[socket.id].position;
			var pos = [posPlayer.x,posPlayer.y+0.75,posPlayer.z];
			var direc=[direc0.x,direc0.y,direc0.z];
			io.emit("projectile", [pos,direc, projType]);
			io.emit("newLazer", [pos, projType]);
			
		} else if (projType=="shog1"){
			spamBlock["lazerBlockTime"]=1500;
			for (i=0; i<5; i++){
				var proj = {};
				proj.speed=1;
				var direc0 = direction.clone().scale(proj.speed);
				var direcMain=direction.clone();
				direcMain.x = direcMain.x+(Math.random()*0.2-0.1);
				direcMain.y = direcMain.y+(Math.random()*0.1-0.05);
				direcMain.z = direcMain.z+(Math.random()*0.25-0.1);
				proj.damage = function(){return 19};
				proj.position=null;
				proj.direction=direcMain;
				proj.lifeTime=15;
				proj.partType="shog1";
				
				projectiles[socket.id].push(proj);
				
				var posPlayer=plyMeshes[socket.id].position;
				var pos = [posPlayer.x,posPlayer.y+0.75,posPlayer.z];
				var direc=[direc0.x,direc0.y,direc0.z];
				io.emit("projectile", [pos,direc, projType]);
			};
			io.emit("newLazer", [pos, projType]);
		} else if (projType=="snip1"){
			spamBlock["lazerBlockTime"]=2000;
			//creating projectile
			var projectile = {};
			projectile.speed=45;
			var direc0=direction.clone().scale(projectile.speed);
			projectile.damage=function(k){var q =150-(k.lifeTime-66)*3; if (q<100){if (q>0) {return q} else {return 1}} else {return 99}};
			projectile.position = null;
			projectile.direction = direction;
			projectile.lifeTime=100; //Amount of frames projectile can last
			projectile.partType="snip1"; //sniper projectile
			projectiles[socket.id].push(projectile);
			var posPlayer=plyMeshes[socket.id].position;
			var pos = [posPlayer.x,posPlayer.y+0.75,posPlayer.z];
			var direc=[direc0.x,direc0.y,direc0.z];
			io.emit("projectile", [pos,direc, projType]);
			io.emit("newLazer", [pos, projType]);
		} else {
			spamBlock["lazerBlockTime"]=1000;
		};
		
		} catch(err){
			console.log(err);
		};
	});
	socket.on("ready", function(data){
		spamBanner+=1;
		if (ply[socket.id].vars.ready==false){
			ply[socket.id].vars.ready=true;
			if (String(data[0]).substring(0,12)==""){data[0]="Guest"};
			ply[socket.id]["custom"]["name"] = String(data[0]).substring(0,12);
			revivePlayer(socket.id);
		};
	});
	function bSpam(mSpam, tSpam){
		if (spamBanner>mSpam){socket.disconnect();console.log("OOF");} else {spamBanner=0;
			setTimeout(bSpam,tSpam,mSpam,tSpam);
		};
	};
	bSpam(10000,10000);
});

function killPlayer(i){
	if (ply[i].vars.team=="red"){
		plyMeshes[i].position=new BABYLON.Vector3(100,-300,100);
	} else {
		plyMeshes[i].position=new BABYLON.Vector3(-100,-300,-100);
	};
	ply[i].vars.ready=false;
	let z=io.to(i);
	z.emit("dead");
};

function revivePlayer(i){
	ply[i].vars.health=100;
	if (ply[i].vars.team=="red"){
		plyMeshes[i].position=new BABYLON.Vector3(559,-21,-445);
	} else {
		plyMeshes[i].position=new BABYLON.Vector3(-610,-23.5,657);
	};
	let z=io.to(i);
	z.emit("alive");
};

var playerSpeed=40; //25
var gravityBase = 0.1;
var gravityAcceleration = 0.008;
var jumpList = [];
for (i=0;i<30;i++){
	//jumpList.push((60-i)/100);
	jumpList.push((30-i)/100);
};
for (i=0;i<10;i++){jumpList.push(0)};

gameUpdater=true;

gameEmissions=[];

function updatePlayers(){
	for (var i in ply){
		try{
		var motion = [0,-1*ply[i]["vars"]["gravity"], 0];
		var rotation = ply[i]["rotation"];
		var onGround=false;
		if (!("gravity" in ply[i]["vars"])){
		ply[i]["vars"]["gravity"]=gravityBase};
		if (!("jumpSet" in ply[i]["vars"])){
		ply[i]["vars"]["jumpSet"]=-1};
		if (rotation.length==3){
		if ((ply[i]["keys"].indexOf("w")>-1) || (ply[i]["keys"].indexOf("ArrowUp")>-1)){
			motion[0]+=parseFloat(Math.sin(rotation[1]))
			* playerSpeed/100;
			motion[2]+=parseFloat(Math.cos(rotation[1]))
			* playerSpeed/100;
		};
		if ((ply[i]["keys"].indexOf("s")>-1) || (ply[i]["keys"].indexOf("ArrowDown")>-1)){
			motion[0]-=parseFloat(Math.sin(rotation[1]))
			* playerSpeed/100;
			motion[2]-=parseFloat(Math.cos(rotation[1]))
			* playerSpeed/100;
		};
		if ((ply[i]["keys"].indexOf("a")>-1) || (ply[i]["keys"].indexOf("ArrowLeft")>-1)){
			motion[0]-=parseFloat(Math.cos(rotation[1]))
			* playerSpeed/100;
			motion[2]+=parseFloat(Math.sin(rotation[1]))
			* playerSpeed/100;
		};
		if ((ply[i]["keys"].indexOf("d")>-1) || (ply[i]["keys"].indexOf("ArrowRight")>-1)){
			motion[0]+=parseFloat(Math.cos(rotation[1]))
			* playerSpeed/100;
			motion[2]-=parseFloat(Math.sin(rotation[1]))
			* playerSpeed/100;
		};
		};
		
		if (plyMeshes[i].position.x<-700){
			plyMeshes[i].position.x=-700;
		} else if (plyMeshes[i].position.x>700){
			plyMeshes[i].position.x=700;
		}
		
		if (plyMeshes[i].position.z<-676){
			plyMeshes[i].position.z=-676;
		} else if (plyMeshes[i].position.z>740){
			plyMeshes[i].position.z=740;
		}

		var currPosition = [plyMeshes[i].position.x,
		plyMeshes[i].position.y, plyMeshes[i].position.z];
		
		if ((currPosition[1]+0.05>=ply[i]["prevPosition"][1]) || (currPosition[1]-0.05>=ply[i]["prevPosition"][1])){
			onGround=true;
			ply[i]["vars"]["gravity"]=gravityBase;
		} else {onGround=false;
		ply[i]["vars"]["gravity"]+=gravityAcceleration};
		
		if (ply[i]["vars"]["jumpSet"]==-1){
		if (ply[i]["keys"].indexOf(" ")>-1){
			if (onGround==true){
				ply[i]["vars"]["jumpSet"]=0;
			};
		};
		} else {
			motion[1]+=jumpList[ply[i]["vars"]["jumpSet"]];
			ply[i]["vars"]["jumpSet"]+=1;
			if (ply[i]["vars"]["jumpSet"]==40){
				ply[i]["vars"]["jumpSet"]=-1};
		}
		
		ply[i]["prevPosition"] = currPosition;
		ply[i]["custom"]["team"]=ply[i]["vars"]["team"];
		ply[i]["custom"]["health"]=ply[i]["vars"]["health"];
		
		
		plyMeshes[i].checkCollisions=true;
		plyMeshes[i].moveWithCollisions(new BABYLON.Vector3(
		motion[0], motion[1], motion[2]));
		let z=io.to(i);
		z.emit("motion",[plyMeshes[i].position.x, plyMeshes[i].position.y, plyMeshes[i].position.z]);
		z.emit("healthUpdate", [ply[i]["custom"]["health"], 100])
		//console.log(ply[i]["custom"]["name"]+":["+plyMeshes[i].position.x+","+plyMeshes[i].position.y+","+
		//plyMeshes[i].position.z+"]");
		
		
		for (var p in ply){
			if (i == p){continue};
			let z=io.to(p);
			z.emit("ply", [i,plyMeshes[i].position.x, plyMeshes[i].position.y, plyMeshes[i].position.z,ply[i]["rotation"][1], ply[i]["custom"]]);
		}
		
		plyMeshes[i].checkCollisions=false;
		} catch (err){
			try{
				sockets[i].disconnect();
			}catch(err){console.log(err)};
		};
	};
}
function updateProjectiles(){
	//projectile detection
	for (var i in projectiles){
		for (var k=0;k<projectiles[i].length;k++){
			try{
			var projectile = projectiles[i][k];
			if (projectile.position==null){
				projectile.position = plyMeshes[i].position.clone();
				projectile.position.y+=0.75;
			};
			var ray = new BABYLON.Ray(projectile.position, projectile.direction,
			projectile.speed);
			var hit = scene.pickWithRay(ray, function(mesh){
				if (mesh == plyMeshes[i]){
					return false;
				}
				return true;
			});
			if (hit.pickedMesh!=null){
				var deleter = projectiles[i].indexOf(projectile);
				if (deleter>-1){
				projectiles[i].splice(deleter,1);
				};
				for (j in plyMeshes){
					if (plyMeshes[j]==hit.pickedMesh){
						if (blueTeam.indexOf(j)>-1){
							if (redTeam.indexOf(i)>-1){
								//redTeam hit blueTeam
								ply[j].vars.health=ply[j].vars.health-projectile.damage(projectile);
								if (ply[j].vars.health<=0){
									killPlayer(j);
								};
							};
						} else {
							if (blueTeam.indexOf(i)>-1){
								//blueTeam hit redTeam
								ply[j].vars.health=ply[j].vars.health-projectile.damage(projectile);
								if (ply[j].vars.health<=0){
									killPlayer(j);
								};								
							};
						};
					};
				};
				continue;
			} else {
				var direc0=ray.direction.scale(projectile.speed);
				projectile.position=ray.origin.add(direc0);
				projectile.lifeTime-=1;
				if (projectile.lifeTime<=0){
					var deleter = projectiles[i].indexOf(projectile);
					projectiles[i].splice(deleter,1);
				} else {
					var pos = [projectile.position.x,projectile.position.y,projectile.position.z];
					direc0=projectile.direction.scale(projectile.speed);
					var direc = [direc0.x,direc0.y,direc0.z];
					io.emit("projectile", [pos,direc, projectile.partType]);
				};
			};
			} catch (err){
				var deleter = projectiles[i].indexOf(projectile);
				if (deleter>-1){
					projectiles[i].splice(deleter,1);
				};
			};
		};
	};
};



function updateGame(){
	if (gameUpdater){
	gameUpdater=false;
	//t1 = new Date;
	updateProjectiles();
	//t2 = new Date;
	updatePlayers();
	//t3 = new Date;
	gameUpdater=true;
	} else {console.log("BLOB")};
	//console.log("Tot: "+String(t3.getTime()-t1.getTime()));
};


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function getSockets(){ sockets = await io.fetchSockets();}

setInterval(getSockets,500);
setInterval(updateGame, 25);