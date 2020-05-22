import "./loaderScreen.css";
import lottie from "lottie-web";

const loaderLottieJson = require("../assets/loaderLottie.json");
const logoImage = require("../assets/Icon.jpg");
const {
  innerWidth,
  innerHeight
} = window
const loading = document.querySelector(".loading")
const spacingLeft =
  innerWidth > 500 ?
  innerWidth / 2 - 250 :
  innerWidth / 2 - loading.clientWidth / 2;
const spacingTop =
  innerHeight > 888 ?
  innerHeight / 2 - 444 :
  (innerHeight - loading.clientHeight) / 2;

export default function loader(gameContainerId) {
  let isLottieLoaded = false;
  const gameContainer = document.getElementById(gameContainerId);

  const loaderScreen = document.createElement("div");
  loaderScreen.className = "loader-screen";

  const logo = document.createElement("img");
  logo.className = "logo-image";
  logo.src = logoImage.default;

  loaderScreen.appendChild(logo);

  loaderScreen.style.left = spacingLeft;
  loaderScreen.style.top = spacingTop;
  // fallback loader
  // const spinLoader = document.createElement("div");
  // spinLoader.className = "spin-loader";

  // loaderScreen.appendChild(spinLoader);

  gameContainer.appendChild(loaderScreen);
  this.loaderScreen = loaderScreen;

  // load lottie
  const lottieContainer = document.createElement("div");
  lottieContainer.className = "lottie-loader-container";
  const loaderLottie = lottie.loadAnimation({
    container: lottieContainer, // the dom element that will contain the animation
    renderer: "svg",
    loop: false,
    autoplay: true,
    animationData: loaderLottieJson
  });
  loaderScreen.appendChild(lottieContainer);
  let currentFrameLimit = 0;

  loaderLottie.addEventListener("DOMLoaded", () => {
    // loaderScreen.removeChild(spinLoader);
    isLottieLoaded = true;
  }); // remove fallback once lottie is loaded

  loaderLottie.addEventListener("complete", () => {
    console.log("completed anims");
    gameContainer.removeChild(loaderScreen);
  });
  loaderLottie.addEventListener("enterFrame", e => {
    // console.log("enterFrame", e);
    if (loaderLottie.currentFrame > currentFrameLimit) {
      loaderLottie.pause();
    }
  });

  this.setLoaderProgress = function (precentage) {
    currentFrameLimit = precentage * loaderLottie.totalFrames;
    loaderLottie.play();
  };
  this.loadingComplete = function () {
    console.log("loading complete");
  };
}