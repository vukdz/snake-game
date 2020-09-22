let config = {
    type: Phaser.WEBGL,
    width: 640,
    height: 480,
    backgroundColor: '#bfcc00',
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
};

let snake;
let food;
let cursors;
let restartButton;

let UP = 0;
let DOWN = 1;
let LEFT = 2;
let RIGHT = 3;

let game = new Phaser.Game(config);

function preload () {
    this.load.image('food', 'img/food.png');
    this.load.image('body', 'img/body.png');
    this.load.image('restart', 'img/restart-button.png');
}

function create () {
    restartButton = this.add.image(320, 240, 'restart').setInteractive();
    restartButton.on('pointerdown', restartGame)
    restartButton.setVisible(false);

    let Food = new Phaser.Class({
        Extends: Phaser.GameObjects.Image,
        initialize:

        function Food(scene, x, y)
        {
            Phaser.GameObjects.Image.call(this, scene)

            this.setTexture('food');
            this.setPosition(x * 16, y * 16);
            this.setOrigin(0);

            this.total = 0;

            scene.children.add(this);
        },

        eat: function ()
        {
            this.total++;

            let x = Phaser.Math.Between(0, 39);
            let y = Phaser.Math.Between(0, 29);

            this.setPosition(x * 16, y * 16);
        }
    });

    let Snake = new Phaser.Class({
        initialize:

        function Snake(scene, x, y)
        {
            this.headPosition = new Phaser.Geom.Point(x, y);
            this.body = scene.add.group();
            this.head = this.body.create(x * 16, y * 16, 'body');
            this.head.setOrigin(0);
            this.alive = true;
            this.speed = 100;
            this.moveTime = 0;
            this.tail = new Phaser.Geom.Point(x, y);

            this.heading = RIGHT;
            this.direction = RIGHT;
        },

        update: function (time) {
            if (time >= this.moveTime)
            {
                return this.move(time);
            }
        },

        faceLeft: function () {
            if (this.direction === UP || this.direction === DOWN)
            {
                this.heading = LEFT;
            }
        },

        faceRight: function () {
            if (this.direction === UP || this.direction === DOWN)
            {
                this.heading = RIGHT;
            }
        },

        faceUp: function () {
            if (this.direction === LEFT || this.direction === RIGHT)
            {
                this.heading = UP;
            }
        },

        faceDown: function () {
            if (this.direction === LEFT || this.direction === RIGHT)
            {
                this.heading = DOWN;
            }
        },

        move: function (time) {
            switch (this.heading)
            {
                case LEFT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x - 1, 0, 40);
                    break;

                case RIGHT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x + 1, 0, 40);
                    break;

                case UP:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y - 1, 0, 30);
                    break;
                
                case DOWN:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y + 1, 0, 30);
                    break;
            }

            this.direction = this.heading;

            Phaser.Actions.ShiftPosition(this.body.getChildren(), this.headPosition.x * 16, this.headPosition.y * 16, 1);

            let hitBody = Phaser.Actions.GetFirst(this.body.getChildren(), { x: this.head.x, y: this.head.y }, 1);

            if (hitBody)
            {
                console.log('dead');
                this.alive = false;
                return false;
            }
            else
            {
                this.moveTime = time + this.speed;
                return true;
            }
        },

        grow: function () {
            let newPart = this.body.create(this.tail.x, this.tail.y, 'body');
            newPart.setOrigin(0);
        },

        collideWithFood: function (food) {
            if (this.head.x === food.x && this.head.y === food.y)
            {
                this.grow();
                food.eat();
                return true;
            }
            else
            {
                return false;
            }
        },

        updateGrid: function (grid)
        {
            this.body.children.each(function (segment) {
                let bx = segment.x / 16;
                let by = segment.y / 16;

                grid[by][bx] = false;
            });
            return grid;
        }
    });

    food = new Food(this, 3, 4);

    snake = new Snake(this, 8, 8);

    cursors = this.input.keyboard.createCursorKeys();   
}

function update (time) {
    if (!snake.alive)
    {
        restartButton.visible = true;
        return;
    }

    if (cursors.left.isDown)
    {
        snake.faceLeft();
    }
    else if (cursors.right.isDown)
    {
        snake.faceRight();
    }
    else if (cursors.up.isDown) 
    {
        snake.faceUp();
    }
    else if (cursors.down.isDown)
    {
        snake.faceDown();
    }

    if (snake.update(time))
    {
        if (snake.collideWithFood(food))
        {
            repositionFood();
        }
    }
}

function repositionFood() {
    let testGrid = [];

    for (let y = 0; y < 30; y++)
    {
        testGrid[y] = [];

        for (let x = 0; x < 40; x++)
        {
            testGrid[y][x] = true;
        }
    }

    snake.updateGrid(testGrid);

    let validLocations = [];

    for (let y = 0; y < 30; y++)
    {
        for (let x = 0; x < 40; x++)
        {
            if (testGrid[y][x] === true)
            {
                validLocations.push({ x: x, y: y });
            }
        }
    }

    if (validLocations.length > 0) 
    {
        let pos = Phaser.Math.RND.pick(validLocations);
        food.setPosition(pos.x * 16, pos.y * 16);
        return true;
    }
    else
    {
        return false;
    }
}

function restartGame()
{
    this.scene.scene.restart();
}