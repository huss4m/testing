import { AdvancedDynamicTexture, Button, Control, Rectangle, TextBlock } from "@babylonjs/gui";
import { Player } from "./Player";
import { Weapon } from "./Weapon";
import { Level } from "./Level";

export class UI {


    ammoTextBlock!: TextBlock;
    healthBlock!: TextBlock;
    staminaBlock!: TextBlock;
    player: Player;
    weapon: Weapon;
    healthBar!: Rectangle;
    staminaBar!: Rectangle;

    inventory!: Weapon[];
    currentWeaponIndex!: number;

    coordinatesBlock!: TextBlock;
    scoreBlock!: TextBlock;

    level: Level;

    waveBlock!: TextBlock;
    waveTimeBlock!: TextBlock;

    deathScreen!: Rectangle;
    restartButton!:Button;

    showDeathScreen: boolean;

    constructor(player: Player, weapon: Weapon, inventory: Weapon[], currentWeaponIndex: number, level: Level) {
        this.player = player;
        this.weapon = weapon;
        
        this.inventory = inventory;
        this.currentWeaponIndex = currentWeaponIndex;
       
        this.showDeathScreen = false;

        this.level = level;

        this.loadText();
    }

    loadText(): void {
        // Create a GUI texture
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    
        // Create container for ammo text
        const ammoContainer = new Rectangle();
        ammoContainer.width = "200px";
        ammoContainer.height = "100px";
        ammoContainer.background = "rgba(0, 0, 0, 0.45)"; // Semi-transparent black background
        ammoContainer.cornerRadius = 20; // Rounded corners
        ammoContainer.thickness = 2; // Border thickness
        ammoContainer.color = "white"; // Border color
        ammoContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        ammoContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        ammoContainer.top = "550px";
        ammoContainer.left = "220px";
    
     /*    // Add box shadow effect
        ammoContainer.shadowBlur = 20; // Blur radius
        ammoContainer.shadowOffsetX = 10; // Offset along X axis
        ammoContainer.shadowOffsetY = 10; // Offset along Y axis
        ammoContainer.shadowColor = "#000000"; // Shadow color
     */
        advancedTexture.addControl(ammoContainer);
    
        // Create a text block for ammo
        this.ammoTextBlock = new TextBlock();
        this.ammoTextBlock.color = "rgb(0, 255, 0)";
        this.ammoTextBlock.fontFamily = "Consolas";
        this.ammoTextBlock.fontWeight = "bold";
        this.ammoTextBlock.fontSize = 36; // Decreased font size for better fit
        ammoContainer.addControl(this.ammoTextBlock);
    
        this.updateAmmoText();
    
        // Create container for player health text
        const healthContainer = new Rectangle();
        healthContainer.width = "200px";
        healthContainer.height = "100px";
        healthContainer.background = "rgba(0, 0, 0, 0.45)";
        healthContainer.cornerRadius = 20;
        healthContainer.thickness = 2;
        healthContainer.color = "white";
        healthContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        healthContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        healthContainer.top = "550px";
        healthContainer.left = "10px";
    
      /*   // Add box shadow effect
        healthContainer.shadowBlur = 10; // Blur radius
        healthContainer.shadowOffsetX = 5; // Offset along X axis
        healthContainer.shadowOffsetY = 5; // Offset along Y axis
        healthContainer.shadowColor = "#000000"; // Shadow color */
    
        advancedTexture.addControl(healthContainer);
    
        // Create a text block for player health
        this.healthBlock = new TextBlock();
        this.healthBlock.color = "rgb(0, 255, 0)";
        this.healthBlock.fontFamily = "Consolas";
        this.healthBlock.fontWeight = "bold";
        this.healthBlock.fontSize = 36; // Decreased font size for better fit
      
        healthContainer.addControl(this.healthBlock);



     /* // Create a progress bar for player health
     this.healthBar = new Rectangle();
     this.healthBar.width = "290px";
     this.healthBar.height = "20px";
     this.healthBar.cornerRadius = 20;
     this.healthBar.background = this.healthBlock.color; // Red color for the bar
     this.healthBar.thickness = 1;
     this.healthBar.color = "darkgreen";
     this.healthBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
     this.healthBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
     this.healthBar.top = "70px";
     this.healthBar.left = "10px";
 
     // Add box shadow effect
     this.healthBar.shadowBlur = 5; // Blur radius
     this.healthBar.shadowOffsetX = 2; // Offset along X axis
     this.healthBar.shadowOffsetY = 2; // Offset along Y axis
     this.healthBar.shadowColor = "#000000"; // Shadow color
 
     advancedTexture.addControl(this.healthBar); */
 
        this.updatePlayerHP();




        // Create a container for stamina text
        const staminaContainer = new Rectangle();
        staminaContainer.width = "200px";
        staminaContainer.height = "100px";
        staminaContainer.background = "rgba(0, 0, 0, 0.45)"; // Semi-transparent black background
        staminaContainer.cornerRadius = 20; // Rounded corners
        staminaContainer.thickness = 2; // Border thickness
        staminaContainer.color = "white"; // Border color
        staminaContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        staminaContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        staminaContainer.top = "450px";
        staminaContainer.left = "10px";
    
     /*    // Add box shadow effect
        staminaContainer.shadowBlur = 10; // Blur radius
        staminaContainer.shadowOffsetX = 5; // Offset along X axis
        staminaContainer.shadowOffsetY = 5; // Offset along Y axis
        staminaContainer.shadowColor = "#000000"; // Shadow color */
    
        advancedTexture.addControl(staminaContainer);


        /* // Create a stamina progress bar
        this.staminaBar = new Rectangle();
        this.staminaBar.width = "290px"; // Initially full width
        this.staminaBar.height = "20px";
        this.staminaBar.cornerRadius = 20;
        this.staminaBar.thickness = 1;
        this.staminaBar.background = "cyan"; // Cyan color
        this.staminaBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.staminaBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.staminaBar.top = "140px";
        this.staminaBar.left = "10px";

                // Add box shadow effect
        this.staminaBar.shadowBlur = 5; // Blur radius
        this.staminaBar.shadowOffsetX = 2; // Offset along X axis
        this.staminaBar.shadowOffsetY = 2; // Offset along Y axis
        this.staminaBar.shadowColor = "#000000"; // Shadow color
        
        advancedTexture.addControl(this.staminaBar); */
     
        // Create a text block for stamina
        this.staminaBlock = new TextBlock();
        this.staminaBlock.color = "cyan";
        this.staminaBlock.fontFamily = "Consolas";
        this.staminaBlock.fontWeight = "bold";
        this.staminaBlock.fontSize = 36; // Decreased font size for better fit
        staminaContainer.addControl(this.staminaBlock);
    
        this.updateStaminaText();




                // Create a text block for player coordinates
       /*  this.coordinatesBlock = new TextBlock();
        this.coordinatesBlock.color = "white";
        this.coordinatesBlock.fontFamily = "Consolas";
        this.coordinatesBlock.fontWeight = "bold";
        this.coordinatesBlock.fontSize = 18; // Adjust font size as needed
        this.coordinatesBlock.text = "(x, y, z): "; // Initial text
        this.coordinatesBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.coordinatesBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.coordinatesBlock.top = "20px";
        this.coordinatesBlock.left = "650px";

        advancedTexture.addControl(this.coordinatesBlock); */

        // Assuming you have access to the player's coordinates, update the text accordingly
        //this.updatePlayerCoordinates();




                // Create a text block for player coordinates
        this.scoreBlock = new TextBlock();
        this.scoreBlock.color = "white";
        this.scoreBlock.fontFamily = "Consolas";
        this.scoreBlock.fontWeight = "bold";
        this.scoreBlock.fontSize = 18; // Adjust font size as needed
        this.scoreBlock.text = "Score: "; // Initial text
        this.scoreBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.scoreBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.scoreBlock.top = "80px";
        this.scoreBlock.left = "650px";

        advancedTexture.addControl(this.scoreBlock);


        this.waveBlock = new TextBlock();
        this.waveBlock.color = "white";
        this.waveBlock.fontFamily = "Consolas";
        this.waveBlock.fontWeight = "bold";
        this.waveBlock.fontSize = 18; // Adjust font size as needed
        this.waveBlock.text = "Wave: "; // Initial text
        this.waveBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.waveBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.waveBlock.top = "50px";
        this.waveBlock.left = "650px";

        advancedTexture.addControl(this.waveBlock);

        

        this.waveTimeBlock = new TextBlock();
        this.waveTimeBlock.color = "white";
        this.waveTimeBlock.fontFamily = "Consolas";
        this.waveTimeBlock.fontWeight = "bold";
        this.waveTimeBlock.fontSize = 18; // Adjust font size as needed
        this.waveTimeBlock.text = "Time left until next wave: "; // Initial text
        this.waveTimeBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.waveTimeBlock.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.waveTimeBlock.top = "95px";
        this.waveTimeBlock.left = "650px";

        advancedTexture.addControl(this.waveTimeBlock);
    }
    


