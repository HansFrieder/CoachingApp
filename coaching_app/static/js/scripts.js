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

function openPopUp(element) {
    // Get the drill data
    const name = element.getAttribute('data-name');
    const description = element.getAttribute('data-description');

    // Show Background
    const popUpBg = document.getElementById('PopUpBg');
    popUpBg.style.display = 'block';
    
    // Show Content
    const popUpContent = document.getElementById('PopUpContent');
    popUpContent.style.display = 'block';
    popUpContent.innerHTML = `
        <span class="close" onclick="closePopUp()">&times;</span>    
        <h2>${name}</h2>
        <p>${description}</p>
    `;

}

function closePopUp() {
    // Hide Background
    const popUpBg = document.getElementById('PopUpBg');
    popUpBg.style.display = 'none';
    
    // Hide Content
    const popUpContent = document.getElementById('PopUpContent');
    popUpContent.style.display = 'none';
}