class CDList extends HTMLElement {
    constructor() {
        super();
    }
    
    // Das hier passiert, wenn das Element in das DOM eingefügt wird (Initialisierung)
    async connectedCallback() {
        
        // Ladekreis

        // Hier werden attribute aus dem HTML-Tag gelesen, z.B. API-URL, Edit-URL, etc.
        this.apiUrl = this.getAttribute("cd-api");
        this.editUrl = this.getAttribute("cd-edit");

        // Weitere Attribute können hier gelesen werden (z.B. ob editierbar, welche Spalten, etc.)
        this.colorBy = this.getAttribute("cd-color-by");
        this.showDescription = this.getAttribute("show-description") === "true";

        await this.loadAndRender();
    }

    // Neu Rendern der Daten (Initial)
    async loadAndRender(url = this.apiUrl) {
        const res = await fetch(url);
        const context = await res.json();
        console.log("Daten geladen:", context);

        this.render(context);
    }

    // Das hier passiert, wenn Filter angewendet werden (Re-Request)
    FilterAufrufen() {
        const form = this.querySelector("#cd-filter-form");
        if (!form) return;

        // Bei Submit, Url mit Filtern erstellen und neu rendern
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            console.log(form.action);
            const url = new URL(form.action);
            const params = new URLSearchParams(new FormData(form));
            url.search = params.toString();

            this.loadAndRender(url.toString());
        });
    }

    // Das hier passiert, wenn eine neue Seite in der Pagination angeklickt wird
    PageChange(context) {
        const buttons = this.querySelectorAll(".pagination-btn");
        if (!buttons) return;
        

        buttons.forEach(button => {
            button.addEventListener("click", (e) => {
                const url = new URL(this.apiUrl, window.location.origin);

                // bestehende Filter anhängen
                Object.entries(context.current_filters).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value !== "") {
                        url.searchParams.set(key, value);
                    }
                });

                // Seite ändern
                url.searchParams.set("page", button.value);
                

                this.loadAndRender(url.toString());
            });
        });
    }

    // Rendern der Daten in die Tabelle
    render(context) {

        // Basis Aufbau und Container
        this.innerHTML = `
        <!-- Filter- und Suchleiste -->
        <div class="row">
            <div class="col mt-2 flex-column align-items-center" id="cd-filter-container"></div>
        </div>

        <!-- Eintragsliste -->
        <div class="row">
            <div class="col p-0">
                <div id="cd-list-container" class="overflow-auto" style="max-height: 250px;"></div>
            </div>
        </div>

        <!-- Pagination -->
        <div class="row">
            <div class="col d-flex justify-content-center mt-3" id="cd-pagination-container"></div>
        </div>
        `;

        // Filter und Suchleiste erstellen
        const filterContainer = this.querySelector("#cd-filter-container");
        const filterForm = document.createElement("cd-filter-form");
        filterForm.filter = context.filter; // Filter-Optionen aus dem Kontext übergeben
        filterForm.current_filters = context.current_filters; // Aktuelle Filter für die Pagination übergeben
        filterForm.apiUrl = this.apiUrl; // API-URL für die Filteranfrage setzen
        filterContainer.appendChild(filterForm);
        filterForm.render();

        // Liste erstellen
        const colors = getColors(); // Funktion aus config.js, um die Farben zu bekommen
        const listContainer = this.querySelector("#cd-list-container");
        context.data.forEach(item => {
            const listItem = document.createElement("cd-list-item");
            listItem.data = item; // Daten für das Listenelement setzen
            listItem.color = colors?.[this.colorBy]?.[item[this.colorBy]]?.[0] ?? '#FFFFFF';
            listItem.setAttribute("show-description", this.showDescription ? "true" : "false");
            listContainer.appendChild(listItem);
            listItem.render();
        });

        // Pagination erstellen
        if (context.paginator) {
            const paginationContainer = this.querySelector("#cd-pagination-container");
            const paginator = document.createElement("cd-paginator");
            paginator.info = context.paginator;
            paginationContainer.appendChild(paginator);
        }

        this.FilterAufrufen();
        this.PageChange(context);
    }
}
customElements.define("cd-list", CDList);

class CDFilterForm extends HTMLElement {
    constructor() {
        super();
        this.filter = null;
        this.current_filters = null;
    }

    connectedCallback() {

        // HTML-Attribute auslesen
        

        this.render();
    }

