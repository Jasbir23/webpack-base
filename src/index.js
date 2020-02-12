import "./index.css";
import Matter from "matter-js";
import lottie from "lottie-web";
const Blowfish = require("egoroof-blowfish");
const {
	innerHeight: h,
	innerWidth: w
} = window;
import {
	GRAVITY,
	getUserURL,
	postResURL,
	INFINITE_MASS_RADIUS,
	BALL_POSITION_CHECK_THRES,
	ROTATION_FAC,
	RIM_HEIGHT,
	RANDOM_VX_FAC,
	RIM_WIDTH,
	RIM_LEFT,
	RIM_TOP,
	BOARD_WIDTH,
	BOARD_HEIGHT
} from './constants'
import {
	random,
	getParameterByName,
	sendResult
} from './utils'

var Engine = Matter.Engine,
	Body = Matter.Body,
	Render = Matter.Render,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Mouse = Matter.Mouse,
	Events = Matter.Events,
	MouseConstraint = Matter.MouseConstraint;

var isLoading = false;
var gameStarted = false;
var resultSend = false;
var timeStopped = true;
var time = 60;
var initialVx = 0;
var initialVy = 0;
var score = 0;
var ballRadius = w / 12;
var startX = 0;
var startY = 0;
var timerStart = 0;
var timerCurr = 0;
var startTime = null;
var endTime = null;
var dragTime = null;
var battleId = null;
var playerId = null;
var scaleThreshold = 0.015;
const loadingArr = [
	[0, 35],
	[35, 65],
	[65, 100],
	[100, 115]
];
var ballArray = []
var engine = Engine.create();

engine.world.gravity.y = GRAVITY;

var render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		width: w,
		height: h,
		wireframes: false
	}
});
render.options.background = "transparent";

var basketOptions = {
	isStatic: true,
	friction: 0.05,
	frictionAir: 0.006,
	frictionStatic: 0,
	restitution: 0.7,
	render: {
		fillStyle: "transparent"
	}
};

var left_point = Bodies.circle(RIM_LEFT, RIM_TOP, INFINITE_MASS_RADIUS, {
	isStatic: true,
	render: {
		fillStyle: "transparent"
	}
});

var right_point = Bodies.circle(
	RIM_LEFT + RIM_WIDTH - 2 * INFINITE_MASS_RADIUS,
	RIM_TOP,
	INFINITE_MASS_RADIUS, {
		isStatic: true,
		render: {
			fillStyle: "transparent"
		}
	}
);


var ground = Bodies.rectangle(w / 2, 0.75 * h, w, 0.06 * h, {
	isStatic: true,
	render: {
		fillStyle: "transparent"
	}
});

// add all of the bodies to the world
World.add(engine.world, [ground, left_point, right_point]);
var mouse = Mouse.create(render.canvas),
	mouseConstraint = MouseConstraint.create(engine, {
		mouse: mouse,
		constraint: {
			stiffness: 0.2,
			render: {
				visible: false
			}
		}
	});

const bf = new Blowfish("gamePind@12", Blowfish.MODE.ECB); // only key isn't optional

let params = new URL(document.location).searchParams;
battleId = params.get("battleId");
playerId = params.get("playerId");
getParameterByName(getUserURL, battleId, playerId);

function setFinalValue(event) {
	// Matter.World.remove(engine.world, ball)
	// console.log('here:  ', engine.world)
	if (ballArray[ballArray.length - 1].isMoving) return;
	var mousePosition = event.mouse.position;
	const {
		x,
		y
	} = ballArray[ballArray.length - 1].position;
	if (
		startX < x - ballRadius - 40 ||
		startX > x + ballRadius + 40 ||
		startY > y + ballRadius + 80 ||
		startY < y - ballRadius - 80 ||
		startY < mousePosition.y
	)
		return;
	let swipeLength = startY - mousePosition.y;
	swipeLength = swipeLength >= 250 ? 2.4 : (swipeLength * 2.4) / 250;

	initialVx =
		0.02 * (mousePosition.x - startX) +
		RANDOM_VX_FAC * (random(0, 1) > 0.5 ? 0.1 : -0.1);

	initialVy = swipeLength === 2.4 ? -0.03 * h : -8.3 * swipeLength;
	// fixing bug
	if (initialVy > -0.02 * h) initialVy = -0.023 * h;
	else initialVy = -0.03 * h;
	Body.set(ballArray[ballArray.length - 1], {
		isSensor: true,
		isStatic: false
	});
	Body.setVelocity(ballArray[ballArray.length - 1], {
		x: initialVx,
		y: initialVy
	});
	ballArray[ballArray.length - 1].rotation = initialVx * ROTATION_FAC;
	ballArray[ballArray.length - 1].isMoving = true;
	setTimeout(function () {
		createBall()
	}, 600);
}

