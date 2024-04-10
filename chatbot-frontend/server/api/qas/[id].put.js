import { ofetch } from "ofetch";

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const api_base_url = process.env.AI_API_BASE_URL;
    const body = await readBody(event);
    if (!body && (!body.answer || !body.question)) {
        setResponseStatus(event, 400);
        return "Missing answer and question in request body"
    }
    const { answer, question } = body;
    try {
        const res = await ofetch(`${api_base_url}/qas/${id}`, { method: "PUT", body: { answer, question } });
        return res;
    }
    catch (error) {
        setResponseStatus(event, 400);
        return error.message
    }

})