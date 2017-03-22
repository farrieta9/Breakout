
function Paddle(x, y, width, height) {
    let self = {};
    self.x = x;
    self.y = y;
    self.width = width;
    self.height = height;
    self.startX = x;
    self.startY = y;
    self.shrinkCount = 0;
    let maxShrinkCount = 1;
    let originalWidth = width;

    self.shrink = function() {
        if (self.shrinkCount < maxShrinkCount) {
            self.width /= 2;
            self.shrinkCount++;
        }
    };

    self.center = function() {
        return {
            x: self.x + (self.width / 2),
            y: self.y + (self.height / 2)
        };
    };
    
    self.reset = function() {
        self.x = self.startX;
        self.y = self.startY;
        self.shrinkCount = 0;
        self.width = originalWidth;
    };

    return self;
}

function Ball(x, y, radius) {
    let self = {};
    let initialSpeed = 4.5;
    self.x = x;
    self.y = y;
    self.radius = radius;
    self.startX = x;
    self.startY = y;
    self.angle = 1;
    self.dx = 0;
    self.dy = 0;
    self.bricksBroken = 0;
    self.color = '#0095DD';
    self.speed = {
        current: initialSpeed,
        maxSpeed: 10.5,
        increment: function() {
            switch (self.bricksBroken) {
                case 4:
                case 12:
                case 36:
                case 62:
                    self.speed.current += 1.5;
                    self.speed.current = Math.min(self.speed.current, self.speed.maxSpeed);
                    break;
                default:
                    break;
            }
        }
    };

    self.reset = function () {
        self.x = self.startX;
        self.y = self.startY;
        self.speed.current = initialSpeed;
        self.bricksBroken = 0;
        self.dx = 0;
        self.dy = 0;
    };

    return self;
}


function Brick(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.padding = 2;
    this.brickTopOffset = 30;
    this.brickLeftOffset = 15;
    this.status = 1;
    this.color = color;
    this.center = {x: x + (width / 2), y: y + (height / 2)};
}

function RectCircleColliding(circle, rect){
    // return true if the rectangle and circle are colliding
    // http://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle
    let distX = Math.abs(circle.x - rect.x - rect.width / 2);
    let distY = Math.abs(circle.y - rect.y-rect.height / 2);

    if (distX > (rect.width / 2 + circle.radius)) { return false; }
    if (distY > (rect.height/2 + circle.radius)) { return false; }

    if (distX <= (rect.width / 2)) { return true; }
    if (distY <= (rect.height / 2)) { return true; }

    let dx=distX-rect.width / 2;
    let dy=distY-rect.height / 2;
    return (dx * dx + dy * dy <= (circle.radius * circle.radius));
}

function Bricks() {
    let self = {};

    self.topLeftCoordinates = {};
    self.bottomRightCoordinaes = {};
    self.rows = [];

    self.addRow = function(brickRow) {
        self.rows.push(brickRow);
    };

    self.detectCollision = function(ball) {
        if (ball.y - ball.radius < self.bottomRightCoordinaes.y && ball.y + ball.radius > self.topLeftCoordinates.y) {
            for(let row = 0; row < self.rows.length; row++) {
                if (ball.y - ball.radius <= self.rows[row].rightCoodinates.y && ball.y + ball.radius >= self.rows[row].leftCoodinates.y) {
                    let brickRow = self.rows[row];
                    let bricks = brickRow.bricks;
                    for(let i = 0; i < bricks.length; i++) {
                        if (bricks[i].status) {
                            if (RectCircleColliding(ball, bricks[i])) {
                                self.rows[row].bricks[i].status = 0;
                                self.rows[row].bricksHit++;
                                
                                let rowCleared = false;

                                if (self.rows[row].bricksHit >= bricks.length) {
                                    rowCleared = true;
                                }

                                return {brick: bricks[i],
                                    rowCleared: rowCleared
                                };
                            }
                        }
                    }
                }
            }

        } else {
            return {};
        }

        return {}; // just in case
    };

    self.setCoordinates = function(){
        if (self.rows.length == 0) {
            return;
        }

        self.topLeftCoordinates.x = self.rows[0].bricks[0].x;
        self.topLeftCoordinates.y = self.rows[0].bricks[0].y;

        let lastRow = self.rows[self.rows.length - 1];
        let lastBrick = lastRow.bricks[lastRow.bricks.length - 1];
        self.bottomRightCoordinaes.x = lastBrick.x + lastBrick.width;
        self.bottomRightCoordinaes.y = lastBrick.y + lastBrick.height;
    };

    return self;
}

function BrickRow() {
    this.leftCoodinates = {};
    this.rightCoodinates = {};
    this.bricks = [];
    this.bricksHit = 0;
}

BrickRow.prototype.push = function (brick) {
    if (this.bricks.length == 0) {
        this.leftCoodinates.x = brick.x;
        this.leftCoodinates.y = brick.y;
    }

    this.bricks.push(brick);
    this.rightCoodinates.x = brick.x + brick.width;
    this.rightCoodinates.y = brick.y + brick.height;
};


