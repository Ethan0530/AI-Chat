const express = require('express')
const { Configuration, OpenAIApi } = require("openai")
const dotenv = require('dotenv')
const cors = require('cors')
dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 3000;

app.use(cors())
app.use(express.json())
app.use(express.static('../client/src'));

app.get("/", async (req, res) => {
    res.json({
        message:"hello world!"
    })
})

app.post("/", async (req, res) => {
    try {
        const model = req.body.model;
        const content = req.body.content;
        let key = req.body.key;
        console.log(req.body)
        
        if(key.length === 0){
            key = configuration.apiKey;
        }

        const openai = new OpenAIApi({apiKey:key})
        const completion = await openai.createChatCompletion({
            model: model,
            messages: [{role: "user", content: content}],
            temperature: 0.5,
            frequency_penalty: 0.5,
        });
        res.status(200).send(completion.data.choices[0].message)
        console.log(completion.data.choices[0].message);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
})

app.listen(port, "0.0.0.0",() => {
    console.log(`app is running at https://localhost${port}`)
})