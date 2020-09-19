const canvas = document.getElementById("mandelbrot");
var X = -0.743643887037151; var Y = -0.13182590420533; var S = 1; var N = 1000; AUTO = false;


var gif = new GIF({
  workers: 1,
  quality: 1,
  width: 1000,
  height: 1000
});

gif.on('finished', function(blob) {
  window.open(URL.createObjectURL(blob));
});

const noob_draw = (s, n) => {
	let start = Date.now();
	mandelbrot(canvas, n, ["black","white"], s, [X, Y]);
	return (Date.now()-start)/1000;
}

const draw = (x, y, s, n=150) => {
	mandelbrot_o(canvas, n, ["black","white"], s, [x, y]);
}

for (let img=0; img<10; img++) {
	noob_draw(S, 200);
	S *= 1.01;
	gif.addFrame(canvas, {delay: 33});
	console.log(img);
}
gif.render();

/*
//draw(0, 0, 1, 500);

setInterval(() => {
	if (AUTO) {
		draw(X, Y, S, N);
	S *= 1.1;
	}
	
	N += 5;
	if (N > 1000) {
		N = 1000;
	}
}, 500);
*/