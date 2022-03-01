let textField = document.getElementById("text-search");
let dropdownMenu =  document.querySelector("#dropdown-menu ul");
let attributeFilterMenu = document.getElementById("attributes-filter-menu");
let racesFilterMenu = document.getElementById("races-filter-menu");

let timer;
const waitTime = 500;

textField.addEventListener("keyup", function(){
    clearTimeout(timer)
    
    timer = setTimeout(() => {
        fetchData()
    }, waitTime)
})


fetch("races_and_attributes.json")
.then((response) => {
    return response.json()
})
.then((data) => {
    let monsterCards = data.races[0].MonsterCards;
    let spellCards = data.races[0].SpellCards;
    let trapCards = data.races[0].TrapCards;

    generateAllRaces(monsterCards, spellCards, trapCards)

    let attributes = data.attributes

    generateAllAttributes(attributes)
})


racesFilterMenu.addEventListener("change", fetchData);
attributeFilterMenu.addEventListener("change", fetchData);

async function fetchData(){
    let response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${textField.value}${getSelectedFilter()}${getSelectedRace()}`)
    let data = await response.json();

    dropdownMenu.classList.replace("hidden", "show")

    let listItems = "";
    for (let monster of data.data){  
        listItems += `<li> <img src= ${monster.card_images[0].image_url} /> <p>${monster.name} </p></li>`;
    }
    dropdownMenu.innerHTML = listItems;

    for (let item of dropdownMenu.childNodes){
        item.addEventListener("click", fetchDetails);
    }   
}

async function fetchDetails(e){
    let clickedLink = e.target;
    let monsterName = clickedLink.innerText;
    
    let response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${monsterName}`)
    let data = await response.json();
    
    let monsterData = data.data[0];

    let monsterImg = monsterData.card_images[0].image_url
    let img_html = document.getElementById("card-img");
    img_html.src = monsterImg;
        
    document.getElementById("stats").innerHTML = `
                                                    <h3> <span> Attack: </span> ${monsterData.atk} </h3> 
                                                    <h3> <span>Defense:</span>  ${monsterData.def} </h3> 
                                                    <h3> <span> Attribute: </span>  ${monsterData.attribute} </h3> 
                                                    <h3> <span> Level: </span> ${monsterData.level} </h3>
                                                    <h3> <span> Type: </span> ${monsterData.type} </h3> 
                                                    <h3> <span> Race: </span> ${monsterData.race} </h3> 
                                                `

    document.getElementById("description").innerHTML = `
                                                    <h3> <span> Description: </span> </h3> 
                                                    <h3>  ${monsterData.desc} </h3>`

    dropdownMenu.classList.replace("show","hidden");

    textField.addEventListener("focus", function(){
        dropdownMenu.classList.replace("hidden", "show");
    })
}

function generateAllRaces(monsterCards, spellCards, trapCards){
    let monsterCardItems = "";
    let spellCardItems = "";
    let trapCardItems = "";

    for (let card of monsterCards) {
        monsterCardItems += `<option value=${card.toLowerCase()}> ${card} </option>`
    }
    for (let card of spellCards) {
        spellCardItems+= `<option value=${card.toLowerCase()}> ${card} </option>`
    }
    for (let card of trapCards) {
        trapCardItems += `<option value=${card.toLowerCase()}> ${card} </option>`
    }

    document.querySelector("#races-filter-menu optgroup").innerHTML = "<option value='' selected> All </option>" + monsterCardItems;
    document.querySelector("#races-filter-menu optgroup:nth-child(2)").innerHTML = spellCardItems
    document.querySelector("#races-filter-menu optgroup:nth-child(3)").innerHTML = trapCardItems
}

function generateAllAttributes(attributesData) {
    let attributesItems = "";
    
    for (attribute of attributesData) {
        attributesItems += `<option value="${attribute.toLowerCase()}">${attribute}</option>`
    }

    attributeFilterMenu.innerHTML = `<option value="" selected >All</option>` + attributesItems;
}

function getSelectedFilter(){
    let selectedAttribute = attributeFilterMenu.value;

    if (selectedAttribute == ""){
        return "";
    } else {
        let attribute = "&attribute=" + selectedAttribute;
        return attribute;
    }
}

function getSelectedRace(){
    let selectedRace = racesFilterMenu.value;

    if (selectedRace == ""){
        return "";
    } else {
        let race = "&race=" + selectedRace;
        return race;
    }
}


