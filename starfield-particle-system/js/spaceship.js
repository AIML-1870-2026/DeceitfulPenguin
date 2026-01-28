class Spaceship {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.visible = false;
        this.isPaused = false;
        this.reduceMotion = false;

        this.width = 200;
        this.height = 120;

        this.baseX = 0;
        this.baseY = 0;
        this.bobOffset = 0;
        this.tiltAngle = 0;

        this.engineGlow = 0;
        this.alienBlinkTimer = 0;
        this.alienIsBlinking = false;
        this.alienLookDirection = 0;

        this.opacity = 0;
        this.targetOpacity = 0;

        this.resize();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.baseX = rect.width - this.width - 50;
        this.baseY = rect.height - this.height - 80;
    }

    setVisible(visible) {
        this.targetOpacity = visible ? 1 : 0;
        this.visible = visible || this.opacity > 0;
    }

    setPaused(paused) {
        this.isPaused = paused;
    }

    setReduceMotion(enabled) {
        this.reduceMotion = enabled;
    }

    update(timestamp) {
        if (this.opacity < this.targetOpacity) {
            this.opacity = Math.min(this.targetOpacity, this.opacity + 0.03);
        } else if (this.opacity > this.targetOpacity) {
            this.opacity = Math.max(this.targetOpacity, this.opacity - 0.03);
        }

        if (this.opacity <= 0 && this.targetOpacity <= 0) {
            this.visible = false;
            return;
        }

        if (this.isPaused) return;

        if (!this.reduceMotion) {
            this.bobOffset = Math.sin(timestamp * 0.002) * 8;
            this.tiltAngle = Math.sin(timestamp * 0.001) * 0.03;
        } else {
            this.bobOffset = 0;
            this.tiltAngle = 0;
        }

        this.engineGlow = 0.5 + Math.sin(timestamp * 0.008) * 0.3;

        this.alienBlinkTimer += 16;
        if (this.alienBlinkTimer > 3000 && !this.alienIsBlinking) {
            this.alienIsBlinking = true;
            setTimeout(() => {
                this.alienIsBlinking = false;
                this.alienBlinkTimer = 0;
            }, 150);
        }

        if (Math.random() < 0.005) {
            this.alienLookDirection = (Math.random() - 0.5) * 0.3;
        }
    }

    render() {
        if (!this.visible || this.opacity <= 0) return;

        const ctx = this.ctx;
        const x = this.baseX;
        const y = this.baseY + this.bobOffset;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(x + this.width / 2, y + this.height / 2);
        ctx.rotate(this.tiltAngle);
        ctx.translate(-this.width / 2, -this.height / 2);

        this.drawEngineGlow(ctx);
        this.drawShipBody(ctx);
        this.drawCockpit(ctx);
        this.drawAlien(ctx);
        this.drawDetails(ctx);

        ctx.restore();
    }

    drawEngineGlow(ctx) {
        const glowX = -20;
        const glowY = this.height / 2;

        const gradient = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 60);
        gradient.addColorStop(0, `rgba(100, 200, 255, ${this.engineGlow * 0.8})`);
        gradient.addColorStop(0.3, `rgba(50, 150, 255, ${this.engineGlow * 0.5})`);
        gradient.addColorStop(0.6, `rgba(30, 100, 255, ${this.engineGlow * 0.3})`);
        gradient.addColorStop(1, 'rgba(0, 50, 200, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(glowX, glowY, 60 * this.engineGlow, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        const innerGradient = ctx.createRadialGradient(glowX + 10, glowY, 0, glowX + 10, glowY, 20);
        innerGradient.addColorStop(0, `rgba(255, 255, 255, ${this.engineGlow})`);
        innerGradient.addColorStop(1, 'rgba(100, 200, 255, 0)');

        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.ellipse(glowX + 10, glowY, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawShipBody(ctx) {
        ctx.fillStyle = '#4a5568';
        ctx.beginPath();
        ctx.moveTo(this.width - 20, this.height / 2);
        ctx.quadraticCurveTo(this.width, this.height / 2 - 15, this.width - 30, this.height / 2 - 35);
        ctx.lineTo(60, this.height / 2 - 40);
        ctx.quadraticCurveTo(20, this.height / 2 - 35, 10, this.height / 2);
        ctx.quadraticCurveTo(20, this.height / 2 + 35, 60, this.height / 2 + 40);
        ctx.lineTo(this.width - 30, this.height / 2 + 35);
        ctx.quadraticCurveTo(this.width, this.height / 2 + 15, this.width - 20, this.height / 2);
        ctx.fill();

        ctx.fillStyle = '#2d3748';
        ctx.beginPath();
        ctx.moveTo(10, this.height / 2);
        ctx.quadraticCurveTo(20, this.height / 2 + 35, 60, this.height / 2 + 40);
        ctx.lineTo(this.width - 30, this.height / 2 + 35);
        ctx.quadraticCurveTo(this.width, this.height / 2 + 15, this.width - 20, this.height / 2);
        ctx.lineTo(10, this.height / 2);
        ctx.fill();

        ctx.fillStyle = '#718096';
        ctx.beginPath();
        ctx.moveTo(this.width - 20, this.height / 2);
        ctx.quadraticCurveTo(this.width, this.height / 2 - 15, this.width - 30, this.height / 2 - 35);
        ctx.lineTo(this.width - 50, this.height / 2 - 30);
        ctx.lineTo(this.width - 30, this.height / 2);
        ctx.fill();
    }

    drawCockpit(ctx) {
        const cockpitX = 100;
        const cockpitY = this.height / 2 - 25;
        const cockpitW = 70;
        const cockpitH = 50;

        ctx.fillStyle = 'rgba(20, 40, 60, 0.9)';
        ctx.beginPath();
        ctx.ellipse(cockpitX + cockpitW / 2, cockpitY + cockpitH / 2, cockpitW / 2, cockpitH / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        const glassGradient = ctx.createLinearGradient(cockpitX, cockpitY, cockpitX + cockpitW, cockpitY + cockpitH);
        glassGradient.addColorStop(0, 'rgba(100, 180, 255, 0.3)');
        glassGradient.addColorStop(0.5, 'rgba(50, 100, 150, 0.1)');
        glassGradient.addColorStop(1, 'rgba(100, 180, 255, 0.2)');

        ctx.fillStyle = glassGradient;
        ctx.beginPath();
        ctx.ellipse(cockpitX + cockpitW / 2, cockpitY + cockpitH / 2, cockpitW / 2 - 3, cockpitH / 2 - 3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(150, 200, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cockpitX + cockpitW / 2, cockpitY + cockpitH / 2, cockpitW / 2, cockpitH / 2, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(200, 230, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cockpitX + cockpitW / 2 - 10, cockpitY + cockpitH / 2 - 10, 15, 8, -0.5, 0, Math.PI);
        ctx.stroke();
    }

    drawAlien(ctx) {
        const alienX = 125 + this.alienLookDirection * 5;
        const alienY = this.height / 2 - 15;

        ctx.fillStyle = '#7cb87c';
        ctx.beginPath();
        ctx.ellipse(alienX, alienY, 18, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#5a9a5a';
        ctx.beginPath();
        ctx.ellipse(alienX, alienY + 12, 14, 8, 0, 0.2, Math.PI - 0.2);
        ctx.fill();

        if (!this.alienIsBlinking) {
            const eyeOffsetX = this.alienLookDirection * 3;

            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.ellipse(alienX - 8 + eyeOffsetX, alienY - 5, 7, 10, -0.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(alienX + 8 + eyeOffsetX, alienY - 5, 7, 10, 0.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(alienX - 6 + eyeOffsetX, alienY - 7, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(alienX + 10 + eyeOffsetX, alienY - 7, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.strokeStyle = '#1a1a2e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(alienX - 12, alienY - 5);
            ctx.lineTo(alienX - 4, alienY - 5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(alienX + 4, alienY - 5);
            ctx.lineTo(alienX + 12, alienY - 5);
            ctx.stroke();
        }

        ctx.fillStyle = '#5a9a5a';
        ctx.beginPath();
        ctx.moveTo(alienX - 3, alienY + 8);
        ctx.quadraticCurveTo(alienX, alienY + 12, alienX + 3, alienY + 8);
        ctx.fill();

        ctx.fillStyle = '#7cb87c';
        ctx.beginPath();
        ctx.ellipse(alienX + 25, alienY + 15, 8, 5, 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#5a9a5a';
        ctx.beginPath();
        ctx.arc(alienX + 28, alienY + 17, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(alienX + 24, alienY + 14, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(alienX + 30, alienY + 14, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawDetails(ctx) {
        ctx.fillStyle = '#e53e3e';
        ctx.beginPath();
        ctx.arc(70, this.height / 2 - 30, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#38b2ac';
        ctx.beginPath();
        ctx.arc(80, this.height / 2 - 28, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#718096';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(50, this.height / 2 - 15);
        ctx.lineTo(40, this.height / 2 - 35);
        ctx.lineTo(35, this.height / 2 - 30);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(50, this.height / 2 + 15);
        ctx.lineTo(40, this.height / 2 + 35);
        ctx.lineTo(35, this.height / 2 + 30);
        ctx.stroke();

        ctx.fillStyle = '#4a5568';
        ctx.beginPath();
        ctx.ellipse(25, this.height / 2, 12, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2d3748';
        ctx.beginPath();
        ctx.ellipse(25, this.height / 2, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}
