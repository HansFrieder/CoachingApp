function getColors() {
    const colors = {
        "level1": {
            1: ["#A9A9A9", "#4dcf9d"], 
            2: ["#A9A9A9", "#40a880"],
            3: ["#A9A9A9", "#348667"],
            4: ["#A9A9A9", "#286b51"],
        },
        "level2": {
            1: ["#A7D8F5", "#108BDD"], 
            2: ["#FFD1C1", "#FC4C24"], 
            3: ["#E6C7F7", "#E86BF8"],
            4: ["#FFF7B2", "#F5D311"],
            5: ["#A9A9A9", "#6B6B6B"],
        },
        "checked": {
            true: ["#A9A9A9", "#6B6B6B"],
            false: ["#fca26a", "#f8711e"]
        }
    }
    return colors;
}