<template>
  <transition name="fade-slide">
    <div v-if="visible" class="popup">
      <img src="/icons/check.svg" alt="Succès" class="icon" />
      <span class="message">{{ message }}</span>
    </div>
  </transition>
</template>

<script>
export default {
  name: "SuccessPopup",
  props: {
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 1500
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
  left: 38%;
  background-color: #1b5e20;
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  font-weight: 500;
  max-width: 90vw;
}

.icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
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
