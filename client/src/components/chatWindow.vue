<template>
  <v-slide-y-reverse-transition>
    <v-card
      v-if="chatStore.isChatOpen"
      width="350"
      height="450"
      class="chat-widget d-flex flex-column"
    >
      <!-- Chat Header -->
      <v-toolbar color="primary" dark density="compact">
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="chatStore.isChatOpen = false"
        ></v-btn>
        <v-toolbar-title class="text-subtitle-1 font-weight-bold ml-2">
          {{ chatStore.activeChatFriend?.username || "Chat" }}
        </v-toolbar-title>
      </v-toolbar>

      <!-- Message List -->
      <v-card-text
        ref="messagesContainer"
        class="flex-grow-1 overflow-y-auto pa-4 bg-surface"
      >
        <div
          v-for="(msg, index) in chatStore.messages"
          :key="msg.id || msg.timestamp"
        >
          <div
            v-if="showDateSeparator(index)"
            class="text-center text-caption text-grey mt-6 mb-3"
          >
            {{ formatDate(msg.timestamp || msg.sent_at) }}
          </div>

          <!-- Flip alignment based on whether the message belongs to the active friend -->
          <div
            class="d-flex align-end"
            :class="isMessageMine(msg) ? 'flex-row-reverse' : 'flex-row'"
          >
            <!-- Chat bubble -->
            <v-sheet
              :color="isMessageMine(msg) ? 'primary' : 'surface-variant'"
              :class="[
                {
                  'mt-1':
                    index > 0 &&
                    msg.sender_id === chatStore.messages[index - 1].sender_id,
                  'mt-3':
                    index === 0 ||
                    msg.sender_id !== chatStore.messages[index - 1].sender_id,
                },
              ]"
              rounded="lg"
              class="pa-2 text-body-2 elevation-1"
              max-width="85%"
              style="word-wrap: break-word"
            >
              {{ msg.content || msg.message }}
            </v-sheet>

            <!-- Timestamp -->
            <span
              class="text-grey mx-2 mb-1"
              style="font-size: 0.65rem; white-space: nowrap"
            >
              {{ formatTime(msg.timestamp || msg.sent_at) }}
            </span>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Input Area -->
      <v-card-actions class="pa-2 bg-surface">
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
import { ref, onMounted, watch, nextTick } from "vue";
import { useTheme } from "vuetify";

const theme = useTheme();
const scrollbarColor = theme.global.current.value.colors.surfaceVariant;

const chatStore = useChatStore();
// Renamed input variable to 'newMessage' so it doesn't conflict with loop bindings
const newMessage = ref("");
const messagesContainer = ref(null);

onMounted(() => {
  chatStore.initSocketListeners();
});

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    const el = messagesContainer.value.$el || messagesContainer.value;
    if (el) el.scrollTop = el.scrollHeight;
  }
};

const isMessageMine = (msg) => {
  return msg.sender_id !== chatStore.activeChatFriend?.id;
};

const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const handleSendMessage = () => {
  if (!newMessage.value.trim()) return;
  chatStore.sendMessage(chatStore.currentChatId, newMessage.value.trim());
  newMessage.value = "";
};

// Trigger 1: A new message object was added to the chatStore.messages array
watch(
  () => chatStore.messages,
  () => {
    scrollToBottom();
  },
  { deep: true, immediate: true },
);

// Trigger 2: The active chat friend changed, which means we need to scroll to the bottom
watch(
  () => chatStore.isChatOpen,
  (isOpen) => {
    if (isOpen) {
      scrollToBottom();
    }
  },
);

const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const showDateSeparator = (index) => {
  if (index === 0) return true;

  const currentMsgObj = chatStore.messages[index];
  const prevMsgObj = chatStore.messages[index - 1];

  const currentDate = formatDate(
    currentMsgObj.timestamp || currentMsgObj.sent_at,
  );
  const prevDate = formatDate(prevMsgObj.timestamp || prevMsgObj.sent_at);

  return currentDate !== prevDate;
};
</script>

<style scoped>
/* Forces the component to float perfectly on the bottom right screen */
.chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  border-radius: 12px !important;
}

/* Hide scrollbar for a cleaner look */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: v-bind(scrollbarColor);
  border-radius: 12px;
}
</style>