    updateAmmoText(): void {
        // Update the ammo count displayed in the TextBlock
        this.ammoTextBlock.text = this.weapon.ammo.toString()+" | "+this.weapon.reloadAmmo.toString();
        //this.ammoTextBlock.text = this.inventory[this.currentWeaponIndex].ammo.toString()+" | "+this.inventory[this.currentWeaponIndex].reloadAmmo.toString();
    }

 
    updateHealthBar(healthBar: Rectangle): void {
        const healthPercentage = this.player.health / this.player.maxHealth;
        healthBar.width = `${healthPercentage * 290}px`; // Adjust the width of the health bar
        healthBar.background = this.healthBlock.color;
    }

    updatePlayerHP(): void {
        const health = this.player.health;
        this.healthBlock.text = health.toString();
    
        // Calculate color based on health value
        let color = "";
        if (health > 50) {
            // Red to yellow gradient
            const red = Math.floor(255 - (health - 50) * 5.1); // Linear interpolation from 255 to 0
            const green = 255;
            color = `rgb(${red},${green},0)`;
        } else {
            // Yellow to green gradient
            const green = Math.floor((health * 5.1));
            const red = 255;
            color = `rgb(${red},${green},0)`;
        }
    
        // Update the color of the health block
        this.healthBlock.color = color;
        //this.updateHealthBar(this.healthBar);
    }


