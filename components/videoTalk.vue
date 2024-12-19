<template>
    <UButton @click="start" v-if="!isStreaming">StartVideo</UButton>
    <video ref="selfVideo" autoplay playsinline controls="false" muted></video>
    <video ref="remoteVideo" autoplay playsinline controls="false" ></video>
</template>
<script >
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  setup() {
    const selfVideo  = ref(null);
    const remoteVideo  = ref(null);
    const isStreaming = ref(false);
    const mediaStream = ref(null);
    const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const constraints = { audio: true, video: true };
    const polite = true;

    class SignalingChannel {
      constructor() {
        this.ws = new WebSocket('https://1rw648c8-3002.euw.devtunnels.ms');
        this.ws.onopen = () => {
          console.log('WebSocket opened');
        };
        this.send = (message) => {
          this.ws.send(JSON.stringify(message));
        };
        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.onmessage(data);
        };
        this.ws.onclose = () => {
          console.log('WebSocket closed');
        };
      }
    }

    const pc = new RTCPeerConnection(rtcConfig);
    const signaler = new SignalingChannel();
    async function start() {
      try {
        mediaStream.value = await navigator.mediaDevices.getUserMedia(constraints);

        for (const track of mediaStream.value.getTracks()) {
          pc.addTrack(track, mediaStream.value);
        }
        console.log('VideoStarted');
        selfVideo.value.srcObject = mediaStream.value;
      } catch (err) {
        console.error(err);
      }
    }
    const stopVideo = () => {
      if (mediaStream.value) {
        // Zatrzymujemy wszystkie ścieżki w strumieniu
        mediaStream.value.getTracks().forEach(track => track.stop());
        mediaStream.value = null;
        console.log('Video stopped');
      }
    };

    pc.ontrack = ({ track, streams }) => {
      track.onunmute = () => {
        if (remoteVideo.value.srcObject != null) {
          return;
        }
        remoteVideo.value.srcObject = streams[0];
      };
    };
    let makingOffer = false;

    pc.onnegotiationneeded = async () => {
      try {
        console.log('Negotiation needed');
        makingOffer = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        signaler.send({ description: pc.localDescription });
      } catch (err) {
        console.error(err);
      } finally {
        makingOffer = false;
      }
    };
    pc.onicecandidate = ({ candidate }) => signaler.send({ candidate });

    let ignoreOffer = false;

    signaler.onmessage = async ({ description, candidate }) => {
      try {
        if (description) {
          const offerCollision =
            description.type === "offer" &&
            (makingOffer || pc.signalingState !== "stable");

          ignoreOffer = !polite && offerCollision;
          if (ignoreOffer) {
            return;
          }

          await pc.setRemoteDescription(description);
          if (description.type === "offer") {
            await pc.setLocalDescription();
            signaler.send({ description: pc.localDescription });
          }
        } else if (candidate) {
          try {
            await pc.addIceCandidate(candidate);
          } catch (err) {
            if (!ignoreOffer) {
              throw err;
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    onMounted(() => {

    });
    onUnmounted(() => {
      stopVideo();
      signaler.ws.close();
    });

    return {
      selfVideo,
      remoteVideo,
      isStreaming,
      start,
      stopVideo
    };
  },
};
</script>