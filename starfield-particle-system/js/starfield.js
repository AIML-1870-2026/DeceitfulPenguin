class Starfield {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.particles = [];
        this.particlePool = [];

        this.settings = {
            trailLength: 50,
            starCount: 1000,
            speedMultiplier: 1.0,
            spawnRadius: 10,
            starColor: '#FFFFFF',
            reduceMotion: false
        };

        this.focalLength = 300;
        this.maxZ = 1000;

        this.lastTime = 0;
        this.deltaTime = 0;
        this.isPaused = false;

        this.fpsHistory = [];
        this.currentFPS = 60;

        this.resize();
        this.initParticles();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.scale(dpr, dpr);

        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.updateParticlePositions();
    }

    updateParticlePositions() {
        for (const particle of this.particles) {
            particle.centerX = this.centerX;
            particle.centerY = this.centerY;
        }
    }

    initParticles() {
        this.particles = [];
        this.particlePool = [];

        for (let i = 0; i < this.settings.starCount; i++) {
            const particle = new Particle(
                this.centerX,
                this.centerY,
                this.settings.spawnRadius,
                this.maxZ
            );
            this.particles.push(particle);
        }
    }

    setStarCount(count) {
        const diff = count - this.particles.length;

        if (diff > 0) {
            for (let i = 0; i < diff; i++) {
                let particle;
                if (this.particlePool.length > 0) {
                    particle = this.particlePool.pop();
                    particle.spawnRadius = this.settings.spawnRadius;
                    particle.reset();
                } else {
                    particle = new Particle(
                        this.centerX,
                        this.centerY,
                        this.settings.spawnRadius,
                        this.maxZ
                    );
                }
                this.particles.push(particle);
            }
        } else if (diff < 0) {
            const removed = this.particles.splice(count, -diff);
            this.particlePool.push(...removed);
        }

        this.settings.starCount = count;
    }

    setSpawnRadius(radius) {
        this.settings.spawnRadius = radius;
        for (const particle of this.particles) {
            particle.spawnRadius = radius;
        }
    }

    setTrailLength(length) {
        this.settings.trailLength = length;
    }

    setSpeedMultiplier(multiplier) {
        this.settings.speedMultiplier = multiplier;
    }

    setStarColor(color) {
        this.settings.starColor = color;
    }

    setReduceMotion(enabled) {
        this.settings.reduceMotion = enabled;
        if (enabled) {
            this.settings.speedMultiplier = Math.min(this.settings.speedMultiplier, 0.3);
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
    }

    toggle() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
        return this.isPaused;
    }

    getColor(particle) {
        if (this.settings.starColor === 'rainbow') {
            const hue = (particle.z / this.maxZ * 360 + Date.now() * 0.05) % 360;
            return `hsl(${hue}, 100%, 70%)`;
        }
        return this.settings.starColor;
    }

    update(timestamp) {
        if (this.isPaused) return;

        this.deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        this.fpsHistory.push(1 / this.deltaTime);
        if (this.fpsHistory.length > 30) {
            this.fpsHistory.shift();
        }
        this.currentFPS = Math.round(
            this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
        );

        const effectiveSpeed = this.settings.reduceMotion
            ? Math.min(this.settings.speedMultiplier, 0.3)
            : this.settings.speedMultiplier;

        for (const particle of this.particles) {
            particle.update(effectiveSpeed, this.deltaTime);

            const projected = particle.project(this.focalLength, this.centerX, this.centerY);
            if (particle.isOutOfBounds(projected.x, projected.y, this.width, this.height)) {
                particle.reset();
                particle.z = this.maxZ;
                particle.prevZ = this.maxZ;
            }
        }
    }

    render() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        const sortedParticles = [...this.particles].sort((a, b) => b.z - a.z);

        const trailFactor = this.settings.trailLength / 100;

        for (const particle of sortedParticles) {
            const projected = particle.project(this.focalLength, this.centerX, this.centerY);
            const opacity = particle.getOpacity();
            const color = this.getColor(particle);

            this.ctx.strokeStyle = color;
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = opacity;

            if (trailFactor > 0.05 && !this.settings.reduceMotion) {
                const trailX = projected.prevX + (projected.x - projected.prevX) * (1 - trailFactor);
                const trailY = projected.prevY + (projected.y - projected.prevY) * (1 - trailFactor);

                this.ctx.beginPath();
                this.ctx.moveTo(trailX, trailY);
                this.ctx.lineTo(projected.x, projected.y);
                this.ctx.lineWidth = Math.max(0.5, projected.size * 0.5);
                this.ctx.stroke();
            }

            this.ctx.beginPath();
            this.ctx.arc(projected.x, projected.y, Math.max(0.5, projected.size), 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;
    }

    getFPS() {
        return this.currentFPS;
    }
}
