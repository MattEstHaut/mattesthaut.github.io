document.getElementById("pause").onclick = () => {
	if (PAUSE) {
		PAUSE = false;
		document.getElementById("pause").innerHTML = "pause";
	} else {
		PAUSE = true;
		document.getElementById("pause").innerHTML = "unpause";
	}
}

document.getElementById("reset").onclick = () => {
	reset();
	setup(document.getElementById("boids").value);
}

document.getElementById("sdistance").onchange = () => {
	SEPARATION_PERCEPTION = document.getElementById("sdistance").value;
}

document.getElementById("adistance").onchange = () => {
	ALIGNEMENT_PERCEPTION = document.getElementById("adistance").value;
}

document.getElementById("cdistance").onchange = () => {
	COHESION_PERCEPTION = document.getElementById("cdistance").value;
}

document.getElementById("scale").onchange = () => {
	SCALE = document.getElementById("scale").value;
}

var ox = 0; var oy = 0; var or = 40;
document.getElementById("obstacle").onclick = () => {
	if (OBSTACLES.length > 0) {
		document.getElementById("obstacle").innerHTML = "put obstacle";
		OBSTACLES.length = 0;
	} else {
		obstacle = true;
		document.getElementById("obstacle").innerHTML = "remove obstacle";
		OBSTACLES.push(new Obstacle(WIDTH/2+ox, HEIGHT/2+oy, or));
	}
}

document.getElementById("ox").onchange = () => {
	ox = parseInt(document.getElementById("ox").value);
	if (OBSTACLES.length > 0) {
		OBSTACLES[0].position.x = WIDTH/2+ox;
	}
}

document.getElementById("oy").onchange = () => {
	oy = parseInt(document.getElementById("oy").value);
	if (OBSTACLES.length > 0) {
		OBSTACLES[0].position.y = HEIGHT/2+oy;
	}
}

document.getElementById("or").onchange = () => {
	or = parseInt(document.getElementById("or").value);
	if (OBSTACLES.length > 0) {
		OBSTACLES[0].radius = or;
	}
}

setup(300);
run();