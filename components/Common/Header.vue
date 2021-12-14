<template>
  <header>
    <a class="header__nav" @click="header.nav.action">
      <i :class="header.nav.icon"></i>
    </a>
    <div class="header__title">
      {{ header.title }}
    </div>
  </header>
</template>

<script>
export default {
  name: 'CommonHeader',
  computed: {
    header() {
      return this.$store.state.header
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/_variables';

header {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  height: $header-height;
  background: #fff;
  box-shadow: 0 1px 4px rgba($color: #000000, $alpha: .2);
  display: flex;
  align-items: center;
  padding: 0 .5rem;

  .header {
    &__nav {
      display: flex;
      width: 40px;
      height: 40px;
      flex-basis: 40px;
      flex-shrink: 0;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    &__title {
      padding-top: .25rem;
      padding-left: .75rem;
      font-size: 1.25rem;
      letter-spacing: 1px;
    }
  }
}
</style>
