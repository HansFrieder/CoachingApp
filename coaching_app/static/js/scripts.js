// import { Chart } from 'chart.js';

function createSkillDistribution(canvas, skillData) {
    const ctx = canvas.getContext('2d');
    const data = {
        datasets: [{
            data: skillData,
            backgroundColor: [
                "#108BDD",  
                "#FC4C24",
                "#E86BF8",
                "#F5D311",
                "#00BFAE"
            ]
        }]
    }
    const skillDist = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: false,  // deaktiviert automatische Größenanpassung
        }
    })
}
