class Particle {
    constructor(centerX, centerY, spawnRadius, maxZ) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.spawnRadius = spawnRadius;
        this.maxZ = maxZ;
        this.reset(true);
    }

    reset(initialSpawn = false) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * this.spawnRadius;

        this.x = Math.cos(angle) * radius;
        this.y = Math.sin(angle) * radius;

        // On initial spawn, distribute particles across the visible range
        // On recycle, start at max distance
        if (initialSpawn) {
            this.z = this.maxZ * 0.15 + Math.random() * this.maxZ * 0.7;
        } else {
            this.z = this.maxZ;
        }

        this.prevX = this.x;
        this.prevY = this.y;
        this.prevZ = this.z;

        this.baseSpeed = 0.5 + Math.random() * 0.5;

        const colorVariation = Math.random();
        if (colorVariation < 0.7) {
            this.baseColor = { r: 255, g: 255, b: 255 };
        } else {
            this.baseColor = { r: 224, g: 240, b: 255 };
        }

        this.size = 1 + Math.random() * 1.5;
    }

    update(speedMultiplier, deltaTime) {
        this.prevX = this.x;
        this.prevY = this.y;
        this.prevZ = this.z;

        const acceleration = Math.max(0.1, (this.maxZ - this.z) / this.maxZ);
        this.z -= this.baseSpeed * speedMultiplier * deltaTime * 60 * acceleration;

        // Recycle before particles get too close (prevents huge stars)
        if (this.z <= 50) {
            this.reset();
            this.z = this.maxZ;
            this.prevZ = this.z;
        }
    }

    project(focalLength, centerX, centerY) {
        const scale = focalLength / this.z;
        const screenX = this.x * scale + centerX;
        const screenY = this.y * scale + centerY;

        const prevScale = focalLength / this.prevZ;
        const prevScreenX = this.prevX * prevScale + centerX;
        const prevScreenY = this.prevY * prevScale + centerY;

        // Cap the size so stars never become huge blobs
        const maxSize = 3;
        const calculatedSize = Math.min(this.size * scale * 0.3, maxSize);

        return {
            x: screenX,
            y: screenY,
            prevX: prevScreenX,
            prevY: prevScreenY,
            scale: scale,
            size: calculatedSize
        };
    }

    getOpacity() {
        const fadeInStart = this.maxZ * 0.9;
        const fadeOutEnd = this.maxZ * 0.05;

        if (this.z > fadeInStart) {
            return 1 - (this.z - fadeInStart) / (this.maxZ - fadeInStart);
        } else if (this.z < fadeOutEnd) {
            return this.z / fadeOutEnd;
        }
        return 1;
    }

    isOutOfBounds(screenX, screenY, canvasWidth, canvasHeight, margin = 100) {
        return screenX < -margin ||
               screenX > canvasWidth + margin ||
               screenY < -margin ||
               screenY > canvasHeight + margin;
    }
}
