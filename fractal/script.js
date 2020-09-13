const canvas = document.getElementById("fractal");

document.getElementById("dragon").addEventListener("mousedown", (evt) => {
	if (evt.button == 0) {
		let i = parseInt(document.getElementById("di").value);
		FRACTAL.dragon(canvas, i, ["#12141c","#b3943e"]);
	}
});

document.getElementById("levy").addEventListener("mousedown", (evt) => {
	if (evt.button == 0) {
		let i = parseInt(document.getElementById("li").value);
		FRACTAL.levy(canvas, i, ["#12141c","#b3943e"]);
	}
});

document.getElementById("mandelbrot").addEventListener("mousedown", (evt) => {
	if (evt.button == 0) {
		let i = parseInt(document.getElementById("mi").value);
		FRACTAL.mandelbrot(canvas, i, ["#12141c","#b3943e"]);
	}
});

FRACTAL.dragon(canvas, 15, ["#12141c","#b3943e"]);
