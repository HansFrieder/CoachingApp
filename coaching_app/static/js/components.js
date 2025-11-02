class DrillList extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const apiUrl = this.getAttribute('action');

        console.log(apiUrl);

        const res = await fetch(apiUrl);
        const data = await res.json();

        const drills = JSON.parse(data.drills);
        const skills = JSON.parse(data.skills);
        const stats = JSON.parse(data.stats);

        console.log(drills);
        console.log(skills);
        console.log(stats);

        // Hier kannst du den Code hinzufügen, um die Drill-Liste zu rendern
        this.innerHTML = `
            <ul>
                ${drills.map(drill => `<li>${drill.fields.name}</li>`).join('')}
            </ul>
        `;
    }
}
customElements.define("drill-list", DrillList);