import { ofetch } from "ofetch";

export default defineEventHandler(async (event) => {
    const api_base_url = process.env.AI_API_BASE_URL;
    const body = await readBody(event);
    if (!body && !body.question) {
        setResponseStatus(event, 400);
        return "Missing answer and question in request body"
    }
    const { question } = body;
    try {
        const res = await ofetch(`${api_base_url}/?question=${encodeURIComponent(question)}`);
        return res;
    }
    catch (error) {
        setResponseStatus(event, 400);
        return error.message
    }

})