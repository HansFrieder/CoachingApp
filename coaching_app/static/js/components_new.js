// const { color } = require("chart.js/helpers");
// import { Chart } from 'chart.js';
// import { Colors } from 'chart.js';

// const { callback } = require("chart.js/helpers");

// Chart.register(Colors);

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
    
    // Beschreibung füllen
    FillDescription(item, meta) {
        const collapse = this.querySelector('#desc-' + item.id);
        collapse.className = "collapse.show collapsable-description border border-light mx-2 px-3 pb-2 text-center";
        const colors = getColors();

        ['level1', 'difficulty', 'intensity', 'level2'].forEach((key, _) => {

            if (key === 'level1') {
                let values = Object.values(item[key + "_distr"]);
                let labels = Object.values(meta[key]);
                let container = collapse.querySelector('#col1-' + item.id);
                container.innerHTML = '';

                // Container mit Daten füllen
                values.forEach((val, index) => {
                    let tip = document.createElement('div');
                    tip.className = 'rounded-pill m-1 p-1';
                    tip.textContent = `${labels[index]}`;
                    tip.style.backgroundColor = val === 1 ? colors[key][index + 1][1] || '#FFFFFF' : 'transparent';
                    tip.style.color = val === 1 ? '#000000' : '#FFFFFF';
                    tip.style.fontSize = '12px';
                    container.appendChild(tip);
                });
            } else if (key === 'difficulty') {
                let dataValue = item[key];
                let labels = Object.values(meta[key]);
                let container = collapse.querySelector('#col2-row1-' + item.id);
                container.innerHTML = '';

                // Container mit Daten füllen
                let canvas = document.createElement('canvas');
                canvas.width = container.offsetWidth;
                canvas.height = 60;
                let ctx = canvas.getContext('2d');
                let data = {
                    labels: ["", ""],
                    datasets: [{
                        data: [dataValue],
                        backgroundColor: ['#FFFFFF'],
                    },
                    {
                        data: [5 - dataValue],
                        backgroundColor: ['#000000'],
                    }]   
                };
                new Chart(ctx, {
                    type: 'bar',
                    data: data,
                    options: {
                        indexAxis: 'y',
                        plugins: {
                            legend: { display: false },       // Legende aus
                            tooltip: { enabled: false },       // Tooltip aus
                            title: {
                                display: true,
                                text: 'Schwierigkeitsgrad',
                                color: '#FFFFFF',
                            }
                        },
                        scales: {
                            x: {
                                grid: { display: false },       // X-Grid weg
                                border: { display: false },
                                min: 0,
                                max: 5,
                                ticks: {
                                    display: false,
                                    align: 'center',
                                    color: '#ffffff',
                                    font: {
                                        size: 7,
                                    },
                                },
                                stacked: true,
                            },
                            y: {
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false },
                                stacked: true,
                            }
                        }
                    }
                });

                container.appendChild(canvas);
            } else if (key === 'intensity') {
                let dataValue = item[key];
                let labels = Object.values(meta[key]);
                let container = collapse.querySelector('#col2-row2-' + item.id);
                container.innerHTML = '';

                // Container mit Daten füllen
                let canvas = document.createElement('canvas');
                canvas.width = container.offsetWidth;
                canvas.height = 60;
                let ctx = canvas.getContext('2d');
                let data = {
                    labels: ["", ""],
                    datasets: [{
                        data: [dataValue],
                        backgroundColor: ['#FFFFFF'],
                    },
                    {
                        data: [5 - dataValue],
                        backgroundColor: ['#000000'],
                    }]   
                };
                new Chart(ctx, {
                    type: 'bar',
                    data: data,
                    options: {
                        indexAxis: 'y',
                        backgroundColor: '#000000',
                        plugins: {
                            legend: { display: false },       // Legende aus
                            tooltip: { enabled: false },       // Tooltip aus
                            title: {
                                display: true,
                                text: 'Intensität',
                                color: '#FFFFFF',
                            }
                        },
                        scales: {
                            x: {
                                grid: { display: false },       // X-Grid weg
                                border: { display: false },
                                min: 0,
                                max: 5,
                                ticks: {
                                    display: false,
                                    align: 'center',
                                    color: '#ffffff',
                                    font: {
                                        size: 7,
                                    },
                                },
                                stacked: true,
                            },
                            y: {
                                grid: { display: false },
                                ticks: { display: false },
                                border: { display: false },
                                stacked: true,
                            }
                        }
                    }
                });

                container.appendChild(canvas);
            }

        });

        // let chartWidth = collContainer.offsetWidth / 3; // 10px Abstand
        // const colors = getColors();

        // ['first-chart', 'second-chart', 'third-chart'].forEach((chart) => {

        //     if (chart === 'first-chart') {
                
        //         // Daten für erstes Chart vorbereiten
        //         let key = 'level1';
        //         let values = Object.values(item[key + "_distr"]);
        //         let labels = Object.values(meta[key]);
                
        //         // Container erstellen oder leeren
        //         let container = collContainer.querySelector('#' + chart + '-' + item.id);
        //         if (!container) {
        //             container = document.createElement('col');
        //             container.className = 'first-chart';
        //             container.id = `${chart}-${item.id}`;
        //             container.style.width = chartWidth + 'px';
        //             container.style.backgroundColor = 'transparent';
        //         } else {
        //             container.innerHTML = '';
        //         }
                
        //         // Container mit Daten füllen
        //         values.forEach((val, index) => {
        //             let tip = document.createElement('div');
        //             tip.className = 'rounded-pill m-1 p-1';
        //             tip.textContent = `${labels[index]}`;
        //             tip.style.backgroundColor = val === 1 ? colors[key][index + 1][1] || '#FFFFFF' : 'transparent';
        //             tip.style.color = val === 1 ? '#000000' : '#FFFFFF';
        //             tip.style.fontSize = '12px';
        //             container.appendChild(tip);
        //         });

        //         // Container zum Collapsable hinzufügen
        //         collContainer.appendChild(container);
                
        //     };

        //     if (chart === 'second-chart') {

        //         // Container erstellen oder leeren
        //         let container = collContainer.querySelector('#' + chart + '-' + item.id);
        //         if (!container) {
        //             container = document.createElement('col');
        //             container.className = 'second-chart';
        //             container.id = `${chart}-${item.id}`;
        //             container.style.width = chartWidth + 'px';
        //             container.style.height = collContainer.offsetHeight + 'px';
        //         } else {
        //             container.innerHTML = '';
        //         }

        //         // Container zum Collapsable hinzufügen
        //         collContainer.appendChild(container);

        //     }

            // let canvas = collContainer.querySelector('canvas' + '.' + chart);
            // if (!canvas) {
            //     canvas = document.createElement('canvas');
            // }
            // canvas.className = chart
            // canvas.width = chartWidth;
            // canvas.height = 100;
            // let ctx = canvas.getContext('2d');

            // // Chart befüllen
            // if (chart === 'first-chart') {
            //     let key = 'level1';
            //     let labels = Object.values(meta[key]);
            //     let numbers = item[key + "_distr"];
            //     let chartColors = Object.values(colors[key]).map(c => c[1]);

            //     let data = {
            //         labels: labels,
            //         datasets: [{
            //             data: numbers,
            //             backgroundColor: chartColors,
            //         }]
            //     }
                
            //     
            // } 

            // collContainer.appendChild(canvas);
        // });

        collapse.className = "collapse collapsable-description border border-light mx-2 px-3 pb-2 text-center";
        collapse.setAttribute('aria-expanded', 'false');
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

        // Einmalige Funktionen aufrufen (Filter, Pagination, Beschreibung füllen)
        this.FilterAufrufen();
        this.PageChange(context);
        
        // Beschreibung füllen (Resize Event Listener hinzufügen)
        context.data.forEach(item => {
            this.FillDescription(item, context.meta);
        });
        window.addEventListener('resize', () => {
            context.data.forEach(item => {
                this.FillDescription(item, context.meta);
            });
        });
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
                    value="${this.current_filters?.search || ''}"
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
            collButton.setAttribute("aria-expanded", "true");
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
            collapsable.className = "collapse.show collapsable-description border border-light mx-2 px-3 pb-2 text-center";
            collapsable.id = `desc-${this.itemId}`;
            // collapsable.innerHTML = `
            //     <div class='col flex-fill d-flex flex-row' id="description-content-${this.itemId}">
            //     </div>
            // `;
            collapsable.innerHTML = `
                <div class='row' id="description-content-${this.itemId}">
                    <div class='col-4' id="col1-${this.itemId}"></div>
                    <div class='col-4' id="col2-${this.itemId}">
                        <div class='row' id="col2-row1-${this.itemId}"></div>
                        <div class='row' id="col2-row2-${this.itemId}"></div>
                    </div>
                    <div class='col-4' id="col3-${this.itemId}">
                        <div class='row' id="col3-row1-${this.itemId}"></div>
                        <div class='row' id="col3-row2-${this.itemId}"></div>
                    </div>
                </div>
            `;

            // Editieren und Check-Button (TODO)

            this.appendChild(collapsable);
        }

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
