const grid = document.getElementById("grid");
const reader = document.getElementById("reader");

const max_s = 800;
var start = [];
var startpoint_mode = false;
var endpoint_mode = false;
var mousedown = false;
var lc = -1;

const initialize = (width, height) => {
	grid.innerHTML = "";
	let second_scale = (width > height) ? height/width: width/height;
	let grid_width = (width > height) ? max_s : Math.floor(max_s*second_scale);
	let grid_height = (width < height) ? max_s : Math.floor(max_s*second_scale);
	let row_height = Math.floor(grid_height/height);
	let case_side = Math.floor(row_height*0.95);
	let case_border = Math.floor(case_side/10);
	grid.style.height = grid_height+"px";
	grid.style.width = grid_width+"px";
	for (let row=0; row < height; row++) {
		let new_row = document.createElement("div");
		new_row.style.height = row_height+"px";
		new_row.style.width = grid_width+"px";
		for (let column=0; column<width; column++) {
			let grid_case = document.createElement("div");
			grid_case.style.height = case_side+"px";
			grid_case.style.width = case_side+"px";
			grid_case.style.borderRadius = case_border+"px";
			grid_case.classList.add("wall");
			grid_case.addEventListener("mousedown", (evt) => {
				if (startpoint_mode) {
					move_start(get_childindex(evt.path[0]),get_childindex(evt.path[1]));
					startpoint_mode = false;
				} else if (endpoint_mode) {
					if (evt.path[0].classList.contains("end")) {
						change(evt.path[0], "end", "");
					} else {
						change(evt.path[0], "", "end");
					}
					endpoint_mode = false;
				} else {
					lc = evt.path[0].classList[0];
					if (evt.path[0].classList[0] == "path") {
						change(evt.path[0], "path", "wall");
					} else {
						change(evt.path[0], "wall", "path");
					}
				}
			});
			grid_case.addEventListener("mousemove", (evt) => {
				if (!startpoint_mode && !endpoint_mode) {
					if (mousedown && evt.path[0].classList[0]==lc && evt.path[0].classList[0]!="start" && evt.path[0].classList[0]!="end") {
						if (evt.path[0].classList[0] == "path") {
							change(evt.path[0], "path", "wall");
						} else {
							change(evt.path[0], "wall", "path");
						}
					}
				}
			});
			new_row.append(grid_case);
		}
		grid.append(new_row);
	}
}

const reinitialize = () => {
	for (let row=0; row < grid.children.length; row++) {
		for (let column=0; column < grid.children[row].children.length; column++) {
			setTimeout(() => {
				change(grid.children[row].children[column], "all", "wall");
			}, Math.random()*500);
		}
	}
};

const get_childindex = (child) => {
	let parent = child.parentNode;
	return Array.prototype.indexOf.call(parent.children, child);
}

const move_start = (x, y) => {
	if (start.length == 2) {
		change(grid.children[start[0]].children[start[1]], "start", "");
	}
	let initial = grid.children[y].children[x].classList[0];
	change(grid.children[y].children[x], initial, "start");
	setTimeout(() => {
		grid.children[y].children[x].classList.add(initial);
	}, 650);
	start = [y, x];
}

const add_solution = (x, y) => {
	change(grid.children[y].children[x], "", "solution");
}

const get_labyrinth = () => {
	let labyrinth = [];
	for (let row=0; row<grid.children.length; row++) {
		labyrinth.push([]);
		for (let grid_case of grid.children[row].children) {
			switch (grid_case.classList[0]) {
				case "path":
					labyrinth[row].push(0);
					break;
				case "wall":
					labyrinth[row].push(1);
					break;
				case "start":
					labyrinth[row].push(2);
					break;
				default:
					labyrinth[row].push(3);
			}
		}
	}
	return labyrinth;
}

const resolve = () => {
	return PATHFINDER.resolve(get_labyrinth());
}

const show_path = (path) => {
	for (let step=0; step<path.length; step++) {
		if (path[step].length == 2) {
			setTimeout(() => {add_solution(path[step][1], path[step][0])}, 2000/path.length*step);
		}
	}
}

