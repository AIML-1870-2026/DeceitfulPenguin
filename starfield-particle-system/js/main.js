(function() {
    'use strict';

    const canvas = document.getElementById('starfield');

    if (!canvas || !canvas.getContext) {
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center;
                        height: 100vh; color: white; font-family: sans-serif; text-align: center;">
                <div>
                    <h1>Canvas Not Supported</h1>
                    <p>Please use a modern browser to view the starfield effect.</p>
                </div>
            </div>
        `;
        return;
    }

    const starfield = new Starfield(canvas);
    const spaceship = new Spaceship(canvas);
    const controls = new Controls(starfield, spaceship);

    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            starfield.resize();
            spaceship.resize();
        }, 100);
    }

    window.addEventListener('resize', handleResize);

    let lastFPSUpdate = 0;
    function animate(timestamp) {
        starfield.update(timestamp);
        spaceship.update(timestamp);

        starfield.render();
        spaceship.render();

        if (timestamp - lastFPSUpdate > 500) {
            controls.updateFPS(starfield.getFPS());
            lastFPSUpdate = timestamp;
        }

        requestAnimationFrame(animate);
    }

    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
        requestAnimationFrame(animate);
    });

    if (document.readyState === 'complete') {
        document.body.style.opacity = '1';
        requestAnimationFrame(animate);
    }
})();
