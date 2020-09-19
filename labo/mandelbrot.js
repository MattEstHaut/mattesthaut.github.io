mandelbrot_set = (z, c) => {
	return [z[0]**2-z[1]**2+c[0], 2*z[0]*z[1]+c[1]];
}

mandelbrot = (canvas, n=15, colors=["black", "white"], scale=1, center=[0,0]) => {
	let ctx = canvas.getContext("2d");
	ctx.fillStyle = colors[0];
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = colors[1];

	let demi_w = canvas.width/2; let demi_h = canvas.height/2;
	let d_w = canvas.width/4*scale; let d_h = canvas.height/4*scale;

	for (let x=0; x <= canvas.width; x++) {
		for (let y=0; y <= canvas.height; y++) {
			let z = [0, 0];
			for (let i=0; i<n; i++) {
				z = mandelbrot_set(z, [(x-demi_w)/d_w+center[0], (y-demi_h)/d_h+center[1]]);
				if (Math.abs(z[0]) + Math.abs(z[1]) > 2) {
					let colors = color(i);
					ctx.fillStyle = "rgb("+ parseInt(100*(Math.cos(i/50)/2)) +", "+ parseInt(255*i/n) +", "+ parseInt(100*(Math.cos(i/50)/2)) +")";
					//ctx.fillStyle = "rgb("+ parseInt(255*i/n) +", "+ parseInt(255*i/n) +", "+ parseInt(255*i/n) +")";
					ctx.fillRect(x, y, 1, 1);
					break;
				}
			}
		}	
	}
}

color = (i) => {
	return [255*(1-Math.sin(i))/2, 255*(1-Math.cos(i))/2, 255*(1-Math.cos(i))/2]
}

mandelbrot_o_pixel = (ctx, x, y, n, demi_w, demi_h, d_w, d_h, center) => {
	let z = [0, 0];
	for (let i=0; i<n; i++) {
		z = mandelbrot_set(z, [(x-demi_w)/d_w+center[0], (y-demi_h)/d_h+center[1]]);
		if (Math.abs(z[0]) + Math.abs(z[1]) > 2) {
			let colors = color(i);
			ctx.fillStyle = "rgb("+ parseInt(100*(Math.cos(i/50)/2)) +", "+ parseInt(255*i/n) +", "+ parseInt(100*(Math.cos(i/50)/2)) +")";
			//ctx.fillStyle = "rgb("+ parseInt(255*i/n) +", "+ parseInt(255*i/n) +", "+ parseInt(255*i/n) +")";
			ctx.fillRect(x, y, 1, 1);
			break;
		}
	}
}

mandelbrot_o = async (canvas, n=15, colors=["black", "white"], scale=1, center=[0,0]) => {
	let ctx = canvas.getContext("2d");
	ctx.fillStyle = colors[0];
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = colors[1];

	let demi_w = canvas.width/2; let demi_h = canvas.height/2;
	let d_w = canvas.width/4*scale; let d_h = canvas.height/4*scale;

	for (let x=0; x <= canvas.width; x++) {
		for (let y=0; y <= canvas.height; y++) {
			mandelbrot_o_pixel(ctx, x, y, n, demi_w, demi_h, d_w, d_h, center);
		}	
	}
}