Events.on(mouseConstraint, "mousedown", function (event) {
	if (!gameStarted && timeStopped) return;
	var mousePosition = event.mouse.position;
	startY = mousePosition.y;
	startX = mousePosition.x;
	startTime = new Date().getTime();
	endTime = null;
});

Events.on(mouseConstraint, "mousemove", function (event) {
	backgroundSound.volume = 0.5
	backgroundSound.play()
	if (!gameStarted && timeStopped) return;
	dragTime = new Date().getTime();
	// slideLottie.stop();
	if (!endTime && dragTime - startTime > 400) setFinalValue(event);
});

Events.on(mouseConstraint, "mouseup", function (event) {
	if (!gameStarted && timeStopped) return;

	endTime = new Date().getTime();
	setFinalValue(event);
});

Events.on(engine, "collisionStart", function (event) {
	// console.log('here: ', engine.world.bodies)
	ballArray.map((ball, index) => {
		if (!ball.isSensor &&
			ball.isMoving &&
			ball.velocity.y >= 0 &&
			ball.position.y < RIM_TOP + 2 * ballRadius
		) {
			rimLottie.playSegments([30, 45], true);
			ball.isCollided = true;
			rimLottie.setSpeed(1.5);
		} else if (ball.velocity.y > 0 && ball.position.y + ballRadius >= 0.6 * h) {
			ball.ballOnPlatform = true;
			bounceSound.playbackRate = 4;
			bounceSound.volume = 0.2;
			bounceSound.play();
			runOnBallOutsideViewPort(ball, index)
		}
	})
});

const scoreView = document.querySelector(".scoreVal");
const timerView = document.querySelector(".timerVal");
const scoreText = document.querySelector(".score");
scoreText.textContent = "Score";
const board = document.querySelector(".board");
board.src =
	"https://res.cloudinary.com/princeofpersia/image/upload/v1579348123/board.png";
board.style.height = BOARD_HEIGHT;
board.style.width = BOARD_WIDTH;
board.style.left =
	RIM_LEFT - INFINITE_MASS_RADIUS - (BOARD_WIDTH - RIM_WIDTH) / 2;
board.style.top = RIM_TOP + 4 * INFINITE_MASS_RADIUS - BOARD_HEIGHT;

const finalScore = document.querySelector(".finalScore");
const name = document.querySelector(".name");
finalScore.style.display = "none";
name.style.display = "none";

const plusTwo = document.querySelector(".plusTwo");
plusTwo.style.display = "none";

const timer = document.querySelector(".timer");
timer.textContent = "Time";
const gameOver = document.querySelector(".gameOver");
gameOver.style.display = "none";

var gameEndLottie = lottie.loadAnimation({
	container: gameOver,
	renderer: "svg",
	autoplay: false,
	loop: true,
	animationData: require("./assets/bouncyBall.json")
});

const swishSound = document.querySelector(".swishSound");
const backgroundSound = document.querySelector(".background");
const bounceSound = document.querySelector(".bounceSound");

const loading = document.querySelector(".loading");
const loadingBall = document.querySelector(".loadingBall");
var loadingLottie = lottie.loadAnimation({
	container: loadingBall,
	renderer: "svg",
	autoplay: false,
	loop: false,
	animationData: require("./assets/loading.json")
});
loadingLottie.playSegments(loadingArr[0], true);
loadingLottie.playSegments(loadingArr[1], false);
loadingLottie.playSegments(loadingArr[2], false);
loadingLottie.loop = true;
var loopComplete = false;
var domLoaded = false;
loadingLottie.addEventListener('loopComplete', function () {
	loopComplete = true
})
loadingLottie.addEventListener('DOMLoaded', function () {
	domLoaded = true
})
var interval = null;

function startGame() {
	loadingLottie.playSegments(loadingArr[3], false)
	loadingLottie.loop = false;
	loadingLottie.destroy();
	loading.style.display = "none";
	loadingBall.style.display = "none";
	createBall()
	isLoading = false;
	timerStart = new Date().getTime() / 1000;
	window.requestAnimationFrame(run);
	// slideLottie.setSpeed(0.2);
	// slideLottie.playSegments([0, 10], true);
}

const rim = document.querySelector(".rim");
var rimLottie = lottie.loadAnimation({
	container: rim,
	renderer: "svg",
	autoplay: false,
	loop: false,
	animationData: require("./assets/net.json")
});
rimLottie.goToAndStop(0, true);

