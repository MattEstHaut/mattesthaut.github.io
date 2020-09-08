const BOIDS = window.BOIDS || {};

BOIDS.options = {
	//basics
	pause:  false,
	max_f:  1/100,
	max_speed:  1,
	width:   1000,
	height:  1000,
	//radius
	cohesion_radius:   40,
	alignement_radius: 30,
	separation_radius: 20,
	dodge_radius:      20,
	//scales
	cohesion_scale:     1,
	alignement_scale: 1.5,
	separation_scale:   2,
	dodge_scale:        1,
	//graphics
	scale:     1,
	cam_x:     0,
	cam_y:     0,
	canvas:                  "",
	context:                 "",
	background_color: "#ffffff",
	boid_color:       "#000000",
	obstacle_color:   "#000000"
}

BOIDS.Vector = class {
	constructor(x=0, y=0) {
		this.x = x; this.y = y;
		return this;
	}

	add(vector) {
		this.x += vector.x;
		this.y += vector.y;
		return this;
	}

	sub(vector) {
		this.x -= vector.x;
		this.y -= vector.y;
		return this;
	}

	div(value) {
		this.x /= value;
		this.y /= value;
		return this;
	}

	mul(value) {
		this.x *= value;
		this.y *= value;
		return this;
	}

	random() {
		//Randomize a vector with length=1.
		let a = Math.random()*(2*Math.PI);
		this.x = Math.cos(a);
		this.y = Math.sin(a);
		return this;
	}

	normalize() {
		//Normalize a vector (length=1).
		let l = BOIDS.get_distance(this, [0, 0]);
		if (l > 0) {
			this.div(l);
		}
		return this;
	}

	rotate(alpha) {
		let l = BOIDS.get_distance(this, [0, 0]);
		this.div(l);
		let a = Math.acos(this.x);
		a = (this.y < 0) ? -a : a;
		a += alpha;
		this.x = Math.cos(a)*l;
		this.y = Math.sin(a)*l;
		return this;
	}

	angle() {
		let vect = this.copy().normalize();
		let a = Math.acos(vect.x);
		a = (vect.y < 0) ? -a : a;
		return a;
	}

	copy() {
		return new BOIDS.Vector(this.x, this.y);
	}

	limit(max) {
		//Limit length of a vector.
		let d = BOIDS.get_distance(this, [0, 0]);
		if (d > max) {
			this.div(d/max);
		}
		return this;
	}
}