var clear_path = () => {
	for (let row=0; row<grid.children.length; row++) {
		for (let column=0; column<grid.children[0].children.length; column++) {
			if (grid.children[row].children[column].classList.contains("solution")) {
				setTimeout(() => {
					change(grid.children[row].children[column], "solution", "");
				}, Math.random()*500);
			}
		}
	}
}

const change = (element, old, c) => {
	let initial = element.classList[0];
	element.style.transitionDuration = "0.2s";
	element.classList.add("r1");
	setTimeout(() => {
		element.style.transitionDuration = "0s";
		if (old != "")
			element.classList.remove(old);
		if (old == "all") {
			element.classList.remove("solution");
			element.classList.remove("start");
			element.classList.remove("end");
			element.classList.remove("wall");
			element.classList.remove("path");
		}
		if (c != "")
			element.classList.add(c);
		element.classList.remove("r1");
		element.style.transitionDuration = "0.2s";
		element.classList.add("r2");
	}, 200);
	setTimeout(() => {
		element.style.transitionDuration = "0s";
		element.classList.remove("r2");
	}, 400);
}

const impossible = () => {
	for (let row=0; row < grid.children.length; row++) {
		for (let column=0; column < grid.children[row].children.length; column++) {
			grid.children[row].children[column].style.transitionDuration = "0.1s";
			grid.children[row].children[column].classList.add("impossible");
			setTimeout(() => {
				grid.children[row].children[column].classList.remove("impossible");
			}, 100);
			setTimeout(() => {
				grid.children[row].children[column].classList.add("impossible");
			}, 200);
			setTimeout(() => {
				grid.children[row].children[column].classList.remove("impossible");
				grid.children[row].children[column].style.transitionDuration = "0";
			}, 300);
		}
	}	
}


PATHFINDER.import(reader, (labyrinth) => {
	initialize(labyrinth.length, labyrinth[0].length);
	for (let row=0; row<labyrinth.length; row++) {
		for (let column=0; column<labyrinth[0].length; column++) {
			if (labyrinth[row][column] == 0) {
				change(grid.children[row].children[column], "wall", "path");
			} else if (labyrinth[row][column] == 2) {
				change(grid.children[row].children[column], "wall", "start");
			} else if (labyrinth[row][column] == 3) {
				change(grid.children[row].children[column], "wall", "end");
			}
			
		}
	}
	for (let row=0; row<labyrinth.length; row++) {
		for (let column=0; column<labyrinth[0].length; column++) {
			if (labyrinth[row][column] == 2) {
				start = [row, column];
			}
		}
	}
})

document.getElementById("resolve").addEventListener("mousedown", () => {
	let solution = resolve();
	if (solution.length > 0) {
		show_path(solution);
	} else {
		impossible();
	}
})

document.getElementById("startpoint").addEventListener("mousedown", () => {
	startpoint_mode = true;
})

document.getElementById("endpoint").addEventListener("mousedown", () => {
	endpoint_mode = true;
})

document.getElementById("init").addEventListener("mousedown", () => {
	document.getElementById("init").innerHTML = "reset";
	let w = document.getElementById("w").value;
	let h = document.getElementById("h").value;
	start = []; end = [];
	if (h == grid.children.length && w == grid.children[0].children.length) {
		reinitialize();
	} else {
		initialize(w, h);
	}
})

document.getElementById("w").addEventListener("change", () => {
	document.getElementById("init").innerHTML = "initialize";
})

document.getElementById("h").addEventListener("change", () => {
	document.getElementById("init").innerHTML = "initialize";
})

document.getElementById("clear").addEventListener("mousedown", () => {
	clear_path();
})

grid.addEventListener("mousedown", (evt) => {
	if (evt.button == 0) {
		mousedown = true;
	}
})

grid.addEventListener("mouseup", (evt) => {
	if (evt.button == 0) {
		mousedown = false;
		lc = "";
	}
})

document.getElementById("export").addEventListener("mousedown", () => {
	let labyrinth = get_labyrinth();
	PATHFINDER.export(labyrinth);
});

initialize(10, 10);