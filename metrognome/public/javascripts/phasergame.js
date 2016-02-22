var game = new Phaser.Game(1000, 300, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
var cursors;
var stars;
var ground;
var scaleX = 8;
var stargroup = [];
var jumpcount = 0;
var canJump = true;

function preload() {
  game.load.image('ground', 'assets/platform.png');
  game.load.image('star', 'assets/star.png');
  game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
}

function create() {
  game.time.advancedTiming = true;
  fpsText = game.add.text(
    20, 20, '', { font: '16px Arial', fill: '#ffffff' }
  );
  fpsText.fixedToCamera = true;

  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.world.setBounds(0, -1000, 1000 * scaleX, game.height + 1000);

  player = game.add.sprite(32, 100, 'dude');
  window.player = player;

  platforms = game.add.group();
  platforms.enableBody = true;

  // // Here we create the ground.
  // var ground = platforms.create(0, game.world.height - 32, 'ground');
  // ground = game.add.tileSprite(0,game.height-5,game.world.width,32,'ground');

  game.physics.arcade.enable(player);
  // game.physics.arcade.enable(ground);
  // ground.body.immovable = true;
  //   ground.body.allowGravity = false;
  // ground.scale.setTo(1, 1);

  // //  This stops it from falling away when you jump on it
  // ground.body.immovable = true;

  //  Now let's create two ledges
  // var ledge = platforms.create(0, game.world.height - 32, 'ground');
  // ledge.body.immovable = true;
  // // ledge = platforms.create(150, 250, 'ground');
  // // ledge.body.immovable = true;

  //  Player physics properties. Give the little guy a slight bounce.
  player.body.bounce.y = 0.2;
  player.body.gravity.y = 3800;
  player.body.collideWorldBounds = true;

  //  Our two animations, walking left and right.
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  cursors = game.input.keyboard.createCursorKeys();
  
  stars = game.add.group();
  stars.enableBody = true;

  game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);

  // ground.body.immovable = true;
  // ground.body.allowGravity = false;
  // game.world.bringToTop(ground);

  var ledge = platforms.create(0, game.height-32, 'ground');
  ledge.width = 10;
  ledge.body.immovable = true;
}

function addStars(windowpeaks) {

  var prevX = 0;
  var prevY = game.height-32;
  var xPos;

  for (var i = 0; i < stars.children.length; i++) {
    stars.children[i].destroy();
  }
  for (var i = 0; i < platforms.children.length; i++) {
    platforms.children[i].destroy();
  }
  for (var i = 0; i < windowpeaks.length; i++)
  {
    // if (Math.random() > 0.5) {
      xPos = windowpeaks[i] * scaleX - 10;
      var ledge = platforms.create(prevX, prevY, 'ground');
      if (i == windowpeaks.length - 1) {
        ledge.width = game.world.width - prevX;
      } else {
        ledge.width = xPos - prevX + 10;
      }  

      ledge.body.immovable = true;
      // ledge.body.gravity.y = -1; //Math.random() > 0.5 ? -1 : -1.05;

      // var max = Math.max(prevY-10, game.height-200);
      // var min = Math.min(prevY+10, game.height-20);
      // var newY = Math.floor(Math.random()*(max-min+1)+min);      
      // prevX = xPos +60 + (newY-prevY);
      // prevY = newY;


      var max = Math.max(Math.random() > 0.5 ? prevY-22 : prevY, game.height-192)
      var min = Math.min(Math.random() > 0.5 ? prevY+22 : prevY, game.height-32)
      var newY = Math.floor(Math.random()*(max-min+1)+min);      
      prevX = xPos +60 + (newY-prevY)/2;
      prevY = newY;

    // } else {
    //   var star = stars.create(xPos + 16, game.height-80, 'star');
    //   star.body.setSize(18, 18, 3, 3);

    //   var ledge = platforms.create(xPos, game.height-28, 'ground');
    //   ledge.width = 50;
    //   ledge.body.immovable = true;
    // }
    
    // star.body.gravity.y = 3000;
    // star.body.bounce.y = 0.7 + Math.random() * 0.2;
  }

  player.body.velocity.y = -600;
  // var ledge = platforms.create(0, 100, 'ground');
  // ledge.body.immovable = true;

}

function collectStar (player, star) {
  // document.querySelector('#audio').pause();
  player.body.velocity.y -= 1000;
  star.kill();
  // setTimeout(function() { 
    // document.querySelector('#audio').play();
  // }, 1000)
}

function render() {
  // game.debug.bodyInfo(player, 0, 100);
  // game.debug.body(player);
  // for (var i = 0; i < stars.children.length; i++) {
  //   game.debug.body(stars.children[i]);
  // }
}

function update() {
  if (game.time.fps !== 0) {
    fpsText.setText(game.time.fps + ' FPS');
  }
  game.physics.arcade.collide(player, platforms);
  // game.physics.arcade.collide(player, ground);
  game.physics.arcade.collide(stars, platforms);
  game.physics.arcade.overlap(player, stars, collectStar, null, this);

  player.body.x = window.playerX * scaleX;

  for (var i = 0; i < stars.children.length; i++) {
    if (stars.children[i].body.x < game.camera.x) {
      stars.children[i].destroy();
      console.log("REMOVE")
    }
    // else {
    //   break;
    // }
  }

  for (var i = 0; i < platforms.children.length; i++) {
    if (platforms.children[i].body.x + platforms.children[i].body.width < game.camera.x) {
      platforms.children[i].destroy();
      console.log("REMOVE PLAT")
    }
    // else {
    //   break;
    // }
  }

  // game.world.wrap(player, 0, true);

  // if (cursors.left.isDown)
  // {
  //     //  Move to the left
  //     player.body.velocity.x = -150;
  //     player.animations.play('left');
  // }
  // else if (cursors.right.isDown)
  // {
  //     //  Move to the right
  //     player.body.velocity.x = 150;
  //     player.animations.play('right');
  // }
  // else
  // {
  //     //  Stand still
  //     player.animations.stop();

  //     player.frame = 4;
  // }

  //  Allow the player to jump if they are touching the ground.

  if (cursors.down.isDown && player.body.touching.down)
  {
    player.animations.play('left');
    player.body.setSize(20, 24, 3, 24);
  } else {
    player.animations.play('right');
    player.body.setSize(28, 48, 1, 0);
  }
  
  if (canJump && player.body.touching.down && cursors.up.isDown) {
    canJump = false;
    player.body.velocity.y = -585;
  } else if (cursors.up.isUp)
  {
    canJump = true;
  }

  
  // if (cursors.up.isUp && player.body.touching.down) {
  //   jumpcount = 0;
  // }
  // if (jumpcount == 0 && cursors.up.isDown && player.body.touching.down) {
  //   jumpcount = 1;
  //   player.body.velocity.y = -600;
  // }
  // else if (jumpcount == 1 && cursors.up.isUp && !player.body.touching.down) {
  //   jumpcount = 2;
  // }
  // else if (jumpcount == 2 && cursors.up.isDown && !player.body.touching.down) {
  //   player.body.velocity.y = -250;
  // }

}