BOIDS.Boid = class {
	constructor(x=0, y=0) {
		this.position = new BOIDS.Vector(x, y);
		this.velocity = new BOIDS.Vector().random();
		this.acceleration = new BOIDS.Vector();
	}

	update() {
		this.position.add(this.velocity);
		this.velocity.add(this.acceleration);
		this.velocity.limit(BOIDS.options.max_speed);
	}

	edges() {
		let demi_width = BOIDS.options.width/2;
		let demi_height = BOIDS.options.height/2;
		if (this.position.x > demi_width) {
			this.position.x = -demi_width;
		} else if (this.position.x < -demi_width) {
			this.position.x = demi_width;
		}
		if (this.position.y > demi_height) {
			this.position.y = -demi_height;
		} else if (this.position.y < -demi_height) {
			this.position.y = demi_height;
		}
	}

	align() {
		let steering = new BOIDS.Vector();
		let total = 0;
		for (let other of BOIDS.flock) {
			let d = BOIDS.get_distance(this.position, other.position);
			if (d <= BOIDS.options.alignement_radius && d != 0) {
				steering.add(other.velocity);
				total++;
			}
		}
		if (total > 0) {
			steering.div(total).normalize().sub(this.velocity).limit(BOIDS.options.max_f);
		}
		return steering;
	}

	cohesion() {
		let steering = new BOIDS.Vector();
		let total = 0;
		for (let other of BOIDS.flock) {
			let d = BOIDS.get_distance(this.position, other.position);
			if (d <= BOIDS.options.cohesion_radius && d != 0) {
				steering.add(other.position);
				total++;
			}
		}
		if (total > 0) {
			steering.div(total).sub(this.position).normalize().sub(this.velocity).limit(BOIDS.options.max_f);
		}
		return steering;
	}

	separation() {
		let steering = new BOIDS.Vector();
		let total = 0;
		for (let other of BOIDS.flock) {
			let d = BOIDS.get_distance(this.position, other.position);
			if (d <= BOIDS.options.separation_radius && d != 0) {
				let difference = new BOIDS.Vector(
					this.position.x-other.position.x, 
					this.position.y-other.position.y);
				steering.add(difference.div(d));
				total++;
			}
		}
		if (total > 0) {
			steering.div(total).normalize().sub(this.velocity).limit(BOIDS.options.max_f);
		}
		return steering;
	}

	dodge() {
		let steering = new BOIDS.Vector();
		let total = 0;
		for (let obstacle of BOIDS.obstacles) {
			let d = BOIDS.get_distance(this.position, obstacle.position)-obstacle.radius;
			if (d <= BOIDS.options.dodge_radius && d != 0) {
				let difference = new BOIDS.Vector(
					this.position.x-obstacle.position.x, 
					this.position.y-obstacle.position.y
					)
				if (d < 0) {
					this.position.add(difference.mul(1.1));
				}
				steering.add(difference.normalize().div(d));
				total++;
			}
		}
		if (total > 0) {
			steering.div(total).sub(this.velocity);
		}
		return steering;
	}

	flock() {
		let alignement = this.align().mul(BOIDS.options.alignement_scale);
		let cohesion = this.cohesion().mul(BOIDS.options.cohesion_scale);
		let separation = this.separation().mul(BOIDS.options.separation_scale);
		let dodge = this.dodge().mul(BOIDS.options.dodge_scale);
		this.acceleration.mul(0);
		this.acceleration.add(alignement);
		this.acceleration.add(cohesion);
		this.acceleration.add(separation);
		this.acceleration.add(dodge);
		this.acceleration.limit(BOIDS.options.max_speed);
	}

	show() {
		let a = Math.acos(this.velocity.normalize().x);
		a = (this.velocity.y < 0) ? -a : a;

		let demi_width = BOIDS.options.width/2;
		let demi_height = BOIDS.options.height/2;
		let demi_canvas_width = BOIDS.options.canvas.width/2;
		let demi_canvas_height = BOIDS.options.canvas.height/2;

		let x = (this.position.x-BOIDS.options.cam_x)*BOIDS.options.scale*(demi_canvas_width/demi_width)+demi_canvas_width;
		let y = (this.position.y-BOIDS.options.cam_y)*BOIDS.options.scale*(demi_canvas_height/demi_height)+demi_canvas_height;

		let scale = BOIDS.options.scale*6*(demi_canvas_width/demi_width+demi_canvas_height/demi_height)/2;

		BOIDS.options.context.fillStyle = BOIDS.options.boid_color;
		BOIDS.options.context.beginPath();
		BOIDS.options.context.moveTo(x+Math.cos(a)*scale*2, y+Math.sin(a)*scale*2);
		BOIDS.options.context.lineTo(x+Math.cos(a-2*Math.PI/3)*scale, y+Math.sin(a-2*Math.PI/3)*scale);
		BOIDS.options.context.lineTo(x+Math.cos(a+2*Math.PI/3)*scale, y+Math.sin(a+2*Math.PI/3)*scale);
		BOIDS.options.context.lineTo(x+Math.cos(a)*scale*2, y+Math.sin(a)*scale*2);
		BOIDS.options.context.fill();
	}
}

BOIDS.flock = [];
BOIDS.flock.update = () => {
	for (let boid of BOIDS.flock) {
		boid.flock();
	}
	for (let boid of BOIDS.flock) {
		boid.update();
		boid.edges();
	}
}
BOIDS.flock.show = () => {
	for (let boid of BOIDS.flock) {
		boid.show();
	}
}

