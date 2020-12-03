/**
 * Heavily inspired by Hakim's (@hakimel( 
 * experiments with canvas!
 */

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 
// MIT license
 
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
   
    if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
   
      if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
          clearTimeout(id);
        };
}());
(function(){
  var SCREEN_WIDTH = 700;
  var SCREEN_HEIGHT = 300;

  var RADIUS = 110;

  var RADIUS_SCALE = 1;
  var RADIUS_SCALE_MIN = 1;
  var RADIUS_SCALE_MAX = 1.5;
  var PARTICLE_SIZE = 10;

  var INFECTED_COLOR = '#FF0000';
  var UNINFECTED_COLOR = '#EFB752';
  var IMMUNE_COLOR = '#7F00FF'
  var RECOVERY_DURATION = 5 * 1000;
  var PERCENT_INIT_INFECTED = 0.1;
  
  var QUANTITY = 200;
  function simulate() {
    var canvas;
    var context;
    var particles;
    var paused = true;

    function init(){
  
      canvas = document.getElementById('world');
  
      if(canvas && canvas.getContext) {
        context = canvas.getContext('2d');
        context.globalCompositeOperation = 'source-over';
        window.addEventListener('resize', windowResizeHandler, false);
        windowResizeHandler();
        createParticles();
        loop();
      }
    }
    
    function createParticles(){
    
      particles = [];
      var depth = 0;
  
      for (var i = 0; i < QUANTITY; i++) {
        var posX = PARTICLE_SIZE/2 + Math.random() * (window.innerWidth - PARTICLE_SIZE/2)
        var posY = PARTICLE_SIZE/2 + Math.random() * (window.innerHeight - PARTICLE_SIZE/2);
  
        var speed = 2;
        var directionX = -speed + (Math.random() * speed*2);
        var directionY = -speed + (Math.random()* speed*2);
        var fillColor = (i < PERCENT_INIT_INFECTED * QUANTITY) ? INFECTED_COLOR : UNINFECTED_COLOR;
        var initTimestamp = new Date().getTime();
        var particle = {
          position: { x: posX, y: posY },
          size: PARTICLE_SIZE,
          directionX: directionX,
          directionY: directionY,
          speed: speed,
          targetX: posX,
          targetY: posY,
          depth: depth,
          index:i,
          fillColor: fillColor,
          infectedTimeStamp: initTimestamp,
        };
  
        particles.push(particle);
      }
      initializeTracker()
    }
  
    function loop(){
  
      context.fillStyle = '#141D28';
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  
      var z = 0;
      var xdist = 0;
      var ydist = 0;
      var dist = 0;
  
      for (var i=0; i < particles.length; i++){
        var particle = particles[i];
        var currentTimestamp = new Date().getTime();
        if(particle.fillColor == INFECTED_COLOR && (currentTimestamp - particle.infectedTimeStamp) > RECOVERY_DURATION) {
            particle.fillColor = IMMUNE_COLOR;
        }
        var lp = { x: particle.position.x, y: particle.position.y };
        
        // Handle left and right collisions
        if(particle.position.x <=particle.size/2 || particle.position.x >= SCREEN_WIDTH - PARTICLE_SIZE/2){
          particle.directionX *= -1;
        }
        // Handle top and bottom collisions
        if(particle.position.y <=particle.size/2 || particle.position.y >= SCREEN_HEIGHT - PARTICLE_SIZE/2){
          particle.directionY *= -1;
        }
        // Check collision for every other particle
        for(var s=0; s < particles.length; s++) {
          var bounceParticle = particles[s];
            // ignore same particle
            if(bounceParticle.index != particle.index) {
              //what are the distances
              z = PARTICLE_SIZE;
              xdist = Math.abs(bounceParticle.position.x - particle.position.x);
              ydist = Math.abs(bounceParticle.position.y - particle.position.y);
              dist = Math.sqrt(Math.pow(xdist, 2) + Math.pow(ydist, 2));
              // Has gotten closer than the limit => collision
              if(dist < z) {
                  if(particle.fillColor == INFECTED_COLOR && bounceParticle.fillColor != IMMUNE_COLOR) {
                      bounceParticle.fillColor = INFECTED_COLOR;
                      bounceParticle.infectedTimeStamp = currentTimestamp;
                  } else if(bounceParticle.fillColor == INFECTED_COLOR && particle.fillColor != IMMUNE_COLOR) {
                      particle.fillColor = INFECTED_COLOR;
                      particle.infectedTimeStamp = currentTimestamp;
                  }
                elasticCollision(particle, bounceParticle);
              }
            }
          }
          if(!(paused)) {
            particle.position.x -= particle.directionX;
            particle.position.y -= particle.directionY;
          }
          context.beginPath();
          context.fillStyle = particle.fillColor;
          context.lineWidth = particle.size;
          context.moveTo(lp.x, lp.y);
          context.arc(particle.position.x, particle.position.y, particle.size/2, 0, Math.PI*2, true);
          context.closePath();
          context.fill();
      }
      
      requestAnimationFrame(loop);
    }
  
  
    function elasticCollision(particle1, particle2) {
      tempX = particle1.directionX;
      particle1.directionX = particle2.directionX;
      particle2.directionX = tempX;
      
      tempY = particle1.directionY;
      particle1.directionY = particle2.directionY;
      particle2.directionY = tempY;
    }
  
    function randomiseDirection (particle) {
  
      //pick a random deg
      var d = 0;
      while((d == 0) || (d == 90) || (d == 180) || (d == 360)) {
        d = Math.floor(Math.random() * 360);
      }
  
      var r = (d * 180)/Math.PI;
      particle.directionX = Math.sin(r) * particle.speed;
      particle.directionY = Math.cos(r) * particle.speed;
  
    }
  
    function windowResizeHandler() {
      SCREEN_WIDTH = window.innerWidth;
      SCREEN_HEIGHT = window.innerHeight;
      canvas.width = SCREEN_WIDTH;
      canvas.height = SCREEN_HEIGHT;
    }
  
    function initializeTracker() {
      var numInfected = 0;
      var numUninfected = 0;
      for(var i = 0; i < particles.length; i++) {
        if(particles[i].fillColor == INFECTED_COLOR) {
          numInfected++;
        } else {
          numUninfected++;
        }
      }
      document.getElementById('uninfected-count').innerHTML = numUninfected;
      document.getElementById('infected-count').innerHTML = numInfected;
      document.getElementById('immune-count').innerHTML = 0;
    }
    init();
    function pauseToggle(e) {
      if(!paused) {
        e.target.innerHTML = "Play";
      } else {
        e.target.innerHTML = "Pause";
      }
      paused = !(paused)
    }
    document.getElementById('pause').addEventListener('click', pauseToggle);
  }
  simulate();
  
  function changeNumberOfParticles(e) {
    QUANTITY = e.target.value;
  }
  document.getElementById('numParticles').addEventListener('input', changeNumberOfParticles);
  document.getElementById('restart').addEventListener('click', simulate);
}())