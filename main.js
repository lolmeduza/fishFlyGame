class Game {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.ctx = context;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.baseHeight = 720;
    this.ratio = this.height / this.baseHeight;
    this.background = new Background(this);
    this.player = new Player(this);
    this.obstacles = [];
    this.numberOfObstacles = 1000;
    this.gravity;
    this.speed;
    this.minSpeed;
    this.maxSpeed;
    this.score;
    this.gameOver;
    this.bottomMargin;
    this.timer;
    this.message1;
    this.message2;
    this.eventTimer = 0;
    this.eventInterval = 150;
    this.eventUpdate = false;
    this.touchStartX;
    this.swipeDistance = 50;
    this.resize(window.innerWidth, window.innerHeight);

    window.addEventListener("resize", (e) => {
      this.resize(e.currentTarget.innerWidth, e.currentTarget.innerHeight);
    });

    // this.resetButton = document.getElementById("resetButton");
    // this.resetButton.addEventListener("click", (e) => {
    //   this.start();
    // });
    // this.fullScreenButton = document.getElementById("fullScreenButton");
    // this.fullScreenButton.addEventListener("click", (e) => {
    //   this.toggleFullScreen();
    // });

    //mouse
    this.canvas.addEventListener("mousedown", (e) => {
      this.player.flap();
    });
    this.canvas.addEventListener("mouseup", (e) => {
      this.player.wingsUp();
    });
    //keyboard controls
    window.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") this.player.flap();
      if (e.key === "Shift" || e.key.toLowerCase() === "c")
        this.player.startCharge();
      if (e.key.toLowerCase() === "f") this.toggleFullScreen();
      if (e.key.toLowerCase() === "r")
        this.resize(window.innerWidth, window.innerHeight);
    });
    window.addEventListener("keyup", (e) => {
      this.player.wingsUp();
    });
    //touch effects
    this.canvas.addEventListener("touchstart", (e) => {
      this.player.flap();
      this.touchStartX = e.changedTouches[0].pageX;
      if (this.gameOver) {
        this.resize(window.innerWidth, window.innerHeight);
      }
    });
    this.canvas.addEventListener("touchmove", (e) => {
      if (e.changedTouches[0].pageX - this.touchStartX > 50) {
        this.player.startCharge();
      }
    });
  }
  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    // this.ctx.fillStyle = "blue";
    this.ctx.font = "25px Bungee";
    this.ctx.textAlign = "right";
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "white";
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ratio = this.height / this.baseHeight;

    this.bottomMargin = Math.floor(50 * this.ratio);
    this.gravity = 0.15 * this.ratio;
    this.speed = 2 * this.ratio;
    this.minSpeed = this.speed;
    this.maxSpeed = this.speed * 5;
    this.background.resize();
    this.player.resize();
    this.createObstacles();
    this.obstacles.forEach((obstacle) => {
      obstacle.resize();
    });
    this.score = 0;
    this.gameOver = false;
    this.timer = 0;
  }
  render(deltaTime) {
    if (!this.gameOver) this.timer += deltaTime;
    // this.timer += deltaTime;
    this.handlePeriodicEvenents(deltaTime);
    this.background.update();
    this.background.draw();
    this.drawStatusText();
    this.player.update();
    this.player.draw();
    this.obstacles.forEach((obstacle) => {
      obstacle.update();
      obstacle.draw();
    });
  }
  createObstacles() {
    this.obstacles = [];
    const firstX = this.baseHeight * this.ratio;
    const obstacleSpacing = 600 * this.ratio;
    for (let i = 0; i < this.numberOfObstacles; i++) {
      this.obstacles.push(new Obstacle(this, firstX + i * obstacleSpacing));
    }
  }
  checkCollision(a, b) {
    const dx = a.collisionX - b.collisionX;
    const dy = a.collisionY - b.collisionY;
    const distance = Math.hypot(dx, dy);
    const sumOfRadii = a.collisionRadius + b.collisionRadius;
    return distance <= sumOfRadii;
  }
  formatTimer() {
    return (this.timer * 0.001).toFixed(1);
  }
  handlePeriodicEvenents(deltaTime) {
    if (this.eventTimer < this.eventInterval) {
      this.eventTimer += deltaTime;
      this.eventUpdate = false;
    } else {
      this.eventTimer = this.eventTimer % this.eventInterval;
      this.eventUpdate = true;
    }
  }
  drawStatusText() {
    this.ctx.save();
    this.ctx.fillText("Score: " + this.score, this.width - 10, 30);
    this.ctx.textAlign = "left";
    this.ctx.fillText("Timer: " + this.formatTimer(), 10, 30);
    if (this.gameOver) {
      if (this.player.collided) {
        this.message1 =
          "Getting rusty? Press Shift or swap on phone to use speedBOOST";
        this.message2 = "Collision time " + this.formatTimer() + "seconds!";
      } else if (this.obstacles.length <= 0) {
        this.message1 = "Nailed it";

        this.message2 =
          "Can you do it faster than " + this.formatTimer() + "seconds?";
      }
      this.ctx.textAlign = "center";
      this.ctx.font = "30px Bangee";
      this.ctx.fillText(
        this.message1,
        this.width * 0.5,
        this.height * 0.5 - 50
      );
      this.ctx.font = "25px Bangee";
      this.ctx.fillText(
        this.message2,
        this.width * 0.5,
        this.height * 0.5 - 20
      );
      this.ctx.font = "30px Bangee";
      this.ctx.fillText(
        'Press "R" to try again!',
        this.width * 0.5,
        this.height * 0.5 + 10
      );
    }
    if (this.player.energy <= this.player.minEnergy) this.ctx.fillStyle = "red";
    else if (this.player.energy >= this.player.maxEnergy)
      this.ctx.fillStyle = "orangered";
    for (let i = 0; i < this.player.energy; i++) {
      this.ctx.fillRect(
        10,
        this.height - 10 - this.player.barSize * i,
        this.player.barSize * 2,
        this.player.barSize
      );
    }
    this.ctx.restore();
  }
}

window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 720;
  canvas.height = 720;

  const game = new Game(canvas, ctx);

  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(deltaTime);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
});