rim.style.height = RIM_HEIGHT;
rim.style.width = RIM_WIDTH;
rim.style.left = left_point.position.x - INFINITE_MASS_RADIUS;
rim.style.top = left_point.position.y - 2 * INFINITE_MASS_RADIUS;
rim.style.borderRadius = `${INFINITE_MASS_RADIUS}px`;


function createBall() {
	var ball1 = Bodies.circle(random(2.5 * ballRadius, w - 2.5 * ballRadius), 0.92 * h, ballRadius, basketOptions);
	ballArray.push(ball1)
	ballArray[ballArray.length - 1].isCollided = false
	ballArray[ballArray.length - 1].ballAboveBasket = false
	ballArray[ballArray.length - 1].ballOnPlatform = false
	ballArray[ballArray.length - 1].isMoving = false
	ballArray[ballArray.length - 1].scale = 1.5
	ballArray[ballArray.length - 1].rotation = 0
	ballArray[ballArray.length - 1].velSet = false
	World.add(engine.world, ballArray[ballArray.length - 1])
	var ballChild = document.createElement("span")
	document.getElementById("ball") && document.getElementById("ball").appendChild(ballChild);
	ballChild.style.height = 2 * ballArray[ballArray.length - 1].circleRadius;
	ballChild.style.width = 2 * ballArray[ballArray.length - 1].circleRadius;
	ballChild.style.borderRadius = `${ballArray[ballArray.length - 1].circleRadius}px`;
	ballChild.style.opacity = 1;
	ballChild.style.transform = `rotate(${ballArray[ballArray.length - 1].rotation}deg) scale(${ballArray[ballArray.length - 1].scale})`;
	ballChild.style.left = ballArray[ballArray.length - 1].position.x - ballArray[ballArray.length - 1].circleRadius;
	ballChild.style.top = ballArray[ballArray.length - 1].position.y - ballArray[ballArray.length - 1].circleRadius;
}

function removeBall(index) {
	World.remove(engine.world, ballArray[index])
	ballArray.splice(index, 1)
	if (document.getElementById("ball") && document.getElementById("ball").childNodes[index])
		document.getElementById('ball').removeChild(document.getElementById("ball").childNodes[index])
}

const slide = document.querySelector(".slide");
// slide.style.left = ballArray[0].position.x - 0.1 * w;
// slide.style.top = ballArray[0].position.y - 0.25 * h;
// var slideLottie = lottie.loadAnimation({
// 	container: slide,
// 	renderer: "svg",
// 	autoplay: false,
// 	loop: true,
// 	animationData: require("./assets/slide.json")
// });
// slideLottie.goToAndStop(0, true);

const leftPoint = document.querySelector(".leftPoint");
leftPoint.style.height = 2 * INFINITE_MASS_RADIUS;
leftPoint.style.width = 2 * INFINITE_MASS_RADIUS;
leftPoint.style.borderRadius = `${INFINITE_MASS_RADIUS}px`;
leftPoint.style.left = left_point.position.x - INFINITE_MASS_RADIUS;
leftPoint.style.top = left_point.position.y - INFINITE_MASS_RADIUS;

const rightPoint = document.querySelector(".rightPoint");
rightPoint.style.height = 2 * INFINITE_MASS_RADIUS;
rightPoint.style.width = 2 * INFINITE_MASS_RADIUS;
rightPoint.style.borderRadius = `${INFINITE_MASS_RADIUS}px`;
rightPoint.style.left = right_point.position.x - INFINITE_MASS_RADIUS;
rightPoint.style.top = right_point.position.y - INFINITE_MASS_RADIUS;

var interval = setInterval(function () {
		if (!domLoaded || !loopComplete) return;
		startGame();
		clearInterval(interval)
	},
	100)

function runOnBasketSuccess(ball, ) {
	if (
		ball.isMoving &&
		ball.ballAboveBasket &&
		ball.position.x > left_point.position.x + INFINITE_MASS_RADIUS &&
		ball.position.x < right_point.position.x - INFINITE_MASS_RADIUS &&
		ball.position.y - ball.circleRadius >
		left_point.position.y + INFINITE_MASS_RADIUS
	) {
		ball.ballAboveBasket = false;
		rimLottie.setSpeed(3);
		rimLottie.playSegments([0, 30], true);
		plusTwo.textContent = ball.isCollided ? "+1" : "+2";
		plusTwo.style.display = "initial";
		setTimeout(function () {
			plusTwo.style.display = "none"
		}, 1000)
		score = ball.isCollided ? score + 1 : score + 2;
	}
}

function runOnBallOutsideViewPort(ball, index) {
	if (
		ball.position.x < 0 - ballRadius - BALL_POSITION_CHECK_THRES ||
		ball.position.x > w + ballRadius + BALL_POSITION_CHECK_THRES ||
		ball.position.y > h + ballRadius + 10 * BALL_POSITION_CHECK_THRES
	) {
		removeBall(index)
	}
}

