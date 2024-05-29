import { Scene, Engine, SceneLoader, Vector3, HemisphericLight, FreeCamera, Sound, Mesh, AbstractMesh, TransformNode, MeshBuilder, StandardMaterial, Texture, Color3, Material, Animation, Matrix, PBRMaterial, CubeTexture, Quaternion, Ray, EasingFunction, CubicEase, PhysicsImpostor, ColorGradient, Color4, Tags, CannonJSPlugin, SceneOptimizerOptions, SceneOptimizer, HardwareScalingOptimization } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock, Button, Rectangle, Control, LinearGradient } from "@babylonjs/gui";

import "@babylonjs/loaders";

import { Level } from "./Level";
import { Weapon } from "./Weapon";

import { Enemy } from "./Enemy";
import { Player } from "./Player";

import { Skull } from "./Skull";

import { AmmoPickup } from "./AmmoPickup";

import { FirstAidPickup } from "./FirstAidPickup";
import { WeaponPickups } from "./WeaponPickups";

import { UI } from "./UI";
import { Mutant } from "./Mutant";
import { Warrok } from "./Warrok";



import { M60 } from "./M60";
import { Pistol } from "./Pistol";
import { Minigun } from "./Minigun";

import { TorchPowerup } from "./TorchPowerup";

export class FirstPersonController {
    scene: Scene;
    engine: Engine;
    weapon!: Weapon;
    inventory!: Weapon[];
    currentWeaponIndex!: number;
    camera!: FreeCamera;
    level: Level;
    isJumping!: boolean;
    wantToJump!: boolean;
    isMoving!: boolean;
    //bulletHoleMaterial!: PBRMaterial;
    isSprinting: boolean;

    ui: UI;

    enemies: Enemy[];
    player: Player;

    playerBox: any;
    ground: any;

    //ammoBoxSound: Sound;
    //firstAidSound: Sound;
    outOfBreathSound: Sound;
    

    jumpSpeed: number;
    jumpHeight: number;
    jumpPeak: number;

    minigun!: Minigun;
    pistol!: Pistol;
    rifle!: Weapon;


    ammopickup: AmmoPickup;
    firstaid: FirstAidPickup;
    weaponPickups: WeaponPickups;
    lmg: M60;
    torchPowerup: TorchPowerup;

