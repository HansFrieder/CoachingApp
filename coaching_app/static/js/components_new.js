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
            
            const url = new URL(form.action);
            const params = new URLSearchParams(new FormData(form));
            url.search = params.toString();

            this.loadAndRender(url.toString());
        });
    }

    // Rendern der Daten in die Tabelle
    render(context) {

        this.innerHTML = `
        <!-- Filter- und Suchleiste -->
        <div class="row">
            <div class="col mt-2 flex-column align-items-center" id="cd-filter-container"></div>
        </div>

        <!-- Eintragsliste -->
        <div class="row">
            <div class="col p-0">
                <div id="cd-list-container" class="overflow-auto" style="max-height: 400px;"></div>
            </div>
        </div>
        `;  

        // Hier wird die Tabelle basierend auf den Daten und Attributen aufgebaut
        // (Implementierung folgt)

        // Filter und Suchleiste erstellen
        const filterContainer = this.querySelector("#cd-filter-container");
        const filterForm = document.createElement("cd-filter-form");
        filterForm.filter = context.filter; // Filter-Optionen aus dem Kontext übergeben
        filterForm.apiUrl = this.apiUrl; // API-URL für die Filteranfrage setzen
        filterContainer.appendChild(filterForm);
        filterForm.render();

        // Liste erstellen
        const listContainer = this.querySelector("#cd-list-container");
        context.data.forEach(item => {
            const listItem = document.createElement("div");
            listItem.className = "text-light";
            listItem.innerHTML = item.name;
            listContainer.appendChild(listItem);
        });

        this.FilterAufrufen();
    }
}
customElements.define("cd-list", CDList);

class CDFilterForm extends HTMLElement {
    constructor() {
        super();
        this.filter = null;
    }

    connectedCallback() {
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