    render() {
        this.innerHTML = `
        <form id="cd-filter-form" class="align-items-center" method="GET" action="${this.apiUrl}">
            
            ${this.filter.name !== 'false' ? `
            <!-- Nach Namen suchen -->
            <div class="row" id="search-container">
                <input 
                    type="text" 
                    name="search" 
                    placeholder="Stichwort suchen..." 
                    class="form-control border border-2 border-dark me-2 flex-grow-1"
                >
            </div>
            ` : ''
            }
            
            <!-- Filteroptionen und Button-->
            <div class="row mt-2" id="filter-options-container">
            </div>
        </form>
        `;
        
        // Filter
        Object.entries(this.filter).forEach(([key, value]) => {
            if (key !== 'name') {
                const selectElement = document.createElement('select');
                selectElement.name = key;
                selectElement.id = `filter-${key}`;
                selectElement.style.backgroundColor = '#000000';
                selectElement.style.color = '#FFFFFF';
                selectElement.className = 'col form-select border border-0 me-1';
                selectElement.innerHTML = `<option value="">All</option>` + value.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
                if (this.current_filters && this.current_filters[key]) {
                    const selectedOption = selectElement.querySelector(`option[value="${this.current_filters[key]}"]`);
                    if (selectedOption) {
                        selectedOption.selected = true;
                    }
                }
                this.querySelector('#filter-options-container').appendChild(selectElement);
            }
        })
        
        //Button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'col btn btn-light custom-nav-btn border border-2 border-dark fw-bold';
        submitButton.textContent = 'Suchen';
        this.querySelector('#filter-options-container').appendChild(submitButton);
    }
}
customElements.define("cd-filter-form", CDFilterForm);

class CDListItem extends HTMLElement {
    constructor() {
        super();
        this.data = null;
        this.color = '#FFFFFF';
    }

    connectedCallback() {

        // HTML-Attribute auslesen
        this.nameIsEditable = this.getAttribute("name-editable") === "true";
        this.showDescription = this.getAttribute("show-description") === "true";

        this.render();
    }

    FillDescription() {
    }

    render() {
        if (!this.data) return;

        // Variablen
        this.itemId = this.data.id;

        // Basis Container
        this.innerHTML = `
            <div 
                id="item-container" 
                class="d-flex flex-row align-itelms-center mx-0 border border-dark rounded-pill my-1 mx-2 py-2 ps-3 pe-0" 
                style="background-color: ${this.color};">
            </div>
        `;
        const container = this.querySelector('#item-container');

        // Name (Input Feld statt Text, wenn editierbar)
        if (this.nameIsEditable) {
            const nameInput = document.createElement("Input");
            nameInput.type = "text";
            nameInput.name = "name";
            nameInput.value = this.getAttribute('data-name') || this.data.name;
            nameInput.className = "p-0 flex-fill d-flex text-truncate align-items-center";
            nameInput.style.minWidth = "0";
            container.appendChild(nameInput);
        } else {
            const nameDiv = document.createElement('div');
            nameDiv.className = "p-0 flex-fill d-flex text-truncate align-items-center";
            nameDiv.textContent = this.data.name;
            container.appendChild(nameDiv);
        }

        // VVVVVVVV Buttons am Ende des Items VVVVVVVV
        const endCol = document.createElement('div');
        endCol.className = "flex-schrink justify-content-end align-items-center mx-2";

        // Beschreibung Button (optional)
        if (this.showDescription) {
            const collButton = document.createElement('button');
            collButton.className = "btn btn-sm rounded-circle";
            collButton.type = "button";
            collButton.dataset.bsToggle = "collapse";
            collButton.dataset.bsTarget = `#desc-${this.itemId}`;
            collButton.setAttribute("aria-expanded", "false");
            collButton.setAttribute("aria-controls", `desc-${this.itemId}`);
            collButton.style = "background-color: black; color: white;";
            collButton.innerHTML = "&#9660;";
            endCol.appendChild(collButton);
        }

        container.appendChild(endCol);
        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

        // Beschreibung Collapsable (optional)
        if (this.showDescription) {
            const collapsable = document.createElement('div');
            collapsable.className = "collapse collapsable-description border border-light mx-2 px-3 pb-2 text-center";
            collapsable.id = `desc-${this.itemId}`;
            collapsable.innerHTML = `
                <div class='first-chart'></div>
                <div class='second-chart'></div>
                <div class='third-chart'></div>
            `;

            // Editieren und Check-Button (TODO)

            this.appendChild(collapsable);
        }

        // Beschreibung befüllen
        this.FillDescription();

    }
}
customElements.define("cd-list-item", CDListItem);

class CDPaginator extends HTMLElement {
    constructor() {
        super();
        this.info = null;
        this.url = null;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        if (!this.info) return;
        if (this.info.has_previous) {
            const prevButton = document.createElement('button');
            prevButton.className = 'btn pagination-btn';
            prevButton.innerHTML = '&#9666;';
            prevButton.style = "background-color: transparent; color: #ffffff; font-size: 60px;";
            prevButton.value = this.info.page - 1;
            this.appendChild(prevButton);
        }
        if (this.info.has_next) {
            const nextButton = document.createElement('button');
            nextButton.className = 'btn pagination-btn';
            nextButton.innerHTML = '&#9656;';
            nextButton.style = "background-color: transparent; color: #ffffff; font-size: 60px;";
            nextButton.value = this.info.page + 1;
            this.appendChild(nextButton);
        }
    }
}
customElements.define("cd-paginator", CDPaginator);

