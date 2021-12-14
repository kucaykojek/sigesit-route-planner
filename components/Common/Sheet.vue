<template>
  <div :ref="`${name}`" :class="['sheet', { 'sheet--expandable': isExpandable }]">
    <div
      v-if="isExpandable"
      :ref="`${name}Expander`"
      class="sheet__expander"
      @touchstart="handleExpandPlanner()"
    ></div>
    <slot></slot>
  </div>
</template>

<script>
import get from 'lodash/get'

export default {
  name: 'CommonSheet',
  props: {
    name: {
      type: String,
      default: 'sheet'
    },
    isExpandable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isDraggingSheet: false
    }
  },
  mounted() {
    if (this.isExpandable) {
      document.addEventListener('touchmove', this.handlePointerMove)
      document.addEventListener('touchend', this.handlePointerUp)
      document.addEventListener('touchcancel', this.handlePointerUp)
    }
  },
  beforeDestroy() {
    if (this.isExpandable) {
      document.removeEventListener('touchmove', this.handlePointerMove)
      document.removeEventListener('touchend', this.handlePointerUp)
      document.removeEventListener('touchcancel', this.handlePointerUp)
    }
  },
  methods: {
    handleExpandPlanner() {
      this.isDraggingSheet = true
    },
    handlePointerMove(e) {
      if (this.isDraggingSheet && get(e, 'touches[0]')) {
        this.handleResizeSheet(e.touches[0])
      }
    },
    handlePointerUp() {
      if (this.isDraggingSheet) {
        this.isDraggingSheet = false
      }
    },
    handleResizeSheet(e) {
      const el = Array.isArray(this.$refs[this.name])
        ? this.$refs[this.name][0]
        : this.$refs[this.name]

      if (el) {
        if (e.pageY > 70) {
          const height = (document.body.clientHeight - e.pageY) + 70
          if (height >= 240) {
            el.style.height = `${height}px`
            this.$emit('resizing', height)
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/css/_mixins';
@import '~/assets/css/_variables';

.sheet {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: $sheet-height;
  padding: calc(1.5rem + 30px) 1.5rem 1.5rem 1.5rem;
  background: #fff;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  box-shadow: 0 -1px 4px rgba($color: #000000, $alpha: .2);
  overflow: hidden;

  &__expander {
    position: absolute;
    z-index: 3;
    top: 0;
    left: 0;
    width: 100%;
    height: 30px;

    &::after {
      position: absolute;
      top: 50%;
      left: 50%;
      height: 5px;
      width: 80px;

      content: "";
      background: #eee;
      border-radius: 3px;
      cursor: pointer;

      @include prefix(transform, translate(-50%, -50%));
    }
  }

  &--expandable {
    &::before,
    &::after {
      position: absolute;
      z-index: 2;
      left: 0;
      height: 30px;
      width: 100%;
      content: "";
    }

    &::before {
      top: 20px;
      background: rgb(255,255,255);
      background: -moz-linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
      background: -webkit-linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
      background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
      filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#ffffff",endColorstr="#ffffff",GradientType=1);
    }

    &::after {
      bottom: 0;
      background: rgb(255,255,255);
      background: -moz-linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
      background: -webkit-linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
      background: linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
      filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#ffffff",endColorstr="#ffffff",GradientType=1);
    }
  }
}
</style>
