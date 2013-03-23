window.onload = function(){

	var rand = function(max,min){
		return Math.random() * (max * 2) + min;
	}

	var screen = {};
	screen.id = document.getElementById("screen");
	screen.canvas = screen.id.getContext("2d");
	screen.clear = function(){
		screen.width = window.innerWidth;
		screen.height = window.innerHeight;
		screen.canvas.fillStyle = "black";
		screen.canvas.fillRect(0,0,screen.width,screen.height);
	};
	screen.draw = function(){
		if(sun.graviFlare.state){
			sun.graviFlare.draw();
		}
		if(sun.particles.state){
			sun.particles.draw();
		}
		if(sun.flare.state){
			sun.flare.draw();
		}
		if(sun.glow.state){
			sun.glow.draw();
		}
		sun.draw();
		if(sun.overlay.state){
			sun.overlay.draw();
		}
		help.draw();
	};
	screen.adjust = function(){
		screen.clear();
		screen.id.width = screen.width;
		screen.id.height = screen.height;
		screen.centerX = screen.width / 2;
		screen.centerY =  screen.height / 2;
		screen.draw();
	};
	
	var sun = {};
	sun.images = [
		 new Image(),
		 new Image()
	];
	sun.images[0].src = "sun_transparent.png";
	sun.images[1].src = "sun_overlay.png";
	sun.rotation = 0;
	sun.draw = function(){
		screen.canvas.translate(screen.centerX,screen.centerY);
		sun.rotation += .05;
		var yourAngleVar = sun.rotation;
        var angleInRadians = (yourAngleVar % 360) * Math.PI / 180;
		screen.canvas.rotate(angleInRadians);
		screen.canvas.drawImage(
			sun.images[0],
			- sun.images[0].width / 2,	
			- sun.images[0].height / 2
		);
		screen.canvas.rotate(-angleInRadians);
		screen.canvas.translate(-screen.centerX,-screen.centerY);
	};
	sun.glow = { };
	sun.glow.brightness = 220;
	sun.glow.brighten = true;
	sun.glow.speed = .3;
	sun.glow.PI = 2 * Math.PI;
	sun.glow.state = true;
	sun.glow.draw = function(){
		if(sun.glow.brighten){
			sun.glow.brightness += sun.glow.speed;
		} else {
			sun.glow.brightness -= sun.glow.speed;
		}
		if(sun.glow.brightness < 180) {
			sun.glow.brighten = true;
		}
		if(sun.glow.brightness > 200){
			sun.glow.brighten = false;
		}
		screen.canvas.beginPath();
		screen.canvas.arc(screen.centerX,screen.centerY,250,0,sun.glow.PI,false);
		screen.canvas.closePath();
		var grd = screen.canvas.createRadialGradient(screen.centerX,screen.centerY,170,screen.centerX,screen.centerY,sun.glow.brightness);
		grd.addColorStop(0,"red");
		grd.addColorStop(1,"transparent");
		screen.canvas.fillStyle = grd;
		screen.canvas.fill();
	};
	sun.flare = {};
	sun.flare.horizontal = Math.random() * 2 - 1;
	sun.flare.vertical =  Math.random() * 2 - 1;
	sun.flare.speedX = Math.random();
	sun.flare.speedY = Math.random();
	sun.flare.state = true;
	sun.flare.draw = function(){
		screen.canvas.beginPath();
		screen.canvas.arc(screen.centerX,screen.centerY,250,0,sun.glow.PI,false);
		screen.canvas.closePath();
		var gradientStartRadius = 170;
		sun.flare.horizontal += sun.flare.speedX;
		sun.flare.vertical += sun.flare.speedY;
		var border = 5;
		if(sun.flare.horizontal >= border){
			sun.flare.speedX = -Math.random();
		} 
		if (sun.flare.horizontal <= -border ){
			sun.flare.speedX = Math.random();
		}
		if(sun.flare.vertical >= border){
			sun.flare.speedY = -Math.random();
		}
		if(sun.flare.vertical <= -border){
			sun.flare.speedY = Math.random();
		}
		var grd = screen.canvas.createRadialGradient(
			screen.centerX, 
			screen.centerY, 
			gradientStartRadius,
			screen.centerX + sun.flare.horizontal, 
			screen.centerY + sun.flare.vertical,
			230
		);
		grd.addColorStop(0,"red");
		grd.addColorStop(1,"transparent");
		screen.canvas.fillStyle = grd;
		screen.canvas.fill();
	};
	sun.overlay = {};
	sun.overlay.opacity = .5;
	sun.overlay.brighten = false;
	sun.overlay.rotation = 0;
	sun.overlay.state = true;
	sun.overlay.draw = function(){
		screen.canvas.translate(screen.centerX,screen.centerY);
		sun.overlay.rotation -= .05;
		var yourAngleVar = sun.overlay.rotation;
        var angleInRadians = (yourAngleVar % 360) * Math.PI / 180;
		screen.canvas.rotate(angleInRadians);
		var speed = .005;
		if(sun.overlay.opacity >= .5){
			sun.overlay.brighten = false;
		} else if(sun.overlay.opacity <= .2){
			sun.overlay.brighten = true;
		}
		if(sun.overlay.brighten) {
			sun.overlay.opacity += speed;
		} else {
			sun.overlay.opacity -= speed;
		}
		screen.canvas.globalAlpha = sun.overlay.opacity;
		screen.canvas.drawImage(
			sun.images[1],
			- sun.images[1].width / 2,
			- sun.images[1].height / 2
		);
		screen.canvas.globalAlpha = 1;
		screen.canvas.rotate(-angleInRadians);
		screen.canvas.translate(-screen.centerX,-screen.centerY);
	};
	sun.particles = {};
	sun.particles.state = true;
	sun.particles.draw = function(){
		for(var i = 0; i < sun.particles.array.length; i++){
			var particle = sun.particles.array[i];
			particle.speedX *= .99; 
			particle.speedY *= .99;
			particle.x += particle.speedX; 
			particle.y += particle.speedY; 
			particle.opacity -= particle.decay;
			if(particle.opacity <= 0){
				particle.size = Math.random() + .1;
				particle.x = screen.centerX;
				particle.y = screen.centerY;
				particle.speedX = Math.random() * 14 - 7;
				particle.speedY = Math.random() * 14 - 7;
				particle.opacity = 1;
				particle.decay = Math.random() + .005;
			}
			sun.particles.outside(particle.size, particle.x, particle.y, particle.opacity);
			sun.particles.inside(particle.size, particle.x, particle.y, particle.opacity);
		}
	};
	sun.particles.outside = function(size,x,y, opacity){
		screen.canvas.beginPath();
		var radius = 100 * size;
		screen.canvas.arc(x, y, radius, 0, 2 * Math.PI, false);
		screen.canvas.closePath();
		var grd = screen.canvas.createRadialGradient(x, y, 0, x, y, radius);
		grd.addColorStop(0,"red");
		grd.addColorStop(1,"transparent");
		screen.canvas.fillStyle = grd;
		screen.canvas.globalAlpha = opacity;	
		screen.canvas.fill();
		screen.canvas.globalAlpha = 1;	
	};
	sun.particles.inside = function(size, x, y, opacity){
		screen.canvas.beginPath();
		var radius = 75 * size;
		screen.canvas.arc(x, y,radius, 0, 2 * Math.PI, false);
		screen.canvas.closePath();
		var grd = screen.canvas.createRadialGradient(
			x,
			y,
			0,
			x,
			y,
			radius
		);
		grd.addColorStop(0,"orange");
		grd.addColorStop(1,"transparent");
		screen.canvas.fillStyle = grd;
		screen.canvas.globalAlpha = opacity;
		screen.canvas.fill();
		screen.canvas.globalAlpha = 1;
	};
	sun.particles.array = [];
	
	sun.graviFlare = {
		state: true,
		particle: function(){
			this.size;
			this.x;
			this.y;
			this.speedX;
			this.speedY;
			this.gravity;
		},
		draw: function(){
			
		}
	};
	
	function Particle(){
		this.size = Math.random() + .1;
		this.x = screen.centerX;
		this.y = screen.centerY;
		this.speedX = Math.random() * 10 - 5;
		this.speedY = Math.random()  * 10 - 5;
		this.opacity = 1;
		this.decay = Math.random()*.1 + .01;
	}
	
	
	
	var help = {};
	help.draw = function(){
		var height = 20;
		var lineY = 50;
		var lineHeight = 20;
		var message = [
			"FPS: " + demo.fps,
		];
		screen.canvas.fillStyle = "#111";
		for(var i = 0; i < message.length; i++) {
			height += lineHeight;
		}
		screen.canvas.fillRect(30,30,300, height);
		screen.canvas.fillStyle = "white";
		for(var i = 0; i < message.length; i++){
			screen.canvas.fillText(message[i], 40, lineY);
			lineY += lineHeight;
		}
	};

	var demo = {};
	demo.load = function(){
		screen.id.style.background = "black";
		screen.adjust();
		var imageCount = 0;
		for(var i = 0; i < sun.images.length; i++){
			sun.images[i].onload = function(){
				imageCount++;
				if(imageCount == sun.images.length){
					setInterval(demo.loop,1000/60);
				}
			};
		}
		var particles = 40;
		for(var i = 0; i < particles; i++){
			sun.particles.array[i] = new Particle();
		}
	};
	demo.fps;
	demo.then = new Date();
	demo.loop = function(){
		screen.clear();
		screen.draw();
		var now = new Date();
		//demo.fps = Math.round(1000 / (now - demo.then));
		demo.then = now;
	};
	
	//listeners
	window.onresize = screen.adjust;
	window.onkeypress = function(e){
		switch(event.keyCode){
			case 49:
				sun.glow.state = !sun.glow.state;
				break;
			case 50:
				sun.flare.state = !sun.flare.state;
				break;
			case 51:
				sun.particles.state = !sun.particles.state;
				break;
			case 52:
				sun.overlay.state = !sun.overlay.state;
				break;
		}
	};
	demo.load();
};