'use strict';

let Graphics = (function() {
    let canvas = document.getElementById('canvas');
    let context = canvas.getContext('2d');

    canvas.width = 700;
    canvas.height = 500;

    CanvasRenderingContext2D.prototype.clear = function() {
		this.save();
		this.setTransform(1, 0, 0, 1, 0, 0);
		this.clearRect(0, 0, canvas.width, canvas.height);
		this.restore();
	};

    function clear() {
        context.clear();
    }

    function drawText(spec) {
        context.save();
        context.beginPath();
        context.font = spec.font;
        context.fillStyle = spec.color;
        context.fillText(spec.text, spec.x, spec.y);
        context.fill();
        context.restore();
    }

    function drawBall(spec) {
        context.save();
        context.beginPath();
        context.arc(spec.x, spec.y, spec.radius, 0, Math.PI * 2);
        context.fillStyle = spec.color;
        context.fill();
        context.restore();
    }

    function drawSquare(spec) {
        context.save();
        context.beginPath();
        context.rect(spec.x, spec.y, spec.width, spec.height);
        context.fillStyle = spec.color;
        context.fill();
        context.restore();
    }

    function finishDraw() {
        context.closePath();
        context.restore();
    }

    function drawImage(spec) {
		context.save();
		
		context.translate(spec.center.x, spec.center.y);
		context.rotate(spec.rotation);
		context.translate(-spec.center.x, -spec.center.y);
		
		context.drawImage(
			spec.image, 
			spec.center.x - spec.size / 2, 
			spec.center.y - spec.size / 2,
			spec.size, spec.size);
		
		context.restore();
	}

    return {
        clear: clear,
        drawBall: drawBall,
        drawSquare: drawSquare,
        drawText: drawText,
        width: canvas.width,
        height: canvas.height,
        finishDraw: finishDraw,
        drawImage: drawImage,
    }
}());

