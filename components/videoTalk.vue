<template>
    <div id="availableCameras"></div>
    <UButton id="webCamButton">StartVideo</UButton>
    <video id="localVideo" autoplay playsinline controls="false"></video>
</template>
<script>
    import { nextTick  } from 'vue';
    export default {
    setup() {
        let webCamButton
        nextTick(() => {
            webCamButton = document.getElementById('webCamButton');
            webCamButton.onclick = async () => {
            try {
                console.log('Start');
                const constraints = {'video': true, 'audio': true};
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                const videoElement = document.getElementById('localVideo');
                videoElement.srcObject = stream;
            } catch(error) {
                console.error('Error opening video camera.', error);
            }
        }
        });
        
        async function getConnectedDevices(type) {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === type)
        }

        const videoCameras = getConnectedDevices('videoinput');
        console.log('Cameras found:', videoCameras);

    return {
        webCamButton,
        getConnectedDevices,
    };
  }
};
</script>