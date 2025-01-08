<template>
    <video ref="selfVideo" autoplay playsinline controls="false" muted></video>
    <video ref="remoteVideo" autoplay playsinline controls="false" ></video>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, watchEffect } from 'vue';
    import type { User } from '~/models/userModel';
    import { useRoute,useRouter } from 'vue-router';

    const config = useRuntimeConfig();
    const selfVideo  = ref<HTMLVideoElement | null>(null);
    const remoteVideo  = ref<HTMLVideoElement | null>(null);
    const isStreaming = ref(false);
    const mediaStream = ref<MediaStream | null>();
    const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const constraints = { audio: true, video: true };
    const polite = true;

    const route = useRoute();
    const router = useRouter();
    const routerCallerID = route.params.callerID.toString();
    const routerCalleeID = route.params.calleeID.toString();

    class SignalingChannel {
        ws: WebSocket;
        constructor() {
            console.log(`${config.public.wsUrl}?CallerId=${routerCallerID}&CalleeID=${routerCalleeID}`);
            this.ws = new WebSocket(`${config.public.wsUrl}?CallerId=${routerCallerID}&CalleeID=${routerCalleeID}`);
            this.ws.onopen = () => {
                console.log('WebSocket opened');
                this.send({ type: 'join', callerID: routerCallerID, calleeID: routerCalleeID });
            };
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.onmessage(data);
            };
            this.ws.onclose = () => {
                console.log('WebSocket closed');
            };
        }
        send(message: any) {
            this.ws.send(JSON.stringify(message));
        }
        close() {
            this.ws.close();
        }
        onmessage(data: any) {}
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
        if (selfVideo.value) {
          selfVideo.value.srcObject = mediaStream.value;
        }
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
      signaler.close();
    };
    pc.ontrack = ({ track, streams }) => {
      track.onunmute = () => {
        if (remoteVideo.value != null && remoteVideo.value.srcObject != null) {
          return;
        }
        if (remoteVideo.value != null){
            remoteVideo.value.srcObject = streams[0];
        }
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
        start();
    });
    onUnmounted(() => {
        stopVideo();
    });
    
</script>