    constructor(private canvas: HTMLCanvasElement) {

        
        
      this.engine = new Engine(this.canvas, true);
      this.level = new Level(this.engine, this);
      this.scene = this.level.scene;

   /*    const optimizerOptions = new SceneOptimizerOptions(
        
    );

    optimizerOptions.addOptimization(new HardwareScalingOptimization(0,1));
    
    // Enable optimizations based on the options provided
    SceneOptimizer.OptimizeAsync(this.scene, optimizerOptions); */
    
      
       
            this.outOfBreathSound = new Sound(
                "outOfBreath",
                "./audio/player/outofbreath.mp3",
                this.scene,
                null,
                {
                    //spatialSound:true,
                    volume: 1,
                    autoplay:false
                });


                

      this.isSprinting = false;
      this.isJumping = false;
      this.isMoving = false;
      this.jumpSpeed = 0.1; // Adjust as needed
      this.jumpHeight = 2; // Adjust as needed
      this.jumpPeak = 0; // Peak height of the jump
 
      this.enemies = [];
      this.inventory = [];

      this.ammopickup = this.level.ammopickup;
      this.firstaid = this.level.firstaid;

     
      this.CreateController();
      
      this.CreateImpostors();
      this.player = new Player(this.camera, this.scene, this);
      //this.generateEnemies();

      this.level.startWaveSystem();
   


      this.minigun = new Minigun(this.scene, this.camera, this.enemies, this.player);
      this.pistol = new Pistol(this.scene, this.camera, this.enemies, this.player);
      this.rifle = new Weapon(this.scene, this.camera, this.enemies, this.player);
      this.lmg = new M60(this.scene, this.camera, this.enemies, this.player);

      this.lmg.preloadMesh();
      this.minigun.preloadMesh();
      this.rifle.preloadMesh();

      this.weapon = this.pistol;

      this.inventory.push(this.weapon);


      //this.inventory.push(this.minigun);


     /*  this.inventory.push(new Weapon(this.scene, this.camera, this.enemies));
      this.inventory.push(new Pistol(this.scene, this.camera, this.enemies));
      this.inventory.push(new Minigun(this.scene, this.camera, this.enemies)); */
      this.currentWeaponIndex = 0;


        // Preload meshes for all weapons in the inventory
        this.inventory.forEach((weapon, index) => {
            if(weapon !== this.weapon) {
                weapon.preloadMesh();
            }
        });

      
      
       

     
      this.weapon.CreateG();
      //this.weapon = weapon;
  
      //this.generateEnemies();
      console.log("Enemies array:", this.enemies);

      

     
      //this.loadBulletholes();
      this.setupInput();
      this.loadFootsteps();
  

      //this.loadText();

      this.ui = new UI(this.player, this.weapon, this.inventory, this.currentWeaponIndex, this.level);


      //this.switchWeapon(this.currentWeaponIndex);

/*         
        this.ammopickup.CreateAmmoPickup(new Vector3(95,0,-76));

        
        this.firstaid.CreateFirstAidPickup(new Vector3(100,0,-86)); */


      this.weaponPickups = this.level.weaponPickups;
    /*   this.weaponPickups.CreateMinigunPickup(new Vector3(90,0,-75));
      this.weaponPickups.CreatePistolPickup(new Vector3(100,0,-75));
      this.weaponPickups.CreateRiflePickup(new Vector3(110,0,-75));
      this.weaponPickups.CreateLMGPickup(new Vector3(120,0,-75)); */


      this.torchPowerup = new TorchPowerup(this.scene);

      this.torchPowerup.CreateTorchPowerup(new Vector3(-30, 0, 40));

      

      let isShooting = false;

this.scene.onPointerDown = (evt) => {
    if (!this.engine.isPointerLock && evt.button === 0) {
        this.engine.enterPointerlock();
        Engine.audioEngine?.unlock();
    } else if (evt.button === 0 && !this.player.isDead() && !this.weapon.isReloading) {
        if (this.weapon.toggleAutomatic) {
            isShooting = true;
            shootLoop();
        } else {
            shootOnce();
        }
    }
};

this.scene.onPointerUp = (evt) => {
    if (evt.button === 0) {
        isShooting = false;
    }
};

const shootOnce = () => {
    if (this.weapon.ammo > 0) {
        this.weapon.shoot();
        this.weapon.shootAnimation(this.weapon);
        //this.weapon.shootSound.play();
    } else {
        this.weapon.emptySound.play();
    }
};

let lastShotTime = 0;

const shootLoop = () => {
    const currentTime = performance.now(); // Obtenir le temps actuel
    if (isShooting && this.weapon.toggleAutomatic) {
        if (this.weapon.ammo > 0 && currentTime - lastShotTime >= this.weapon.fireRate) {
            shootOnce();
            lastShotTime = currentTime;
        } else if (this.weapon.ammo <= 0) {
            isShooting = false;
            this.weapon.emptySound.play();
        }
    }
    requestAnimationFrame(shootLoop);
};

// Appelle shootLoop pour la première fois
requestAnimationFrame(shootLoop);





this.scene.onDataLoadedObservable.addOnce(() => {
    
    this.camera.needMoveForGravity = true;
});

      
      // Register the before render loop
    this.scene.registerBeforeRender(() => {
        // Iterate over the array of enemies
        for (const enemy of this.enemies) {
          
            enemy.move(this.player); 
            
        }

 
       if(this.playerBox.position.y+1 > 1.56) {
        this.camera.position.y = this.playerBox.position.y+1;
       }
        this.playerBox.position.z = this.camera.position.z;
        this.playerBox.position.x = this.camera.position.x;

        

        if(this.camera.position.y <= 1.56) {
            this.isJumping = false;
        }
    });


    

      this.engine.runRenderLoop(() => {
   
        this.player.updatePosition(this.camera);

          

           
            this.ui.updateAmmoText();
            this.ui.updatePlayerHP();
            this.ui.updateStaminaText();
            this.ui.updatePlayerScore();
            this.ui.updateWaveNumber();
            this.ui.updateWaveTimer();


            if(this.player.health <= 0) {
                this.camera.position.y = 0.3;

                this.weapon.animationGroups.forEach(function (animationGroup) {
                    animationGroup.stop();
                });
                 
                this.camera.detachControl();
                this.engine.exitPointerlock();
                this.ui.createDeathScreen();
            }



            if(this.isSprinting && this.player.stamina > 0) {
                this.camera.speed = this.player.sprintSpeed;
            }
            if(!this.isSprinting || this.player.stamina <=0 ) {
                this.camera.speed = this.player.walkSpeed;
            }

        /*     if(this.player && this.player.position) {
                this.ui.updatePlayerCoordinates();
            } */
         
        this.scene.render();
        
      });
  
  
  
      
    }
  
  
  
