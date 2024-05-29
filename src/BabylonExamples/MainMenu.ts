import { FirstPersonController } from "./FirstPersonController";

// Main menu class definition
export class MainMenu {
    private canvas: HTMLCanvasElement;
    private startButton!: HTMLButtonElement;
  
    constructor(canvas: HTMLCanvasElement) {
      this.canvas = canvas;
      this.createUI();
      this.setBackground();
    }
  
    private createUI() {
      const startButton = document.createElement('button');
      startButton.innerText = 'Start Game';
      startButton.style.position = 'absolute';
      startButton.style.top = '50%';
      startButton.style.left = '50%';
      startButton.style.transform = 'translate(-50%, -50%)';
      startButton.style.padding = '10px 20px';
      startButton.style.fontSize = '16px';
      startButton.style.backgroundColor = '#4CAF50';
      startButton.style.color = 'white';
      startButton.style.border = 'none';
      startButton.style.borderRadius = '5px';
      startButton.style.cursor = 'pointer';
      
      startButton.addEventListener('click', () => {
        this.startGame();
      });
  
      // Append the start button to the document body or any desired container
      document.body.appendChild(startButton);
  
      this.startButton = startButton;
    }
  
    private setBackground() {
      document.body.style.backgroundImage = 'url("textures/asphalt/asphalt_diff.jpg")';
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.height = '100vh'; // Ensures the background covers the entire viewport
      document.body.style.margin = '0';
    }
  
    private startGame() {
      // Remove the start button
      this.startButton.remove();
      // Initialize FirstPersonController
      new FirstPersonController(this.canvas);
    }
}
