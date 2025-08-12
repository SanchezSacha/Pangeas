<template>
  <nav
      class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow position-relative d-flex align-items-center justify-content-between px-3"
  >
    <button
        class="btn btn-link d-md-none rounded-circle mr-3"
        @click="$emit('toggle')"
    >
      <i class="fa fa-bars"></i>
    </button>

    <div
        class="navbar-brand text-center position-absolute w-100"
        style="left: 0; right: 0; pointer-events: none;"
    >
      <span style="pointer-events: auto;">{{ pageTitle }}</span>
    </div>

    <ul class="navbar-nav ml-auto">
      <li class="nav-item dropdown no-arrow">
        <a
            class="nav-link dropdown-toggle d-flex align-items-center"
            href="#"
            role="button"
            @click.prevent="toggleMenu"
        >
          <span class="mr-2 d-none d-lg-inline text-gray-600 small">Admin</span>
          <img
              class="img-profile rounded-circle"
              src="/logo_mobile_pangeas.png"
              alt="avatar"
              style="width:52px;height:52px"
          />
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  pageTitle: { type: String, default: "Bienvenue dans l'admin" }
});
const emit = defineEmits(['toggle']);
const menuOpen = ref(false);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}
</script>

<style scoped>
.img-profile {
  object-fit: cover;
}
</style>
