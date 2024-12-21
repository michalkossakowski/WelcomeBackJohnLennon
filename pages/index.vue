<template>

    <div class="cardBox">
        <router-link to="/profile" class="card">
            <UCard>
                <template #header>
                    <UIcon name="i-heroicons-user-circle" class="icon" />
                </template>
                My Profile
            </UCard>
        </router-link>

        <router-link to="/friends" class="card">
            <UCard class="card">
                <template #header>
                    <UIcon name="i-heroicons-user-group" class="icon" />
                </template>
                Friends
            </UCard>
        </router-link>

        <router-link to="/chats" class="card">
            <UCard class="card">
                <template #header>
                    <UIcon name="i-heroicons-envelope" class="icon" />
                </template>
                Private Messages
            </UCard>
        </router-link>

        <router-link to="/servers" class="card">
            <UCard class="card">
                <template #header>
                    <UIcon name="i-heroicons-server-stack" class="icon" />
                </template>
                Servers
            </UCard>
        </router-link>

        <router-link to="/help" class="card">
            <UCard class="card">
                <template #header>
                    <UIcon name="i-heroicons-question-mark-circle" class="icon" />
                </template>
                Help
            </UCard>
        </router-link>
    </div>


</template>
  


<style scoped>

.icon {
    width: 200px;
    height: 200px;
}

.cardBox {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    text-align: center;
    gap: 50px;
    flex-wrap: wrap;
}


.card:hover{
    color: #4ade80;
    border-color: rgb(222, 1, 1);
    cursor: pointer;
}

</style>