    updateStaminaText(): void {
        // Update the stamina count displayed in the TextBlock
        this.staminaBlock.text = this.player.stamina.toString();

      /*   const staminaPercentage = this.player.stamina / this.player.maxStamina;
        this.staminaBar.width = `${staminaPercentage * 290}px`; // Adjust width according to stamina level */

    }
    

    // Function to update player coordinates text
/* updatePlayerCoordinates() {



    const playerX = 0;
    const playerY =0;
    const playerZ = 0;

    

    // Assuming you have access to the player's current coordinates as variables: playerX, playerY, playerZ
    this.coordinatesBlock.text = `(x: ${this.player.position.x.toFixed(2)}, y: ${this.player.position.y.toFixed(2)}, z: ${this.player.position.z.toFixed(2)})`;
    
} */


updatePlayerScore() {
    this.scoreBlock.text = `Score: ${this.player.score}`;
}


updateWaveNumber() {
    this.waveBlock.text = `Wave: ${this.level.waveNumber}`;
}


updateWaveTimer() {
    this.waveTimeBlock.text = `Time left before next wave: ${this.level.nextWaveTime} seconds.`;
}



createDeathScreen(): void {
    if(!this.showDeathScreen) {
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Create a full-screen rectangle with translucent red background
    this.deathScreen = new Rectangle();
    this.deathScreen.width = "100%";
    this.deathScreen.height = "100%";
    this.deathScreen.background = "rgba(255, 0, 0, 0.5)"; // Translucent red color
    this.deathScreen.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.deathScreen.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(this.deathScreen);


    // Create text block to display player's score
    const scoreText = new TextBlock();
    scoreText.text = "Score: " + this.player.score;
    scoreText.color = "white";
    scoreText.fontSize = 24;
    scoreText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    scoreText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    scoreText.top = "-50px"; // Adjust vertical position
    this.deathScreen.addControl(scoreText);




    // Create a "Restart" button
    this.restartButton = Button.CreateSimpleButton("restartButton", "Restart");
    this.restartButton.width = "200px";
    this.restartButton.height = "50px";
    this.restartButton.color = "white";
    this.restartButton.background = "black";
    this.restartButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.restartButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

    // Add functionality to restart the game
    this.restartButton.onPointerUpObservable.add(() => {
        // Remove death screen
        advancedTexture.removeControl(this.deathScreen);


        location.reload();
    
    });

    this.deathScreen.addControl(this.restartButton);
    this.showDeathScreen = true;
}
}


}