<template>
    <div
        class="flex flex-col h-[90vh] w-full max-w-3xl border border-gray-200 rounded-lg shadow-sm dark:border-gray-800">
        <div class="flex flex-col h-full">
            <div class="flex items-center p-4 gap-5 border-b dark:border-gray-800">
                <div class="flex items-center space-x-4">
                    <h2 class="text-xl font-medium">Support Bot</h2>
                </div>
                <button
                    class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                    Ask me anything
                </button>
            </div>
            <div class="flex-1 flex flex-col justify-end p-4 overflow-hidden">
                <div class="flex flex-col gap-2 max-h-full overflow-auto px-2" id="chat-container">
                    <div v-for="chat in chatHistory" class="flex flex-col gap-1"
                        :class="chat.type == 'user' ? 'items-end' : 'items-start'">
                        <div class="rounded-lg  p-4 max-w-md break-words"
                            :class="chat.type == 'user' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-200 dark:bg-slate-600'">
                            {{ chat.message }}
                        </div>
                    </div>
                    <TypingIndicator v-show="waitingAI" />
                </div>
            </div>
            <div class="flex w-full p-4 gap-5 border-t dark:border-gray-800">
                <div class="w-full">
                    <UInput color="primary" v-model="question" inputClass="w-full" size="lg" variant="outline"
                        placeholder="Ask a question..." />
                </div>
                <UButton @click="askAI()" icon="i-heroicons-paper-airplane" label="Send" siz="lg"
                    :disabled="waitingAI" />
            </div>
        </div>
    </div>
</template>

<script setup>

const waitingAI = ref(true);
const question = ref("");
const chatHistory = useState("chatHistory", () => []);

chatHistory.value = chatHistory.value || [];

const pinToBottom = () => {
    setTimeout(function () {
        const el = document.getElementById("chat-container");
        if (el) el.scrollTo({ left: 0, top: el.scrollHeight, behavior: "smooth" })
    }, 1000)
}

const askAI = async () => {
    if (waitingAI.value) return;
    if (question.value.length < 3) {
        chatHistory.value.push({
            type: "system",
            message: "Please type at least 3 characters"
        })
        pinToBottom();
        return;
    }
    chatHistory.value.push({
        type: "user",
        message: question.value
    })
    pinToBottom();
    waitingAI.value = true;
    const question_value = question.value;
    question.value = ""
    try {
        const reply = await $fetch('/api/ai', { method: "POST", body: { question: question_value } });
        chatHistory.value.push({
            type: "ai",
            message: reply
        })
        waitingAI.value = false;
        pinToBottom();
    }
    catch (error) {
        chatHistory.value.push({
            type: "ai",
            message: "Unable to connect to the chat engine, please try again!"
        })
        waitingAI.value = false;
        pinToBottom();
    }

}

onMounted(async () => {
    pinToBottom();
    waitingAI.value = true;
    if (chatHistory.value.length == 0) {
        try {
            const reply = await $fetch('/api/ai', { method: "POST", body: { question: "Hello!" } });
            chatHistory.value.push({
                type: "ai",
                message: reply
            })
            waitingAI.value = false;
        }
        catch (error) {
            chatHistory.value.push({
                type: "ai",
                message: "Unable to connect to the chat engine, please try again!"
            })

            waitingAI.value = false;
        }
    } else {
        waitingAI.value = false;
    }
})

</script>
