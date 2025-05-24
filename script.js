document.addEventListener('DOMContentLoaded', () => {
    const mainPickupButton = document.querySelector('.pickup-button');
    const modalContainer = document.getElementById('pickupModalContainer');
    const modalOverlay = document.getElementById('pickupModalOverlay');
    const closeModalBtn = document.getElementById('closePickupModalBtn');

    // Nuevos elementos para la pantalla de agradecimiento
    const thankYouScreen = document.getElementById('thankYouScreen');
    const closeThankYouScreenBtn = document.getElementById('closeThankYouScreenBtn');

    // --- Modal Visibility ---
    function openModal() {
        if (modalContainer && modalOverlay) {
            modalContainer.classList.add('visible');
            modalOverlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() { // Esta es la función para cerrar el modal de recogida
        if (modalContainer && modalOverlay) {
            modalContainer.classList.remove('visible');
            modalOverlay.classList.remove('visible');
            document.body.style.overflow = '';
            resetSlider();
        }
    }

    if (mainPickupButton) mainPickupButton.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal); // Cierra el modal de recogida
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal); // Cierra el modal de recogida


    // --- Funciones para la pantalla de agradecimiento ---
    function showThankYouScreen() {
        if (thankYouScreen) {
            // Primero, ocultamos el modal de recogida y su overlay si están visibles
            if (modalContainer && modalContainer.classList.contains('visible')) {
                modalContainer.classList.remove('visible');
            }
            if (modalOverlay && modalOverlay.classList.contains('visible')) {
                modalOverlay.classList.remove('visible');
            }

            thankYouScreen.classList.add('visible');
            document.body.style.overflow = 'hidden'; // Asegura que el fondo no scrollee
        }
    }

    function hideThankYouScreen() {
        if (thankYouScreen) {
            thankYouScreen.classList.remove('visible');
            document.body.style.overflow = ''; // Restaura el scroll si es necesario
            // Opcionalmente, puedes decidir aquí si quieres volver a alguna pantalla específica
            // o simplemente permitir que el usuario interactúe con la página principal de nuevo.
            // El slider ya se resetea cuando el modal de recogida se cierra.
        }
    }

    if (closeThankYouScreenBtn) {
        closeThankYouScreenBtn.addEventListener('click', hideThankYouScreen);
    }


    // --- Slider Logic ---
    const sliderContainer = document.getElementById('pickupSliderContainer');
    const sliderTrack = sliderContainer ? sliderContainer.querySelector('.slider-pickup-track') : null;
    const sliderThumb = document.getElementById('pickupSliderThumb');
    const sliderText = sliderTrack ? sliderTrack.querySelector('.slider-pickup-text') : null;

    let isDragging = false;
    let startX;
    const TRACK_BORDER_WIDTH = 2;
    let initialThumbLeftPx;

    if (sliderThumb && sliderTrack && sliderContainer && sliderText) {
        function onDragStart(e) {
            // ... (código existente de onDragStart) ...
            e.preventDefault();
            isDragging = true;
            startX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
            sliderThumb.style.transition = 'none';
            sliderText.style.transition = 'none';
            sliderTrack.classList.add('dragging');
            initialThumbLeftPx = parseFloat(window.getComputedStyle(sliderThumb).left);
        }

        function onDragMove(e) {
            // ... (código existente de onDragMove) ...
            if (!isDragging) return;
            e.preventDefault();
            const currentX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
            const diffX = currentX - startX;
            const currentStyledLeft = parseFloat(sliderThumb.style.left || initialThumbLeftPx);
            let newStyledLeft = currentStyledLeft + diffX;
            const trackWidth = sliderTrack.offsetWidth;
            const thumbWidth = sliderThumb.offsetWidth;
            const minLeft = TRACK_BORDER_WIDTH;
            const maxLeft = trackWidth - thumbWidth - TRACK_BORDER_WIDTH;
            newStyledLeft = Math.max(minLeft, Math.min(newStyledLeft, maxLeft));
            sliderThumb.style.left = `${newStyledLeft}px`;
            const travelDistance = maxLeft - minLeft;
            const currentTravel = newStyledLeft - minLeft;
            let progress = 0;
            if (travelDistance > 0) progress = currentTravel / travelDistance;
            progress = Math.max(0, Math.min(progress, 1));
            sliderText.style.opacity = (1 - progress * 1.5).toFixed(2);
            startX = currentX;
        }

        function onDragEnd() {
            if (!isDragging) return;
            isDragging = false;
            sliderTrack.classList.remove('dragging');

            sliderThumb.style.transition = 'left 0.2s ease-out';
            sliderText.style.transition = 'opacity 0.2s ease-out';

            const currentThumbPos = parseFloat(sliderThumb.style.left);
            const trackWidth = sliderTrack.offsetWidth;
            const thumbWidth = sliderThumb.offsetWidth;
            const minSnapPosition = TRACK_BORDER_WIDTH;
            const maxSnapPosition = trackWidth - thumbWidth - TRACK_BORDER_WIDTH;
            const completionThresholdProgress = 0.75;
            const completionThresholdPx = minSnapPosition + (maxSnapPosition - minSnapPosition) * completionThresholdProgress;

            if (currentThumbPos >= completionThresholdPx) {
                sliderThumb.style.left = `${maxSnapPosition}px`;
                sliderText.style.opacity = '0';
                sliderContainer.classList.add('completed');
                console.log('Recogida confirmada!');
                disableSliderInteraction();

                // !MOSTRAR PANTALLA DE AGRADECIMIENTO!
                setTimeout(() => { // Pequeño delay para que el usuario vea el slider completarse
                    showThankYouScreen();
                }, 400); // 400ms de delay

            } else {
                sliderThumb.style.left = `${minSnapPosition}px`;
                sliderText.style.opacity = '1';
                sliderContainer.classList.remove('completed');
            }
        }

        function resetSliderVisuals() {
            // ... (código existente de resetSliderVisuals) ...
            sliderThumb.style.transition = 'left 0.2s ease-out';
            sliderText.style.transition = 'opacity 0.2s ease-out';
            const minSnapPosition = TRACK_BORDER_WIDTH;
            sliderThumb.style.left = `${minSnapPosition}px`;
            sliderText.style.opacity = '1';
            sliderContainer.classList.remove('completed');
        }

        function resetSlider() {
            resetSliderVisuals();
            enableSliderInteraction();
        }

        let interactionDisabled = false;
        function disableSliderInteraction() {
            // ... (código existente) ...
            if (interactionDisabled) return;
            sliderThumb.removeEventListener('mousedown', onDragStart);
            sliderThumb.removeEventListener('touchstart', onDragStart, { passive: false });
            interactionDisabled = true;
        }

        function enableSliderInteraction() {
            // ... (código existente) ...
            if (!interactionDisabled) return;
            if (sliderThumb) {
                sliderThumb.addEventListener('mousedown', onDragStart);
                sliderThumb.addEventListener('touchstart', onDragStart, { passive: false });
            }
            interactionDisabled = false;
        }

        sliderThumb.addEventListener('mousedown', onDragStart);
        sliderThumb.addEventListener('touchstart', onDragStart, { passive: false });
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchend', onDragEnd);

    } else {

        console.error("Slider elements not found. Check IDs (pickupSliderContainer, pickupSliderThumb, slider-pickup-text) and structure.");
        if (!sliderThumb) console.error("sliderThumb not found");
        if (!sliderTrack) console.error("sliderTrack not found");
        if (!sliderContainer) console.error("sliderContainer not found");
        if (!sliderText) console.error("sliderText not found");
    }
});
