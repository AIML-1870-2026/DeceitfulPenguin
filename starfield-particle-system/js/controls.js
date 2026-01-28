class Controls {
    constructor(starfield, spaceship) {
        this.starfield = starfield;
        this.spaceship = spaceship;

        this.elements = {
            toggleBtn: document.getElementById('toggle-controls'),
            controlPanel: document.getElementById('controls'),
            trailLength: document.getElementById('trail-length'),
            trailValue: document.getElementById('trail-value'),
            starCount: document.getElementById('star-count'),
            countValue: document.getElementById('count-value'),
            starSpeed: document.getElementById('star-speed'),
            speedValue: document.getElementById('speed-value'),
            spawnRadius: document.getElementById('spawn-radius'),
            radiusValue: document.getElementById('radius-value'),
            starColor: document.getElementById('star-color'),
            showSpaceship: document.getElementById('show-spaceship'),
            reduceMotion: document.getElementById('reduce-motion'),
            showFps: document.getElementById('show-fps'),
            pauseBtn: document.getElementById('pause-btn'),
            fpsCounter: document.getElementById('fps-counter'),
            warning: document.getElementById('performance-warning')
        };

        this.loadSettings();
        this.bindEvents();
    }

    bindEvents() {
        this.elements.toggleBtn.addEventListener('click', () => {
            this.elements.controlPanel.classList.toggle('collapsed');
            this.saveSettings();
        });

        this.elements.trailLength.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.elements.trailValue.textContent = value;
            this.starfield.setTrailLength(value);
            this.debouncedSave();
        });

        this.elements.starCount.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.elements.countValue.textContent = value;
            this.starfield.setStarCount(value);

            if (value > 1500) {
                this.showWarning();
            }
            this.debouncedSave();
        });

        this.elements.starSpeed.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.elements.speedValue.textContent = value.toFixed(1) + 'x';
            this.starfield.setSpeedMultiplier(value);
            this.debouncedSave();
        });

        this.elements.spawnRadius.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.elements.radiusValue.textContent = value + 'px';
            this.starfield.setSpawnRadius(value);
            this.debouncedSave();
        });

        this.elements.starColor.addEventListener('change', (e) => {
            this.starfield.setStarColor(e.target.value);
            this.saveSettings();
        });

        this.elements.showSpaceship.addEventListener('change', (e) => {
            this.spaceship.setVisible(e.target.checked);
            this.saveSettings();
        });

        this.elements.reduceMotion.addEventListener('change', (e) => {
            this.starfield.setReduceMotion(e.target.checked);
            this.spaceship.setReduceMotion(e.target.checked);
            this.saveSettings();
        });

        this.elements.showFps.addEventListener('change', (e) => {
            this.elements.fpsCounter.classList.toggle('hidden', !e.target.checked);
            this.saveSettings();
        });

        this.elements.pauseBtn.addEventListener('click', () => {
            const isPaused = this.starfield.toggle();
            this.spaceship.setPaused(isPaused);
            this.elements.pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
            this.elements.pauseBtn.classList.toggle('paused', isPaused);
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
                this.elements.pauseBtn.click();
            }
        });
    }

    showWarning() {
        this.elements.warning.classList.remove('hidden');
        setTimeout(() => {
            this.elements.warning.classList.add('hidden');
        }, 3000);
    }

    updateFPS(fps) {
        this.elements.fpsCounter.textContent = `FPS: ${fps}`;

        if (fps < 30 && this.starfield.settings.starCount > 500) {
            this.autoReduceQuality();
        }
    }

    autoReduceQuality() {
        const newCount = Math.max(300, Math.floor(this.starfield.settings.starCount * 0.8));
        this.starfield.setStarCount(newCount);
        this.elements.starCount.value = newCount;
        this.elements.countValue.textContent = newCount;
    }

    debouncedSave() {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this.saveSettings(), 300);
    }

    saveSettings() {
        const settings = {
            trailLength: parseInt(this.elements.trailLength.value),
            starCount: parseInt(this.elements.starCount.value),
            starSpeed: parseFloat(this.elements.starSpeed.value),
            spawnRadius: parseInt(this.elements.spawnRadius.value),
            starColor: this.elements.starColor.value,
            showSpaceship: this.elements.showSpaceship.checked,
            reduceMotion: this.elements.reduceMotion.checked,
            showFps: this.elements.showFps.checked,
            collapsed: this.elements.controlPanel.classList.contains('collapsed')
        };

        try {
            localStorage.setItem('starfield-settings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Could not save settings to localStorage');
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('starfield-settings');
            if (!saved) {
                this.applyMobileDefaults();
                return;
            }

            const settings = JSON.parse(saved);

            if (settings.trailLength !== undefined) {
                this.elements.trailLength.value = settings.trailLength;
                this.elements.trailValue.textContent = settings.trailLength;
                this.starfield.setTrailLength(settings.trailLength);
            }

            if (settings.starCount !== undefined) {
                this.elements.starCount.value = settings.starCount;
                this.elements.countValue.textContent = settings.starCount;
                this.starfield.setStarCount(settings.starCount);
            }

            if (settings.starSpeed !== undefined) {
                this.elements.starSpeed.value = settings.starSpeed;
                this.elements.speedValue.textContent = settings.starSpeed.toFixed(1) + 'x';
                this.starfield.setSpeedMultiplier(settings.starSpeed);
            }

            if (settings.spawnRadius !== undefined) {
                this.elements.spawnRadius.value = settings.spawnRadius;
                this.elements.radiusValue.textContent = settings.spawnRadius + 'px';
                this.starfield.setSpawnRadius(settings.spawnRadius);
            }

            if (settings.starColor !== undefined) {
                this.elements.starColor.value = settings.starColor;
                this.starfield.setStarColor(settings.starColor);
            }

            if (settings.showSpaceship !== undefined) {
                this.elements.showSpaceship.checked = settings.showSpaceship;
                this.spaceship.setVisible(settings.showSpaceship);
            }

            if (settings.reduceMotion !== undefined) {
                this.elements.reduceMotion.checked = settings.reduceMotion;
                this.starfield.setReduceMotion(settings.reduceMotion);
                this.spaceship.setReduceMotion(settings.reduceMotion);
            }

            if (settings.showFps !== undefined) {
                this.elements.showFps.checked = settings.showFps;
                this.elements.fpsCounter.classList.toggle('hidden', !settings.showFps);
            }

            if (settings.collapsed) {
                this.elements.controlPanel.classList.add('collapsed');
            }

        } catch (e) {
            console.warn('Could not load settings from localStorage');
            this.applyMobileDefaults();
        }
    }

    applyMobileDefaults() {
        const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;

        if (isMobile) {
            const mobileCount = 400;
            this.elements.starCount.value = mobileCount;
            this.elements.countValue.textContent = mobileCount;
            this.starfield.setStarCount(mobileCount);
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.elements.reduceMotion.checked = true;
            this.starfield.setReduceMotion(true);
            this.spaceship.setReduceMotion(true);
        }
    }
}