BOIDS.Obstacle = class {
	constructor(x, y, r) {
		this.position = new BOIDS.Vector(x, y);
		this.radius = r;
	}

	show() {
		let demi_width = BOIDS.options.width/2;
		let demi_height = BOIDS.options.height/2;
		let demi_canvas_width = BOIDS.options.canvas.width/2;
		let demi_canvas_height = BOIDS.options.canvas.height/2;

		let x = (this.position.x-BOIDS.options.cam_x)*BOIDS.options.scale*(demi_canvas_width/demi_width)+demi_canvas_width;
		let y = (this.position.y-BOIDS.options.cam_y)*BOIDS.options.scale*(demi_canvas_height/demi_height)+demi_canvas_height;

		let scale = BOIDS.options.scale*(demi_canvas_width/demi_width+demi_canvas_height/demi_height)/2;

		BOIDS.options.context.fillStyle = BOIDS.options.obstacle_color;
		BOIDS.options.context.beginPath();
		BOIDS.options.context.arc(x, y, this.radius*scale, 0, 2*Math.PI);
		BOIDS.options.context.fill();
	}
}

BOIDS.obstacles = [];
BOIDS.obstacles.show = () => {
	for (let obs of BOIDS.obstacles) {
		obs.show();
	}
}

BOIDS.set_canvas = (canvas) => {
	BOIDS.options.canvas = canvas;
	BOIDS.options.context = canvas.getContext("2d");
}

BOIDS.get_distance = (coord_1, coord_2) => {
	let x1, y1, x2, y2;
	if (coord_1.x != undefined && coord_1.y != undefined) {
		x1 = coord_1.x; y1 = coord_1.y;
	} else {
		x1 = coord_1[0]; y1 = coord_1[1];
	}
	if (coord_2.x != undefined && coord_2.y != undefined) {
		x2 = coord_2.x; y2 = coord_2.y;
	} else {
		x2 = coord_2[0]; y2 = coord_2[1];
	}
	return Math.sqrt((x1-x2)**2+(y1-y2)**2);
}

BOIDS.get_angle = (vect_1, vect_2) => {
	return vect_2.angle() - vect_1.angle();
}

BOIDS.clear = () => {
	BOIDS.options.context.fillStyle = BOIDS.options.background_color;
	BOIDS.options.context.fillRect(0, 0, BOIDS.options.canvas.width, BOIDS.options.canvas.height);
}

BOIDS.get_cam_limits = () => {
	let x = (BOIDS.options.width-BOIDS.options.width/BOIDS.options.scale)/2;
	let y = (BOIDS.options.height-BOIDS.options.height/BOIDS.options.scale)/2;
	return new BOIDS.Vector(x, y);
}

BOIDS.cam_to_real = (x, y) => {
	x = (x-BOIDS.options.canvas.width/2)*(BOIDS.options.width/BOIDS.options.canvas.width/BOIDS.options.scale)+BOIDS.options.cam_x;
	y = (y-BOIDS.options.canvas.height/2)*(BOIDS.options.height/BOIDS.options.canvas.height/BOIDS.options.scale)+BOIDS.options.cam_y;
	return new BOIDS.Vector(x, y);
}

BOIDS.setup = (number=300, center=false) => {
	if (center) {
		for (let b=0; b<number; b++) {
			BOIDS.flock.push(new BOIDS.Boid(0, 0));
		}
	} else {
		let demi_width = BOIDS.options.width/2;
		let demi_height = BOIDS.options.height/2;
		for (let b=0; b<number; b++) {
			BOIDS.flock.push(new BOIDS.Boid(Math.random()*BOIDS.options.width-demi_width, Math.random()*BOIDS.options.height-demi_height));
		}
	}
}

BOIDS.reset = () => {
	BOIDS.flock.length = 0;
}

BOIDS.legalize_cam = () => {
	let limits = BOIDS.get_cam_limits();
	BOIDS.options.cam_x = (BOIDS.options.cam_x < -limits.x) ? -limits.x : BOIDS.options.cam_x;
	BOIDS.options.cam_x = (BOIDS.options.cam_x > limits.x) ? limits.x : BOIDS.options.cam_x;
	BOIDS.options.cam_y = (BOIDS.options.cam_y < -limits.y) ? -limits.y : BOIDS.options.cam_y;
	BOIDS.options.cam_y = (BOIDS.options.cam_y > limits.y) ? limits.y : BOIDS.options.cam_y;
}

BOIDS.run = () => {
	var interval = setInterval(() => {
		BOIDS.clear();
		if (!BOIDS.options.pause) {
			BOIDS.flock.update();
		}
		BOIDS.obstacles.show();
		BOIDS.flock.show();
	}, 10);
}