document.addEventListener('DOMContentLoaded', () => {
    // Elementos del Pre-Menú
    const preMenuContainer = document.getElementById('preMenuContainer');
    const configForm = document.getElementById('configForm');

    // Elemento principal de la app
    const appContainer = document.getElementById('appContainer');

    // Botón de retroceso en appContainer
    const goBackToPreMenuBtn = document.getElementById('goBackToPreMenu');

    // Elementos a poblar en appContainer
    const logoTextPlaceholder = document.getElementById('logoTextPlaceholder');
    const displayEstablishmentName = document.getElementById('displayEstablishmentName');
    const displayEstablishmentAddress = document.getElementById('displayEstablishmentAddress');
    const displayPickupDate = document.getElementById('displayPickupDate');
    const displayPickupTime = document.getElementById('displayPickupTime');
    const displayPackCount = document.getElementById('displayPackCount');
    const displayTotalPrice = document.getElementById('displayTotalPrice');

    // Elementos a poblar en el Modal de Recogida
    const modalPackIconText = document.getElementById('modalPackIconText');
    const modalEstablishmentName = document.getElementById('modalEstablishmentName');

    // Elementos del modal de recogida y pantalla de agradecimiento
    const mainPickupButton = document.querySelector('.pickup-button');
    const modalContainer = document.getElementById('pickupModalContainer');
    const modalOverlay = document.getElementById('pickupModalOverlay');
    const closeModalBtn = document.getElementById('closePickupModalBtn');
    const thankYouScreen = document.getElementById('thankYouScreen');
    const closeThankYouScreenBtn = document.getElementById('closeThankYouScreenBtn');

    // Elementos del slider
    const sliderContainer = document.getElementById('pickupSliderContainer');
    const sliderTrack = sliderContainer ? sliderContainer.querySelector('.slider-pickup-track') : null;
    const sliderThumb = document.getElementById('pickupSliderThumb');
    const sliderText = sliderTrack ? sliderTrack.querySelector('.slider-pickup-text') : null;

    // --- Lógica del Pre-Menú ---
    if (configForm) {
        const pickupDateInput = document.getElementById('pickupDate');
        if (pickupDateInput) {
            try {
                const today = new Date();
                const offset = today.getTimezoneOffset();
                const todayLocal = new Date(today.getTime() - (offset*60*1000));
                pickupDateInput.value = todayLocal.toISOString().split('T')[0];
            } catch(e) {
                console.warn("No se pudo establecer la fecha por defecto:", e);
            }
        }

        configForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const establishmentNameInput = document.getElementById('establishmentName').value;
            const establishmentAddressInput = document.getElementById('establishmentAddress').value;
            const pickupDateRaw = document.getElementById('pickupDate').value;
            const pickupTimeInput = document.getElementById('pickupTime').value;
            const packCountInput = document.getElementById('packCount').value;
            const totalPriceInput = parseFloat(document.getElementById('totalPrice').value).toFixed(2);

            let formattedDate = pickupDateRaw;
            if (pickupDateRaw) {
                try {
                    const dateObj = new Date(pickupDateRaw + 'T00:00:00Z');
                    const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
                    formattedDate = dateObj.toLocaleDateString('es-ES', options);
                } catch (e) {
                    console.error("Error formateando fecha:", e);
                }
            }

            if (logoTextPlaceholder) logoTextPlaceholder.textContent = establishmentNameInput.charAt(0).toUpperCase();
            if (displayEstablishmentName) displayEstablishmentName.textContent = establishmentNameInput;
            if (displayEstablishmentAddress) displayEstablishmentAddress.textContent = establishmentAddressInput;
            if (displayPickupDate) displayPickupDate.textContent = formattedDate;
            if (displayPickupTime) displayPickupTime.textContent = pickupTimeInput;
            if (displayPackCount) displayPackCount.textContent = `${packCountInput} x`;
            if (displayTotalPrice) displayTotalPrice.textContent = `${totalPriceInput} €`;

            // Poblar los datos en el Modal de Recogida
            // Poblar los datos en el Modal de Recogida
            if (modalPackIconText) modalPackIconText.textContent = `${packCountInput}x`;
            if (modalEstablishmentName) {
                let displayLocation = "Ubicación Desconocida"; // Valor por defecto
                const addressParts = establishmentAddressInput.split(',').map(part => part.trim()); // Dividir y quitar espacios

                // Intentar encontrar "San Vicente del Raspeig" o una localidad similar
                // Esto es un ejemplo, podrías necesitar una lógica más compleja si las direcciones varían mucho
                if (establishmentAddressInput.toLowerCase().includes("san vicente del raspeig")) {
                    displayLocation = "San Vicente del Raspeig";
                } else if (addressParts.length >= 3) {
                    // Si hay al menos calle, número, código postal + localidad...
                    // la localidad suele ser la parte antes del código postal o la ciudad.
                    // Tomemos la parte que parece ser la localidad/ciudad (ej. antes de la provincia o país)
                    // Esta es una suposición y puede necesitar ajuste.
                    // Por ejemplo, si la estructura es "Calle, Numero, CP Localidad, Provincia, Pais"
                    // addressParts[2] podría ser "03690 San Vicente del Raspeig"
                    // addressParts[3] podría ser "Alicante"

                    // Una heurística simple: si hay un código postal numérico, tomar lo que le sigue (si no es la provincia)
                    // o lo que está antes de la provincia.
                    // Por simplicidad, vamos a tomar la tercera parte si existe y parece una localidad,
                    // o la segunda si la tercera parece una provincia/país.

                    // Ejemplo más simple: tomar la segunda parte significativa
                    // (asumiendo que la primera es la calle y número)
                    if (addressParts.length > 1) {
                         // Intentar tomar la parte que contiene el CP y la localidad, y extraer la localidad
                        const cpAndLocalityPart = addressParts.find(part => part.match(/^\d{5}\s+/));
                        if (cpAndLocalityPart) {
                            displayLocation = cpAndLocalityPart.replace(/^\d{5}\s+/, ''); // Quitar el CP
                        } else if (addressParts.length > 2 && !addressParts[2].match(/^\d{5}/) && addressParts[2].length > 3) {
                            // Si la tercera parte no es un CP y es suficientemente larga
                            displayLocation = addressParts[2];
                        } else if (addressParts.length > 1 && !addressParts[1].match(/^\d{5}/) && addressParts[1].length > 3) {
                            // Sino, la segunda si no es CP y es larga
                            displayLocation = addressParts[1];
                        } else if (addressParts.length > 0) {
                            // Como último recurso, la primera parte si las otras no son útiles
                            displayLocation = addressParts[0];
                        }
                    }
                } else if (addressParts.length > 0) {
                    displayLocation = addressParts[0]; // Si no hay comas, usar toda la dirección
                }

                // Si aún no se ha encontrado una localidad específica, tomar el segundo elemento después de la primera coma.
                // Esto es muy genérico.
                if (displayLocation === "Ubicación Desconocida" && addressParts.length > 1) {
                    displayLocation = addressParts[1]; // Esto podría ser el número o el CP
                }


                // Lógica más simplificada y robusta basada en el ejemplo dado:
                // "C. Villafranqueza, 17, 03690 San Vicente del Raspeig, Alicante, España"
                // Queremos "San Vicente del Raspeig"
                // Esto está después del código postal.

                let finalDisplayLocation = "Localidad"; // Default
                for (const part of addressParts) {
                    if (part.toLowerCase().includes("san vicente del raspeig")) {
                        finalDisplayLocation = "San Vicente del Raspeig";
                        break;
                    }
                    // Puedes añadir más 'else if' para otras localidades comunes si es necesario
                }
                // Si no se encontró una localidad específica por nombre, intentamos tomar una parte significativa
                if (finalDisplayLocation === "Localidad") {
                    if (addressParts.length > 2) { // Asumiendo Calle, Número, CP Localidad
                        const cpLocality = addressParts[2];
                        if (cpLocality.match(/^\d{5}\s(.+)/)) {
                            finalDisplayLocation = cpLocality.replace(/^\d{5}\s/, '');
                        } else {
                             finalDisplayLocation = addressParts[1] || addressParts[0]; // Fallback
                        }
                    } else if (addressParts.length > 1) {
                        finalDisplayLocation = addressParts[1];
                    } else if (addressParts.length > 0) {
                        finalDisplayLocation = addressParts[0];
                    }
                }


                modalEstablishmentName.textContent = `${establishmentNameInput} - ${finalDisplayLocation}`;
            }

            if (preMenuContainer) preMenuContainer.classList.add('hidden');
            if (appContainer) appContainer.classList.remove('hidden');
        });
    }

    if (goBackToPreMenuBtn) {
        goBackToPreMenuBtn.addEventListener('click', () => {
            if (appContainer) appContainer.classList.add('hidden');
            if (preMenuContainer) preMenuContainer.classList.remove('hidden');
            closeModal();
            hideThankYouScreen();
        });
    }

    // --- Modal Visibility ---
    function openModal() {
        if (modalContainer && modalOverlay) {
            modalContainer.classList.add('visible');
            modalOverlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (modalContainer && modalOverlay) {
            modalContainer.classList.remove('visible');
            modalOverlay.classList.remove('visible');
            if (!thankYouScreen || !thankYouScreen.classList.contains('visible')) {
                 document.body.style.overflow = '';
            }
            resetSlider();
        }
    }

    if (mainPickupButton) mainPickupButton.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // --- Funciones para la pantalla de agradecimiento ---
    function showThankYouScreen() {
        if (thankYouScreen) {
            if (modalContainer && modalContainer.classList.contains('visible')) {
                modalContainer.classList.remove('visible');
            }
            if (modalOverlay && modalOverlay.classList.contains('visible')) {
                modalOverlay.classList.remove('visible');
            }
            thankYouScreen.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
    }

    function hideThankYouScreen() {
        if (thankYouScreen) {
            thankYouScreen.classList.remove('visible');
            document.body.style.overflow = '';
        }
    }
    if (closeThankYouScreenBtn) closeThankYouScreenBtn.addEventListener('click', hideThankYouScreen);

    // --- Slider Logic ---
    let isDragging = false;
    let startX;
    const TRACK_BORDER_WIDTH = 2;
    let initialThumbLeftPx;

    if (sliderThumb && sliderTrack && sliderContainer && sliderText) {
        function onDragStart(e) {
            e.preventDefault();
            isDragging = true;
            startX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
            sliderThumb.style.transition = 'none';
            sliderText.style.transition = 'none';
            sliderTrack.classList.add('dragging');
            initialThumbLeftPx = parseFloat(window.getComputedStyle(sliderThumb).left);
        }

        function onDragMove(e) {
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
                setTimeout(() => {
                    showThankYouScreen();
                }, 400);
            } else {
                sliderThumb.style.left = `${minSnapPosition}px`;
                sliderText.style.opacity = '1';
                sliderContainer.classList.remove('completed');
            }
        }

        function resetSliderVisuals() {
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
            if (interactionDisabled) return;
            sliderThumb.removeEventListener('mousedown', onDragStart);
            sliderThumb.removeEventListener('touchstart', onDragStart, { passive: false });
            interactionDisabled = true;
        }

        function enableSliderInteraction() {
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
        console.error("Algunos elementos del slider no fueron encontrados. Revisa los IDs: pickupSliderContainer, pickupSliderThumb, slider-pickup-text.");
    }
});
