let GameStatus = {
    PAUSED: 0,
    ONGOING: 1,
    GAMEOVER: 2,
    INITIAL: 3,
    RESET: 4,
};

class Breakout {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.paddle = new Paddle(this.width / 2 - 38, this.height - 55, 80, 10);
        let ball = new Ball(this.paddle.x + (this.paddle.width / 2), this.paddle.y - 10, 10);
        // let ball2 = new Ball(this.paddle.x + (this.paddle.width / 2) + 20, this.paddle.y - 10, 10);
        this.balls = [ball];

        this.brickColumnCount = 14;
        this.brickRowCount = 8;
        this.bricks = [];
        this.score = 0;
        this.roundScore = 0;
        this.lives = 3;
        this.status = GameStatus.INITIAL;
        this.didWin = false;

        this.colorScore = {
            "#FFFF66": 1, // yellow
            "#F05F40": 2, // orange
            "#1E90FF": 3, // blue
            "#228B22": 5, // green
        };

        let colors = [
            "#228B22",
            "#228B22",

            "#1E90FF",
            "#1E90FF",

            "#F05F40",
            "#F05F40",

            "#FFFF66",
            "#FFFF66",
        ];

        let brickHeight = 20;
        let brickTopOffset = 30;
        let brickLeftOffset = 15;
        let brickPadding = 2;
        let brickWidth = this.width / this.brickColumnCount - (brickPadding * 2);

        // for(let col = 0; col < this.brickColumnCount; col++) {
        //     this.bricks[col] = [];
        //     for(let row = 0; row < this.brickRowCount; row++) {
        //         this.bricks[col][row] = new Brick(
        //             (col * (brickWidth + brickPadding)) + brickLeftOffset, // x
        //             (row * (brickHeight + brickPadding)) + brickTopOffset, // y
        //             brickWidth,
        //             brickHeight,
        //             colors[row]
        //         );
        //     }
        // }

        this.brickTree = new Bricks();
        for(let row = 0; row < this.brickRowCount; row++) {
            this.brickTree.addRow(new BrickRow());
            for(let col = 0; col < this.brickColumnCount; col++) {
                this.brickTree.rows[row].push(new Brick(
                    (col * (brickWidth + brickPadding)) + brickLeftOffset, // x
                    (row * (brickHeight + brickPadding)) + brickTopOffset, // y
                    brickWidth,
                    brickHeight,
                    colors[row]
            ));
            }
        }

        this.brickTree.setCoordinates();

        this.dx = 0;
        this.dy = 0;
    }

    updateAllBalls() {
        let balls = this.balls;
        for(let i = 0; i < balls.length; i++) {
            // let ball = this.balls[i];
            this.__updateBallPosition(balls[i]);
        }

    }

    __updateBallPosition(ball) {
        if (ball.y + ball.dy < ball.radius) {
            ball.dy = -ball.dy; // hit the top

            // Check if direction is downward to prevent ball getting stuck in paddle
        } else if (ball.dy > 0 && ball.y + ball.radius > this.paddle.y) {
            // hit the bottom
            if (RectCircleColliding(ball, this.paddle)) {
                ball.dy = -ball.dy;

                // ball reflection technique
                ball.angle = (ball.x - this.paddle.center().x) / (this.paddle.width / 2);

                // this.ball.speed.current += this.ball.speed.increment;
                ball.speed.increment();

                // this.dx = this.ball.speed.current * this.ball.angle;
                ball.dx = ball.angle;
            }
        }

        if (ball.x + ball.dx < ball.radius || ball.x + ball.dx > this.width - ball.radius) {
            ball.dx = -ball.dx; // hit the left or right wall
        }

        if (ball.y > this.height) {
            this.ballDropped(ball);
        }

        ball.x += ball.dx * ball.speed.current;
        ball.y += ball.dy * ball.speed.current;

    }

    ballDropped(ball) {
        // If there are two or more balls then just drop the one that fell
        // else all balls have been dropped so lose a life
        let index = this.balls.indexOf(ball);
        if (this.balls.length > 1 && index > -1) {
            this.balls.splice(index, 1);
        } else {
            this.handleGameOver(ball);
        }
    }

    handleGameOver(ball) {
        this.lives--;

        if (!this.lives) {
            this.status = GameStatus.GAMEOVER;
        } else {
            this.reset();            
        }
    }

    reset() {
        this.balls.length = 1;
        this.balls[0].reset();
        this.paddle.reset();
        this.roundScore = 0;
        this.status = GameStatus.RESET;
    }

    start() {
        if (this.balls.length === 0) {
            this.balls.push(new Ball(this.paddle.x + (this.paddle.width / 2), this.paddle.y - 10, 10))
        } else if (this.balls.length >= 2) {
            this.balls.length = 1;
        }

        this.balls[0].dx = 1;
        this.balls[0].dy = -1;
        this.status = GameStatus.ONGOING;
    }

    updateScore(hitColor, rowCleared) {

        if (hitColor === "#228B22") {
            this.paddle.shrink();
        }

        if (rowCleared) {
            this.score += 25;
            this.roundScore += 25;
        }

        this.score += this.colorScore[hitColor];
        this.roundScore += this.colorScore[hitColor];

        if (this.roundScore >= 100) {
            this.roundScore = 0;
            let newBall = new Ball(this.paddle.x + (this.paddle.width / 2), this.paddle.y - 10, 10);
            newBall.dx = 1;
            newBall.dy = -1;
            this.balls.push(newBall);
        }
    }

    collisionDetection(ball) {
        let result = this.brickTree.detectCollision(ball);
        if (Object.keys(result).length === 0) {
            return {};
        }

        ball.dy = -ball.dy;
        ball.bricksBroken += 1;
        this.updateScore(result.brick.color, result.rowCleared);

        if (this.score >= 508) { // 508 is the high score a player can reach
            this.didWin = true;
            this.handleGameOver();
        }
        return {x: result.brick.center.x, y: result.brick.center.y};

    }
}
