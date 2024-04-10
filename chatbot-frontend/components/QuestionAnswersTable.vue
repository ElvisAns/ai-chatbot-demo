<script setup>

const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'question', label: 'Question' },
    { key: 'answer', label: 'Answer' },
    { key: 'actions' }
];
const toast = useToast();

const { pending, data: qas } = await useLazyAsyncData('qas', () => $fetch('/api/qas', { parseResponse: JSON.parse }))

const items = (row) => [
    [
        {
            label: 'Edit',
            icon: 'i-heroicons-pencil-square-20-solid',
            click: () => {
                const { question, answer } = qas.value.find(q => q.id == row.id)
                openModal({ title: 'Edit QA', id: row.id, question, answer })
            }
        },
    ],
    [
        {
            label: 'Delete',
            icon: 'i-heroicons-trash-20-solid',
            click: async () => {
                pending.value = true;
                try {
                    await $fetch(`/api/qas/${row.id}`, { method: "DELETE" });
                    qas.value = qas.value.filter(q => q.id !== row.id);
                    setTimeout(() => {
                        pending.value = false;
                    }, 1000);
                }
                catch (error) {
                    toast.add({ title: "Failed to delete question, try again" })
                    setTimeout(() => {
                        pending.value = false;
                    }, 1000);
                }
            }
        }
    ]
];
const showModal = ref(false);
const modalTitle = ref("");
const currentModalProps = ref({ question: null, answer: null, id: null })
const openModal = (props) => {
    showModal.value = true;
    currentModalProps.value = { ...currentModalProps.value, ...props };
}

const saveModal = async () => {
    pending.value = true;
    if (currentModalProps.value.id) {
        const { id, answer, question } = currentModalProps.value;
        try {
            await $fetch(`/api/qas/${id}`, { method: "PUT", body: { answer, question } })
            qas.value.map(q => {
                if (q.id != id) return q;
                q.answer = answer;
                return q;
            })
            showModal.value = false;
            setTimeout(() => {
                pending.value = false;
            }, 2000);
        }
        catch (error) {
            toast.add({ title: "Failed to update qa, try again" })
            setTimeout(() => {
                pending.value = false;
            }, 1000);
        }
    }
    else {
        const { answer, question } = currentModalProps.value;
        try {
            const { id } = await $fetch(`/api/qas`, { method: "POST", body: { answer, question } })
            qas.value.push({ id, question, answer })
            showModal.value = false;
            setTimeout(() => {
                pending.value = false;
            }, 2000);
        }
        catch (error) {
            toast.add({ title: "Failed to create qa, try again" })
            setTimeout(() => {
                pending.value = false;
            }, 1000);
        }
    }
}

</script>

<template>
    <div>
        <UButton label="New QA" icon="i-heroicons-plus-circle" class="float-right"
            @click="openModal({ title: 'new QA entry', id: null })" />
        <div class="clear-both">
            <UTable :loading="pending" :rows="qas" :columns="columns"
                :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'No items.' }">
                <template #actions-data="{ row }">
                    <UDropdown :items="items(row)">
                        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                    </UDropdown>
                </template>
            </UTable>
        </div>
        <UModal v-model="showModal">
            <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                    <h1 class="uppercase">{{ currentModalProps.title }}</h1>
                </template>
                <div class="space-y-4">
                    <UFormGroup label="Question">
                        <UInput color="primary" variant="outline" placeholder="Question"
                            v-model="currentModalProps.question" />
                    </UFormGroup>

                    <UFormGroup label="Answer">
                        <UTextarea color="primary" variant="outline" placeholder="Answer"
                            v-model="currentModalProps.answer" autoresize :maxrows="5" />
                    </UFormGroup>
                </div>
                <template #footer>
                    <UButton label="save" size="lg" @click="saveModal()" />
                </template>
            </UCard>
        </UModal>
    </div>
</template>