function run() {
	timerCurr = new Date().getTime() / 1000;
	var scoreText = ("0" + score).slice(-3);
	scoreView.textContent = `SCORE: ${scoreText}`;
	if (timerCurr - timerStart >= 1) {
		timerStart = timerCurr;
		gameStarted = true;
		timeStopped = false;
		time !== 0 && gameStarted && time--;
		if (time === 0) {
			timeStopped = true;
			gameEndLottie.play();
			document.getElementById('ball') && document.getElementById('ball').remove();
		}

		if (gameStarted && timeStopped) {
			// slideLottie.stop();
			// ballView.style.display = "none";
			gameOver.style.display = "initial";
			var gameEndContainer = document.querySelector(".gameEndContainer");
			gameEndContainer.style.opacity = 0.6;
			gameEndContainer.style.display = "initial";
			name.style.display = "initial";
			finalScore.style.display = "initial";
			finalScore.textContent = `SCORE: ${score}`;
			let res = {
				battleId: battleId,
				result: {
					id: playerId,
					score
				}
			};
			!resultSend && playerId && battleId && sendResult(res, postResURL, bf);

		}
	}

	timerView.textContent = `TIME: ${time}`;
	ballArray.map((ball, index) => {
		var ballView = document.getElementById("ball") && document.getElementById("ball").childNodes[index]
		if (!ballView) return
		Body.set(ball, {
			circleRadius: ballRadius * ball.scale
		});
		ballView.style.transform = `rotate(${ball.rotation}deg) scale(${ball.scale})`;
		ball.rotation = ball.rotation + 3 * ball.velocity.x;
		ballView.style.left = ball.position.x - ball.circleRadius;
		ballView.style.top = ball.position.y - ball.circleRadius;

		if (ball.isMoving) {
			ballView.style.boxShadow = "0px 15px 10px -15px #111";
		} else {
			ballView.style.boxShadow = "0px 15px 10px -10px #111";
		}
		if (ball.ballOnPlatform && ballView.style.opacity >= 0.1) {
			ballView.style.opacity = ballView.style.opacity - 0.02;
		} else if (ball.ballOnPlatform && ballView.style.opacity <= 0.1) {
			removeBall(index)
		}
		if (
			ball.isMoving &&
			ball.position.y + ball.circleRadius <
			left_point.position.y - INFINITE_MASS_RADIUS &&
			ball.velocity.y >= 0
		) {
			Body.set(ball, {
				isSensor: false
			});
			ballView.style.zIndex = -2;
			ball.isCollided = false;
			ball.ballAboveBasket = true;
		}

		if (ball.velocity.y > 0) {
			Body.set(ball, {
				isSensor: false
			});
		}
		if (
			ball.isMoving &&
			ball.velocity.y >= 0 &&
			ball.position.y - ballRadius >
			left_point.position.y + INFINITE_MASS_RADIUS + RIM_HEIGHT
		) {
			ballView.style.zIndex = -2;
		}
		if (
			ball.isMoving &&
			ball.position.y > RIM_TOP &&
			ball.velocity.y > 0 &&
			ball.position.x > RIM_LEFT &&
			ball.position.x < RIM_LEFT + RIM_WIDTH &&
			!ball.velSet &&
			initialVy === -0.03 * h
		) {
			Body.setVelocity(ball, {
				x: 0,
				y: ball.velocity.y
			});
			ball.velSet = true;
		}
		if (ball.scale > 1 && ball.isMoving) {
			if (initialVy === 0.02 * h) scaleThreshold = 0.03;
			else scaleThreshold = 0.015;
			ball.scale = ball.scale - scaleThreshold < 1 ? 1 : ball.scale - scaleThreshold;
		}

		//check if ball is outside viewport
		runOnBallOutsideViewPort(ball, index)

		// if (
		// 	ball.isMoving &&
		// 	ball.ballAboveBasket &&
		// 	ball.position.x > left_point.position.x + INFINITE_MASS_RADIUS &&
		// 	ball.position.x < right_point.position.x - INFINITE_MASS_RADIUS &&
		// 	ball.position.y > left_point.position.y - INFINITE_MASS_RADIUS
		// ) {
		// 	swishSound.play();
		// 	swishSound.playbackRate = 1;
		// 	swishSound.volume = 0.7;
		// }

		//check if basket is succesfull
		runOnBasketSuccess(ball, ballView)

	})
	Engine.update(engine, 0);
	window.requestAnimationFrame(run);
}
Matter.Runner.run(engine)
render.mouse = mouse;

Render.run(render);