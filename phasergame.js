var game = new Phaser.Game(1000, 300, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var cursors;
var stars;
var ground;
var scaleX = 10;

function preload() {
  game.load.image('ground', 'assets/platform.png');
  game.load.image('star', 'assets/star.png');
  game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.world.setBounds(0, 0, 1000 * scaleX, game.height);

  player = game.add.sprite(32, game.world.height - 150, 'dude');
  window.player = player;

  platforms = game.add.group();
  platforms.enableBody = true;

  // // Here we create the ground.
  // var ground = platforms.create(0, game.world.height - 32, 'ground');
  ground = game.add.tileSprite(0,game.height-32,game.world.width,32,'ground');
  
  game.physics.arcade.enable(player);
  game.physics.arcade.enable(ground);

  ground.body.immovable = true;
  ground.body.allowGravity = false;
  
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
  player.body.gravity.y = 3000;
  player.body.collideWorldBounds = true;

  //  Our two animations, walking left and right.
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  cursors = game.input.keyboard.createCursorKeys();
  
  stars = game.add.group();
  stars.enableBody = true;

  game.camera.follow(player);

}

function addStars() {
  for (var i = 0; i < window.peaks.length; i++)
  {
      //  Create a star inside of the 'stars' group
      var star = stars.create(window.peaks[i] * scaleX, 200, 'star');
      //  Let gravity do its thing
      star.body.gravity.y = 3000;
      //  This just gives each star a slightly random bounce value
      // star.body.bounce.y = 0.7 + Math.random() * 0.2;
  }
  stars.setAll('outOfBoundsKill', true);
  stars.setAll('checkWorldBounds', true);
}

function collectStar (player, star) {
  // Removes the star from the screen
  star.destroy();
}

function update() {
  game.physics.arcade.collide(player, ground);
  game.physics.arcade.collide(stars, ground);
  game.physics.arcade.overlap(player, stars, collectStar, null, this);

  player.animations.play('right');
  player.body.x = window.playerX * scaleX;

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
  if (cursors.up.isDown && player.body.touching.down)
  {
      player.body.velocity.y = -600;
  }
}
