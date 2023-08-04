const { Configuration, OpenAIApi } = require("openai")
const dotenv = require('dotenv')

dotenv.config();

const configuration = new Configuration({
  // organization: "Personal",
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// let axiosRequestConfig = {
//   proxy: {
//     host: "127.0.0.1",
//     port: "10808",
//     protocol: "socks",
//   }
// }

// console.log(axiosRequestConfig)

(async function() {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: "hi"}],
    },{
      proxy: {
        host: "127.0.0.1",
        port: "10809",
        protocol: "https",
      }
    });
    console.log(completion.data.choices[0].message);
    // console.log(completion)
  } catch (error) {
    console.error(error)
  }
})()