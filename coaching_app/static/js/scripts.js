function createSkillDistribution(canvas, chartData) {
    const ctx = canvas.getContext('2d');
    
    // Data Konfiguration
    const data = {
        datasets: [{
            data: chartData.level2_distr,
            backgroundColor: [
                "#108BDD",  
                "#FC4C24",
                "#E86BF8",
                "#F5D311",
                "#6B6B6B"
            ],
            borderWidth: 2,
            borderColor: '#000000',
        }]
    }

    // Chart Konfiguration
    const skillDist = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: false,
            layout: {
                autoPadding: true,
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            hover: {
                mode: null
            },
            cutout: '50%',
            center: true
        },
    })
}

function createBar(canvas, chartData) {
    const ctx = canvas.getContext('2d');

    // Outer rectangle
    ctx.fillStyle = '#000000';
    let outerWidth = canvas.width / 2;
    let outerStartX = outerWidth / 2;
    let outerStartY = 0;
    ctx.fillRect(outerStartX, outerStartY, outerWidth, canvas.height);

    // Inner rectangle
    const offset = 2;
    ctx.fillStyle = '#FFFFFF';
    
    let value = canvas.getAttribute('data-type') === "intensity" ? chartData.intensity : chartData.difficulty;

    let innerHeight = canvas.height / 5 * value - offset * 2;
    let innerWidth = canvas.width / 2 - offset * 2;
    let innerStartX = outerStartX + offset;
    let innerStartY = canvas.height - innerHeight - offset;

    ctx.fillRect(innerStartX, innerStartY, innerWidth, innerHeight);
}

function openPopUp(element, type) {
    
    // Show Background
    const popUpBg = document.getElementById('PopUpBg');
    popUpBg.style.display = 'block';
    
    if (type === 'drill') {

        // Get the drill data
        const name = element.getAttribute('data-name');
        const description = element.getAttribute('data-description');

        // Show Content
        const popUpContent = document.getElementById('PopUpContent');
        popUpContent.style.display = 'block';
        popUpContent.innerHTML = `
            <span class="close" onclick="closePopUp()">&times;</span>    
            <h2>${name}</h2>
            <p>${description}</p>
        `;
    } else if (type === 'list') {

        // Show List container
        const popUpList = document.getElementById('PopUpList');
        popUpList.style.display = 'block';
        
        // Close Button
        let closeSpan = popUpList.querySelector('span.close');
        if (!closeSpan) { // Not found, create it
            closeSpan = document.createElement('span');
            closeSpan.className = 'close';
            closeSpan.setAttribute('onclick', 'closePopUp()');
            closeSpan.innerHTML = '&times;';
            popUpList.insertBefore(closeSpan, popUpList.firstChild);
        } else { // Exists, ensure it's the first child
            if (popUpList.firstChild !== closeSpan) {
            popUpList.insertBefore(closeSpan, popUpList.firstChild);
            }
        }

        // Drill-Liste im PopUp erstellen, falls noch nicht vorhanden
        let drillListEl = popUpList.querySelector('cd-list');
        if (!drillListEl) { // noch nicht vorhanden
            
            // Liste erstellen
            const drillList = document.createElement('cd-list');
            const attributes = {
                'cd-api': '/api/drills/',
                'isselectable': 'true',
                'has-skill-dist': 'true',
                'has-intensity': 'true',
                'has-difficulty': 'true',
                'cd-data': 'drills',
                'cd-chart-data': 'stats',
                'cd-filter-name': 'true',
                'cd-filter-by': 'skills',
                'cd-color-by': 'stats'
            };
            Object.entries(attributes).forEach(([key, value]) => {
                drillList.setAttribute(key, value);
            });
            popUpList.appendChild(drillList);

            // Warten, bis die Liste geladen ist
            drillList.addEventListener('cdListLoaded', () => {

                // schon ausgewählte Elemente markieren
                const sortableContainer = document.getElementById('sortable');
                const selectedDrills = sortableContainer.querySelectorAll('cd-list-item');
                if (attributes.isselectable === 'true' && selectedDrills.length > 0) {
                    selectedDrills.forEach(selectedItem => {
                        const selectedId = selectedItem.getAttribute('data-id');
                        const listItem = drillList.querySelector(`cd-list-item[data-id='${selectedId}']`);
                        if (listItem) {
                            const color = selectedItem.getAttribute('data-color') || '#FFFFFF';
                            const itemDiv = listItem.querySelector('div');
                            selectItem(itemDiv, color);
                        }
                    });
                }
            });
        
        } else { // Liste schon vorhanden
            drillListEl.style.display = 'block';
        }
    }
}

function closePopUp() {
    
    // Hide Background
    const popUpBg = document.getElementById('PopUpBg');
    if (popUpBg) {
        popUpBg.style.display = 'none';
    }

    // Hide Content
    const popUpContent = document.getElementById('PopUpContent');
    if (popUpContent) {
        popUpContent.style.display = 'none';
    }

    // Hide List
    const popUpList = document.getElementById('PopUpList');
    if (popUpList) {
        popUpList.style.display = 'none';
    }

    // Event triggern, für weitere Aktionen nach dem Schließen
    document.dispatchEvent(
        new CustomEvent("popupClosed", {
            detail: { closedAt: Date.now() }
        })
    );
}

function selectItem(element, color) {
    // Get parent element
    const parent = element.parentElement;
    if (!parent) return;
    
    if (parent.getAttribute('selected') === 'true') { // deselect
        parent.setAttribute('selected', 'false');
        element.style.backgroundColor = color || '#FFFFFF';
    } else { // select
        parent.setAttribute('selected', 'true');
        parent.setAttribute('data-color', color || '#FFFFFF');
        element.style.backgroundColor = '#FFFFFF';
    }
}

function updateTotalDuration() {
    let totalDuration = 0;
    document.querySelectorAll('cd-list-item').forEach(drillDiv => {
        const input = drillDiv.querySelector('input[name="duration"]');
        if (input) {
            const duration = parseInt(input.value) || 0;
            totalDuration += duration;
        }
    });

    const totalDurationEl = document.getElementById('total-duration');
    if (totalDurationEl) {
        totalDurationEl.textContent = totalDuration;
    }
}

function durationToMinutes(durationString) {
    
    // Format: "00:00:00" (HH:MM:SS) → nur Minuten
    const [hours, minutes] = durationString.split(':');
    
    return parseInt(hours) * 60 + parseInt(minutes);
}

function getCookie(name) {

    // Gibt einen bestimmten Cookie nach Namen zurück
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1)
                );
                break;
            }
        }
    }
    return cookieValue;
    }