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

class DrillList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  render() {
    // produce shadow DOM content here (template, styles, event wiring)
    this.shadowRoot.innerHTML = `
        <!-- Drill-Liste -->
        <div class="row">
            <div class="col p-0">
                {% for drill in drills %}
                    <div class="row border border-dark rounded mt-2 p-2" style="background-color: {{ drill.stats.color|default:'#ffffff' }};">
                        <!-- Text -->
                        <div 
                            class="col p-0 text-truncate d-flex align-items-center fw-bold" 
                            data-name ="{{ drill.name }}"
                            data-description="{{ drill.description }}"
                            onclick="openPopUp(this)">{{ drill.name }}</div>

                        <!-- Statistiken und Buttons -->
                        <div class="col d-flex justify-content-end">

                            <!-- Statistiken (Durch JS befüllt) -->
                            <canvas data-drill-id="{{ drill.id }}" data-type="skillDist" class="chart-canvas me-1" width="40" height="40"></canvas>
                            <canvas data-drill-id="{{ drill.id }}" data-type="intensity" class="chart-canvas " width="40" height="40"></canvas>
                            <canvas data-drill-id="{{ drill.id }}" data-type="difficulty" class="chart-canvas " width="40" height="40"></canvas>

                            <!-- Buttons -->
                            <form class="d-flex flex-row align-items-stretch m-0" action="{% url 'edit_drill' %}" method="post">
                                {% csrf_token %}
                                <button 
                                    class="btn btn-sm flex-fill mx-1" 
                                    type="submit" 
                                    name="update" 
                                    value="{{ drill.id }}" 
                                    style="background-color: white; border-width:2px; border-color:black;">
                                    &#9998;
                                </button>
                                <button 
                                    class="btn btn-sm flex-fill ms-1" 
                                    type="submit" 
                                    name="delete" 
                                    value="{{ drill.id }}" 
                                    style="background-color: white; border-width:2px; border-color:red;"
                                    disabled>
                                    &#10006;
                                </button>
                            </form>
                        </div>
                    </div>
                {% endfor %}
            </div>

            <!-- Seiten-Navigation -->
            <!-- TODO: Schöner gestalten -->
            <div class="pagination row mt-2">
                <!-- Zurück -->
                <div class="col align-items-center d-flex justify-content-center">
                    {% if drills.has_previous %}
                        <a class="btn btn-sm" href="?page={{ drills.previous_page_number }}">« Zurück</a>
                    {% endif %}
                </div>

                <!-- Seitenzahlen -->
                <div class="col text-center">
                    {% if drills.has_other_pages %}
                    <span class="col">Seite {{ drills.number }} von {{ drills.paginator.num_pages }}</span>
                {% endif %}
                </div>

                <!-- Weiter -->
                <div class="col align-items-center d-flex justify-content-center">
                    {% if drills.has_next %}
                        <a class="btn btn-sm" href="?page={{ drills.next_page_number }}">Weiter »</a>
                    {% endif %}
                </div>
            </div>
        </div>
    `;
}

}

customElements.define("drill-list", DrillList);