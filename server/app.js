const express = require('express')
const { Configuration, OpenAIApi } = require("openai")
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser');
dotenv.config();

const defaultConfiguration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 3000;

app.use(cors())
app.use(express.json())
app.use(express.static('../client/src'));
app.use(cookieParser());

app.get("/", async (req, res) => {
    res.json({
        message:"hello world!"
    })
})

app.post("/", async (req, res) => {
    try {
        const model = req.body.model || "gpt-3.5-turbo";
        const content = req.body.content || "hi";
        let key = req.body.key || defaultConfiguration.apiKey;
        // console.log(req.body);
        const context = req.cookies.context;
        const contextArr = (context)?JSON.parse(context):[];

        //save 6 contexts
        if(contextArr.length > 6){
            while(contextArr.length > 6){
                contextArr.shift();
            }
        }

        contextArr.push({role: "user",content: content})
        const openai = new OpenAIApi(new Configuration({apiKey: key}));
        const completion = await openai.createChatCompletion({
            model: model,
            //messages: [{role: "user", content: content}],
            messages: contextArr,
            temperature: 0.5,
            frequency_penalty: 0.5,
        });
        contextArr.push(completion.data.choices[0].message);
        res.cookie('context', JSON.stringify(contextArr), { maxAge: 3600000 });
        //console.log(contextArr);
            res.status(200).send(completion.data);
            //console.log(completion.data.choices[0].message);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
})

app.listen(port, () => {
    console.log(`app is running at https://localhost${port}`)
})
