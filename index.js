// gh"

window.addEventListener("load", function(){
    //canvas setup
    const canvas = document.getElementById("canvas1")
    const ctx = canvas.getContext("2d")
    canvas.width = 1500;
    canvas.height = 500;
   
    class Inputhandler{
        constructor(game){
            this.game= game;
            window.addEventListener("keydown", e=>{
                if(
                    ((e.key === "ArrowDown") || (e.key === "ArrowRight")) 
                    && (this.game.keys.indexOf(e.key) === -1)
                   ){
                    this.game.keys.push(e.key)                  
                } else if(e.key === " "){
                    this.game.player.shootTop();


                } else if(e.key === "d"){
                    this.game.debug = !this.game.debug;
                }
            });
            window.addEventListener("keyup", e=>{
                if(this.game.keys.indexOf(e.key) > -1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1)
            } 
            
        })
        }
    }

    class Projectile{
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
            this.image = document.getElementById("projectile");

            
        }       
        update(){
            this.x += this.speed;
            if(this.x > this.game.width * 0.9) this.markedForDeletion = true;
        }
        draw(context){
            context.drawImage(this.image,this.x, this.y);
        }
    }

    class Particle{
        // gh"
        constructor(game, x ,y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById("gears");
            this.frameX = Math.floor(Math.random()*3);
            this.frameY = Math.floor(Math.random()*3); 
            this.spriteSize = 50;
            this.spriteModifier = Math.floor(Math.random() * 0.5 + 0.5).toFixed(1);
            this.size = this.spriteSize * this.spriteModifier;
            this.speedX = Math.random() * 6 -3;
            this.speedY = Math.random() * -15;
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0.2 - 0.1;
 
        }
        update(){
            this.angle += this.va;
            this.speedY += this.gravity;
            this.x -= this.speedX;
            this.y += this.speedY;
            if(this.y > this.game.height + this.size || this.x < 0 - this.size) this.markedForDeletion = true;
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteSize, this.y * this.spriteSize, this.spriteSize, this.spriteSize, this.x, this.y, this.size, this.size)
        }
    }   

    class Player{
        constructor(game){
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.x =20;
            this.y = 100;
            this.speedY = 0;
            this.maxSpeed = 3;
            this.projectiles = [];
            this.image = document.getElementById("player");
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 5000;
        
        }
        

        update(deltaTime){
            if(this.game.keys.includes("ArrowDown")){
                this.speedY = this.maxSpeed;
            }else if(this.game.keys.includes("ArrowRight")){
                this.speedY = -this.maxSpeed;
            }else this.speedY = 0;
            this.y +=this.speedY;
            //handle projectiles          
            this.projectiles.forEach(projectile=>{
                projectile.update();
            });
             this.projectiles = this.projectiles.filter(projectile =>!projectile.markedForDeletion);
            // sprite animation
            if(this.frameX < this.maxFrame) this.frameX++
            else this.frameX = 0
            //powerUp
            if(this.powerUp){
                if(this.powerUpTimer > this.powerUpLimit){
                    this.powerUpTimer = 0;
                    this.powerUp = false;
                    this.frameY = 0; 
                }else {
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1;
                    this.game.ammo += 0.1;
                }
            }
            //boundaries
             if (this.y +  this.height * 0.5 >= this.game.height) this.y = this.game.height - this.height * 0.5
             if (this.y <=  - this.height * 0.5) this.y = - this.height * 0.5

            }
            
        draw(context){
            this.projectiles.forEach(projectile => {
                projectile.draw(context)
            });
           if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width,  this.height, this.x,  this.y,  this.width, this.height);

        }
        shootTop(){
            if(this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, (this.x + 90 ), this.y + 33));
                this.game.ammo--;  
                if(this.powerUp) this.shootBottom()
            }
          
        }
        shootBottom(){
            if(this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, (this.x + 90 ), this.y + 175));  
            }
        }

        enterPowerUp(){
            this.powerUpTimer = 0;
            this.powerUp = true;
            this.game.ammo = this.game.maxAmmo;
        }
    }

    class Enemy{
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 -0.5;
            this.markedForDeletion = false;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }
        update(){
            this.x += this.speedX - this.game.gameSpeed ;
            if(this.x + this.width < 0) this.markedForDeletion = true;
            // sprite animation
            if(this.frameX < this.maxFrame) this.frameX ++
            else this.frameX = 0;
        }
        draw(context){
            if(this.game.debug)context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width ,this.frameY * this.height, this.width,this.height,this.x, this.y, this.width, this.height);
            context.font = "20px Helvetica"
            if(this.game.debug) context.fillText(this.lives, this.x, this.y);
        }
    }

    class Angler1 extends Enemy{
        constructor(game){
            super(game);
            this.width = 228;
            this.height = 169;
            this.lives = 2; 
            this.score = this.lives;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById("angler1");
            this.frameY = Math.floor(Math.random() * 3);
        }
    
    }

    class Angler2 extends Enemy{
        constructor(game){
            super(game);
            this.width = 213;
            this.height = 165;
            this.lives = 3; 
            this.score = this.lives;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById("angler2");
            this.frameY = Math.floor(Math.random() * 2);
        }
    
    }

    class Lucky extends Enemy{
        constructor(game){
            super(game);
            this.width = 99;
            this.height = 95;
            this.lives = 1; 
            this.score = 15;
            this.type = "lucky";
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById("lucky");
            this.frameY = Math.floor(Math.random() * 2);
        }
    
    }

    

    class Layer{
        constructor(game, image, speedModifier){
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update(){
            if(this.x <= -this.width)          
                this.x = 0;
             this.x -= this.game.gameSpeed * this.speedModifier; 
        
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }

    class Background{
         constructor(game){
            this.game = game;
            this.image1 = document.getElementById("layer1");
            this.image2 = document.getElementById("layer2");
            this.image3 = document.getElementById("layer3");
            this.image4 = document.getElementById("layer4");
            this.layer1 = new Layer(this.game, this.image1, 3);
            this.layer2 = new Layer(this.game, this.image2, 3);
            this.layer3 = new Layer(this.game, this.image3, 3);
            this.layer4 = new Layer(this.game, this.image4, 3);

            this.layers = [this.layer1, this.layer2, this.layer3]; 
         }
         update(){
            this.layers.forEach(layer => layer.update());
         }
         draw(context){
            this.layers.forEach(layer => layer.draw(context));

         }
    }

    class UI{
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = "Helvetica";
            this.color = "white";
        }
// gh"
        draw(context){
            context.save();
            context.fillStyle = this.color;
            context.font = this.fontSize +"px" + this.fontFamily;
            context.shadowOffsetX =2;
            context.shadowOffsetY = 2;
            context.shadowColor = "black";
            //score
            context.fillText("Score: " + this.game.score, 20, 40); 
            
            //ammo refill image
            if(this.game.player.powerUp) context.fillStyle ="#ffffbd" ;

            for(let i =0; i < this.game.ammo; i++){
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }

            //timer
            if(this.game.player.powerUp) context.fillStyle ="#fff" ;
            const timeFormatter = (this.game.gameTime * 0.001).toFixed(1) ;
            context.fillText("Timer: "+ timeFormatter, 20, 90)

            //game over messages
            if(this.game.gameOver){
                context.textAling = "center";
                let message1;
                let message2;
                if(this.game.score > this.game.winningScore){
                    message1 = "You win!";
                    message2 = "Well done";
                }else{
                    message1 = "You loose!";
                    message2 = "Try again";
                }
                context.font = "50px" + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5);
                context.font = "25px" + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.6);
  
            }
            context.restore();
        }

    }

    class Game{
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new Inputhandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.particles = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoInterval = 500; 
            this.ammoTimer = 0;  
            this.gameOver = false; 
            this.score = 0;
            this.winningScore = 10;
            this.gameTime = 0;
            this.timeLimit = 10000;
            this.gameSpeed = 1;
            this.debug = true;

        }
        update(deltaTime){
            if(!this.gameOver) this.gameTime += deltaTime;
            if(this.gameTime > this.timeLimit) this.gameOver = true;
            this.background.layer4.update();
            this.player.update(deltaTime);
            this.background.update();

            if(this.ammoTimer > this.ammoInterval){
                if(this.ammo < this.maxAmmo) {
                    this.ammo++;
                    this.ammoTimer = 0;
                }
            }else {
                this.ammoTimer += deltaTime;
            }

            this.enemies.forEach(enemy => {
                enemy.update();
                if(this.checkCollision(this.player, enemy)){
                     for(let i; i < 10; i++){
                         this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                     }
                    enemy.markedForDeletion = true;
           
                    if(enemy.type === "lucky") this.player.enterPowerUp();
                    else this.score--;
                }
                this.player.projectiles.forEach(projectile =>{
                    if(this.checkCollision(projectile, enemy)){
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        if(enemy.lives <= 0){
                            enemy.markedForDeletion = true;
                                this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                            if(!this.gameOver)this.score += enemy.score;
                            if(this.score > this.winningScore){
                                this.gameOver = true;
                            }
                        }
                    }
                })
            });
            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => !particle.markedForDeletion);
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if(this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            }else{
                this.enemyTimer +=deltaTime;
            }

        } 
        draw(context){
            this.background.draw(context);
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.particles.forEach(particle =>{
                 particle.draw(context);
                });
            this.background.layer4.draw(context);
        }
        addEnemy(){
            const randomize = Math.random();
            if(randomize <= 0.3)
             this.enemies.push(new Angler1(this));
             else if(randomize <= 0.6) this.enemies.push(new Angler2(this));
            else this.enemies.push(new Lucky(this));

            
        }  
        checkCollision(rect1, rect2){
            return(
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y
            )
        }
    }

    const game = new Game(canvas.width, canvas.height)

    //animation loop
    lastTime  = 0;
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
     
        ctx.clearRect(0, 0,canvas.width, canvas.height )
         game.update(deltaTime);
        game.draw(ctx); 
        requestAnimationFrame(animate);  
    }

    animate(0);


});