let GameEngine = (function() {

    let canvas = null;
    let breakout = null;
    let rightPressed = false;
    let leftPressed = false;
    let timer = 3;
    let lastRender = 0;
    let timerElapsedTime = 0;
    let graphics;
    let particlesFire;
    let particlesSmoke;
    let storage = Storage;
    let previousState;

    function initialize() {
        graphics = Graphics;

        particlesFire = ParticleSystem({
            image : 'images/fire.png',
            center: {x: 300, y: 300},
            speed: {mean: 50, stdev: 25},
            lifetime: {mean: 1.0, stdev: 0.25}
        },
            graphics
        );

		// Another particle system for the smoke particles
		particlesSmoke = ParticleSystem( {
			image : 'images/smoke.png',
			center: {x: 300, y: 300},
			speed: {mean: 50, stdev: 25},
			lifetime: {mean: 1.0, stdev: 0.25}
		},
		    graphics
        );

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        run();
        requestAnimationFrame(gameloop);
        // document.addEventListener('mousemove', onMouseMove)
    }

    function onMouseMove(event) {
        let relativeX = event.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            breakout.paddle.x = relativeX - breakout.paddle.width / 2;
        }
    }

    function onKeyDown(event) {
        if (event.keyCode === 39) {
            rightPressed = true;
        } else if (event.keyCode === 37) {
            leftPressed = true;
        }
    }

    function togglePause() {
        if (breakout.status === GameStatus.PAUSED) {
            breakout.status = previousState;
        } else {
            previousState = breakout.status;
            breakout.status = GameStatus.PAUSED;
        }
    }

    function onKeyUp(event) {
        if (event.keyCode === 39) {
            rightPressed = false;
        } else if (event.keyCode === 37) {
            leftPressed = false;
        } else if (event.keyCode === 27) { // esc
            togglePause();
        }
    }

    function run() {
        timer = 3;
        breakout = new Breakout(graphics.width, graphics.height);
    }

    function gameloop(timestamp) {
        let progress = timestamp - lastRender;

        update(progress);
        render();

        lastRender = timestamp;
        requestAnimationFrame(gameloop);
    }

    function update(elapsedTime) {

        if (breakout.status === GameStatus.PAUSED) {
            return;
        }

        particlesFire.update(elapsedTime);
        particlesSmoke.update(elapsedTime);

        if (breakout.status === GameStatus.GAMEOVER) {
            storage.add(breakout.score);
            return;
        }

        if (rightPressed && breakout.paddle.x < breakout.width - breakout.paddle.width) {
            breakout.paddle.x += 9;
        } else if (leftPressed && breakout.paddle.x > 0) {
            breakout.paddle.x -= 9;
        }

        if (breakout.status === GameStatus.ONGOING) {
            // breakout.updateBallPosition();
            breakout.updateAllBalls();

            for(let i = 0; i < breakout.balls.length; i++) {

                let collision = breakout.collisionDetection(breakout.balls[i]);
                if (Object.keys(collision).length !== 0 && collision.constructor === Object) {
                    particlesFire.createMultipleParticles(collision.x, collision.y);
                    particlesSmoke.createMultipleParticles(collision.x, collision.y);
                }
            }
            return;
        }

        if (breakout.status === GameStatus.RESET) {
            timer = 3;
            breakout.balls.length = 1;
            breakout.balls[0].dx = 0;
            breakout.balls[0].dy = 0;
            timerElapsedTime = 0;
            breakout.status = GameStatus.INITIAL;
            return;
        }

        if (breakout.status === GameStatus.INITIAL) {
            if (timerElapsedTime > 1000) {
                timerElapsedTime = 0;
                if (timer > 1) {
                    timer--;
                } else {
                    timer--;
                    
                    breakout.start();
                    storage.reset();
                }
            } else {
                timerElapsedTime += elapsedTime;
            }

            let offSet = 0;
            for (let i = 0; i < breakout.balls.length; i++) {

                breakout.balls[i].x = breakout.paddle.x + (breakout.paddle.width / 2) + offSet;
                breakout.balls[i].y = breakout.paddle.y - 10;

                offSet += 20;

            }

            return;
        }
    }

    function render() {
        graphics.clear();
        drawBall();
        drawPaddle();
        drawBricks();
        drawScore();
        drawLives();
        drawTimer();
        drawStatus();
        particlesFire.render();
        particlesSmoke.render();
        graphics.finishDraw();
    }

    function drawBall() {
        for(let i = 0; i < breakout.balls.length; i++) {
            let ball = breakout.balls[i];
            graphics.drawBall({
                x: ball.x,
                y: ball.y,
                radius: ball.radius,
                color: ball.color,
            });
        }
    }

    function drawPaddle() {
        graphics.drawSquare({
            x: breakout.paddle.x,
            y: breakout.paddle.y,
            width: breakout.paddle.width,
            height: breakout.paddle.height,
            color: '#0095DD',
        });
    }

    function drawBricks() {
        for(let row = 0; row < breakout.brickRowCount; row++) {
            for(let col = 0; col < breakout.brickColumnCount; col++) {

                if (breakout.brickTree.rows[row].bricks[col].status === 1) {
                    graphics.drawSquare({
                        x: breakout.brickTree.rows[row].bricks[col].x,
                        y: breakout.brickTree.rows[row].bricks[col].y,
                        width: breakout.brickTree.rows[row].bricks[col].width,
                        height: breakout.brickTree.rows[row].bricks[col].height,
                        color: breakout.brickTree.rows[row].bricks[col].color,
                    })
                }
            }
        }
    }

    function drawLives() {
        graphics.drawText({
            x: graphics.width - (breakout.paddle.width * breakout.lives) - 50,
            // y: breakout.height - 5,
            y: breakout.paddle.height + 10,
            font: "16px Arial",
            text: "Lives:",
            color: "#0095DD",
        });

        for (let i = 0; i <= breakout.lives; i++) {
            // debugger;
            graphics.drawSquare({
                x: graphics.width - (breakout.paddle.width * i),
                // y: breakout.height - 5,
                y: 10,
                width: breakout.paddle.width - 15,
                height: breakout.paddle.height,
                color: "#0095DD",
            });
        }

    }

    function drawStatus() {

        if (breakout.status === GameStatus.ONGOING) {
            return;
        }

        let spec = {};
        spec.color = "#0095DD";
        spec.y = breakout.height / 2 + 50;
        spec.font = "128px Arial";

        if (breakout.status === GameStatus.GAMEOVER) {

            if (breakout.didWin) {
                spec.text = "YOU WON";
                spec.x = 34;
            }
            else {
                spec.text = "Game Over";
                spec.x = 14;
            }

        } else if (breakout.status === GameStatus.PAUSED) {
            spec.text = "PAUSED";
            // spec.x = breakout.width / 2 - 200;
            spec.x = 100;
        }

        graphics.drawText(spec);
    }

    function drawScore() {
        graphics.drawText({
            font: "16px Arial",
            color: "#0095DD",
            text: "Score: " + breakout.score,
            x: 5,
            y: breakout.height - 5,
        });
    }

    function drawTimer() {

        if (breakout.status !== GameStatus.INITIAL) {
            return;
        }

        if (timer > 0) {
            graphics.drawText({
                font: "128px Arial",
                color: "#0095DD",
                text: timer,
                x: breakout.width / 2 - 20, 
                y: breakout.height / 2 + 50,
            });
        }
    }

    return {
        initialize,
        run
    }
}());
