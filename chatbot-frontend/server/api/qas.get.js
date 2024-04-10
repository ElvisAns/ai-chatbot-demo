import { ofetch } from "ofetch";

export default defineEventHandler(async (event) => {
    const api_base_url = process.env.AI_API_BASE_URL;
    try {
        const res = await ofetch(`${api_base_url}/qas`);
        return res;
    }
    catch (error) {
        setResponseStatus(event, 500);
        return error.message
    }

})