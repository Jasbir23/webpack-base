import { Game, AUTO, Math as PhaserMath, BlendModes } from "phaser";
import "./index.css";
const { innerHeight, innerWidth } = window;

const startBut = document.querySelector(".start-but");
const startScreen = document.querySelector(".start-screen");

function commence() {
  const container = document.querySelector("#basket-ball");
  const restartScreen = document.querySelector(".restart-screen");
  const startScreen = document.querySelector(".start-screen");
  const restartBut = document.querySelector(".restart-button");
  const scoreDiv = document.querySelector(".score-val");
  const timerDiv = document.querySelector(".timer-val");
  const actionButton = document.querySelector(".action-button");

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const containerTop = (innerHeight - containerHeight) / 2;
  const containerLeft = (innerWidth - containerWidth) / 2;
  const ball = require("./assets/ball.png");
  const gameBG = require("./assets/BG.png");
  const startBG = require("./assets/loaderBackground.jpg");
  const ballShadow = require("./assets/shadow.png");
  const buttonBG =
    "https://res.cloudinary.com/princeofpersia/image/upload/v1579079521/yellowBack.png";
  const config = {
    type: AUTO,
    width: containerWidth,
    height: containerHeight,
    parent: container,
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
    physics: {
      default: "arcade",
    },
  };

  function preload() {
    var progressBar = this.add.graphics();
    var progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(
      0.25 * containerWidth,
      0.5 * containerHeight,
      0.5 * containerWidth,
      20
    );
    var width = this.cameras.main.width;
    var height = this.cameras.main.height;

    var percentText = this.make.text({
      x: containerWidth / 2,
      y: containerHeight / 2 + 50,
      text: "0%",
      style: {
        font: "18px monospace",
        fill: "#ffffff",
      },
    });
    percentText.setOrigin(0.5, 0.5);
    this.load.on("progress", function (value) {
      percentText.setText(parseInt(value * 100) + "%");
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        0.25 * containerWidth,
        0.5 * containerHeight,
        0.5 * containerWidth * value,
        20
      );
    });
    this.load.on("complete", function () {
      progressBar.destroy();
      progressBox.destroy();
      percentText.destroy();
      startScreen.style.display = "flex";

      scoreDiv.style.display = "flex";
      scoreDiv.style.top = 0.04 * containerHeight + containerTop;
      scoreDiv.style.right = 0.025 * containerWidth + containerLeft;

      timerDiv.style.display = "flex";
      timerDiv.style.top = 0.04 * containerHeight + containerTop;
      timerDiv.style.left = 0.025 * containerWidth + containerLeft;

      startBut.textContent = "START";
      restartBut.textContent = "RESTART";

      actionButton.style.display = "flex";
      actionButton.style.width = 0.5 * containerWidth;
      actionButton.style.height = 0.08 * containerHeight;
      actionButton.style.lineHeight = actionButton.style.height.toString();

      startBut.onclick = function () {
        startScreen.style.display = "none";
      };
    });
    this.load.image("assets", [startBG.default, ballShadow.default, buttonBG]);
    this.load.image("ball", ball.default);
    this.load.image("background", gameBG.default);
  }
  function create() {
    const BG = this.add.image(0, 0, "background");
    BG.setDisplaySize(containerWidth, containerHeight);
    BG.setOrigin(0, 0);
    console.log("here: ", BG);

    const ball = this.physics.add.image();
  }
  function update() {}
  function resetBall() {}
  new Game(config);
}
commence();
