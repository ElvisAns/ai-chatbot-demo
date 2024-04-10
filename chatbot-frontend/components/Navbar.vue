<template>
    <header class="sticky bg-opacity-80 dark:bg-opacity-80 border-b border-gray-200 backdrop-blur z-[10001] justify-between flex h-16 w-full items-center px-6 md:px-20 bg-fuchsia-blue-500 dark:bg-gray-500 top-0">
        <NuxtLink to="/" class="flex justify-center items-center space-x-3 rtl:space-x-reverse">
            Home
        </NuxtLink>
        <NuxtLink to="/questions-answers" class="flex justify-center items-center space-x-3 rtl:space-x-reverse">
            Questions & Answers
        </NuxtLink>
        <NuxtLink to="/chat" class="flex justify-center items-center space-x-3 rtl:space-x-reverse">
            Chatbot
        </NuxtLink>
    </header>
</template>