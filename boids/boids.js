const CANVAS = document.getElementById("main-canvas");
const CTX = CANVAS.getContext("2d");
const WIDTH = CANVAS.width; const HEIGHT = CANVAS.height;
var SCALE = 4;

var ALIGNEMENT_PERCEPTION = 40;
var COHESION_PERCEPTION = 60;
var SEPARATION_PERCEPTION = 20;
var ALIGNEMENT_SCALE = 1;
var COHESION_SCALE = 0.5;
var SEPARATION_SCALE = 1.5;
var MAX_SPEED = 1;
var MAX_F = 0.01;

var PAUSE = false;

const FLOCK = [];
FLOCK.show = () => {
	clear();
	for (let obs of OBSTACLES) {
		obs.show();
	}
	for (let boid of FLOCK) {
		boid.edges();
		boid.flock(FLOCK);
	}
	for (let boid of FLOCK) {
		boid.update();
		boid.show();
	}
};

const OBSTACLES = [];

const clear = () => {
	CTX.fillStyle = "#fba6ff";
	CTX.fillRect(0, 0, WIDTH, HEIGHT);
}

class Vector {
	constructor(x=0, y=0) {
		this.x = x;
		this.y = y;
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
		let a = Math.random()*(2*Math.PI);
		this.x = Math.cos(a);
		this.y = Math.sin(a);
		return this;
	}

	normalize() {
		let d = distance(this.x, this.y, 0, 0);
		if (d > 0) {
			this.x /= d; this.y /= d;
		}
		return this;
	}

	limit(max) {
		let d = distance(this.x, this.y, 0, 0);
		if (d > max) {
			this.div(d/max);
		}
		return this;
	}
}

const distance = (x1, y1, x2, y2) => {
	return Math.sqrt((x1-x2)**2+(y1-y2)**2);
}

class Boid {
	constructor() {
		this.position = new Vector(WIDTH*Math.random(), HEIGHT*Math.random());
		this.velocity = new Vector().random();
		this.acceleration = new Vector();
	}

	update() {
		this.position.add(this.velocity);
		this.velocity.add(this.acceleration);
		this.velocity.limit(MAX_SPEED);
	}

	edges() {
		if (this.position.x > WIDTH) {
			this.position.x = 0;
		} else if (this.position.x < 0) {
			this.position.x = WIDTH;
		}
		if (this.position.y > HEIGHT) {
			this.position.y = 0;
		} else if (this.position.y < 0) {
			this.position.y = HEIGHT;
		}
	}

	align(boids) {
		let steering = new Vector();
		let total = 0;
		for (let other of boids) {
			let d = distance(this.position.x, this.position.y, other.position.x, other.position.y);
			if (d <= ALIGNEMENT_PERCEPTION && d != 0) {
				steering.add(other.velocity);
				total++;
			}
		}
		if (total > 0) {
			steering.div(total);
			steering.normalize().mul(MAX_SPEED);
			steering.sub(this.velocity);
			steering.limit(MAX_F);
		}
		return steering;
	}

	cohesion(boids) {
		let steering = new Vector();
		let total = 0;
		for (let other of boids) {
			let d = distance(this.position.x, this.position.y, other.position.x, other.position.y);
			if (d <= COHESION_PERCEPTION && d != 0) {
				steering.add(other.position);
				total++;
			}
		}
		if (total > 0) {
			steering.div(total);
			steering.sub(this.position);
			steering.normalize().mul(MAX_SPEED);
			steering.sub(this.velocity);
			steering.limit(MAX_F);
		}
		return steering;
	}

	separation(boids) {
		let steering = new Vector();
		let total = 0;
		for (let other of boids) {
			let d = distance(this.position.x, this.position.y, other.position.x, other.position.y);
			if (d <= SEPARATION_PERCEPTION && d != 0) {
				let difference = new Vector(
					this.position.x-other.position.x, 
					this.position.y-other.position.y);
				difference.div(d);
				steering.add(difference);
				total++;
			}
		}
		if (total > 0) {
			steering.div(total);
			steering.normalize().mul(MAX_SPEED);
			steering.sub(this.velocity);
			steering.limit(MAX_F);
		}
		return steering;
	}

	obs_separation(obstacles) {
		let steering = new Vector();
		let total = 0;
		for (let obstacle of obstacles) {
			let radial_vector = new Vector(
				this.position.x-obstacle.position.x, 
				this.position.y-obstacle.position.y).normalize();
			let nearest_point = radial_vector.add(obstacle.position);

			let d = distance(this.position.x, this.position.y, nearest_point.x, nearest_point.y);
			if (d <= 60 && d != 0) {
				let difference = new Vector(
					this.position.x-obstacle.position.x, 
					this.position.y-obstacle.position.y);
				difference.div(d);
				steering.add(difference);
				total++;
			}
		}
		if (total > 0) {
			steering.div(total);
			steering.normalize().mul(MAX_SPEED);
			steering.sub(this.velocity);
			steering.limit(MAX_F*3);
		}
		return steering;
	}

	flock(boids) {
		let alignement = this.align(boids).mul(ALIGNEMENT_SCALE);
		let cohesion = this.cohesion(boids).mul(COHESION_SCALE);
		let separation = this.separation(boids).mul(SEPARATION_SCALE);
		let obs_separation = this.obs_separation(OBSTACLES).mul(SEPARATION_SCALE);
		this.acceleration.mul(0);
		this.acceleration.add(alignement);
		this.acceleration.add(cohesion);
		this.acceleration.add(separation);
		this.acceleration.add(obs_separation);
	}

	show() {
		let a = Math.acos(this.velocity.x);
		a = (this.velocity.y < 0) ? -a : a;

		CTX.fillStyle = "white";
		CTX.beginPath();
		CTX.moveTo(this.position.x+Math.cos(a)*SCALE*3, this.position.y+Math.sin(a)*SCALE*3);
		CTX.lineTo(this.position.x+Math.cos(a-Math.PI/3)*SCALE, this.position.y+Math.sin(a-Math.PI/3)*SCALE);
		CTX.lineTo(this.position.x+Math.cos(a+Math.PI/3)*SCALE, this.position.y+Math.sin(a+Math.PI/3)*SCALE);
		CTX.lineTo(this.position.x+Math.cos(a)*SCALE*3, this.position.y+Math.sin(a)*SCALE*3);
		CTX.fill();
	}
}

class Obstacle {
	constructor(x, y, r) {
		this.position = new Vector(x, y);
		this.radius = r;
	}

	show() {
		CTX.fillStyle = "white";
		CTX.beginPath();
		CTX.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		CTX.fill();
	}
}

const setup = (number=50) => {
	for (let b=0; b<number; b++) {
		FLOCK.push(new Boid());
	}
}

const reset = () => {
	FLOCK.length = 0;
}

const run = () => {
	var interval = setInterval(() => {
		if (!PAUSE) {
			FLOCK.show();
		}
	}, 10);	
}