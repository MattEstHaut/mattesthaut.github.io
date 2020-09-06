const CANVAS = document.getElementById("main-canvas");
const CTX = CANVAS.getContext("2d");
const WIDTH = CANVAS.width; const HEIGHT = CANVAS.height;
const SCALE = 4;

var ALIGNEMENT_PERCEPTION = 40;
var COHESION_PERCEPTION = 60;
var SEPARATION_PERCEPTION = 20;
var ALIGNEMENT_SCALE = 1;
var COHESION_SCALE = 0.5;
var SEPARATION_SCALE = 1.5;
var MAX_SPEED = 1;
var MAX_F = 0.01;

const FLOCK = [];
FLOCK.show = () => {
	clear();
	for (let boid of FLOCK) {
		boid.edges();
		boid.flock(FLOCK);
	}
	for (let boid of FLOCK) {
		boid.update();
		boid.show();
	}
};

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

	flock(boids) {
		let alignement = this.align(boids).mul(ALIGNEMENT_SCALE);
		let cohesion = this.cohesion(boids).mul(COHESION_SCALE);
		let separation = this.separation(boids).mul(SEPARATION_SCALE);
		this.acceleration.mul(0);
		this.acceleration.add(alignement);
		this.acceleration.add(cohesion);
		this.acceleration.add(separation);
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

const setup = (number=50) => {
	for (let b=0; b<number; b++) {
		FLOCK.push(new Boid());
	}
}

setup(200);

var interval = setInterval(() => {
	FLOCK.show();
}, 10);
