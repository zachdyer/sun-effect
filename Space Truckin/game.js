var rand = function(min, max){
  return Math.floor(Math.random() * (max + max)) + min;
}
window.onload = function () {
    var canvas = document.getElementById('screen'), 
    context = canvas.getContext('2d');
    window.addEventListener('resize', resizeCanvas, false);
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    
    var defaultZoom = 30,
        getScale = function(min, max, val) {
          var minp = MIN_SCROLL_ZOOM,maxp = MAX_SCROLL_ZOOM;
          var minv = Math.log(min), maxv = Math.log(max);
          var scale = (maxv-minv) / (maxp-minp);
          return Math.exp(minv + scale*(val-minp));
        };
    var screen = document.getElementById('screen'),
        mouseX = 0, mouseY = 0,
        MAX_MAP_X = 8500,
        MAX_MAP_Y = 6500,
        X = -screen.width/2, lastX = 0,
        Y = -screen.height/2, lastY = 0,
        ZOOM_SPEED = 1,
        MIN_SCROLL_ZOOM = 0,
        MAX_SCROLL_ZOOM = 30,
        MIN_ALLOWED_ZOOM = 0.0001,
        MAX_ALLOWED_ZOOM = 5,
        imageBuffer = {},
        solars = {},
        entities = {},
        state = {showingWelcomeScreen: true, zoom: defaultZoom, scaled_zoom: getScale(MIN_ALLOWED_ZOOM,MAX_ALLOWED_ZOOM, defaultZoom), isDragging: false},
        imageLoaded = function(ib){
            //check to see if we're done!
            var count = 0, loaded = 0, img;
            for(img in imageBuffer){
              count++;
              loaded += imageBuffer[img].loaded ? 1 : 0;
            }
            if (count == loaded){
              startGame();
            }
          }
        ,
        loadImage = function(src, name, regions){
          var img = new Image();
          var tmpData = { src: src, name: name, regions: regions, img: img, loaded: false };
          imageBuffer[name] = tmpData;
          img.onload=function(){
            tmpData.loaded = true;
            imageLoaded(tmpData);
          }
          img.src = src;
        },
        clearScreen = function(c){
          var context = c || screen.getContext('2d');
          context.beginPath();
          context.rect(0, 0, MAX_MAP_X, MAX_MAP_Y);
          context.fillStyle = 'black';
          context.fill();
        },
        drawImage = function(c, image, tile, x, y, w, h){
          var context = c || screen.getContext('2d');
          var img = imageBuffer[image];
          context.drawImage(img.img, img.regions[tile][0], img.regions[tile][1], img.regions[tile][2], img.regions[tile][3], x * state.scaled_zoom, y * state.scaled_zoom, w * state.scaled_zoom, h * state.scaled_zoom);
        },
        loadScreen = function(){
          console.info("Loading Resources, please wait..");
          var context = screen.getContext('2d');
          clearScreen(context);
          var x = screen.width / 2;
          var y = screen.height / 2;
          context.font = '30pt Calibri';
          context.textAlign = 'center';
          context.fillStyle = 'white';
          context.fillText('Loading, please wait...', x, y);
        },
        drawFrame = function(){
          var context = screen.getContext('2d');
          clearScreen(context);
          
          var angleInRadians = 0;
          var gW = 50000;
          var x = 0;
          var y = 0;
          
          var ii = getScale(1, 100, state.zoom);
          if (ii > 255) ii = 255;
          if (ii < 0) ii = 0;
          context.globalAlpha = 1.0 -((ii *100) /255 /100 );
          context.translate((x * state.scaled_zoom) - X, (y * state.scaled_zoom) - Y);
          context.rotate(angleInRadians);
          drawImage(context, 'galaxy', 'galaxy1', -gW/2, -gW/2, gW, gW);             
          context.rotate(-angleInRadians);
          context.translate(-((x * state.scaled_zoom) - X), -((y * state.scaled_zoom) - Y));
          context.globalAlpha = 1.0;
              
          //drawImage(context, 'galaxy', 'galaxy1', -((X -gW) / 2) * state.scaled_zoom, -(Y + (-gW / 2)) * state.scaled_zoom, gW, gW);                  
          for(i in solars){
            var solar = solars[i];
            solar.render(context);
          }
          
          for(i in entities){
            var entity = entities[i];
            entity.rotation+=0.1 * entity.speed;
            var angleInRadians = (entity.rotation % 360) * Math.PI / 180;
            context.translate((entity.x * state.scaled_zoom) - X, (entity.y * state.scaled_zoom) - Y);
            context.rotate(angleInRadians);
            drawImage(context, entity.tileset, entity.tileregion, -entity.width / 2, -entity.height / 2, entity.width, entity.height);
            context.rotate(-angleInRadians);
            context.translate(-((entity.x * state.scaled_zoom) - X), -((entity.y * state.scaled_zoom) - Y));
          }
          
          if (1==2 && state.showingWelcomeScreen){
            //state.scaled_zoom-=0.001;
            var x = screen.width / 2;
            var y = screen.height / 2;
            context.font = '30pt Calibri';
            context.textAlign = 'center';
            context.fillStyle = 'white';
            context.fillText('Welcome to ShipGame v0.0.1 ALPHA', x, y);
          
            context.font = '20pt Calibri';
            context.textAlign = 'left';
            context.fillStyle = 'white';
            context.fillText('mX=' + mouseX +',mY=' + mouseY, 20, 50);
            //context.fillText('mX=' + ((mouseX * state.scaled_zoom)-X) +',mY=' + ((mouseY * state.scaled_zoom)-Y), 20, 100);
            context.fillText('mX=' + ((mouseX +X) /state.scaled_zoom) +',mY=' + ((mouseY +Y) /state.scaled_zoom), 20, 100);
            context.fillText('X=' + X +',Y=' + Y, 20, 150);
            context.fillText('Z=' + state.zoom +',sZ=' + state.scaled_zoom, 20, 200);
          }
        },
        handleMouse = function(event){
          if (event.type == "mouseup"){
            if (state.isDragging){
              console.timeEnd("Time to pick a location");
              console.info(event);
              X = lastX - event.offsetX;// * state.scaled_zoom;
              Y = lastY - event.offsetY;// * state.scaled_zoom;
            }
            state.isDragging = false;
          }else if(event.type == "mousedown"){
            console.time("Time to pick a location");
            lastX = X + event.offsetX;// * state.scaled_zoom;
            lastY = Y + event.offsetY;// * state.scaled_zoom;
            state.isDragging = true;       
          }else if(event.type == "mousemove"){
            if (state.isDragging){
              X = lastX - event.offsetX;// * state.scaled_zoom;
              Y = lastY - event.offsetY;// * state.scaled_zoom;
            }
          }
          mouseX = event.offsetX;
          mouseY = event.offsetY;
        },
        handleMouseScroll = function(event){
          var last_scale_zoom = state.scaled_zoom;
          var mXO = ((mouseX +X) /state.scaled_zoom);
          var mYO = ((mouseY +Y) /state.scaled_zoom);
          if (event.wheelDeltaY>0){
            state.zoom+=ZOOM_SPEED;
            if (state.zoom > MAX_SCROLL_ZOOM){
              state.zoom = MAX_SCROLL_ZOOM;
            }
          }else if(event.wheelDeltaY<0){
            state.zoom-=ZOOM_SPEED;
            if (state.zoom < MIN_SCROLL_ZOOM){
              state.zoom = MIN_SCROLL_ZOOM;
            }
          }
          state.scaled_zoom = getScale(MIN_ALLOWED_ZOOM, MAX_ALLOWED_ZOOM, state.zoom);
          var mXO2 = ((mouseX +X) /state.scaled_zoom);
          var mYO2 = ((mouseY +Y) /state.scaled_zoom);
          X += (mXO - mXO2) *state.scaled_zoom;
          Y += (mYO - mYO2) *state.scaled_zoom;
          return false;
        },
        SolarSystem = function(name, x, y, star, planetArr){
          this.star = star;
          this.planets = planetArr;
          this.render = function(context){
            var star = this.star;
            star.rotation+=0.01;
            var angleInRadians = (star.rotation % 360) * Math.PI / 180;
            context.translate((x * state.scaled_zoom) - X, (y * state.scaled_zoom) - Y);
            context.rotate(angleInRadians);
            drawImage(context, star.tileset, star.tileregion, -star.width / 2, -star.height / 2, star.width, star.height);
            context.rotate(-angleInRadians);
            context.translate(-((x * state.scaled_zoom) - X), -((y * state.scaled_zoom) - Y));
            
            //var ss =  500; //sunsize
            //var x = MAX_MAP_X / 2 - ss / 2;
            //var y = MAX_MAP_Y / 2 - ss / 2;
            var ii = getScale(15, 200, state.zoom);
            
            for(i in this.planets){
              var planet = this.planets[i];
              planet.orbit+=planet.orbit_speed;
              planet.rotation+=planet.rotation_speed;
              var orbitInRadians = (planet.orbit % 360) * Math.PI / 180;
              var rotationInRadians = (planet.rotation % 360) * Math.PI / 180;
              var radius = planet.radius;
              
              context.beginPath();
              context.arc(((x) * state.scaled_zoom) - X, ((y) * state.scaled_zoom) - Y, radius *state.scaled_zoom, 0, 2 * Math.PI, false);
              context.lineWidth = 1;
              context.strokeStyle = 'rgba(255,255,255,'+((ii *100) /255 /100 )+')';
              context.stroke();
              
              context.translate((x * state.scaled_zoom) - X, (y * state.scaled_zoom) - Y);
              context.rotate(orbitInRadians);
                context.translate((planet.radius * state.scaled_zoom), (0 * state.scaled_zoom));
                context.rotate(rotationInRadians);
                  drawImage(context, planet.tileset, planet.tileregion, -planet.width / 2, -planet.width / 2, planet.width, planet.width);
                context.rotate(-rotationInRadians);
                context.translate(-((planet.radius * state.scaled_zoom)), -((0 * state.scaled_zoom)));
              context.rotate(-orbitInRadians);
              context.translate(-((x * state.scaled_zoom) - X), -((y * state.scaled_zoom) - Y));
            }
          };
        },
        Star = function(tileset, tileregion, width, height, rotation){
          this.rotation = rotation;
          this.x = 0;
          this.y = 0;
          this.width = width;
          this.height = height;
          this.tileset = tileset;
          this.tileregion = tileregion;
        },
        Planet = function(tileset, tileregion, r, width, rotation, orbit, rotation_speed, orbit_speed){
          this.orbit = orbit;
          this.orbit_speed = orbit_speed;
          this.rotation = rotation;
          this.rotation_speed = rotation_speed;
          this.radius = r;
          this.width = width;
          this.tileset = tileset;
          this.tileregion = tileregion;
        },
        ShipEntity = function(tileset, tileregion, x, y, width, height, rotation, speed){
          this.rotation = rotation;
          this.x = x;
          this.y = y;
          this.width = width;
          this.height = height;
          this.speed = speed;
          this.tileset = tileset;
          this.tileregion = tileregion;
        },
        startGame = function(){
          screen.addEventListener('mousewheel', handleMouseScroll, false);
          screen.addEventListener('mousedown', handleMouse, false);
          screen.addEventListener('mouseup', handleMouse, false);
          screen.addEventListener('mousemove', handleMouse, false);
          console.info("Starting Game.");
          
          var ss =  500; //sunsize
          var x = MAX_MAP_X / 2 - ss / 2;
          var y = MAX_MAP_Y / 2 - ss / 2;
          var debugMulti = 0.5;
          var planets = [
                          new Planet("planets", "blue1",     300, 100, 1,  42,    0, 1 * debugMulti),
                          new Planet("planets", "blue2",     550, 100, 2, 200,    0, 0.6 * debugMulti),
                          new Planet("planets", "blue3",     700, 100, 0,  29,    0, 0.3 * debugMulti),
                          new Planet("planets", "earth1",   1000, 170, 0, 300, 0.01, 0.1 * debugMulti),
                          new Planet("planets", "earth2",   1400, 170, 0,  57,    0, 0.05 * debugMulti),
                          new Planet("planets", "blue3",    1900, 500, 0, 207,    0, 0.005 * debugMulti),
                          new Planet("planets", "blue3",    2600,  80, 0,  97,    0, 0.0005 * debugMulti)
                        ];
          var planets2 = [
                          new Planet("planets", "blue1",     300, 100, 0,   42,    0, 2 * debugMulti),
                          new Planet("planets", "blue2",     550, 100, 0,   29,    0, 1.1 * debugMulti),
                          new Planet("planets", "blue3",     700, 100, 0,  207,    0, 0.6 * debugMulti),
                          new Planet("planets", "earth1",   1000, 170, 0,   57, 0.01, 0.3 * debugMulti),
                          new Planet("planets", "earth2",   1400, 170, 0,   97,    0, 0.09 * debugMulti),
                          new Planet("planets", "blue3",    1900, 500, 0,  300,    0, 0.009 * debugMulti),
                          new Planet("planets", "blue3",    2600,  80, 0,  200,    0, 0.0009 * debugMulti)
                        ];
          solars.milky_way = new SolarSystem('milky_way', -10000, 10000, new Star("suns", "solar_system", ss, ss, 0), planets);
          solars.milky_way2 = new SolarSystem('milky_way2', -10000, -10000, new Star("suns", "solar_system", ss, ss, 0), planets);
          solars.milky_way3 = new SolarSystem('milky_way3', 10000, -10000, new Star("suns", "solar_system", ss, ss, 0), planets2);
          solars.milky_way4 = new SolarSystem('milky_way4', 10000, 10000, new Star("suns", "solar_system", ss, ss, 0), planets2);
          entities.player = new ShipEntity("ships", "player", 100,  100, 100, 100, 0, 5);
          entities.enemy_1 = new ShipEntity("ships", "enemy", 0,  0, 100, 100, 0, -1);
          gameTimerFn();
        },
        gameTimer = null,
        gameTimerFn = function(){
          clearTimeout(gameTimer);
          
          drawFrame();  
          gameTimer = setTimeout(gameTimerFn, 1);
        };
        
    loadScreen();
    
    loadImage("galaxy.png", 'galaxy', {
        galaxy1: [0, 0, 786, 786]
    });
    loadImage("stars.png", 'stars', {
        stars1: [0, 0, 786, 786]
    });
    loadImage("sun_transparent.png", 'suns', {
        solar_system: [0, 0, 400, 400]
    });
    loadImage("ships.png", 'ships', {
        player: [0, 0, 331, 230],
        enemy: [0, 231, 384, 214]
    });
    loadImage("planets.png", 'planets', {
        blue1:    [0,   0, 142, 142],
        blue2:    [142, 0, 142, 142],
        blue3:    [284, 0, 142, 142],
        resource: [425, 0, 142, 142],
        crack:    [567, 0, 142, 142],
        earth1:   [709, 0, 142, 142],
        earth2:   [851, 0, 142, 142]
    });
};