document.addEventListener('DOMContentLoaded', () => {
    document.fonts.ready.then(() => {
        console.log('Custom fonts loaded successfully.');
        initializeGenerator();
    }).catch(err => {
        console.error('Font loading failed:', err);
        initializeGenerator();
    });

    const templateConfig = {
        imageSrc: './images/lspd_template.png',
        fileName: 'business-card.png',
        fields: ['phone', 'area', 'division', 'name', 'badge'],
        requiredFields: ['phone', 'name', 'badge'],
        settings: {
            phone: { size: 20, x: 407, y: 30, font: 'Crustaceans Signature', align: 'left' },
            division: { size: 15, x: 250, y: 160, font: 'Copperplate', align: 'center' },
            area: { size: 14, x: 250, y: 185, font: 'Copperplate', align: 'center' },
            name: { size: 19, x: 53, y: 249, align: 'left' },
            badge: { size: 19, x: 180, y: 249, align: 'left' }
        }
    };
    
    const subDivisionMappings = {
        'MISSION ROW DIVISION':  ['Patrol Officer', 'FAD'],
        'Metropolitan Division': ['Diving Unit', 'H Platoon', 'K-9 Platoon', 'Bomb Squad', 'Crisis Negotiation', 'S.W.A.T'],
        'Gang Enforcement Detail': ['Gang  Officer'],
        'Detective Bureau': ['Gang Impact Team', 'MRAD', 'Major Crimes'],
        'Traffic Division': ['SES']
    };

    function initializeGenerator() {
        const canvas = document.getElementById('card-canvas');
        const ctx = canvas.getContext('2d');
        
        const phoneInput = document.getElementById('phone-input'),
              areaSelect = document.getElementById('area-select'),
              subdivisionSelect = document.getElementById('subdivision-select'),
              divisionSelect = document.getElementById('division-select'),
              badgeInput = document.getElementById('badge-input'),
              nameInput = document.getElementById('name-input'),
              generateBtn = document.getElementById('generate-btn'),
              fontSelect = document.getElementById('font-select'),
              badgeFontSelect = document.getElementById('badge-font-select'),
              resultContainer = document.getElementById('result-container');

        const areaFormGroup = document.querySelector('.form-group[data-field="area"]');
        const areaSettingGroup = document.querySelector('.setting-group[data-field="area"]');

        const sliders = {
            phone: { size: document.getElementById('phone-size'), x: document.getElementById('phone-x'), y: document.getElementById('phone-y') },
            area: { size: document.getElementById('area-size'), x: document.getElementById('area-x'), y: document.getElementById('area-y') },
            division: { size: document.getElementById('division-size'), x: document.getElementById('division-x'), y: document.getElementById('division-y') },
            badge: { size: document.getElementById('badge-size'), x: document.getElementById('badge-x'), y: document.getElementById('badge-y') },
            name: { size: document.getElementById('name-size'), x: document.getElementById('name-x'), y: document.getElementById('name-y') }
        };
        const valueDisplays = {
            phone: { size: document.getElementById('phone-size-val'), x: document.getElementById('phone-x-val'), y: document.getElementById('phone-y-val') },
            area: { size: document.getElementById('area-size-val'), x: document.getElementById('area-x-val'), y: document.getElementById('area-y-val') },
            division: { size: document.getElementById('division-size-val'), x: document.getElementById('division-x-val'), y: document.getElementById('division-y-val') },
            badge: { size: document.getElementById('badge-size-val'), x: document.getElementById('badge-x-val'), y: document.getElementById('badge-y-val') },
            name: { size: document.getElementById('name-size-val'), x: document.getElementById('name-x-val'), y: document.getElementById('name-y-val') }
        };
        
        const templateImage = new Image();
        const advancedSettings = document.getElementById('advanced-settings');
        const toggleButton = document.getElementById('advanced-settings-toggle');
        toggleButton.addEventListener('click', () => advancedSettings.classList.toggle('open'));

        const changelogContainer = document.getElementById('changelog-container');
        const changelogToggle = document.getElementById('changelog-toggle');
        if (changelogToggle) {
            changelogToggle.addEventListener('click', () => changelogContainer.classList.toggle('open'));
        }

        function setupInitialState() {
            templateImage.src = templateConfig.imageSrc;
            
            for (const field in templateConfig.settings) {
                if (sliders[field]) {
                    ['size', 'x', 'y'].forEach(prop => {
                        if (sliders[field][prop] && templateConfig.settings[field][prop] !== undefined) {
                            sliders[field][prop].value = templateConfig.settings[field][prop];
                            valueDisplays[field][prop].textContent = templateConfig.settings[field][prop];
                        }
                    });
                }
            }
            validateForm();
        }

        function drawCard() {
            if (!templateImage.complete) return;
            
            ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#283F5B';
            ctx.globalAlpha = 0.9; 

            ctx.font = `${sliders.phone.size.value}px '${templateConfig.settings.phone.font}'`;
            ctx.textAlign = templateConfig.settings.phone.align;
            ctx.fillText(phoneInput.value || '', sliders.phone.x.value, sliders.phone.y.value);

            ctx.font = `${sliders.area.size.value}px '${templateConfig.settings.area.font}'`;
            ctx.textAlign = templateConfig.settings.area.align;
            ctx.fillText(areaSelect.value.toUpperCase() || '', sliders.area.x.value, sliders.area.y.value);

            let divisionText = divisionSelect.value.toUpperCase();
            const subDivisionText = subdivisionSelect.value.toUpperCase();
            if (divisionText && subDivisionText) {
                divisionText = `${divisionText} / ${subDivisionText}`;
            }
            ctx.font = `${sliders.division.size.value}px '${templateConfig.settings.division.font}'`;
            ctx.textAlign = templateConfig.settings.division.align;
            ctx.fillText(divisionText || '', sliders.division.x.value, sliders.division.y.value);

            ctx.font = `${sliders.name.size.value}px '${fontSelect.value}'`;
            ctx.textAlign = templateConfig.settings.name.align;
            ctx.fillText(nameInput.value || '', sliders.name.x.value, sliders.name.y.value);
            
            let badgeText = badgeInput.value;
            if (badgeText && !badgeText.startsWith('#')) {
                badgeText = '#' + badgeText;
            }
            ctx.font = `${sliders.badge.size.value}px '${badgeFontSelect.value}'`;
            ctx.textAlign = templateConfig.settings.badge.align;
            ctx.fillText(badgeText || '', sliders.badge.x.value, sliders.badge.y.value);
            
            ctx.globalAlpha = 1.0;
        }

        const validateForm = () => {
            const requiredInputs = templateConfig.requiredFields.map(fieldName => document.querySelector(`[data-field="${fieldName}"]`).querySelector('input, select'));
            const allFilled = requiredInputs.every(input => input && input.value.trim() !== '');
            generateBtn.disabled = !allFilled;
        };
        
        function toggleWorkAreaVisibility() {
            const selectedDivision = divisionSelect.value;
            if (selectedDivision === 'MISSION ROW DIVISION') {
                areaFormGroup.classList.remove('hidden');
                areaSettingGroup.classList.remove('hidden');
            } else {
                areaFormGroup.classList.add('hidden');
                areaSettingGroup.classList.add('hidden');
                areaSelect.value = '';
            }
        }

        function updateSubDivisionDropdown() {
            const selectedDivision = divisionSelect.value;
            const subDivisions = subDivisionMappings[selectedDivision] || [];
            
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
        
        templateImage.onload = () => { 
            drawCard(); 
            validateForm(); 
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
        
        divisionSelect.addEventListener('input', () => {
            toggleWorkAreaVisibility();
            updateSubDivisionDropdown();
            drawCard();
            validateForm();
        });

        [phoneInput, areaSelect, subdivisionSelect, badgeInput, nameInput, fontSelect, badgeFontSelect].forEach(element => {
            element.addEventListener('input', () => {
                drawCard();
                validateForm();
            });
        });

        generateBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = templateConfig.fileName;
            link.href = canvas.toDataURL('image/png');
            link.click();
            resultContainer.textContent = 'Card downloaded!';
        });

        setupInitialState();
    }
});