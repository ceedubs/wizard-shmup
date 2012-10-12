function WizardShmup() {

	/* Simular to example1 but now we're using jaws properties to get width and height of canvas instead */
	/* This mainly since we let jaws handle the canvas now */
	function isOutsideCanvas(item) {
		return (item.x < 0 || item.y < 0 || item.x > jaws.width || item.y > jaws.height) 
	}

	var player;
	var bullets = new jaws.SpriteList();
	var enemies = new jaws.SpriteList();
	
	this.setup = function() {
		jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
		player = new Player({
			x: 0.1 * jaws.canvas.width,
			y: 0.5 * jaws.canvas.height
		});
		var sendRepeatEnemies = function() {
			enemies.push(new Enemy({
				x: jaws.canvas.width,
				y: Math.random() * jaws.canvas.height,
				vx: -1.5,
				vy: 0
			}));
			setTimeout(sendRepeatEnemies, 1000);
		};
		sendRepeatEnemies();
	};
		
	this.update = function() {
		if (jaws.pressed("left"))  { player.x -= 2; }
		if (jaws.pressed("right")) { player.x += 2; }
		if (jaws.pressed("up"))	{ player.y -= 2; }
		if (jaws.pressed("down"))  { player.y += 2; }
		if (jaws.pressed("space")) { player.fire(); }

		bullets.update();
		bullets.deleteIf(isOutsideCanvas);
		enemies.update();
		jaws.collideManyWithMany(bullets, enemies).forEach(function(pair, index) {
			var bullet = pair[0];
			var enemy = pair[1];
			bullet.collision = true;
			enemy.takeHit(bullet);	
		});
		bullets.deleteIf(function(bullet) {
			return bullet.collision;
		});
		enemies.deleteIf(function(enemy) {
			return enemy.hp <= 0;
		});
	};
	
	this.draw = function() {
		jaws.context.clearRect(0,0,jaws.width,jaws.height);
		player.draw();
		bullets.draw();
		enemies.draw();
	};

	function Bullet(options) {
		jaws.Sprite.call(this, options);
		this.setImage("bullet.png");
		this.vx = options.vx;
		this.vy = options.vy;
		this.collision = false;
		this.baseDamage = 1;

		this.update = function() {
			this.x += this.vx;
			this.y += this.vy;
		};
	}
	Bullet.prototype = jaws.Sprite.prototype;

	function Player(options) {
		jaws.Sprite.call(this, options);
		this.setImage("grumpy_old_wizard.png");
		this.canFire = true;

		this.fire = function() {
			if (!this.canFire) { return; }

			var self = this;
			this.canFire = false;
			bullets.push(new Bullet({
				x: this.x,
				y: this.y,
				vx: 2,
				vy: 0
			}));
			setTimeout(function() {
				self.canFire = true;
			}, 250);
		};
	}
	Player.prototype = jaws.Sprite.prototype;

	function Enemy(options) {
		jaws.Sprite.call(this, options);
		this.setImage("rect.png");
		this.vx = options.vx;
		this.vy = options.vy;
		this.hp = 1;

		this.update = function() {
			this.x += this.vx;
			this.y += this.vy;
		};

		this.takeHit = function(hit) {
			this.hp -= hit.baseDamage;	
		};
	}
	Enemy.prototype = jaws.Sprite.prototype;
}

/*
*
* Our script-entry point
*
*/
window.onload = function() {
	jaws.assets.root = "media/";
  jaws.assets.add("rect.png")
  jaws.assets.add("bullet.png")
  jaws.start(WizardShmup)
}
