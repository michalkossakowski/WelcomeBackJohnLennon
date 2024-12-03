<template>
    <div id="availableCameras"></div>
    <UButton @click="startVideo" v-if="!isStreaming">StartVideo</UButton>
    <UButton @click="stopVideo" v-if="isStreaming">Stop Video</UButton>
    <UButton @click="startRTCConnection" v-if="isStreaming">Start RTC</UButton>
    <video ref="localVideo" autoplay playsinline controls="false" ></video>
</template>
<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  setup() {
    const videoCameras = ref([]);
    const localVideo = ref(null);
    const remoteVideo = ref(null);
    const mediaStream = ref(null);
    const peerConnection = ref(null);
    const isStreaming = ref(false);
    const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

    const getConnectedDevices = async (type) => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === type);
    };

    const loadCameras = async () => {
      videoCameras.value = await getConnectedDevices('videoinput');
      console.log('Cameras found:', videoCameras.value);
    };

    const startVideo = async () => {
      try {
        console.log('Starting video');
        const constraints = { video: true, audio: true };
        mediaStream.value = await navigator.mediaDevices.getUserMedia(constraints);
        if (localVideo.value) {
          localVideo.value.srcObject = mediaStream.value;
          isStreaming.value = true;
        }
      } catch (error) {
        console.error('Error opening video camera.', error);
      }
    };
    const stopVideo = () => {
      if (mediaStream.value) {
        // Zatrzymujemy wszystkie ścieżki w strumieniu
        mediaStream.value.getTracks().forEach(track => track.stop());
        mediaStream.value = null;
        isStreaming.value = false;
        console.log('Video stopped');
      }
    };
    const startRTCConnection = async () => {
      try {
        console.log('Starting RTC connection');
        peerConnection.value = new RTCPeerConnection(rtcConfig);

        // Dodaj lokalny strumień do PeerConnection
        mediaStream.value.getTracks().forEach(track => {
          peerConnection.value.addTrack(track, mediaStream.value);
        });

        // Odbieranie strumienia zdalnego
        peerConnection.value.ontrack = (event) => {
          console.log('Remote stream received');
          if (remoteVideo.value) {
            remoteVideo.value.srcObject = event.streams[0];
          }
        };

        // Obsługa ICE candidate
        peerConnection.value.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('New ICE candidate:', event.candidate);
            // W realnej aplikacji należy wysłać candidate do drugiego użytkownika
          }
        };

        // Stworzenie oferty
        const offer = await peerConnection.value.createOffer();
        await peerConnection.value.setLocalDescription(offer);
        console.log('Offer created and set as local description:', offer);

        // W realnej aplikacji wyślij ofertę do drugiego użytkownika
      } catch (error) {
        console.error('Error starting RTC connection:', error);
      }
    };

    onMounted(() => {
      loadCameras();
    });
    onUnmounted(() => {
        stopVideo();
    });

    return {
        videoCameras,
        localVideo,
        remoteVideo,
        startVideo,
        stopVideo,
        startRTCConnection,
        isStreaming,
    };
  },
};
</script>