    CreateController(): void {
      const camera = new FreeCamera("camera", new Vector3(-35, 15, 55), this.scene);
      camera.setTarget(new Vector3(0,1.5,-2));
      camera.attachControl();
      camera.applyGravity = true;
      camera.checkCollisions = true;
      camera.ellipsoid = new Vector3(1, 0.75, 1);
      camera.minZ = 0;
  
      camera.speed = 1.2;
      camera.angularSensibility = 800;
      //camera.needMoveForGravity = false;
      
      camera.keysUp.push(90);
      camera.keysDown.push(83);
      camera.keysLeft.push(81);
      camera.keysRight.push(68);
        
      camera.inertia = 0.1;

      //camera.getScene().gravity = new Vector3(0, -0.3, 0);

      /* this.scene.enablePhysics(new Vector3(0,-9.81,0), new CannonJSPlugin(true, 10, CANNON)); */

  
      this.camera = camera;

      
      //this.CreateCrosshair();
      camera.onCollide = (collidedMesh) => {
        // If the camera collides with the ammo box
        if(collidedMesh.id == 'ammoBox') {


            this.ammopickup.pickupSound.play();
            this.weapon.reloadAmmo += 60;
            this.weapon.reloadWeapon();
            collidedMesh.dispose();
            
        }

        if(collidedMesh.id == 'firstAid') {
            this.firstaid.pickupSound.play();
            this.player.health = this.player.maxHealth;
            collidedMesh.dispose();
        }

     // Assuming the WeaponPickups class is instantiated as this.weaponPickups
     if(collidedMesh.id == 'firstAid') {
        this.firstaid.pickupSound.play();
        this.player.health = this.player.maxHealth;
        collidedMesh.dispose();
    }




    if (collidedMesh.id === 'minigunPickup') {
        this.weaponPickups.pickupSound.play();
        if (!this.inventory.includes(this.minigun)) {
            this.inventory.push(this.minigun);
        } else {
            // Add 60 to reloadAmmo property if minigun is already in inventory
            this.minigun.reloadAmmo += 60;
        }
        collidedMesh.dispose();
    }
    
    if (collidedMesh.id === 'pistolPickup') {
        this.weaponPickups.pickupSound.play();
        if (!this.inventory.includes(this.pistol)) {
            this.inventory.push(this.pistol);
        } else {
            // Add 60 to reloadAmmo property if pistol is already in inventory
            this.pistol.reloadAmmo += 60;
        }
        collidedMesh.dispose();
    }
    
    if (collidedMesh.id === 'riflePickup') {
        this.weaponPickups.pickupSound.play();
        if (!this.inventory.includes(this.rifle)) {
            this.inventory.push(this.rifle);
        } else {
            // Add 60 to reloadAmmo property if rifle is already in inventory
            this.rifle.reloadAmmo += 60;
        }
        collidedMesh.dispose();
    }
    

    if (collidedMesh.id === 'lmgPickup') {
        this.weaponPickups.pickupSound.play();
        if (!this.inventory.includes(this.lmg)) {
            this.inventory.push(this.lmg);
        } else {
            // Add 60 to reloadAmmo property if rifle is already in inventory
            this.lmg.reloadAmmo += 60;
        }
        collidedMesh.dispose();
    }


    if(collidedMesh.id==='torchPowerup') {
        this.torchPowerup.pickupSound.play();

        this.rifle.damage += 4;
        this.pistol.damage += 2;
        this.minigun.damage+=6;
        this.lmg.damage += 6;

        

        if(this.player.jumpingPower < 12) {
            this.player.jumpingPower +=1;
        }

        if(this.player.staminaDecayRate > 2) {
            this.player.staminaDecayRate -= 1;
        }

        if(this.player.staminaRegenRate < 10) {
            this.player.staminaRegenRate += 1;
        }

        collidedMesh.dispose();
    }


    if(collidedMesh.id === 'medalPowerup') {
        this.torchPowerup.pickupSound.play();

        if(this.player.sprintSpeed < 7) {
            this.player.sprintSpeed += 0.25;
        }

        collidedMesh.dispose();
    }


    }





    
      
     // this.camera.position.y = this.playerBox.position.y;

      
      }
  
      

      
     
      
        











      setupInput(): void {

       // Define variables to track movement and sprinting state
//let isMoving = false;
//let isSprinting = false;

// Define a dictionary to track the state of movement keys
const pressedKeys: { [key: string]: boolean } = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    ShiftLeft: false, // Assuming left shift key for sprinting
    ShiftRight: false // Assuming right shift key for sprinting
};



