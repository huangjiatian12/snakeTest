class Map {
  constructor(el, rect = 10) {
    this.el = el;
    this.rect = rect;
    this.data = [];
    let rows = Math.ceil(Map.getStyle(el, "width") / rect);
    let columns = Math.ceil(Map.getStyle(el, "height") / rect);
    this.rows = rows; // * 横轴
    this.columns = columns; // * 纵轴
    Map.setStyle(el, "width", rows * rect);
    Map.setStyle(el, "height", columns * rect);
  }
  static getStyle(el, attr) {
    return parseFloat(getComputedStyle(el)[attr]);
  }
  static setStyle(el, attr, value) {
    el.style[attr] = value + "px";
  }
  setData(newData) {
    this.data = this.data.concat(newData);
  }
  clearData() {
    this.data.length = 0;
  }
  include({ x, y }) {
    return this.data.some((item) => item.x == x && item.y == y);
  }
  render() {
    this.el.innerHTML = this.data.map((item) => {
      let { x, y, color } = item;
      x *= this.rect;
      y *= this.rect;
      return `<span class="block" style="width:${this.rect}px;height:${this.rect}px;left:${x}px;top:${y}px;background-color:${color};"></span>`;
    });
  }
}

class Food {
  constructor(rows = 10, columns = 10, colors = ["red", "blue", "yellow", "pink", "#dddddd"]) {
    this.rows = rows;
    this.columns = columns;
    this.data = null;
    this.colors = colors;
    this.create();
  }
  create() {
    let x = this.createRandom(0, this.rows - 1);
    let y = this.createRandom(0, this.columns - 1);
    let color = this.colors[this.createRandom(0, this.colors.length - 1)];
    this.data = { x, y, color };
  }
  createRandom(min, max) {
    switch (arguments.length) {
      case 1:
        return parseInt(Math.random() * min + 1, 10);
      case 2:
        return parseInt(Math.random() * (max - min + 1) + min, 10);
      default:
        return 0;
    }
  }
}

class Snake {
  constructor() {
    this.data = [
      {
        x: 8,
        y: 4,
        color: "green",
      },
      {
        x: 7,
        y: 4,
        color: "#fff",
      },
      {
        x: 6,
        y: 4,
        color: "#fff",
      },
      {
        x: 5,
        y: 4,
        color: "#fff",
      },
      {
        x: 4,
        y: 4,
        color: "#fff",
      },
    ];
    this.direction = "right";
  }
  move() {
    let len = this.data.length - 1;
    this.lastData = {
      x: this.data[len].x,
      y: this.data[len].y,
      color: this.data[len].color,
    };
    for (let i = len; i > 0; i--) {
      this.data[i].x = this.data[i - 1].x;
      this.data[i].y = this.data[i - 1].y;
    }
    switch (this.direction) {
      case "left":
        console.log("left")
        this.data[0].x--;
        break;
      case "right":
        console.log("right")
        this.data[0].x++;
        break;
      case "up":
        console.log("up")
        this.data[0].y--;
        break;
      case "down":
        console.log("down")
        this.data[0].y++;
        break;
    }
  }
  changeDir(dir) {
    console.log(dir, 'dir')
    if (this.direction === "left" || this.direction === "right") {
      if (dir === "left" || dir === "right") return false;
    } else {
      if (dir === "up" || dir === "bottom") return false;
    }
    this.direction = dir;
    return true;
  }
  eatFood() {
    this.data.push(this.lastData);
  }
}

class Game {
  constructor(el, rect, toControl = null, toGrade = null, toOver = null, toWin = null) {
    this.step = 0.95
    this.grade = 0
    this.map = new Map(el, rect);
    this.food = new Food(this.map.rows, this.map.columns);
    this.snake = new Snake();
    this.createFood()
    this.render()
    // this.map.setData(this.snake.data)
    // this.map.setData(this.food.data)
    // this.map.render();
    this.timer = 0;
    this.interval = 200;
    this.toControl = toControl;
    this.toGrade = toGrade
    this.toWin = toWin
    this.toOver = toOver
    this.keyDown = this.keyDown.bind(this);
    this.control();
  }
  createFood() {
    this.food.create()
    if (this.map.include(this.food.data)) {
      this.createFood();
    }
  }
  start() {
    this.move();
  }
  pause() {
    clearInterval(this.timer);
  }
  render() {
    this.map.clearData()
    this.map.setData(this.snake.data)
    this.map.setData(this.food.data)
    this.map.render();
  }
  move() {
    this.pause();
    this.timer = setInterval(() => {
      this.snake.move();
      // this.map.clearData();
      if (this.isEat()) {
        this.grade++
        this.snake.eatFood()
        this.createFood()
        this.changeGrade(this.grade)
        this.interval *= this.step
        this.pause()
        this.start()
        if (this.grade >= 100) {
          this.over(1)
          return
        }
      }
      if (this.isOver()) {
        this.over(0)
        return
      }
      this.render()
      // this.map.setData(this.snake.data);
      // this.map.setData(this.food.data);
      // this.map.render();
    }, this.interval);
  }
  isEat() {
    return this.snake.data[0].x === this.food.data.x && this.snake.data[0].y === this.food.data.y;
  }
  isOver() {
    let snakeHead = this.snake.data[0]
    if (snakeHead.x < 0 || snakeHead.x >= this.map.rows || snakeHead.y < 0 || snakeHead.y >= this.map.columns) return true
    for (let i = 1; i < this.snake.data.length; i++) {
      if (snakeHead.x === this.snake.data[i].x && snakeHead.y == this.snake.data[i].y) return true
    }
    return false
  }
  over(overStatus = 0) {
    if (overStatus) {
      this.toWin && this.toWin()
    } else {
      this.toOver && this.toOver()
    }
    this.pause()
  }
  keyDown({ keyCode }) {
    let isDir;
    switch (keyCode) {
      case 37:
        isDir = this.snake.changeDir("left");
        break;
      case 38:
        isDir = this.snake.changeDir("up");
        break;
      case 39:
        isDir = this.snake.changeDir("right");
        break;
      case 40:
        isDir = this.snake.changeDir("down");
        break;
    }
    console.log(isDir);
  }
  control() {
    if (this.toControl) {
      this.toControl();
      return;
    }
    window.addEventListener("keydown", this.keyDown);
  }
  addControl(fn) {
    fn.call(this);
    window.removeEventListener("keydown", this.keyDown);
  }

  changeGrade(grade) {
    this.toGrade && this.toGrade(grade)
  }
}
