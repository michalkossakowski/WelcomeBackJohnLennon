<template>
    <div>
        <h1>Channles</h1>
        <pre>{{ data }}</pre>
    </div>
</template>

<script setup lang="ts">
    const { data } = await useFetch('/api/channels/get')
</script>