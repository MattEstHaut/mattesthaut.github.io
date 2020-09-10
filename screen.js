const SCREEN = window.SCREEN || {};

SCREEN.setup = (div, width, height, colors=["black", "#c99430"], pixel_s=16, pixel_e=4, delay=100) => {
	this.options = {
		div: div, width: width, height: height, pixel_s: pixel_s, pixel_e: pixel_e, colors: colors, delay: delay, avancement: 0
	}
	this.options.div.style.width = (this.options.pixel_s+this.options.pixel_e)*this.options.width+"px";
	this.options.div.style.height = (this.options.pixel_s+this.options.pixel_e)*this.options.height+"px";
	this.options.div.style.display = "flex";
	this.options.div.style.flexDirection = "column";
	this.options.div.style.justifyContent = "space-around";
	this.options.div.style.alignItems = "center";
	for (let row=0; row<this.options.height; row++) {
		let row_div = document.createElement("div");
		row_div.style.display = "flex";
		row_div.style.flexDirection = "row";
		row_div.style.justifyContent = "space-around";
		row_div.style.alignItems = "center";
		row_div.style.width = "100%";
		this.options.div.appendChild(row_div);
		for (let column=0; column<this.options.width; column++) {
			let pixel = document.createElement("div");
			pixel.style.height = this.options.pixel_s+"px";
			pixel.style.width = this.options.pixel_s+"px";
			pixel.style.borderRadius = this.options.pixel_s+"px";
			pixel.style.backgroundColor = this.options.colors[0];
			this.options.div.children[row].appendChild(pixel);
		}
	}
}

SCREEN.draw = (image) => {
	this.image = image;
}

SCREEN.update = () => {
	for (let row=0; row<this.options.height; row++) {
		for (let column=0; column<this.options.width; column++) {
			if (this.image[row][column-this.options.width+this.options.avancement]=="#") {
				this.options.div.children[row].children[column].style.backgroundColor = this.options.colors[1];
			} else {
				this.options.div.children[row].children[column].style.backgroundColor = this.options.colors[0];
			}
		}
	}
}

SCREEN.run = () => {
	var interval = setInterval(() => {
		SCREEN.update();
		if (this.options.avancement >= this.options.width+this.image[0].length) {
			this.options.avancement = 0;
		} else {
			this.options.avancement++;
		}
	}, this.options.delay);
}