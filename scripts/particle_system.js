'use strict';
function ParticleSystem(spec, graphics) {
    let self = {},
        nextName = 1,
        particles = {},
        imageSrc = spec.image;

    spec.image = new Image();
    spec.image.onload = function() {

        self.render = function() {
            let value, particle;
            for(value in particles) {
                if (particles.hasOwnProperty(value)) {
                    particle = particles[value];
                    graphics.drawImage(particle);
                }
            }
        };
    };

    spec.image.src = imageSrc;

    self.render = function() {};

    self.create = function(x, y) {
        // Creates one particle
        let p = {
            image: spec.image,
            size: Random.nextGaussian(10, 4),
            center: {x: x, y: y},
            direction: Random.nextCircleVector(),
            speed: Random.nextGaussian(spec.speed.mean, spec.speed.stdev), // pixels per second
            rotation: 0,
            lifetime: Random.nextGaussian(spec.lifetime.mean, spec.lifetime.stdev),	// How long the particle should live, in seconds
            alive: 0 // How long the particle has been alive, in seconds
        };

        p.size = Math.max(1, p.size);
		p.lifetime = Math.max(0.01, p.lifetime);
		
        particles[nextName++] = p;
    };

    self.createMultipleParticles = function(x, y) {
        for(let i = 0; i < 10; i++) {
            self.create(x, y);
        }
    };

    self.update = function(elapsedTime) {
        let removeMe = [],
            value,
            particle;
        elapsedTime = elapsedTime / 1000;
        for (value in particles) {
			if (particles.hasOwnProperty(value)) {
				particle = particles[value];
                
				// Update how long it has been alive
				particle.alive += elapsedTime;
				
				// Update its position
				particle.center.x += (elapsedTime * particle.speed * particle.direction.x);
				particle.center.y += (elapsedTime * particle.speed * particle.direction.y);
				
				// Rotate proportional to its speed
				particle.rotation += particle.speed / 500;
				
				// If the lifetime has expired, identify it for removal
				if (particle.alive > particle.lifetime) {
					removeMe.push(value);
				}
			}
		}

		// Remove all of the expired particles
		for (particle = 0; particle < removeMe.length; particle++) {
			delete particles[removeMe[particle]];
		}
		removeMe.length = 0;
    }
    
    return self;
}