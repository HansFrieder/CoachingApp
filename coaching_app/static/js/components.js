class CDList extends HTMLElement {
    constructor() {
        super();
    }

    // Das hier passiert, wenn das Element in das DOM eingefügt wird (Initialisierung)
    async connectedCallback() {
        
        // Basis Attribute
        this.csrfToken = this.getAttribute('cd-csrf');
        this.apiUrl = this.getAttribute('cd-api');
        this.EditUrl = this.getAttribute('cd-edit') || '';
        
        // Steuerungsattribute
        this.isSelectable = this.getAttribute('isselectable') === 'true';
        this.hasSkillDist = this.getAttribute('has-skill-dist') === 'true';
        this.hasIntensity = this.getAttribute('has-intensity') === 'true';
        this.hasDifficulty = this.getAttribute('has-difficulty') === 'true';
        this.hasDuration = this.getAttribute('has-duration') === 'true';
        this.hasDeleteButton = this.getAttribute('has-delete-button') === 'true';
        
        // Data Attribute
        this.dataFrom = this.getAttribute('cd-data');
        this.chartData = this.getAttribute('cd-chart-data') || '';
        this.filterName = this.getAttribute('cd-filter-name') || 'false';
        this.filterBy = this.getAttribute('cd-filter-by') || '';
        this.colorBy = this.getAttribute('cd-color-by') || '';

        await this.loadAndRender();
    }

    // Neu Rendern der Daten (Initial)
    async loadAndRender() {
        const res = await fetch(this.apiUrl);
        const data = await res.json();

        this.render({
            data: JSON.parse(data[this.dataFrom]),
            chartData: JSON.parse(data[this.chartData]) || [],
            filterBy: this.filterBy,
            filter: JSON.parse(data[this.filterBy]),
            color: JSON.parse(data[this.colorBy]),
            apiUrl: this.apiUrl,
        });
    }

    // Filterung ohne Re-Render
    async filter(url) {

        // Fetch API Response
        const res = await fetch(url);
        const data = await res.json();

        // Neue und dargestellte Daten einlesen
        const filteredData = JSON.parse(data[this.dataFrom]);
        const existingItems = this.querySelectorAll("cd-list-item");

        // Verstecke nicht mehr vorhandene Items
        existingItems.forEach(item => {
            const itemId = item.getAttribute('data-id');
            if (!filteredData.some(d => d.pk.toString() === itemId)) {
                item.style.display = 'none';
            }
        });

        // Stelle neue Items wieder auf sichtbar
        filteredData.forEach(d => {
            const item = this.querySelector(`cd-item[data-id='${d.pk}']`);
            if (item) {
                item.style.display = 'block';
            }
        });
    }

    // Das hier passiert, wenn Filter angewendet werden (Re-Request)
    FilterAufrufen() {
        const form = this.querySelector("#cd-filter-form");
        if (!form) return;

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const url = new URL(form.action);
            const params = new URLSearchParams(new FormData(form));
            url.search = params.toString();

            this.filter(url.toString());
        });
    }

    // Charts erstellen
    initCharts(chartData) {
        this.querySelectorAll("canvas.chart-canvas").forEach(canvas => {
            const ItemId = canvas.getAttribute('data-item-id');
            const ItemChartData = chartData?.[ItemId] ?? [];

            if (canvas.dataset.type === "skillDist") {
                createSkillDistribution(canvas, ItemChartData);
            } else {
                createBar(canvas, ItemChartData);
            }
        });
    }

    // Render-Methode zum Erstellen der HTML-Struktur
    render({ data, chartData, filter, color, apiUrl }) {

        // Erstmal Wrapper mit innerHTML (für die Zukunft sauberer mit JS)
        this.innerHTML = `
        <!-- Filter- und Suchleiste -->
        <div class="row">
            <div class="col mt-2" id="cd-filter-container"></div>
        </div>

        <!-- Eintragsliste -->
        <div class="row">
            <div class="col p-0">
                <div id="cd-list-container" class="overflow-auto" style="max-height: 400px;"></div>
            </div>
        </div>
        `;
    
        // Erstelle Filter-Kopf mit angegebenen Attributen
        if (filter.length > 0 || this.filterName !== 'false') {
            const filterContainer = this.querySelector("#cd-filter-container");
            const filterForm = document.createElement('cd-filter-form');
            filterForm.setAttribute('action', apiUrl);
            filterForm.setAttribute('cd-filter-name', this.filterName);
            filterForm.setAttribute('cd-filter-by', this.filterBy);
            filterForm.setAttribute('cd-filter-options', JSON.stringify(filter));
            filterContainer.appendChild(filterForm);
        }

        // Erstelle Liste der Einträge
        const listContainer = this.querySelector("#cd-list-container");
        data.forEach(d => {
            const item = document.createElement('cd-list-item');
            item.setAttribute('data-csrf', this.csrfToken);
            item.setAttribute('data-edit', this.EditUrl);
            item.setAttribute('data-id', d.pk);
            item.setAttribute('data-name', d.fields.name);
            item.setAttribute('data-description', d.fields.description || '');
            item.setAttribute('color', color?.[d.pk].color || '#000000');
            item.setAttribute('isselectable', this.isSelectable.toString());
            item.setAttribute('has-skill-dist', this.hasSkillDist.toString());
            item.setAttribute('has-intensity', this.hasIntensity.toString());
            item.setAttribute('has-difficulty', this.hasDifficulty.toString());
            item.setAttribute('has-duration', this.hasDuration.toString());
            item.setAttribute('has-delete-button', this.hasDeleteButton.toString());
            listContainer.appendChild(item);
        });

        // JS Scripts
        if (this.chartData !== '') {
            try {
                this.initCharts(chartData);
            } catch (error) {
                console.error('Error initializing charts:', error);
            }
        }
        this.FilterAufrufen();
    }
}
customElements.define("cd-list", CDList);

