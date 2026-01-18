class CDList extends HTMLElement {
    constructor() {
        super();
    }

    // Das hier passiert, wenn das Element in das DOM eingefügt wird (Initialisierung)
    async connectedCallback() {
        
        // Zeige Ladekreis
        this.innerHTML = `
            <div class="row">
                <div class="col mt-2" id="cd-spinner">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Laden...</span>
                    </div>
                </div>
            </div>
        `;

        // Basis Attribute
        this.csrfToken = this.getAttribute('cd-csrf');
        this.apiUrl = this.getAttribute('cd-api');
        this.EditUrl = this.getAttribute('cd-edit') || '';
        
        // Steuerungsattribute
        this.isSelectable = this.getAttribute('isselectable') === 'true';
        this.isSortable = this.getAttribute('issortable') === 'true';
        this.hasSkillDist = this.getAttribute('has-skill-dist') === 'true';
        this.hasIntensity = this.getAttribute('has-intensity') === 'true';
        this.hasDifficulty = this.getAttribute('has-difficulty') === 'true';
        this.hasDuration = this.getAttribute('has-duration') === 'true';
        this.hasDeleteButton = this.getAttribute('has-delete-button') === 'true';
        this.hasCheckbox = this.getAttribute('has-checkbox') === 'true';
        
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
            chartData: data?.[this.chartData] ? JSON.parse(data[this.chartData]) : [],
            filterBy: this.filterBy,
            filter: data?.[this.filterBy] ? JSON.parse(data[this.filterBy]) : [],
            color: data?.[this.colorBy] ? JSON.parse(data[this.colorBy]) : [],
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
            const item = this.querySelector(`cd-list-item[data-id='${d.pk}']`);
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
            filterForm.setAttribute('cd-filter-options', JSON.stringify(filter)); // Optimierung: Direktes Übergeben des Filter-Arrays als JSON-String
            filterContainer.appendChild(filterForm);
        }

        // Erstelle Liste der Einträge
        const listContainer = this.querySelector("#cd-list-container");
        console.log(data)
        data.forEach(d => {
            const item = document.createElement('cd-list-item');
            item.setAttribute('data-csrf', this.csrfToken);
            item.setAttribute('data-edit', this.EditUrl || '');
            item.setAttribute('data-id', d.pk);
            item.setAttribute('data-name', d.fields.name);
            item.setAttribute('data-description', d.fields.description || '');
            if (this.hasDuration) {
                item.setAttribute('data-duration', durationToMinutes(d.fields.duration.toString()) || '10');
            }
            item.setAttribute('color', color?.[d.pk]?.color ?? '#FFFFFF');
            item.setAttribute('isselectable', this.isSelectable.toString());
            item.setAttribute('has-skill-dist', this.hasSkillDist.toString());
            item.setAttribute('has-intensity', this.hasIntensity.toString());
            item.setAttribute('has-difficulty', this.hasDifficulty.toString());
            item.setAttribute('has-duration', this.hasDuration.toString());
            item.setAttribute('has-delete-button', this.hasDeleteButton.toString());
            item.setAttribute('has-checkbox', this.hasCheckbox.toString());
            item.setAttribute('checked', d.fields.checked?.toString() ?? 'false');
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

        // Event auslösen, dass die Liste fertig initialisiert wurde
        this.dispatchEvent(new CustomEvent(
            'cdListLoaded',
        ));
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
        this.description = this.getAttribute('data-description') || '';

        // Layout
        this.color = this.getAttribute('color') || '#FFFFFF';

        // Steuerungsattribute
        this.isSelectable = this.getAttribute('isselectable') === 'true' || false;
        this.hasSkillDist = this.getAttribute('has-skill-dist') === 'true'  || false;
        this.hasIntensity = this.getAttribute('has-intensity') === 'true'   || false;
        this.hasDifficulty = this.getAttribute('has-difficulty') === 'true' || false;
        this.hasDuration = this.getAttribute('has-duration') === 'true'   || false;
        if (this.hasDuration) {
            this.setAttribute('data-duration', this.getAttribute('data-duration') || '10');
        }
        this.hasCheckbox = this.getAttribute('has-checkbox') === 'true' || false;
        this.checked = this.getAttribute('checked') === 'true' || false;
        this.hasDeleteButton = this.getAttribute('has-delete-button') === 'true' || false;
        this.nameIsEditable = this.getAttribute('name-is-editable') === 'true' || false;

        this.render();

        // Definiere Events
        const nameInput = this.querySelector('input[name="name"]');
        if (nameInput) {
            nameInput.addEventListener('change', () => {
                nameInput.setAttribute('data-name', nameInput.value);
                nameInput.parentElement.parentElement.setAttribute('data-name', nameInput.value);
            });
        }
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
                durationInput.parentElement.parentElement.parentElement.setAttribute('data-duration', durationInput.value);
            });
        }
        if (this.isSelectable) {
            const nameDiv = this.querySelector('#item-container');
            nameDiv.addEventListener('click', () => {
                console.log("Item clicked:", this.itemId);
                selectItem(nameDiv, this.color);
            });
        }
        if (this.hasCheckbox) {
            const checkboxInput = this.querySelector('input[name="select-checkbox"]');
            checkboxInput.addEventListener('change', () => {
                document.dispatchEvent(
                    new CustomEvent("checkboxChanged", { 
                        detail: { ItemId: this.itemId, Checked: checkboxInput.checked }
                    })
                );
            });
        }
    }

    render() {

        // Benennung
        this.innerHTML = `
        <div id="item-container" class="row mx-0 border border-dark rounded mt-2 p-2" style="background-color: ${this.color};"></div>
        `;
        const container = this.querySelector('#item-container');

        if (this.nameIsEditable) {
            const nameInput = document.createElement("Input");
            nameInput.type = "text";
            nameInput.name = "name";
            nameInput.value = this.getAttribute('data-name') || this.name;
            nameInput.className = "col form-control form-control-sm d-flex align-items-center justify-content-start fw-bold";
            nameInput.style.minWidth = "0";
            container.appendChild(nameInput);
        } else {
            const nameDiv = document.createElement('div');
            nameDiv.className = "col p-0 text-truncate d-flex align-items-center fw-bold";
            nameDiv.textContent = this.name;
            container.appendChild(nameDiv);
        }

        // Charts und Buttons am Ende
        const endCol = document.createElement('div');
        endCol.className = "col d-flex justify-content-end align-items-center";

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
            intensityCanvas.className = "chart-canvas";
            intensityCanvas.width = 20;
            intensityCanvas.height = 40;
            endCol.appendChild(intensityCanvas);
        }
        if (this.hasDifficulty) {
            const difficultyCanvas = document.createElement('canvas');
            difficultyCanvas.dataset.itemId = this.itemId;
            difficultyCanvas.dataset.type = "difficulty";
            difficultyCanvas.className = "chart-canvas";
            difficultyCanvas.width = 20;
            difficultyCanvas.height = 40;
            endCol.appendChild(difficultyCanvas);
        }
        if (this.hasDuration) {
            const durationInput = document.createElement('input');
            durationInput.type = "number";
            durationInput.name = "duration";
            durationInput.value = this.getAttribute('data-duration') || "10";
            durationInput.min = "1";
            durationInput.className = "form-control form-control-sm";
            durationInput.style.width = "60px";
            endCol.appendChild(durationInput);
        }
        if (this.editUrl !== '') {
            const editForm = document.createElement('form');
            editForm.className = "d-flex flex-row align-items-stretch m-0 p-0 mx-1";
            editForm.action = this.editUrl;
            editForm.method = "post";
            editForm.innerHTML = `
            <input type="hidden" name="csrfmiddlewaretoken" value="${this.csrfToken}">
            <button
            class="btn btn-sm flex-fill"
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
            deleteButton.className = "btn btn-sm flex-row";
            deleteButton.type = "button";
            deleteButton.name = "delete";
            deleteButton.style = "background-color: white; border-width:2px; border-color:red;";
            deleteButton.innerHTML = "&#10006;";
            endCol.appendChild(deleteButton);
        }
        if (this.description !== '') {
            
            // Button
            const descButton = document.createElement('button');
            descButton.className = "btn btn-sm flex-row";
            descButton.type = "button";
            descButton.dataset.bsToggle = "collapse";
            descButton.dataset.bsTarget = `#desc-${this.itemId}`;
            descButton.setAttribute("aria-expanded", "false");
            descButton.setAttribute("aria-controls", `desc-${this.itemId}`);
            descButton.style = "background-color: white; border-width:2px; border-color:black;";
            descButton.innerHTML = "&#9660;";
            endCol.appendChild(descButton);
        }
        if (this.hasCheckbox) {
            const checkboxInput = document.createElement('input');
            checkboxInput.type = "checkbox";
            checkboxInput.name = "select-checkbox";
            checkboxInput.className = "form-check-input ms-2 border-dark";
            checkboxInput.checked = this.checked;
            if (this.checked) {
                checkboxInput.disabled = true;
            }
            endCol.appendChild(checkboxInput);
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