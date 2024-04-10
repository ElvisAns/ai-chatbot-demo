import { Ai } from '@cloudflare/ai'
import { Hono } from "hono"
const app = new Hono()

app.get('/', async (c) => {
	const ai = new Ai(c.env.AI);

	const question = c.req.query('question');

	if (!question) {
		return c.text("Missing question", 400);
	}

	const embeddings = await ai.run('@cf/baai/bge-base-en-v1.5', { text: question })
	const vectors = embeddings.data[0]

	const SIMILARITY_CUTOFF = 0.70
	const vectorQuery = await c.env.VECTOR_INDEX.query(vectors, { topK: 1 });
	const vecIds = vectorQuery.matches
		.filter(vec => vec.score > SIMILARITY_CUTOFF)
		.map(vec => vec.id)

	let answers = []
	if (vecIds.length) {
		const query = `SELECT * FROM QA_repository WHERE id IN (${vecIds.join(", ")})` //ensure the question still exist
		const { results } = await c.env.DB.prepare(query).bind().all()
		if (results) answers = results.map(vec => vec.answer)
	}
	const contextMessage = answers.length
		? `Context:\n${answers.map(answer => `- ${answer}`).join("\n")}`
		: ""

	const systemPrompt2 = `You are my virtual assitant.Your name is Ansima's bot! When answering the question or responding, always use the context provided, if it is provided and relevant. If context don't match, say you are still learning and don't answer at all. Try to mimic human written text as much as you can.`

	const systemPrompt = `You are Ansima's virtual assitant.Your name is Ansima's bot! When answering the question or responding, always use the context provided, if it is provided and relevant. If context don't match, say you are still learning and don't answer at all. Try to mimic human written text as much as you can.`

	const { response: answer } = await ai.run(
		'@cf/meta/llama-2-7b-chat-int8',
		{
			messages: [
				...(answers.length ? [{ role: 'system', content: contextMessage }] : []),
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: question }
			]
		}
	)

	return c.text(answer);
})

app.get("/qas", async (c) => {
	const { results } = await c.env.DB.prepare("SELECT * FROM QA_repository").run();
	return c.json(JSON.stringify(results));
})

app.delete("/qas/:id", async (c) => {
	const id = c.req.param('id');
	if (!id) {
		return c.text("Missing id parameter", 400);
	}

	const { success } = await c.env.DB.prepare(`DELETE FROM QA_repository WHERE id = ?`)
		.bind(id).run()

	if (!success) {
		return c.text("Something went wrong", 500)
	}
	return c.text("deleted", 200)
})

app.put("/qas/:id", async (c) => {
	const id = c.req.param('id');
	if (!id) {
		return c.text("Missing id parameter", 400);
	}
	const ai = new Ai(c.env.AI)
	const { answer, question } = await c.req.json();

	if (!answer) {
		return c.json("Missing answer", 400);
	}

	const { success } = await c.env.DB.prepare(`UPDATE QA_repository SET answer = ? WHERE id = ?`)
		.bind(answer, id).run()

	if (!success) {
		return c.text("Something went wrong", 500)
	}

	const { data } = await ai.run('@cf/baai/bge-base-en-v1.5', { text: [question] })
	const values = data[0]

	if (!values) {
		return c.text("Failed to generate vector embedding", 500);
	}

	const inserted = await c.env.VECTOR_INDEX.upsert([
		{
			id: id.toString(),
			values,
		}
	])

	return c.text("updated", 201)
})

app.post('/qas', async (c) => {
	const ai = new Ai(c.env.AI)

	const { question, answer } = await c.req.json();
	if (!question || !answer) {
		return c.json("Missing question and/or answer", 400);
	}

	const { results } = await c.env.DB.prepare("INSERT INTO QA_repository (question,answer) VALUES (?,?) RETURNING *")
		.bind(question, answer)
		.run()

	const record = results.length ? results[0] : null

	if (!record) {
		return c.text("Failed to create QA entry", 500);
	}

	const { data } = await ai.run('@cf/baai/bge-base-en-v1.5', { text: [question] })
	const values = data[0]

	if (!values) {
		return c.text("Failed to generate vector embedding", 500);
	}

	const { id } = record
	const inserted = await c.env.VECTOR_INDEX.upsert([
		{
			id: id.toString(),
			values,
		}
	])

	return c.json({ id, data: [question, answer], inserted }, 200)
})

export default app