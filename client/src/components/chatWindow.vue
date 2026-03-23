<template>
  <v-slide-y-reverse-transition>
    <v-card v-if="chatStore.isChatOpen" width="350" height="450" class="chat-widget d-flex flex-column">
      <!-- Chat Header -->
      <v-toolbar color="primary" dark density="compact">
        <v-btn icon="mdi-close" variant="text" size="small" @click="chatStore.isChatOpen = false"></v-btn>
        <v-toolbar-title class="text-subtitle-1 font-weight-bold ml-2">
          {{ chatStore.activeChatFriend?.username || "Chat" }}
        </v-toolbar-title>
      </v-toolbar>

      <!-- Message List -->
      <v-card-text class="flex-grow-1 overflow-y-auto pa-3 bg-grey-lighten-4">
        <div v-for="msg in chatStore.messages" :key="msg.id || msg.timestamp">
          <!-- Flip alignment based on whether the message belongs to the active friend -->
          <div
            class="d-flex mb-3"
            :class="msg.sender_id !== chatStore.activeChatFriend?.id ? 'justify-end' : 'justify-start'"
          >
            <!-- Chat bubble -->
            <v-sheet
              :color="msg.sender_id !== chatStore.activeChatFriend?.id ? 'primary' : 'white'"
              :class="msg.sender_id !== chatStore.activeChatFriend?.id ? 'text-white' : 'text-black'"
              rounded="xl"
              class="pa-3 text-body-2 elevation-1"
              max-width="85%"
              style="word-wrap: break-word;"
            >
              {{ msg.content || msg.message }}
            </v-sheet>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Input Area -->
      <v-card-actions class="pa-2 bg-white">
        <v-text-field
          v-model="newMessage"
          variant="solo-filled"
          density="compact"
          placeholder="Type a message..."
          hide-details
          flat
          rounded="pill"
          append-inner-icon="mdi-send"
          @click:append-inner="handleSendMessage"
          @keyup.enter="handleSendMessage"
        ></v-text-field>
      </v-card-actions>
    </v-card>
  </v-slide-y-reverse-transition>
</template>

<script setup>
import { useChatStore } from "../stores/chatStore.js";
import { ref, onMounted } from "vue";

const chatStore = useChatStore();
// Renamed input variable to 'newMessage' so it doesn't conflict with loop bindings
const newMessage = ref("");

onMounted(() => {
  chatStore.initSocketListeners();
});

const handleSendMessage = () => {
  if (!newMessage.value.trim()) return;
  chatStore.sendMessage(chatStore.currentChatId, newMessage.value.trim());
  newMessage.value = "";
};
</script>

<style scoped>
/* Forces the component to float perfectly on the bottom right screen */
.chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  border-radius: 12px 12px 0 0 !important;
}

/* Hide scrollbar for a cleaner look */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
</style>
