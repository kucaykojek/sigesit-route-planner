<template>
  <div class="qr-scanner-wrapper">
    <client-only>
      <qrcode-stream @decode="onDecode" @init="onInit" />
    </client-only>
  </div>
</template>

<script>
export default {
  name: 'QrScanner',
  data() {
    return {
      error: null
    }
  },
  methods: {
    onDecode(decodedString) {
      if (decodedString) {
        this.$emit('result', decodedString)
      }
    },
    async onInit(promise) {
      try {
        await promise
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          this.error = 'ERROR: you need to grant camera access permission'
        } else if (error.name === 'NotFoundError') {
          this.error = 'ERROR: no camera on this device'
        } else if (error.name === 'NotSupportedError') {
          this.error = 'ERROR: secure context required (HTTPS, localhost)'
        } else if (error.name === 'NotReadableError') {
          this.error = 'ERROR: is the camera already in use?'
        } else if (error.name === 'OverconstrainedError') {
          this.error = 'ERROR: installed cameras are not suitable'
        } else if (error.name === 'StreamApiNotSupportedError') {
          this.error = 'ERROR: Stream API is not supported in this browser'
        } else if (error.name === 'InsecureContextError') {
          this.error = 'ERROR: Camera access is only permitted in secure context. Use HTTPS or localhost rather than HTTP.'
        } else {
          this.error = `ERROR: Camera error (${error.name})`
        }
      }
    }
  }
}
</script>

<style lang="scss">
.qr-scanner-wrapper {
  position: absolute;
  z-index: 999;
  top: 0;
  left: 0;
  background: white;
  width: 100vw;
  height: 100vh;
}
</style>