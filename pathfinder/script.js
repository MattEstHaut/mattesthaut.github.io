const grid = document.getElementById("grid");
const reader = document.getElementById("reader");
const max_s = 800;
var start = []; var end = [];
var startpoint_mode = false;
var endpoint_mode = false;
var mousedown = false;
var lc = "";

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
			grid_case.classList.add("path");
			grid_case.addEventListener("mousedown", (evt) => {
				if (startpoint_mode) {
					move_start(get_childindex(evt.path[0]),get_childindex(evt.path[1]));
					startpoint_mode = false;
				} else if (endpoint_mode) {
					remove_end(end[0], end[1]);
					add_end(get_childindex(evt.path[0]),get_childindex(evt.path[1]));
					endpoint_mode = false;
				} else {
					lc = evt.path[0].classList[0];
					if (evt.path[0].classList[0] == "path") {
						evt.path[0].classList.remove("path");
						evt.path[0].classList.add("wall");
					} else {
						evt.path[0].classList.add("path");
						evt.path[0].classList.remove("wall");
					}
				}
			});
			grid_case.addEventListener("mousemove", (evt) => {
				if (!startpoint_mode && !endpoint_mode) {
					if (mousedown && evt.path[0].classList[0]==lc && evt.path[0].classList[0]!="start" && evt.path[0].classList[0]!="end") {
						if (evt.path[0].classList[0] == "path") {
							evt.path[0].classList.remove("path");
							evt.path[0].classList.add("wall");
						} else {
							evt.path[0].classList.add("path");
							evt.path[0].classList.remove("wall");
						}
					}
				}
			});
			new_row.append(grid_case);
		}
		grid.append(new_row);
	}
}

const get_childindex = (child) => {
	let parent = child.parentNode;
	return Array.prototype.indexOf.call(parent.children, child);
}

const move_start = (x, y) => {
	if (start.length == 2) {
		grid.children[start[0]].children[start[1]].classList.remove("start");
	}
	let initial = grid.children[y].children[x].classList[0];
	grid.children[y].children[x].classList.remove(initial);
	grid.children[y].children[x].classList.add("start");
	grid.children[y].children[x].classList.add(initial);
	start = [y, x];
}

const add_end = (x, y) => {
	let initial = grid.children[y].children[x].classList[0];
	grid.children[y].children[x].classList.remove(initial);
	grid.children[y].children[x].classList.add("end");
	grid.children[y].children[x].classList.add(initial);
	end = [x, y];
}

const remove_end = (x, y) => {
	if (end.length == 2) {
		grid.children[y].children[x].classList.remove("end");
	}
}

const add_solution = (x, y) => {
	let initial = grid.children[y].children[x].classList[0];
	grid.children[y].children[x].classList.remove(initial);
	grid.children[y].children[x].classList.add("solution");
	grid.children[y].children[x].classList.add(initial);
}

const get_labyrinth = () => {
	let labyrinth = [];
	for (let row=0; row<grid.children.length; row++) {
		labyrinth.push([]);
		for (let grid_case of grid.children[row].children) {
			switch (grid_case.classList[0]) {
				case "path":
					labyrinth[row].push(" ");
					break;
				case "wall":
					labyrinth[row].push("#");
					break;
				case "start":
					labyrinth[row].push("S");
					break;
				default:
					labyrinth[row].push("E");
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
			setTimeout(() => {add_solution(path[step][1], path[step][0])}, 200*step);
		}
	}
}

var clear_path = () => {
	for (let row=0; row<grid.children.length; row++) {
		for (let column=0; column<grid.children[0].children.length; column++) {
			grid.children[row].children[column].classList.remove("solution");
		}
	}
}

PATHFINDER.import(reader, (labyrinth) => {
	initialize(labyrinth.length, labyrinth[0].length);
	for (let row=0; row<labyrinth.length; row++) {
		for (let column=0; column<labyrinth[0].length; column++) {
			if (labyrinth[row][column] == "#") {
				grid.children[row].children[column].classList.remove("path");
				grid.children[row].children[column].classList.add("wall");
			} else if (labyrinth[row][column] == "S") {
				grid.children[row].children[column].classList.remove("path");
				grid.children[row].children[column].classList.add("start");
				grid.children[row].children[column].classList.add("path");
			} else if (labyrinth[row][column] == "E") {
				grid.children[row].children[column].classList.remove("path");
				grid.children[row].children[column].classList.add("end");
				grid.children[row].children[column].classList.add("path");
			}
			
		}
	}
	for (let row=0; row<labyrinth.length; row++) {
		for (let column=0; column<labyrinth[0].length; column++) {
			if (labyrinth[row][column] == "S") {
				start = [row, column];
			}
		}
	}
})

document.getElementById("resolve").addEventListener("mousedown", () => {
	let solution = resolve();
	if (solution.solutions.length > 0) {
		show_path(solution.shortest);
	}
})

document.getElementById("startpoint").addEventListener("mousedown", () => {
	startpoint_mode = true;
})

document.getElementById("endpoint").addEventListener("mousedown", () => {
	endpoint_mode = true;
})

document.getElementById("init").addEventListener("mousedown", () => {
	let w = document.getElementById("w").value;
	let h = document.getElementById("h").value;
	initialize(w, h);
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
	clear_path();
	let labyrinth = get_labyrinth();
	PATHFINDER.export(labyrinth);
});

initialize(10, 10);