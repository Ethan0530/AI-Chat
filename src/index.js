const config = {
    length: 20,
    key: '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'
}

let sign = true;

const listContainer = document.querySelector('#list');

(function init(){
    // let items = [];
    // for(let i = 1;i <= config.length;i++){
    //     items.push("item"+i)
    // }
    // items.forEach(item => {
    //     let child = createListItem(item);
    //     listContainer.appendChild(child);
    // })
})();

//create new list item element and return it
function createListItem(text,styleOptions){
    let listItem = document.createElement("div");
    listItem.className = "list-item";
    listItem.textContent = text;
    for(key in styleOptions){
        listItem.style[key] = styleOptions[key];
    }
    return listItem;
}

// const observer = new MutationObserver(function(mutationList) {
//     mutationList.forEach(mutation => {
//         if(mutation.type === 'childList'){
//             setTimeout(() => {
//                 listContainer.scrollTop = listContainer.scrollHeight;
//             },5)
//         }
//     })
// })

//observe the changes in the sub-elements of the list
// observer.observe(listContainer,{childList:true})

function refreshScroll(element){
    element.scrollTop = element.scrollHeight;
}

const textArea = document.querySelector('textarea');

function getModel(){
    const selectElement = document.querySelector('select');
    let selectedIndex = selectElement.selectedIndex;
    return selectElement.options[selectedIndex].value;
}

function getInputApiKey(){
    const inputElement = document.querySelector('input');
    return inputElement.value;
}

function getKey(){
    let key = getInputApiKey().trim();
    if(key.length === 0){
        key = config.key;
    }
    return key;
}

textArea.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        const text = textArea.value.trim();
        if(text === '') return

        //remove the default init element
        if(sign === true){
            const intro = document.querySelector(".intro");
            intro.remove();
            sign = false;
        }

        let child = createListItem("user: " + text);
        listContainer.appendChild(child);
        textArea.value = '';
        textArea.readOnly = true;

        getAIResponse(getKey(),getModel(),text)
        .then((data) => {
            if(data.error !== undefined){
                return JSON.stringify(data);
            }else return data.choices[0].message.content;
        }).then((data) => {
            let answer = createListItem("Bot: " + data,{backgroundColor:"#3F414D"});
            listContainer.appendChild(answer);
            textArea.readOnly = false;
            setTimeout(() => {
                refreshScroll(listContainer);
            },20)
        }).catch((err) => {
            listContainer.appendChild(createListItem(err));
            textArea.readOnly = false;
            setTimeout(() => {
                refreshScroll(listContainer);
            },20)
        })
    }
})

function typeText(element,text){
    let index = 0;
    let interval = setInterval(() => {
        if(index < text.length){
            element.innerHTML += text.charAt(index);
            index++;
        }else{
            clearInterval(interval);
        }
    }, 20)
}

/**
 * Generates a unique identifier.
 * @returns {string}
 */
function genetateUniqueId(){
    const time = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);
    return `id-${time}-${hexadecimalString}`;
}

/**
 * This asynchronous function sends a POST request to the OpenAI API to get an AI response.
 * @param {string} apiKey - The API key used for authentication with the OpenAI API.
 * @param {string} model - The gpt model. 
 * @param {string} content - The user's input or message content.
 * @returns {Promise} - A Promise that resolves to the JSON response from the API.
 */
async function getAIResponse(apiKey,model,content){
    const requestObject = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            "model": model,
            "messages": [{"role": "user", "content": content}],
            "temperature": 0.7
        })
    };
    const response = await fetch('https://api.openai.com/v1/chat/completions', requestObject);

    return response.json();
}



const selectElement = document.querySelector('select');
selectElement.addEventListener('click', (e) => {
    if(getInputApiKey().trim().length === 0){
        selectElement.options[5].disabled = true;
        selectElement.options[6].disabled = true;
        selectElement.options[7].disabled = true;
        selectElement.options[8].disabled = true;
        selectElement.options[9].disabled = true;
    }else{
        selectElement.options[5].disabled = false;
        selectElement.options[6].disabled = false;
        selectElement.options[7].disabled = false;
        selectElement.options[8].disabled = false;
        selectElement.options[9].disabled = false;
    } 
})