<template>
  <div>
    <h3>BabylonExamples</h3>
    <canvas ref="canvas"></canvas>
    <div id="dialogueBox">
      This is a dialogue box
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { FirstPersonController } from '@/BabylonExamples/FirstPersonController';
import { MainMenu } from '@/BabylonExamples/MainMenu';

export default defineComponent({
  name: 'BabylonExamples',
  mounted() {
    const canvas = this.$refs.canvas as HTMLCanvasElement;
    //new FirstPersonController(canvas);
    const mainMenu = new MainMenu(canvas);
  }
});
</script>

<style scoped>
canvas {
  width: 1280px;
  height: 720px;
  position: relative; 
}

#dialogueBox {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 10px;
}
</style>

