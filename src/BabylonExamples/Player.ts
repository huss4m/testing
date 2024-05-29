import { FreeCamera, Vector3, Animation, Scene, Sound } from "@babylonjs/core";
import { TextBlock } from "@babylonjs/gui";
import { FirstPersonController } from "./FirstPersonController";

export class Player {


    health: number;
    healthView!: TextBlock;
    position!: Vector3;
    maxHealth: number;
    stamina: number;
    maxStamina: number;

    camera: FreeCamera;
    scene: Scene;


    score: number;

    hasDot: boolean;

    jumpingPower: number;


    staminaRegenRate: number;
    staminaDecayRate: number;


    sprintSpeed: number;
    walkSpeed: number;
    firstPersonController: FirstPersonController;


    isDecaying!: boolean;
    isRegenerating!: boolean;

    decayInterval!: number;
    regenInterval!: number;


    outOfBreath: Sound;

    constructor(camera: FreeCamera, scene: Scene, firstPersonController: FirstPersonController) {

        this.health = 100;
        this.maxHealth = 100;
        this.stamina = 100;
        this.maxStamina = 100;
        this.camera = camera;
        this.scene = scene;
        this.firstPersonController = firstPersonController;

        this.hasDot = false;
        this.score = 0;

        this.jumpingPower = 5;

        this.staminaRegenRate= 5;
        this.staminaDecayRate = 10;

        this.sprintSpeed = 3;
        this.walkSpeed = 1.5;


        this.outOfBreath = new Sound(
            "firstAidPickup",
            "./audio/player/outofbreath.mp3",
            this.scene,
            null,
            {
                //spatialSound:true,
                volume: 1,
                autoplay:false
            });
    }


    updatePosition(camera: FreeCamera) {
        this.position = camera.position
    }

    screenJerk(duration = 100, intensity = 5) {
         // Create glow overlay element
        const glowOverlay = document.createElement('div');
        glowOverlay.id = 'glow-overlay';
        document.body.appendChild(glowOverlay);

        // Remove the glow overlay after the specified duration
        setTimeout(() => {
            document.body.removeChild(glowOverlay);
        }, duration);
    }
    
    isDead(): boolean {
        return this.health <= 0;
    }



    applyDot(damage: number, duration: number) {
        // Calculate damage per second
        const damagePerSecond = damage;
    
        // Apply initial damage
        //this.health -= damagePerSecond;
    
        this.hasDot = true;
        // Create timer for the damage-over-time effect
        const dotTimer = setInterval(() => {
            // Reduce health by damage per second
            this.health = Math.max(this.health-damagePerSecond, 0);
    
            // Check if the duration has elapsed
            duration -= 1000; // Subtract 1 second (1000 milliseconds)
            if (duration <= 0) {
                // Clear the timer and stop the damage-over-time effect
                clearInterval(dotTimer);
                this.hasDot = false;
            }
        }, 1000); // Repeat every 1 second (1000 milliseconds)
    }


    applyShockwave() {

   /*      this.camera.speed = this.camera.speed * 0.5; */
   const originalWalkSpeed = this.walkSpeed;
   const originalSprintSpeed = this.sprintSpeed;
   this.walkSpeed *= 0.5;
   this.sprintSpeed *= 0.5;
   this.firstPersonController.applyShockwave();
        setTimeout(() => {
            this.walkSpeed = originalWalkSpeed;
            this.sprintSpeed = originalSprintSpeed;
            /* this.camera.speed = originalCameraSpeed; */
        }, 6000);

        this.health = Math.max(0, this.health - 20);
    }

    decayStamina() {

        this.isRegenerating = false;
        if(!this.isDecaying && !this.isRegenerating) {

        clearInterval(this.regenInterval);
            // Interval for stamina decay
         this.decayInterval = setInterval(() => {
            // Reduce stamina by decay rate
            this.stamina = Math.max(0, this.stamina - this.staminaDecayRate);
            if (this.stamina === 0) {
                // Clear the interval if stamina reaches zero
                this.outOfBreath.play();
                clearInterval(this.decayInterval);
            }
        }, 1000); // Decay every second (1000 milliseconds)
    
        this.isDecaying = true;

    }
    }
    

    regenStamina() {

        this.isDecaying = false;
        if(!this.isRegenerating && !this.isDecaying) {
        clearInterval(this.decayInterval);
        // Interval for stamina regeneration
         this.regenInterval = setInterval(() => {
            // Increase stamina by regen rate, capped at maxStamina
            this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegenRate);
            if (this.stamina === this.maxStamina) {
                // Clear the interval if stamina reaches max
                clearInterval(this.regenInterval);
            }
        }, 1000); // Regen every second (1000 milliseconds)
    
        this.isRegenerating = true;
    }
    }
}