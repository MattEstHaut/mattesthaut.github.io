const FRACTAL = window.FRACTAL || {};

FRACTAL.dragon_curve = (n) => {
	let curve = [[0, 0], [1, 0]];
	for (let i=0; i<n; i++) {
		let next_curve = [];
		for (let p=0; p<curve.length-1; p++) {
			next_curve.push(curve[p]);
			let vector = FRACTAL._vectorize(curve[p], curve[p+1]);

			if (p%2 == 0) {
				vector = FRACTAL._mul(FRACTAL._rotate(vector, Math.PI/4), 1/Math.sqrt(2));
			} else {
				vector = FRACTAL._mul(FRACTAL._rotate(vector, -Math.PI/4), 1/Math.sqrt(2));
			}

			next_curve.push(FRACTAL._add(curve[p], vector));
		}
		next_curve.push(curve[curve.length-1]);
		curve = next_curve.slice();
	}
	return curve;
}

FRACTAL.levy_curve = (n) => {
	let curve = [[0, 0], [1, 0]];
	for (let i=0; i<n; i++) {
		let next_curve = [];
		for (let p=0; p<curve.length-1; p++) {
			next_curve.push(curve[p]);
			let vector = FRACTAL._vectorize(curve[p], curve[p+1]);
			vector = FRACTAL._mul(FRACTAL._rotate(vector, -Math.PI/4), 1/Math.sqrt(2));
			next_curve.push(FRACTAL._add(curve[p], vector));
		}
		next_curve.push(curve[curve.length-1]);
		curve = next_curve.slice();
	}
	return curve;
}

FRACTAL._vectorize = (a, b) => {
	return [b[0]-a[0], b[1]-a[1]];
}

FRACTAL._rotate = (v, a) => {
	let x = v[0]*Math.cos(a)-v[1]*Math.sin(a);
	let y = v[0]*Math.sin(a)+v[1]*Math.cos(a);
	return [x, y];
}

FRACTAL._mul = (v, s) => {
	return [v[0]*s, v[1]*s];
}

FRACTAL._add = (a, b) => {
	return [a[0]+b[0], a[1]+b[1]];
}

FRACTAL._scale = (a, canvas) => {
	let coef = (canvas.width > canvas.height) ? canvas.height : canvas.width;
	let x = a[0]-1/2;
	let y = a[1];
	x *= coef*0.4;
	y *= coef*0.4;
	x += canvas.width/2;
	y += canvas.height/2;
	y = canvas.height-y;
	return [x, y];
}

FRACTAL.display_curve = (canvas, curve, colors=["black", "white"]) => {
	let ctx = canvas.getContext("2d");
	ctx.fillStyle = colors[0];
	ctx.strokeStyle = colors[1];
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	let begin = FRACTAL._scale(curve[0], canvas);
	ctx.moveTo(begin[0], begin[1]);
	for (let i=1; i<curve.length; i++) {
		let p = FRACTAL._scale(curve[i], canvas);
		ctx.lineTo(p[0], p[1]);
	}
	ctx.stroke();
}

FRACTAL._mandelbrot_set = (z, c) => {
	return [z[0]**2-z[1]**2+c[0], 2*z[0]*z[1]+c[1]];
}

FRACTAL.dragon = (canvas, n=15, colors=["black", "white"]) => {
	FRACTAL.display_curve(canvas, FRACTAL.dragon_curve(n), colors);
}

FRACTAL.levy = (canvas, n=15, colors=["black", "white"]) => {
	FRACTAL.display_curve(canvas, FRACTAL.levy_curve(n), colors);
}

FRACTAL.mandelbrot = (canvas, n=15, colors=["black", "white"]) => {
	let ctx = canvas.getContext("2d");
	ctx.fillStyle = colors[0];
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = colors[1];
	let min = (canvas.width > canvas.height) ? canvas.height : canvas.width;
	let step = 4/min;
	for (let x=0; x <= min; x++) {
		for (let y=0; y <= min; y++) {
			let z = [0, 0];
			for (let i=0; i<n; i++) {
				z = FRACTAL._mandelbrot_set(z, [x*step-2.5, y*step-2]);
			}
			if (Math.abs(z[0]) + Math.abs(z[1]) < 16) {
				ctx.fillRect(x-(min-canvas.width)/2, y-(min-canvas.height)/2, 1, 1);
			}				
		}	
	}
}