         // Function to handle keydown events
         document.addEventListener('keydown', (event) => {
             if (event.code === 'KeyW' || event.code === 'KeyA' || event.code === 'KeyS' || event.code === 'KeyD') {
                
                 this.isMoving = true;
                 pressedKeys[event.code] = true;
             }

             if ((event.code === 'ShiftLeft' || event.code === 'ShiftRight') && this.isMoving) {
                
                 this.isSprinting = true;
                 if(this.player.stamina > 0) {
                     this.camera.speed = this.player.sprintSpeed;
                 }
                 else {
                     this.camera.speed = this.player.walkSpeed;
                 }
                 this.player.decayStamina();
             }


               // Handle number key presses to switch weapons
                    switch (event.code) {
                        case 'Digit1':
                            this.switchWeaponByKey(0);
                            break;
                        case 'Digit2':
                            this.switchWeaponByKey(1);
                            break;
                        case 'Digit3':
                            this.switchWeaponByKey(2);
                            break;
                        case 'Digit4':
                            this.switchWeaponByKey(3);
                            break;
                    }
         });

         // Function to handle keyup events
         document.addEventListener('keyup', (event) => {
             if (event.code === 'KeyW' || event.code === 'KeyA' || event.code === 'KeyS' || event.code === 'KeyD') {
                 
                 pressedKeys[event.code] = false;
                 if (!pressedKeys['KeyW'] && !pressedKeys['KeyA'] && !pressedKeys['KeyS'] && !pressedKeys['KeyD']) {
                     this.isMoving = false;
                 }
             }

             if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
                 
                 this.isSprinting = false;
                 this.camera.speed = this.player.walkSpeed;
                 this.player.regenStamina();
             }
         });



     window.addEventListener('keydown', (event) => {
      

         if (event.code === 'Space' && !this.isJumping) {              
                 this.jump();
                 this.isJumping = true;
         }
        
         if (event.code === 'KeyR') {
             if (this.weapon.reloadAmmo > 0 && !this.weapon.isReloading) {
                 this.weapon.reloadAnimation(this.weapon);
                 this.weapon.reloadWeapon();
                 
                 this.weapon.reloadSound.play();
             }
         }
     });

    

     //staminaRegenInterval = setInterval(regenerateStamina, 1000);


     window.addEventListener('wheel', (event) => {
         // Check if the wheel was scrolled up or down
         if (event.deltaY < 0) {
             // Scrolled up, cycle to the next weapon
             this.cycleWeapon(1);
         } else if (event.deltaY > 0) {
             // Scrolled down, cycle to the previous weapon
             this.cycleWeapon(-1);
         }
     });
 

       
    }
    
    
    jump(): void {
       

        if(!this.isJumping && !this.player.isDead()) {
            this.playerBox.physicsImpostor.applyImpulse(new Vector3(0,this.player.jumpingPower,0), this.playerBox.getAbsolutePosition());
            
        }
    }
    


    

        loadFootsteps(): void {

            const initialCameraYPosition = this.camera.position.y;

            const headbobParams = {
                amplitude: 0.01, // Amplitude du mouvement (haut/bas)
                frequency: 20, // Fréquence du mouvement (plus rapide)
                // verticalOffset: 0.0 // Pas de décalage horizontal
            };
        
            // Variables pour le headbobbing
            const headbobOffset = 0;
            let headbobTimer = 0;
        
            // Fonction pour calculer le headbobbing
            const calculateHeadbobbing = (deltaTime: number): Vector3 => {
                // Calculer le décalage vertical du headbobbing (mouvement ascendant et descendant)
                const verticalOffset = Math.sin(headbobTimer * headbobParams.frequency) * headbobParams.amplitude;
        
                // Mettre à jour le compteur de temps pour le headbobbing
                headbobTimer += deltaTime;
        
                // Retourner le décalage total du headbobbing (pas de décalage horizontal)
                return new Vector3(0, verticalOffset, 0);
            };
        
            // Fonction pour appliquer le headbobbing à la caméra
            const applyHeadbobbing = (deltaTime: number): void => {
                // Calculer le décalage du headbobbing pour cette trame
                const headbobbingOffset = calculateHeadbobbing(deltaTime);
        
                // Appliquer le décalage à la position de la caméra
                this.camera.position.addInPlace(headbobbingOffset);
            };
    
          


            const footstepsSound = new Sound(
                "footstepsSound",
                "./audio/footsteps.mp3",
                this.scene,
                null,
                {
                    volume: 1, // Volume du son
                    loop: true // Lecture en boucle
                }
            );
        
            // Fonction pour démarrer le son des pas
            const startFootsteps = () => {
                if (!footstepsSound.isPlaying) {
                    footstepsSound.play();
                }
            };
        
            // Fonction pour arrêter le son des pas
            const stopFootsteps = () => {
                if (footstepsSound.isPlaying) {
                    footstepsSound.stop();
                }
            };
        
            // Ajouter un écouteur pour le changement d'état du mouvement
            this.scene.onBeforeRenderObservable.add(() => {
                if (this.isMoving && !this.player.isDead() && !this.isJumping) {
                    startFootsteps();
                    //applyHeadbobbing(this.engine.getDeltaTime() / 1000);
                    // console.log("footstep sound started");
                } else {
                    stopFootsteps();
                   // console.log("footstep sound stopped");
                }
            });


           
        }





        loadBreathing() {
            const outOfBreath = new Sound(
                "firstAidPickup",
                "./audio/player/outofbreath.mp3",
                this.scene,
                null,
                {
                    spatialSound:true,
                    volume: 1,
                    autoplay:false
                });

                if(this.player.stamina == 0) {
                    outOfBreath.play();
                }

        }


    

        CreateImpostors(): void {

            /* const ground = MeshBuilder.CreateGround("groundImpostor", {width:1000, height:1000});
            ground.isVisible = false;
            ground.position.y = 0.050;
            ground.physicsImpostor = new PhysicsImpostor(
                ground,
                PhysicsImpostor.BoxImpostor,
                {mass:0, restitution:0}
            );      


            this.ground = ground; */



                        // Create a box mesh to represent the player's physical body
                this.playerBox = MeshBuilder.CreateSphere("playerBox", { diameter: 1}, this.scene);
                this.playerBox.position.x = this.camera.position.x; // Position the box at the same position as the camera
            
                this.playerBox.position.z = this.camera.position.z;
                this.playerBox.position.y = 0.055+0.5;

                this.playerBox.isVisible = false;
                //this.playerBox.height = 0.2;
                //this.playerBox.checkCollisions = true;
                this.playerBox.isPickable = false;
                
                // Create a physics impostor for the player box
                this.playerBox.physicsImpostor = new PhysicsImpostor(
                    this.playerBox,
                    PhysicsImpostor.SphereImpostor,
                    { mass: 1, restitution: 0, friction: 0 },
                    this.scene
                );


                 this.playerBox.physicsImpostor.registerOnPhysicsCollide(
                    this.ground.physicsImpostor,
                    this.isNotJumping
                ); 
        } 




        isNotJumping(): void {
            this.isJumping = false;
        }






        cycleWeapon(direction: number): void {
            // If there's only one weapon in the inventory, do nothing
            if (this.inventory.length === 1) {
                return;
            }
        
            // Increment or decrement the current weapon index based on direction
            this.currentWeaponIndex += direction;
        
            // Ensure the index stays within bounds of the inventory array
            if (this.currentWeaponIndex < 0) {
                this.currentWeaponIndex = this.inventory.length - 1;
            } else if (this.currentWeaponIndex >= this.inventory.length) {
                this.currentWeaponIndex = 0;
            }
        
           
            // Switch to the newly selected weapon
            this.switchWeapon(this.currentWeaponIndex);
        }
        
        switchWeapon(index: number): void {
            // Ensure the index is valid
            if (index >= 0 && index < this.inventory.length) {
                // Hide the mesh of the current weapon if it's defined
                if (this.weapon && this.weapon.isMeshCreated && this.weapon.gunMesh) {
                    this.weapon.gunMesh.setEnabled(false);
                }
                
                // Set the current weapon to the weapon at the specified index
                this.weapon = this.inventory[index];
                this.weapon.readyAnimation(this.weapon);
                this.weapon.readySfx();

                this.ui.weapon = this.weapon;
                this.ui.updateAmmoText();
        
                // If the weapon's mesh is not created yet, create it
                if (!this.weapon.isMeshCreated) {
                    this.weapon.CreateG(); // Assuming createG method creates the mesh
                }
        
                // Show the mesh of the new weapon if it's defined
                if (this.weapon && this.weapon.isMeshCreated && this.weapon.gunMesh) {
                    this.weapon.gunMesh.setEnabled(true);
                }
        
                // Perform any additional logic needed for switching weapons (e.g., updating UI)
                // console.log(`Switched to ${this.weapon.name}`);
            }
        
        
        }
        

        applyShockwave() {
            const originalCameraSpeed = this.camera.speed;
            this.camera.speed = this.camera.speed*0.5;
            setTimeout(() => {
                this.camera.speed = originalCameraSpeed;
                /* this.camera.speed = originalCameraSpeed; */
            }, 6000);

        }



        switchWeaponByKey(index: number): void {
            if (index >= 0 && index < this.inventory.length) {
                this.switchWeapon(index);
            }
        }

}