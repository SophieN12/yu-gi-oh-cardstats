let textField = document.getElementById("text-search");
let dropdownMenu =  document.querySelector("#dropdown-menu ul");
let attributeFilterMenu = document.getElementById("attributes-filter-menu");
let racesFilterMenu = document.getElementById("races-filter-menu");

let timer;
const waitTime = 500;

textField.addEventListener("keyup", function(){
    clearTimeout(timer)
    
    timer = setTimeout(() => {
        if (textField.value == ""){
            return;
        }

        fetchData()
    }, waitTime)
})


async function fetchRacesAndAttributesData(){
    try {
       let response = await fetch("races_and_attributes.json");

        let data = await response.json();
        
        let monsterCards = data.races[0].MonsterCards;
        let spellCards = data.races[0].SpellCards;
        let trapCards = data.races[0].TrapCards;

        let attributes = data.attributes;

        generateAllRaces(monsterCards, spellCards, trapCards);
        generateAllAttributes(attributes) ;
    }
    catch(err) {
        console.error(err);
        renderErrorMessage("catch-races-and-attributes");
    }
}


racesFilterMenu.addEventListener("change", fetchData);
attributeFilterMenu.addEventListener("change", fetchData);

async function fetchData(){
    try {
        document.getElementById("error-messages").innerHTML = "";

        let response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${textField.value}${getSelectedFilter()}${getSelectedRace()}`)        
        renderErrorMessage(response.status);
        
        let data = await response.json();
        console.log(data.data);

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
    catch(err) {
        
        console.log(err);
        renderErrorMessage("catch-server");
    }
}

async function fetchDetails(e){
    try {
        let clickedLink = e.target;
        let monsterName = clickedLink.innerText;
        
        let response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${monsterName}`)
        let data = await response.json();
        
        let monsterData = data.data[0];

        let monsterImg = monsterData.card_images[0].image_url;
        let img_html = document.getElementById("card-img");
        img_html.src = monsterImg;
     
        renderCardDetails(monsterData.type, monsterData);

        dropdownMenu.classList.replace("show","hidden");

        textField.addEventListener("focus", function(){
            dropdownMenu.classList.replace("hidden", "show");
        })

    } catch(err) {
        console.log(err);
        renderErrorMessage("catch-details");
    }
}

function renderCardDetails(monsterType, monsterData){
    if (monsterType === "Spell Card" || monsterType === "Trap Card"){
        document.getElementById("stats").innerHTML = ` 
                                                    <h3> <span> Type: </span> ${monsterData.type} </h3> 
                                                    <h3> <span> Race: </span> ${monsterData.race} </h3> 
                                                    `
    } else {
        document.getElementById("stats").innerHTML = `
                                                    <h3> <span> Attack: </span> ${monsterData.atk} </h3> 
                                                    <h3> <span>Defense:</span>  ${monsterData.def} </h3> 
                                                    <h3> <span> Attribute: </span>  ${monsterData.attribute} </h3> 
                                                    <h3> <span> Level: </span> ${monsterData.level} </h3>
                                                    <h3> <span> Type: </span> ${monsterData.type} </h3> 
                                                    <h3> <span> Race: </span> ${monsterData.race} </h3> 
                                                `
    }

    document.getElementById("description").innerHTML = `
                                                    <h3> <span> Description: </span> </h3> 
                                                    <h3>  ${monsterData.desc} </h3>`
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
    document.querySelector("#races-filter-menu optgroup:nth-child(2)").innerHTML = spellCardItems;
    document.querySelector("#races-filter-menu optgroup:nth-child(3)").innerHTML = trapCardItems;
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

function renderErrorMessage(status){
    let errorMessage = "";
    if (status == 400){
        errorMessage += "Sorry, we couldn't find the card you were looking for!" 
        throw new Error(errorMessage);
    } 
    else if (status == "catch-server"){
        errorMessage += "Sorry. There's seems to be some problems. Please double check everything.";
    }
    else if (status == "catch-details"){
        errorMessage += "Something went wrong, could not fetch details about your card! Try again later."   
    }
    else if (status == "catch-races-and-attributes"){
        errorMessage += "There seems to be a problem with fetching all races and attributes, please use 'Go Live' "
        attributeFilterMenu.innerHTML = `<option value="" selected >All</option>`
        document.querySelector("#races-filter-menu ").innerHTML = "<option value='' selected> All </option>"
    }

    document.getElementById("error-messages").innerHTML = errorMessage;
    return errorMessage;
}   

fetchRacesAndAttributesData();
