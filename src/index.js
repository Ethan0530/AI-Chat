let sign = true;

const listContainer = document.querySelector('#list');
const textArea = document.querySelector('textarea');
const btn = document.querySelector('.btn');

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

function refreshScroll(element){
    setTimeout(() => {
        element.scrollTop = element.scrollHeight;
    },20)
}

function getModel(){
    const selectElement = document.querySelector('select');
    let selectedIndex = selectElement.selectedIndex;
    return selectElement.options[selectedIndex].value;
}

function getInputApiKey(){
    const inputElement = document.querySelector('input');
    return inputElement.value;
}

function typeText(element,text,callback){
    let index = 0;
    let interval = setInterval(() => {
        if(index < text.length){
            element.innerHTML += text.charAt(index);
            index++;
        }else{
            clearInterval(interval);
            if(callback) callback();
        }
    }, 10)
}

function disableElement(element){
    element.disabled = true;
}

function enableElement(element){
    element.disabled = false;
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

// 监听textarea的输入事件（input），每次输入时调整高度，还有点击enter时重置高度，但不超过最大高度
function resizeHeight() {
    // textArea.style.height = 'auto'; // 首先重置高度，以便计算新高度
    textArea.style.height = 'auto';
    const scrollHeight = textArea.scrollHeight;
    //这里必须计算才能拿到max-height,因为不是直接定义在index.html的内联样式中，也没有显式定义
    const computedStyle = window.getComputedStyle(textArea);
    const computedStyleHeight = computedStyle.getPropertyValue('max-height');
    const maxHeight = parseInt(computedStyleHeight);
    if(scrollHeight <= maxHeight){
        textArea.style.height = scrollHeight + "px";
    }else{
        textArea.style.height = maxHeight + "px";
    }
}

function checkSign(){
    //remove the default init element
    if(sign === true){
        const intro = document.querySelector(".intro");
        intro.remove();
        sign = false;
    }
}

function thinking(element){
    let count = 0;
    let interval = setInterval(() => {
        if(count === 5){
            element.innerHTML = "Bot: ";
            count = 0
        }
        element.innerHTML += "."
        count++;
    },1000)
    return interval;
}

function main(){
    const text = textArea.value.trim();
    if(text === '') return;

    checkSign();

    //add askElement
    let askElement = createListItem("user: " + text);
    listContainer.appendChild(askElement);

    //clear the text in textArea and resize it's height
    textArea.value = '';
    resizeHeight();

    //disable element until type full answer
    disableElement(textArea);
    disableElement(btn);

    //create answerElement
    let answerElement = createListItem("Bot: ",{backgroundColor:"#3F414D"});
    listContainer.appendChild(answerElement);

    //add thinking effect on answerElement
    let interval = thinking(answerElement);

    //do fetch
    getAIResponse(getInputApiKey(),getModel(),text)
    .then((data) => {
        //remove the thinking effect and do some basic check
        clearInterval(interval);
        answerElement.innerHTML = "Bot: ";

        if(data.error !== undefined){
            return JSON.stringify(data);
        }else return data.choices[0].message.content;
    }).then((data) => {
        //typing answer and do callback after typing
        typeText(answerElement,data,() => {
            enableElement(textArea);
            enableElement(btn);
            refreshScroll(listContainer);
        });
    }).catch((err) => {
        clearInterval(interval);
        answerElement.innerHTML = "Bot: ";
        typeText(answerElement,data,() => {
            enableElement(textArea);
            enableElement(btn);
            refreshScroll(listContainer);
        });    
    })   
}

btn.addEventListener('click', main)
textArea.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        main();
    }
})
textArea.addEventListener('input', resizeHeight);

function init(){
    const btn = document.querySelector('.btn');
    const inputContainer = document.querySelector('.input-container');
    const computedStyle = window.getComputedStyle(inputContainer);
    const computedStyleHeight = computedStyle.getPropertyValue('height');

    btn.style.height = computedStyleHeight;
}

init();
