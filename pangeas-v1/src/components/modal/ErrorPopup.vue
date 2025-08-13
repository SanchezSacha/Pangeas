<template>
  <transition name="fade-slide">
    <div v-if="visible" class="popup error-popup">
      <img src="/icons/x.svg" alt="Erreur" class="icon" />
      <span class="message">{{ message }}</span>
    </div>
  </transition>
</template>

<script>
export default {
  name: "ErrorPopup",
  props: {
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 2500
    }
  },
  data() {
    return {
      visible: false
    };
  },
  mounted() {
    this.visible = true;
    setTimeout(() => {
      this.visible = false;
      this.$emit('closed');
    }, this.duration);
  }
};
</script>

<style scoped>
.popup {
  position: fixed;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  font-weight: 500;
  max-width: 90vw;
  width: auto;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.4;
}

.error-popup {
  background-color: var(--color-error);
  color: #fff;
}

.icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.message {
  display: inline-block;
  max-width: 70vw;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
