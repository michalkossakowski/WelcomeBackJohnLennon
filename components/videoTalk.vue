<template>
  <div class="flex flex-col items-center justify-center space-y-4">
    <div id="video-container" class="grid grid-cols-2 gap-4">
      <video ref="selfVideo" autoplay playsinline class="w-full h-auto border border-gray-300 rounded"></video>
      <video ref="remoteVideo" autoplay playsinline class="w-full h-auto border border-gray-300 rounded"></video>
    </div>
    <div class="flex space-x-4">
      <UButton @click="start" v-if="!isStreaming">Start Video</UButton>
      <UButton @click="stop" v-if="isStreaming">Stop Video</UButton>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  setup() {
    const selfVideo = ref<HTMLVideoElement | null>(null);
    const remoteVideo = ref<HTMLVideoElement | null>(null);
    const isStreaming = ref(false);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    const ws = new WebSocket('ws://localhost:3000/ws'); // WebSocket do serwera sygnalizacyjnego
    const localStream = ref<MediaStream | null>(null);

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(message));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }));
      }

      if (message.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(message));
      }

      if (message.type === 'candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(
          JSON.stringify({ type: 'candidate', candidate: event.candidate })
        );
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideo.value && event.streams[0]) {
        remoteVideo.value.srcObject = event.streams[0];
      }
    };

    const start = async () => {
      const constraints = { video: true, audio: true };
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        selfVideo.value!.srcObject = stream;
        localStream.value = stream;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        isStreaming.value = true;

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: 'offer', sdp: offer.sdp }));
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    const stop = () => {
      localStream.value?.getTracks().forEach((track) => track.stop());
      localStream.value = null;
      selfVideo.value!.srcObject = null;
      isStreaming.value = false;
    };

    onUnmounted(() => {
      stop();
      pc.close();
      ws.close();
    });

    return {
      selfVideo,
      remoteVideo,
      start,
      stop,
      isStreaming,
    };
  },
});
</script>

<style scoped>
#video-container {
  max-width: 800px;
}
</style>
