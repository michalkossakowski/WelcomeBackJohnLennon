<template>
    <div class="content-wrapper">
      <video ref="selfVideo" autoplay playsinline  muted class="video"></video>
      <video ref="remoteVideo" autoplay playsinline  class="video"></video>
    </div>

    <UCard class="card">
      <template #header>
        <div class="buttons">
          <button v-if="!isMuted" @click="toggleMute" title="mute" class="call-button">
            <UIcon  class="icon-call w-5 h-5" name="i-heroicons-microphone"/>
          </button>
          <button v-else @click="toggleMute" title="mute" class="call-button">
            <UIcon  class="icon-red w-5 h-5" name="i-heroicons-microphone"/>
          </button>
          <button  v-if="!isDeafened" @click="toggleDeafen" title="Deafen" class="call-button">
             <UIcon class="icon-call w-5 h-5" name="i-heroicons-speaker-x-mark"/>
          </button>
          <button  v-else @click="toggleDeafen" title="Deafen" class="call-button">
             <UIcon  class="icon-red w-5 h-5" name="i-heroicons-speaker-wave"/>
          </button>
          <button @click="stopVideo" title="Disconnect" class="call-button"> <UIcon class="icon w-5 h-5" name="i-heroicons-phone-arrow-down-left"/></button>
        </div>
      </template>
    </UCard>
    

</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import type { User } from '~/models/userModel';
    import { useRoute,useRouter } from 'vue-router';

    const config = useRuntimeConfig();
    const selfVideo  = ref<HTMLVideoElement | null>(null);
    const remoteVideo  = ref<HTMLVideoElement | null>(null);
    const isStreaming = ref(false);
    const mediaStream = ref<MediaStream | null>();
    const isMuted = ref(false);
    const isDeafened = ref(false);
    const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const constraints = { audio: true, video: true };
    let polite = true;
    const user = ref<User | null>(null);
    const toast = useToast()
    const route = useRoute();
    const router = useRouter();
    const routerCallerID = route.params.callerID.toString();
    const routerCalleeID = route.params.calleeID.toString();
    
    const fetchUser = async () => {
      try {
          const response = await $fetch('/api/users/get', { method: 'GET' });
          user.value = response.user;
          if (!user.value) {
              return;
          }
      } catch (error) {
          user.value = null;
      } finally {
          if(user.value?.id === routerCallerID){
            polite = true;
          }else{
            polite = false;
          }
      }
  };

    class SignalingChannel {
        ws: WebSocket;
        messageQueue: any[] = [];
        constructor() {
            console.log(`${config.public.wsUrl}?CallerId=${routerCallerID}&CalleeID=${routerCalleeID}`);
            this.ws = new WebSocket(`${config.public.wsUrl}?CallerId=${routerCallerID}&CalleeID=${routerCalleeID}`);
            this.ws.onopen = () => {
                console.log('WebSocket opened');
                this.messageQueue.forEach(message => this.send(message));
                this.messageQueue = [];
                this.send({ type: 'join', callerID: routerCallerID, calleeID: routerCalleeID });
            };
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'leave') {
                    router.push('/friends');
                    this.close();
                    return;
                }
                this.onmessage(data);
            };
            this.ws.onclose = () => {
                console.log('WebSocket closed');
                toast.add({ title: 'Call ended', description: 'The call has ended' });
                router.push('/friends');
            };
        }
        send(message: any) {
          if (this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(JSON.stringify(message));
          } else {
              this.messageQueue.push(message);
          }
        }
        close() {
            this.ws.close();
        }
        onmessage(data: any) {}
    }
    const signaler = new SignalingChannel();
    const pc = new RTCPeerConnection(rtcConfig);
    pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
    };
    
    const toggleMute = () => {
        if (mediaStream.value && !isDeafened.value) {
            mediaStream.value.getAudioTracks().forEach(track => {
                track.enabled = isMuted.value;
            });
            isMuted.value = !isMuted.value;
        }
    };
    const toggleDeafen = () => {

      if (remoteVideo.value) {
        remoteVideo.value.muted = !remoteVideo.value.muted; 
        isDeafened.value = !isDeafened.value;
        if (mediaStream.value) {
          mediaStream.value.getAudioTracks().forEach(track => {
              track.enabled = !isDeafened.value;
          });
          isMuted.value = isDeafened.value;
        }
      }

    };
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
      signaler.send({ type: 'leave' });
      router.push('/friends');
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
    let makingOffer = true;
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
        fetchUser();
        start();
    });
    onUnmounted(() => {
        stopVideo();
    });
    
</script>
<style scoped>
.content-wrapper {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}
.video {
    width: 50%;
    height: 50%;
    margin: 10px;
    border: 1px solid black;
}
.card {
    max-width: fit-content;
    margin-left: auto;
    margin-right: auto;
}
.buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
}
.icon-call .icon-red{
  transition: transform 0.3s ease;
  margin-left: 10px;
}
.icon-red{
  color:red;
}
.icon-call:hover{
  color:red;
  transform: translateY(-3px);
}

.call-button{
  padding-left: 5px;
  padding-right: 5px;
}
</style>