/*


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

*/

const canvas = document.getElementById("main-canvas");
var left_down = false; var right_down = false;

BOIDS.options.background_color = "#fba6ff";
BOIDS.options.boid_color = "white";
BOIDS.options.obstacle_color = "white";

const default_values = {
	cohesion_radius:   40,
	alignement_radius: 30,
	separation_radius: 20,
	cohesion_scale:     1,
	alignement_scale: 1.5,
	separation_scale:   2
}

canvas.addEventListener('contextmenu', event => event.preventdefault_values());

canvas.addEventListener("mousedown", (evt) => { 
	if (evt.button == 0) {
		left_down = true;
		right_down = false;
	} else if (evt.button == 2) {
		right_down = true;
		left_down = false;
		let position = BOIDS.cam_to_real(evt.offsetX, evt.offsetY);
		BOIDS.obstacles.push(new BOIDS.Obstacle(position.x, position.y, 3));
	}
});

document.addEventListener("mouseup", (evt) => { 
	if (evt.button == 0) {
		left_down = false;
	} else {
		right_down = false;
	}
});

canvas.addEventListener("mousemove", (evt) => {
	if (left_down) {
		BOIDS.options.cam_x -= evt.movementX/BOIDS.options.scale;
		BOIDS.options.cam_y -= evt.movementY/BOIDS.options.scale;

		BOIDS.legalize_cam();
	} else if (right_down) {
		let position = BOIDS.cam_to_real(evt.offsetX, evt.offsetY);
		BOIDS.obstacles.push(new BOIDS.Obstacle(position.x, position.y, 3));
	}
});

canvas.addEventListener("wheel", (evt) => {
	if (evt.deltaY > 0 && BOIDS.options.scale > 1) {
		BOIDS.options.scale -= 0.1;
		BOIDS.legalize_cam();
	} else if (evt.deltaY < 0) {
		let direction = BOIDS.cam_to_real(evt.offsetX, evt.offsetY).sub(new BOIDS.Vector(BOIDS.options.cam_x, BOIDS.options.cam_y));
		BOIDS.options.cam_x += direction.x/BOIDS.options.scale**4;
		BOIDS.options.cam_y += direction.y/BOIDS.options.scale**4;
		BOIDS.options.scale += 0.1;
		BOIDS.legalize_cam();
	}
});

document.getElementById("pause").onclick = () => {
	if (BOIDS.options.pause) {
		BOIDS.options.pause = false;
		document.getElementById("pause").innerHTML = "pause";
	} else {
		BOIDS.options.pause = true;
		document.getElementById("pause").innerHTML = "unpause";
	}
}

document.getElementById("reset").onclick = () => {
	BOIDS.reset();
	BOIDS.setup(document.getElementById("boids").value);
}

document.getElementById("clear").onclick = () => {
	BOIDS.obstacles.length = 0;
}

document.getElementById("default").onclick = () => {
	BOIDS.options.cohesion_radius = default_values.cohesion_radius;
	BOIDS.options.cohesion_scale = default_values.cohesion_scale;
	BOIDS.options.alignement_radius = default_values.alignement_radius;
	BOIDS.options.alignement_scale = default_values.alignement_scale;
	BOIDS.options.separation_radius = default_values.separation_radius;
	BOIDS.options.separation_scale = default_values.separation_scale;
	document.getElementById("cohesion_radius").value = default_values.cohesion_radius;
	document.getElementById("cohesion_scale").value = default_values.cohesion_scale;
	document.getElementById("alignement_radius").value = default_values.alignement_radius;
	document.getElementById("alignement_scale").value = default_values.alignement_scale;
	document.getElementById("separation_radius").value = default_values.separation_radius;
	document.getElementById("separation_scale").value = default_values.separation_scale;
}

document.getElementById("cohesion_radius").onchange = () => {
	BOIDS.options.cohesion_radius = document.getElementById("cohesion_radius").value;
}
document.getElementById("cohesion_scale").onchange = () => {
	BOIDS.options.cohesion_scale = document.getElementById("cohesion_scale").value;
}
document.getElementById("alignement_radius").onchange = () => {
	BOIDS.options.alignement_radius = document.getElementById("alignement_radius").value;
}
document.getElementById("alignement_scale").onchange = () => {
	BOIDS.options.alignement_scale = document.getElementById("alignement_scale").value;
}
document.getElementById("separation_radius").onchange = () => {
	BOIDS.options.separation_radius = document.getElementById("separation_radius").value;
}
document.getElementById("separation_scale").onchange = () => {
	BOIDS.options.separation_scale = document.getElementById("separation_scale").value;
}

BOIDS.set_canvas(canvas);
BOIDS.setup(300);
BOIDS.run();