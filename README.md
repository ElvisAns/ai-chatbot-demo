# AI Chat Bot

We built a customizable chatbot using Cloudflare AI Workers that responds to custom questions with pre-defined answers, leveraging text vectorisation and AI text generation for natural conversational interaction. 

https://github.com/ElvisAns/ai-chatbot-demo/assets/35831811/40260c82-4589-4cc8-afb1-d1c9b35af43e

**Please check the Demo at : https://ai-chatbot-demo.pages.dev**

⚠️ Currently the site has not login/signup, so please be responsible, don't abuse!

## Technology used

We're using vector embedding to sort of train our AI to respond to users questions with predefined answers, all without having to train the AI in a formal way, which can be difficult and expensive.

On the AI backend side we are using 2 models :
- @cf/baai/bge-base-en-v1.5 : Cloudflare vectorize, https://developers.cloudflare.com/vectorize
- @cf/meta/llama-2-7b-chat-int8 : Text generation model, https://developers.cloudflare.com/workers-ai/models/llama-2-7b-chat-int8

The entire frontend is built with NuxtJs

We also have a `D1` https://developers.cloudflare.com/d1/ database that help us store our questions and answers

## How does it work

We have a database that store questions and answers, when our frontend query the AI route, we first check within our vector database if there's a text (question) that has simularity with the user asked question, if yes we check if questions still exist in the qa repository via their `id` that we also stored in the vector db when we created the question. From the DB we get the predefined answers and we pass them as context for our AI text generation model. The reponse from the AI is then pass back to our frontend. For our chatbot to really work as a virtual assistant we have a prefined prompt that tell the AI to not answer questions outside of scope.

## How to setup

*Note that to use Cloudflare vectorize you need to be on a paid plan, so this code may work perfectly for you if you are on free plan but you can "simulate" vector embedding by using "Fuzzy search" logic against your question from the database (see https://www.npmjs.com/package/minisearch as a example)*

steps:

You need to have node and npm install in order to proced
- Clone or fork this repository
- Install Wrangler and login your account so that you can deploy the workers localy (https://developers.cloudflare.com/workers/wrangler/install-and-update/)
    - Browse to the folder were you have the repo then `cd ai-backend`
    - Create vector index `npx wrangler vectorize create qa-vector-index --dimensions=768 --metric=cosine` (the index name qa-vector-index is already in wrangler.toml so this command is all you need to do)
    - Create the D1 database `npx wrangler d1 create database`
    - I found it easy to create table from the the CF dashboard, so from your dashboard browse to a D1 DB called "database", create a table called QA_repository and give it 3 cols : id (INT PK), question(TEXT) & answer(TEXT)
    - Deploy your workers `npx wrangler deploy` and take that worker URL
    - For frontend, it is also easy to deploy nuxt to cloudflare pages, just go to your dashboard and
        - Create a page
        - Choose create from Github, connect your account and select the repo in the list
        - Click advanced and for root folder put : `chatbot-frontend`
        - Before deployment create one environment variable called : `AI_API_BASE_URL` and set it to the url of your AI backend with no trailing slash
        - Hit deploy and that it!

From the above step you will have the chatbot deployed and you can play with it as needed.

To manage your QA knowledge base for your chatbot you need to go to the QA tab and manage your set there

![image](https://github.com/ElvisAns/ai-chatbot-demo/assets/35831811/538cea21-bb03-4a31-a124-12cbfa6b55f4)

Just after creating your custom question, you can go to the chat section and ask the AI your question, it will answer in a very comic way 😍

## Next steps

Of course, this is just the beginning, this chatbot can end up being an embeddable chatbot on a website and with some customisation, lots of questions and answers, you can have a real virtual assistant that can be deployed hassle-free.

## Authors
- [@Ansima](https://www.github.com/ElvisAns)
