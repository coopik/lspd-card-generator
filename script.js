document.addEventListener('DOMContentLoaded', () => {
    document.fonts.ready.then(() => {
        console.log('Custom fonts loaded successfully.');
        initializeGenerator();
    }).catch(err => {
        console.error('Font loading failed:', err);
        initializeGenerator();
    });

    const templateConfigs = {
        'lspd_modern': {
            imageSrc: 'https://i.imgur.com/I7mqXSW.png',
            fileName: 'lspd-modern-card.png',
            fields: ['phone', 'area', 'division', 'subdivision', 'name', 'badge'],
            requiredFields: ['phone', 'name', 'badge'],
            settings: {
                phone: { size: 20, x: 407, y: 30, font: 'Crustaceans Signature', align: 'left', color: '#283F5B', rotation: 0 },
                division: { size: 15, x: 250, y: 160, font: 'Copperplate', align: 'center', color: '#283F5B', rotation: 0 },
                area: { size: 14, x: 250, y: 185, font: 'Copperplate', align: 'center', color: '#283F5B', rotation: 0 },
                name: { size: 19, x: 53, y: 249, align: 'left', color: '#283F5B', rotation: 0 },
                badge: { size: 19, x: 180, y: 249, align: 'left', color: '#283F5B', rotation: 0 },
                email: { size: 1, x: 0, y: 0, color: '#283F5B', rotation: 0 },
                rank: { size: 1, x: 0, y: 0, color: '#283F5B', rotation: 0 },
                subdivision: { size: 1, x: 0, y: 0, color: '#283F5B', rotation: 0 }
            }
        },
        'lspd_ged': {
            imageSrc: 'https://i.imgur.com/s7ewdFw.png',
            fileName: 'lspd-ged-card.png',
            fields: ['phone', 'area', 'name', 'badge'],
            requiredFields: ['phone', 'name', 'badge'],
            settings: {
                phone: { size: 20, x: 407, y: 30, font: 'Crustaceans Signature', align: 'left', color: '#182738', rotation: 0 },
                area: { size: 14, x: 250, y: 185, font: 'Copperplate', align: 'center', color: '#182738', rotation: 0 },
                name: { size: 19, x: 53, y: 249, align: 'left', color: '#182738', rotation: 0 },
                badge: { size: 19, x: 180, y: 249, align: 'left', color: '#182738', rotation: 0 },
                email: { size: 1, x: 0, y: 0, color: '#182738', rotation: 0 },
                rank: { size: 1, x: 0, y: 0, color: '#182738', rotation: 0 },
                division: { size: 1, x: 0, y: 0, color: '#182738', rotation: 0 },
                subdivision: { size: 1, x: 0, y: 0, color: '#182738', rotation: 0 }
            }
        },
        'lspd_db': {
            imageSrc: 'https://i.imgur.com/1ufYz0j.png',
            fileName: 'lspd-db-card.png',
            fields: ['phone', 'email', 'division', 'subdivision', 'name', 'badge', 'rank'],
            requiredFields: ['phone', 'name', 'email'],
            settings: {
                phone: { size: 15, x: 430, y: 270, font: 'Thryn', align: 'center', color: '#272727', rotation: 0 },
                email: { size: 15, x: 410, y: 290, font: 'Thryn', align: 'center', color: '#272727', rotation: 0 },
                division: { size: 15, x: 309, y: 66, font: 'Copperplate', align: 'center', color: '#272727', rotation: 0 },
                subdivision: { size: 14, x: 309, y: 80, font: 'Copperplate', align: 'center', color: '#272727', rotation: 0 },
                name: { size: 23, x: 300, y: 140, align: 'center', color: '#272727', rotation: 0 },
                badge: { size: 18, x: 75, y: 173, align: 'center', color: '#272727', rotation: 0 },
                rank: { size: 16, x: 300, y: 160, font: 'Copperplate', align: 'center', color: '#272727', rotation: 0 },
                area: { size: 1, x: 0, y: 0, color: '#272727', rotation: 0 }
            }
        }
    };

    const allDivisions = {
        'MISSION ROW DIVISION': ['Patrol Officer', 'FAD'],
        'Metropolitan Division': ['Diving Unit', 'H Platoon', 'K-9 Platoon', 'Bomb Squad', 'Crisis Negotiation'],
        'Gang Enforcement Detail': ['Gang Officer'],
        'Detective Bureau': ['Gang Impact Team', 'Mission Row Area Detective', 'Major Crimes'],
        'Traffic Division': ['SES']
    };

    const detectiveDivisions = {
        'Detective Bureau': ['Gang Impact Team', 'Mission Row Area Detective', 'Major Crimes']
    };

    function initializeGenerator() {
        const mainCanvas = document.getElementById('card-canvas');
        const mainCtx = mainCanvas.getContext('2d');
        const drawingCanvas = document.getElementById('drawing-canvas');
        const drawingCtx = drawingCanvas.getContext('2d');

        const templateSelect = document.getElementById('template-select');
        const phoneInput = document.getElementById('phone-input'),
            emailInput = document.getElementById('email-input'),
            rankInput = document.getElementById('rank-input'),
            areaSelect = document.getElementById('area-select'),
            subdivisionSelect = document.getElementById('subdivision-select'),
            divisionSelect = document.getElementById('division-select'),
            badgeInput = document.getElementById('badge-input'),
            nameInput = document.getElementById('name-input'),
            generateBtn = document.getElementById('generate-btn'),
            fontSelect = document.getElementById('font-select'),
            badgeFontSelect = document.getElementById('badge-font-select'),
            resultContainer = document.getElementById('result-container');

        const drawModeToggle = document.getElementById('draw-mode-toggle');
        const drawColorInput = document.getElementById('draw-color');
        const drawWidthInput = document.getElementById('draw-width');
        const clearDrawingBtn = document.getElementById('clear-drawing-btn');
        const undoBtn = document.getElementById('undo-drawing-btn');

        const historySidebar = document.getElementById('history-sidebar');
        const historyToggleBtn = document.getElementById('history-toggle-btn');
        const historyItemsWrapper = document.getElementById('history-items-wrapper');
        const clearHistoryBtn = document.getElementById('clear-history-btn');

        const areaFormGroup = document.querySelector('.form-group[data-field="area"]');
        const areaSettingGroup = document.querySelector('.setting-group[data-field="area"]');

        const sliders = {
            phone: { size: document.getElementById('phone-size'), x: document.getElementById('phone-x'), y: document.getElementById('phone-y'), rotation: document.getElementById('phone-rotation') },
            email: { size: document.getElementById('email-size'), x: document.getElementById('email-x'), y: document.getElementById('email-y'), rotation: document.getElementById('email-rotation') },
            area: { size: document.getElementById('area-size'), x: document.getElementById('area-x'), y: document.getElementById('area-y'), rotation: document.getElementById('area-rotation') },
            division: { size: document.getElementById('division-size'), x: document.getElementById('division-x'), y: document.getElementById('division-y'), rotation: document.getElementById('division-rotation') },
            subdivision: { size: document.getElementById('subdivision-size'), x: document.getElementById('subdivision-x'), y: document.getElementById('subdivision-y'), rotation: document.getElementById('subdivision-rotation') },
            badge: { size: document.getElementById('badge-size'), x: document.getElementById('badge-x'), y: document.getElementById('badge-y'), rotation: document.getElementById('badge-rotation') },
            name: { size: document.getElementById('name-size'), x: document.getElementById('name-x'), y: document.getElementById('name-y'), rotation: document.getElementById('name-rotation') },
            rank: { size: document.getElementById('rank-size'), x: document.getElementById('rank-x'), y: document.getElementById('rank-y'), rotation: document.getElementById('rank-rotation') }
        };
        const valueDisplays = {
            phone: { size: document.getElementById('phone-size-val'), x: document.getElementById('phone-x-val'), y: document.getElementById('phone-y-val'), rotation: document.getElementById('phone-rotation-val') },
            email: { size: document.getElementById('email-size-val'), x: document.getElementById('email-x-val'), y: document.getElementById('email-y-val'), rotation: document.getElementById('email-rotation-val') },
            area: { size: document.getElementById('area-size-val'), x: document.getElementById('area-x-val'), y: document.getElementById('area-y-val'), rotation: document.getElementById('area-rotation-val') },
            division: { size: document.getElementById('division-size-val'), x: document.getElementById('division-x-val'), y: document.getElementById('division-y-val'), rotation: document.getElementById('division-rotation-val') },
            subdivision: { size: document.getElementById('subdivision-size-val'), x: document.getElementById('subdivision-x-val'), y: document.getElementById('subdivision-y-val'), rotation: document.getElementById('subdivision-rotation-val') },
            badge: { size: document.getElementById('badge-size-val'), x: document.getElementById('badge-x-val'), y: document.getElementById('badge-y-val'), rotation: document.getElementById('badge-rotation-val') },
            name: { size: document.getElementById('name-size-val'), x: document.getElementById('name-x-val'), y: document.getElementById('name-y-val'), rotation: document.getElementById('name-rotation-val') },
            rank: { size: document.getElementById('rank-size-val'), x: document.getElementById('rank-x-val'), y: document.getElementById('rank-y-val'), rotation: document.getElementById('rank-rotation-val') }
        };
        const colorPickers = {
            phone: document.querySelector('[data-color-for="phone"]'),
            email: document.querySelector('[data-color-for="email"]'),
            division: document.querySelector('[data-color-for="division"]'),
            subdivision: document.querySelector('[data-color-for="subdivision"]'),
            area: document.querySelector('[data-color-for="area"]'),
            name: document.querySelector('[data-color-for="name"]'),
            badge: document.querySelector('[data-color-for="badge"]'),
            rank: document.querySelector('[data-color-for="rank"]')
        };

        const templateImage = new Image();
        templateImage.crossOrigin = "Anonymous";
        const advancedSettings = document.getElementById('advanced-settings');
        const toggleButton = document.getElementById('advanced-settings-toggle');
        toggleButton.addEventListener('click', () => advancedSettings.classList.toggle('open'));

        const changelogContainer = document.getElementById('changelog-container');
        const changelogToggle = document.getElementById('changelog-toggle');
        if (changelogToggle) {
            changelogToggle.addEventListener('click', () => changelogContainer.classList.toggle('open'));
        }

        if (historyToggleBtn) {
            historyToggleBtn.addEventListener('click', () => {
                historySidebar.classList.toggle('open');
            });
        }

        let isDrawing = false;
        let drawModeEnabled = false;
        let lastX = 0;
        let lastY = 0;
        let drawHistory = [];
        let requiredInputs = [];

        function updateUIForTemplate(templateId) {
            const config = templateConfigs[templateId];
            if (!config) return;

            templateImage.src = config.imageSrc;

            document.querySelectorAll('.form-group, .setting-group').forEach(group => {
                const fieldName = group.getAttribute('data-field');
                if (fieldName && fieldName !== 'template') {
                    const shouldBeVisible = config.fields.includes(fieldName);
                    group.classList.toggle('hidden', !shouldBeVisible);
                }
            });

            for (const field in config.settings) {
                if (sliders[field]) {
                    ['size', 'x', 'y', 'rotation'].forEach(prop => {
                        if (sliders[field][prop] && config.settings[field][prop] !== undefined) {
                            sliders[field][prop].value = config.settings[field][prop];
                            valueDisplays[field][prop].textContent = config.settings[field][prop];
                        }
                    });
                }
                if (colorPickers[field] && config.settings[field].color) {
                    colorPickers[field].value = config.settings[field].color;
                }
            }

            requiredInputs = config.requiredFields.map(fieldName => {
                const group = document.querySelector(`.form-group[data-field="${fieldName}"]`);
                return group ? group.querySelector('input, select') : null;
            }).filter(Boolean);

            populateDivisionDropdown(templateId);
            toggleWorkAreaVisibility();
            updateSubDivisionDropdown();
            validateForm();
            drawCard();
        }

        function populateDivisionDropdown(templateId) {
            const divisions = (templateId === 'lspd_db') ? detectiveDivisions : allDivisions;
            divisionSelect.innerHTML = '<option value="">-- Select Division (Optional) --</option>';
            for (const divisionName in divisions) {
                const option = document.createElement('option');
                option.value = divisionName;
                option.textContent = divisionName === 'MISSION ROW DIVISION' ? 'MRD' : divisionName;
                divisionSelect.appendChild(option);
            }
        }

        function updateSubDivisionDropdown() {
            const templateId = templateSelect.value;
            const divisions = (templateId === 'lspd_db') ? detectiveDivisions : allDivisions;
            const selectedDivision = divisionSelect.value;
            const subDivisions = divisions[selectedDivision] || [];

            subdivisionSelect.innerHTML = '<option value="">-- Select Sub-Division (Optional) --</option>';

            if (subDivisions.length > 0) {
                subDivisions.forEach(subDiv => {
                    const option = document.createElement('option');
                    option.value = subDiv;
                    option.textContent = subDiv;
                    subdivisionSelect.appendChild(option);
                });
                subdivisionSelect.disabled = false;
            } else {
                subdivisionSelect.disabled = true;
            }
        }

        function saveDrawState() {
            drawHistory.push(drawingCanvas.toDataURL());
            updateUndoButtonState();
        }

        function updateUndoButtonState() {
            undoBtn.disabled = drawHistory.length <= 1;
        }

        function undoLastDraw() {
            if (drawHistory.length > 1) {
                drawHistory.pop();
                const lastStateDataUrl = drawHistory[drawHistory.length - 1];
                const img = new Image();
                img.src = lastStateDataUrl;
                img.onload = () => {
                    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                    drawingCtx.drawImage(img, 0, 0);
                };
            }
            updateUndoButtonState();
        }

        function drawOnCanvas(e) {
            if (!isDrawing) return;
            e.preventDefault();
            const rect = drawingCanvas.getBoundingClientRect();
            const scaleX = drawingCanvas.width / rect.width;
            const scaleY = drawingCanvas.height / rect.height;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const currentX = (clientX - rect.left) * scaleX;
            const currentY = (clientY - rect.top) * scaleY;

            drawingCtx.strokeStyle = drawColorInput.value;
            drawingCtx.lineWidth = drawWidthInput.value;
            drawingCtx.lineCap = 'round';
            drawingCtx.lineJoin = 'round';

            drawingCtx.beginPath();
            drawingCtx.moveTo(lastX, lastY);
            drawingCtx.lineTo(currentX, currentY);
            drawingCtx.stroke();

            [lastX, lastY] = [currentX, currentY];
        }

        function startDrawing(e) {
            if (!drawModeEnabled) return;
            isDrawing = true;
            const rect = drawingCanvas.getBoundingClientRect();
            const scaleX = drawingCanvas.width / rect.width;
            const scaleY = drawingCanvas.height / rect.height;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            [lastX, lastY] = [(clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY];
        }

        const endDrawing = () => {
            if (!isDrawing) return;
            isDrawing = false;
            saveDrawState();
        };

        drawingCanvas.addEventListener('mousedown', startDrawing);
        drawingCanvas.addEventListener('mousemove', drawOnCanvas);
        drawingCanvas.addEventListener('mouseup', endDrawing);
        drawingCanvas.addEventListener('mouseleave', endDrawing);
        drawingCanvas.addEventListener('touchstart', startDrawing, { passive: false });
        drawingCanvas.addEventListener('touchmove', drawOnCanvas, { passive: false });
        drawingCanvas.addEventListener('touchend', endDrawing);

        drawModeToggle.addEventListener('click', () => {
            drawModeEnabled = !drawModeEnabled;
            drawModeToggle.textContent = drawModeEnabled ? 'Disable Drawing Mode' : 'Enable Drawing Mode';
            drawModeToggle.classList.toggle('active', drawModeEnabled);
            drawingCanvas.classList.toggle('draw-mode-active', drawModeEnabled);
        });

        clearDrawingBtn.addEventListener('click', () => {
            drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            drawHistory = [];
            saveDrawState();
        });

        undoBtn.addEventListener('click', undoLastDraw);

        function loadHistory() {
            return JSON.parse(localStorage.getItem('cardHistory') || '[]');
        }

        function saveHistory(history) {
            if (history.length > 10) {
                history = history.slice(history.length - 10);
            }
            localStorage.setItem('cardHistory', JSON.stringify(history));
        }

        function renderHistory() {
            const history = loadHistory();
            historyItemsWrapper.innerHTML = '';
            if (history.length === 0) {
                historyItemsWrapper.innerHTML = '<p style="color: var(--color-text-muted); grid-column: 1 / -1; text-align: center;">No history yet.</p>';
                return;
            }

            history.slice().reverse().forEach(entry => {
                const item = document.createElement('div');
                item.className = 'history-item';

                const thumb = new Image();
                thumb.src = entry.thumbnail;
                item.appendChild(thumb);

                const date = document.createElement('div');
                date.className = 'history-item-date';
                date.textContent = new Date(entry.timestamp).toLocaleString();
                item.appendChild(date);

                item.addEventListener('click', () => {
                    restoreFromHistory(entry);
                    if (window.innerWidth < 900) {
                        historySidebar.classList.remove('open');
                    }
                });
                historyItemsWrapper.appendChild(item);
            });
        }

        function restoreFromHistory(entry) {
            templateSelect.value = entry.template;
            updateUIForTemplate(entry.template);

            requestAnimationFrame(() => {
                phoneInput.value = entry.values.phone || '';
                emailInput.value = entry.values.email || '';
                rankInput.value = entry.values.rank || '';
                divisionSelect.value = entry.values.division || '';

                updateSubDivisionDropdown();
                subdivisionSelect.value = entry.values.subdivision || '';

                toggleWorkAreaVisibility();
                areaSelect.value = entry.values.area || '';

                nameInput.value = entry.values.name || '';
                badgeInput.value = entry.values.badge || '';

                fontSelect.value = entry.fonts.name;
                badgeFontSelect.value = entry.fonts.badge;

                for (const field in entry.styles) {
                    if (sliders[field]) {
                        for (const prop in entry.styles[field]) {
                            if (sliders[field][prop]) {
                                sliders[field][prop].value = entry.styles[field][prop];
                                valueDisplays[field][prop].textContent = entry.styles[field][prop];
                            }
                        }
                    }
                }
                for (const field in entry.colors) {
                    if (colorPickers[field]) {
                        colorPickers[field].value = entry.colors[field];
                    }
                }

                drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                if (entry.drawing) {
                    const img = new Image();
                    img.src = entry.drawing;
                    img.onload = () => {
                        drawingCtx.drawImage(img, 0, 0);
                        drawHistory = [];
                        saveDrawState();
                    };
                } else {
                    drawHistory = [];
                    saveDrawState();
                }

                drawCard();
                validateForm();
            });
        }

        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your entire card history? This cannot be undone.')) {
                localStorage.removeItem('cardHistory');
                renderHistory();
            }
        });

        function drawCard() {
            if (!templateImage.complete || templateImage.naturalHeight === 0) return;
            mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
            mainCtx.drawImage(templateImage, 0, 0, mainCanvas.width, mainCanvas.height);

            const config = templateConfigs[templateSelect.value];

            config.fields.forEach(field => {
                if (!config.settings[field] || !sliders[field]) return;

                let textToDraw = '';

                switch (field) {
                    case 'phone': textToDraw = phoneInput.value; break;
                    case 'email': textToDraw = emailInput.value; break;
                    case 'name': textToDraw = nameInput.value; break;
                    case 'rank': textToDraw = rankInput.value; break;
                    case 'area': textToDraw = areaSelect.value.toUpperCase(); break;
                    case 'badge':
                        textToDraw = badgeInput.value;
                        if (textToDraw && !textToDraw.startsWith('#')) textToDraw = '#' + textToDraw;
                        break;
                    case 'division':
                        textToDraw = divisionSelect.value.toUpperCase();
                        if (templateSelect.value !== 'lspd_db' && config.fields.includes('subdivision')) {
                            const subDivisionText = subdivisionSelect.value.toUpperCase();
                            if (textToDraw && subDivisionText) {
                                textToDraw = `${textToDraw} / ${subDivisionText}`;
                            }
                        }
                        break;
                    case 'subdivision':
                        if (templateSelect.value === 'lspd_db') {
                            textToDraw = subdivisionSelect.value.toUpperCase();
                        }
                        break;
                }

                if (textToDraw) {
                    let font = config.settings[field].font || 'sans-serif';
                    if (field === 'name') font = fontSelect.value;
                    if (field === 'badge') font = badgeFontSelect.value;

                    mainCtx.save();

                    const x = parseInt(sliders[field].x.value, 10);
                    const y = parseInt(sliders[field].y.value, 10);
                    const rotation = parseInt(sliders[field].rotation.value, 10);
                    const rotationInRadians = rotation * Math.PI / 180;

                    mainCtx.fillStyle = colorPickers[field].value;
                    mainCtx.font = `${sliders[field].size.value}px '${font}'`;
                    mainCtx.textAlign = config.settings[field].align || 'left';

                    mainCtx.translate(x, y);
                    mainCtx.rotate(rotationInRadians);

                    mainCtx.fillText(textToDraw, 0, 0);

                    mainCtx.restore();
                }
            });
        }

        const validateForm = () => {
            const allFilled = requiredInputs.every(input => input && input.value.trim() !== '');
            generateBtn.disabled = !allFilled;
        };

        function toggleWorkAreaVisibility() {
            const config = templateConfigs[templateSelect.value];
            const selectedDivision = divisionSelect.value;
            const shouldBeVisible = config.fields.includes('area') && (selectedDivision === 'MISSION ROW DIVISION' || selectedDivision === 'Gang Enforcement Detail');

            if (areaFormGroup && areaSettingGroup) {
                areaFormGroup.classList.toggle('hidden', !shouldBeVisible);
                areaSettingGroup.classList.toggle('hidden', !shouldBeVisible);
            }

            if (!shouldBeVisible) {
                areaSelect.value = '';
            }
        }

        templateImage.onload = () => drawCard();
        templateImage.onerror = () => {
            console.error("Failed to load template image:", templateImage.src);
            mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        };

        for (const group in sliders) {
            for (const prop in sliders[group]) {
                const slider = sliders[group][prop];
                const display = valueDisplays[group][prop];
                if (slider) {
                    slider.addEventListener('input', () => {
                        display.textContent = slider.value;
                        drawCard();
                    });
                }
            }
        }
        for (const field in colorPickers) {
            if (colorPickers[field]) {
                colorPickers[field].addEventListener('input', drawCard);
            }
        }

        divisionSelect.addEventListener('input', () => {
            toggleWorkAreaVisibility();
            updateSubDivisionDropdown();
            drawCard();
            validateForm();
        });

        templateSelect.addEventListener('input', () => {
            updateUIForTemplate(templateSelect.value);
        });

        [phoneInput, emailInput, areaSelect, subdivisionSelect, badgeInput, nameInput, rankInput, fontSelect, badgeFontSelect].forEach(element => {
            element.addEventListener('input', () => {
                drawCard();
                validateForm();
            });
        });

        generateBtn.addEventListener('click', () => {
            const config = templateConfigs[templateSelect.value];
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = mainCanvas.width;
            tempCanvas.height = mainCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(mainCanvas, 0, 0);
            tempCtx.drawImage(drawingCanvas, 0, 0);

            const thumbnailCanvas = document.createElement('canvas');
            thumbnailCanvas.width = 150;
            thumbnailCanvas.height = 90;
            thumbnailCanvas.getContext('2d').drawImage(tempCanvas, 0, 0, 150, 90);

            const newEntry = {
                template: templateSelect.value,
                timestamp: new Date().getTime(),
                thumbnail: thumbnailCanvas.toDataURL(),
                values: {
                    phone: phoneInput.value,
                    email: emailInput.value,
                    division: divisionSelect.value,
                    subdivision: subdivisionSelect.value,
                    area: areaSelect.value,
                    name: nameInput.value,
                    badge: badgeInput.value,
                    rank: rankInput.value
                },
                fonts: {
                    name: fontSelect.value,
                    badge: badgeFontSelect.value,
                },
                styles: {
                    phone: { size: sliders.phone.size.value, x: sliders.phone.x.value, y: sliders.phone.y.value, rotation: sliders.phone.rotation.value },
                    email: { size: sliders.email.size.value, x: sliders.email.x.value, y: sliders.email.y.value, rotation: sliders.email.rotation.value },
                    division: { size: sliders.division.size.value, x: sliders.division.x.value, y: sliders.division.y.value, rotation: sliders.division.rotation.value },
                    subdivision: { size: sliders.subdivision.size.value, x: sliders.subdivision.x.value, y: sliders.subdivision.y.value, rotation: sliders.subdivision.rotation.value },
                    area: { size: sliders.area.size.value, x: sliders.area.x.value, y: sliders.area.y.value, rotation: sliders.area.rotation.value },
                    name: { size: sliders.name.size.value, x: sliders.name.x.value, y: sliders.name.y.value, rotation: sliders.name.rotation.value },
                    badge: { size: sliders.badge.size.value, x: sliders.badge.x.value, y: sliders.badge.y.value, rotation: sliders.badge.rotation.value },
                    rank: { size: sliders.rank.size.value, x: sliders.rank.x.value, y: sliders.rank.y.value, rotation: sliders.rank.rotation.value }
                },
                colors: {
                    phone: colorPickers.phone.value,
                    email: colorPickers.email.value,
                    division: colorPickers.division.value,
                    subdivision: colorPickers.subdivision.value,
                    area: colorPickers.area.value,
                    name: colorPickers.name.value,
                    badge: colorPickers.badge.value,
                    rank: colorPickers.rank.value
                },
                drawing: drawingCanvas.toDataURL()
            };

            const history = loadHistory();
            history.push(newEntry);
            saveHistory(history);
            renderHistory();

            const link = document.createElement('a');
            link.download = config.fileName;
            link.href = tempCanvas.toDataURL('image/png');
            link.click();
            resultContainer.textContent = 'Card downloaded & Saved to history.';
        });

        updateUIForTemplate(templateSelect.value);
        saveDrawState();
        renderHistory();
    }
});