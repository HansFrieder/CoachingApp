class DrillList extends HTMLElement {
    constructor() {
        super();
    }

    // Beim Anhängen an das DOM
    async connectedCallback() {
        this.apiUrl = this.getAttribute('action');
        this.isSelectable = this.getAttribute('isselectable') === 'true';
        this.updateUrlTemplate = this.getAttribute('update-url-template') || '';
        this.csrfToken = this.getAttribute('data-csrf');

        await this.loadAndRender();
    }

    // Daten laden und rendern
    async loadAndRender(url = this.apiUrl) {
        const res = await fetch(url);
        const data = await res.json();

        this.render({
            drills: JSON.parse(data.drills),
            skills: JSON.parse(data.skills),
            stats: JSON.parse(data.stats),
            apiUrl: this.apiUrl,
        });

    }

    // Charts erstellen
    initCharts(stats) {
        this.querySelectorAll("canvas.chart-canvas").forEach(canvas => {
            const drillId = canvas.dataset.drillId;
            const skillData = stats?.[drillId] ?? [];

            if (canvas.dataset.type === "skillDist") {
                createSkillDistribution(canvas, skillData);
            } else {
                createBar(canvas, skillData);
            }
        });
    }

    // Event-Handler für das Filterformular (Re-Request)
    attachFilterHandler() {
        const form = this.querySelector("#filter-form");
        if (!form) return;

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const url = new URL(form.action);
            const params = new URLSearchParams(new FormData(form));
            url.search = params.toString();

            this.loadAndRender(url.toString());
        });
    }
    
    // Render-Methode zum Erstellen der HTML-Struktur
    render({ drills, skills, stats, apiUrl }) {
        this.innerHTML = `
        <!-- Filter- und Suchleiste -->
        <div class="row">
            <div class="col mt-2">
                <form id="filter-form" class="d-flex align-items-center" method="GET" action="${apiUrl}">
                    <!-- Nach Namen suchen -->
                    <input type="text" name="search" placeholder="Suche..." class="form-control border border-2 border-dark me-2">
                    
                    <!-- nach Hauptskill Filtern-->
                    <select name="skill" class="form-select border border-2 border-dark me-2">
                        <option value="">All</option>
                        ${skills.map(skill => `<option value="${skill.pk}">${skill.fields.name}</option>`)}
                    </select>
                    <button type="submit" class="btn btn-dark custom-nav-btn border border-2 border-dark">Suchen</button>
                </form>
            </div>
        </div>

        <!-- Drill Liste -->
        <div class="row">
            <div class="col p-0">
            <div id="drill-list" class="overflow-auto" style="max-height: 400px;">
            ${drills.map(drill => `
            <div 
            data-drill-id="${drill.pk}"
            data-name ="${drill.fields.name}"
            class="row mx-0 border border-dark rounded mt-2 p-2" 
            style="background-color: ${ (stats[drill.pk]?.color) ?? '#ffffff' };">
                <!-- Text -->
                <div 
                class="col p-0 text-truncate d-flex align-items-center fw-bold"
                ${this.isSelectable ? `onclick="selectDrill(this, '${stats[drill.pk]?.color}')"` : `onclick="openPopUp(this, 'drill')"`}
                >${drill.fields.name}</div>

                <!-- Statistiken und Buttons -->
                <div class="col d-flex justify-content-end">

                    <!-- Statistiken (Durch JS befüllt) -->
                    <canvas data-drill-id="${drill.pk}" data-type="skillDist" class="chart-canvas me-1" width="40" height="40"></canvas>
                    <canvas data-drill-id="${drill.pk}" data-type="intensity" class="chart-canvas" width="40" height="40"></canvas>
                    <canvas data-drill-id="${drill.pk}" data-type="difficulty" class="chart-canvas" width="40" height="40"></canvas>

                    <!-- Buttons -->
                    
                    ${this.updateUrlTemplate !== '' ? `
                        <form class="d-flex flex-row align-items-stretch m-0" action="${this.updateUrlTemplate}" method="post">
                            <input type="hidden" name="csrfmiddlewaretoken" value="${this.csrfToken}">
                            <button 
                                class="btn btn-sm flex-fill mx-1" 
                                type="submit" 
                                name="update"
                                value="${drill.pk}" 
                                style="background-color: white; border-width:2px; border-color:black;">
                                &#9998;
                            </button>
                        </form>
                    ` : ''}

                    <!-- Toggle description (Bootstrap collapse) -->
                    
                    <button 
                        class="btn btn-sm flex-fill mx-1" 
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#desc-${drill.pk}"
                        aria-expanded="false"
                        aria-controls="desc-${drill.pk}"
                        style="background-color: white; border-width:2px; border-color:black;">
                        &#9660;
                    </button>
                </div>
            </div>

            <!-- Collapsible description -->
            <div class="collapse mt-1" id="desc-${drill.pk}">
                <div class="border border-dark rounded p-2 bg-light">
                <strong>${drill.fields.name}</strong><br>
                ${drill.fields.description ?? ''}
                </div>
            </div>

            `).join('')}
            </div>
            </div>
        </div>
        `;

        // JS Scripts
        this.initCharts(stats);
        this.attachFilterHandler();
    }
}
customElements.define("drill-list", DrillList);

class TrainingItem extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.drillId = this.getAttribute('data-id');
        this.name = this.getAttribute('data-name');

        this.render();
        
        // Definiere Events
        this.querySelector('button[name="delete"]').addEventListener('click', () => {
            document.dispatchEvent(
                new CustomEvent("deleteButtonPressed", { 
                    detail: { drillId: this.drillId }
                })
            );
        });
        this.querySelector('input[name="duration"]').addEventListener('change', () => {
            document.dispatchEvent(
            new CustomEvent("updateTotal")
            );
        });
        if ('custom' in this.drillId) {
            this.querySelector('div[name="name"]').addEventListener('click', () => {
                document.dispatchEvent(
                    new CustomEvent("customNameClicked", { 
                        detail: { drillId: this.drillId }
                    })
                );
            });
        };
    }

    render() {
        this.innerHTML = `
            <div class="row mx-0 border border-dark rounded mt-2 p-2">
                <div name="name" class="col p-0 text-truncate d-flex align-items-center fw-bold">${this.name}</div>
            
                <div class="col d-flex justify-content-end">
                    <input
                    name="duration"
                    type="number"
                    value="10"
                    min="1"
                    class="form-control form-control-sm me-1"
                    style="width: 60px;">
                    <button 
                    class="btn btn-sm flex-fill ms-1" 
                    type="button" 
                    name="delete"
                    style="background-color: white; border-width:2px; border-color:red;">
                    &#10006;
                    </button>
                </div>
            </div>
        `;
    }
}
customElements.define("training-item", TrainingItem);