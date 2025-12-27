function createSkillDistribution(canvas, skillData) {
    const ctx = canvas.getContext('2d');
    
    // Data Konfiguration
    const data = {
        datasets: [{
            data: skillData.level2_distr,
            backgroundColor: [
                "#108BDD",  
                "#FC4C24",
                "#E86BF8",
                "#F5D311",
                "#00BFAE"
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

function createBar(canvas, skillData) {
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
    
    let value = canvas.getAttribute('data-type') === "intensity" ? skillData.intensity : skillData.difficulty;

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
        
        // Ensure the drill-list web component is present and initialized.
        // If it's already in the DOM but was added before, set it to display block.
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

        // Ensure the drill-list web component is present and initialized.
        let drillListEl = popUpList.querySelector('drill-list');
        if (!drillListEl) {
            const drillList = document.createElement('drill-list');
            drillList.setAttribute('action', '/api/drills/');
            drillList.setAttribute('isselectable', 'true');
            popUpList.appendChild(drillList);
        } else {
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
}

function selectDrill(element, color) {

    // Get parent element
    const parent = element.parentElement;
    if (!parent) return;
    
    if (parent.getAttribute('selected') === 'true') { // deselect
        parent.setAttribute('selected', 'false');
        parent.style.backgroundColor = color || '#FFFFFF';
    } else { // select
        parent.setAttribute('selected', 'true');
        parent.style.backgroundColor = '#FFFFFF';
    }
}