class CDFilterForm extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.filterName = this.getAttribute('cd-filter-name') || 'false';
        this.filterBy = this.getAttribute('cd-filter-by') || '';
        this.filterOptions = this.getAttribute('cd-filter-options') || '[]';
        this.apiUrl = this.getAttribute('action');

        this.render();
    }

    render() {
        this.innerHTML = `
        <form id="cd-filter-form" class="d-flex align-items-center" method="GET" action="${this.apiUrl}">
        `
        // Wenn filterName gesetzt ist, Suchfeld erstellen
        + (this.filterName !== 'false' ? `
            <!-- Nach Namen suchen -->
            <input type="text" name="search" placeholder="Suche..." class="form-control border border-2 border-dark me-2">
        ` : '') 
        // Wenn filterBy gesetzt ist, Dropdown erstellen
        + (this.filterBy !== '' ? `
            <!-- nach Filterkriterium Filtern-->
            <select name="${this.filterBy}" class="form-select border border-2 border-dark me-2">
                <option value="">All</option>
                ${JSON.parse(this.filterOptions).map(f => `<option value="${f.pk}">${f.fields.name}</option>`)}
            </select>
        ` : '') +
        // In Zukunft können hier weitere Filterkriterien hinzugefügt werden (Datum)
        `<button type="submit" class="btn btn-dark custom-nav-btn border border-2 border-dark">Suchen</button>
        </form>`;
    }
}
customElements.define("cd-filter-form", CDFilterForm);

class CDListItem extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        // Aktionen
        this.csrfToken = this.getAttribute('data-csrf') || '';
        this.editUrl = this.getAttribute('data-edit') || '';

        // Item Data
        this.itemId = this.getAttribute('data-id');
        this.name = this.getAttribute('data-name');
        this.description = this.getAttribute('data-description');

        // Layout
        this.color = this.getAttribute('color') || '#000000';

        // Steuerungsattribute
        this.isSelectable = this.getAttribute('isselectable') === 'true' || false;
        this.hasSkillDist = this.getAttribute('has-skill-dist') === 'true'  || false;
        this.hasIntensity = this.getAttribute('has-intensity') === 'true'   || false;
        this.hasDifficulty = this.getAttribute('has-difficulty') === 'true' || false;
        this.hasDuration = this.getAttribute('has-duration') === 'true'   || false;
        this.hasDeleteButton = this.getAttribute('has-delete-button') === 'true' || false;
        this.nameIsEditable = this.getAttribute('name-is-editable') === 'true' || false;

        this.render();

        // Definiere Events
        const deleteButton = this.querySelector('button[name="delete"]');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                document.dispatchEvent(
                    new CustomEvent("deleteButtonPressed", { 
                        detail: { ItemId: this.itemId }
                    })
                );
            });
        }
        const durationInput = this.querySelector('input[name="duration"]');
        if (durationInput) {
            durationInput.addEventListener('change', () => {
                document.dispatchEvent(
                new CustomEvent("updateTotal")
                );
            });
        }
    }

    render() {

        // Benennung
        this.innerHTML = `
        <div id="item-container" class="row mx-0 border border-dark rounded mt-2 p-2" style="background-color: ${this.color};">
            <div class="col p-0 text-truncate d-flex align-items-center fw-bold"
                ${this.isSelectable ? `onclick="selectItem(this, '${this.color}')"` : ''}
            >
                ${this.nameIsEditable ? this.name : this.name}
            </div>
        </div>
        `;
        const container = this.querySelector('#item-container');

        if (this.nameIsEditable) {
            const nameInput = document.createElement("Input");
            nameInput.type = "text";
            nameInput.name = "name";
            nameInput.value = this.name;
            nameInput.className = "form-control form-control-sm";
            container.appendChild(nameInput);
        }
            // } else {
        //     container.textContent = this.name;
        // }

        // Charts und Buttons am Ende
        const endCol = document.createElement('div');
        endCol.className = "col d-flex justify-content-end";

        // Charts
        if (this.hasSkillDist) {
            const skillCanvas = document.createElement('canvas');
            skillCanvas.dataset.itemId = this.itemId;
            skillCanvas.dataset.type = "skillDist";
            skillCanvas.className = "chart-canvas me-1";
            skillCanvas.width = 40;
            skillCanvas.height = 40;
            endCol.appendChild(skillCanvas);
        }
        if (this.hasIntensity) {
            const intensityCanvas = document.createElement('canvas');
            intensityCanvas.dataset.itemId = this.itemId;
            intensityCanvas.dataset.type = "intensity";
            intensityCanvas.className = "chart-canvas me-1";
            intensityCanvas.width = 40;
            intensityCanvas.height = 40;
            endCol.appendChild(intensityCanvas);
        }
        if (this.hasDifficulty) {
            const difficultyCanvas = document.createElement('canvas');
            difficultyCanvas.dataset.itemId = this.itemId;
            difficultyCanvas.dataset.type = "difficulty";
            difficultyCanvas.className = "chart-canvas me-1";
            difficultyCanvas.width = 40;
            difficultyCanvas.height = 40;
            endCol.appendChild(difficultyCanvas);
        }
        if (this.hasDuration) {
            const durationInput = document.createElement('input');
            durationInput.type = "number";
            durationInput.name = "duration";
            durationInput.value = "10";
            durationInput.min = "1";
            durationInput.className = "form-control form-control-sm me-1";
            durationInput.style.width = "60px";
            endCol.appendChild(durationInput);
        }
        if (this.editUrl !== '') {
            const editForm = document.createElement('form');
            editForm.className = "d-flex flex-row align-items-stretch m-0";
            editForm.action = this.editUrl;
            editForm.method = "post";
            editForm.innerHTML = `
            <input type="hidden" name="csrfmiddlewaretoken" value="${this.csrfToken}">
            <button
            class="btn btn-sm flex-fill mx-1"
            type="submit"
            name="update"
            value="${this.itemId}"
            style="background-color: white; border-width:2px; border-color:black;">
            &#9998;
            </button>
            `;
            endCol.appendChild(editForm);
        }
        if (this.hasDeleteButton) {
            const deleteButton = document.createElement('button');
            deleteButton.className = "btn btn-sm flex-fill ms-1";
            deleteButton.type = "button";
            deleteButton.name = "delete";
            deleteButton.style = "background-color: white; border-width:2px; border-color:red;";
            deleteButton.innerHTML = "&#10006;";
            endCol.appendChild(deleteButton);
        }
        if (this.description !== '') {
            
            // Button
            const descButton = document.createElement('button');
            descButton.className = "btn btn-sm flex-fill mx-1";
            descButton.type = "button";
            descButton.dataset.bsToggle = "collapse";
            descButton.dataset.bsTarget = `#desc-${this.itemId}`;
            descButton.setAttribute("aria-expanded", "false");
            descButton.setAttribute("aria-controls", `desc-${this.itemId}`);
            descButton.style = "background-color: white; border-width:2px; border-color:black;";
            descButton.innerHTML = "&#9660;";
            endCol.appendChild(descButton);
        }
        container.appendChild(endCol);

        // Collapsible description
        if (this.description !== '') {
            const descDiv = document.createElement('div');
            descDiv.className = "collapse mt-1";
            descDiv.id = `desc-${this.itemId}`;
            descDiv.innerHTML = `
            <div class="border border-dark rounded p-2 bg-light">
            <strong>${this.name}</strong><br>
            ${this.description}
            </div>
            `;
            this.appendChild(descDiv);
        }
    }
}
customElements.define("cd-list-item", CDListItem);


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
                    <select name="skills" class="form-select border border-2 border-dark me-2">
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