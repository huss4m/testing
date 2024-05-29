
import { AbstractMesh, Animation, AnimationGroup, Color3, FreeCamera, Material, Mesh, MeshBuilder, PBRMaterial, Ray, Scene, SceneLoader, Sound, StandardMaterial, Tags, Texture, TransformNode, Vector3, ParticleSystem, Color4 } from "@babylonjs/core";
import "@babylonjs/loaders";

import { Enemy } from "./Enemy";
import { Player } from "./Player";

export class Weapon {

    camera: FreeCamera;
    scene: Scene;
    animationGroups!: AnimationGroup[];
    isFiring: boolean;
    isReloading: boolean;
    gunMesh!: any;
    gunMeshChild!: any;
    ammo: number;
    reloadAmmo: number;
    enemies: Enemy[];
    bulletHoleMaterial!: PBRMaterial;


    shootSound!: Sound;
    emptySound!: Sound;
    reloadSound!: Sound;
    readySound!: Sound;


    isMeshCreated!: boolean;

    toggleAutomatic!: boolean;
    fireRate!: number;

     muzzleFlashParticleSystem: ParticleSystem | null = null;


    damage: number;

     player!: Player;

    constructor(scene: Scene, camera: FreeCamera, enemies: Enemy[], player: Player) {
        this.camera = camera;
        this.scene = scene;
        this.player = player;

        this.isFiring = false;
        this.isReloading = false;
        this.ammo = 30;
        this.enemies = enemies;
        this.reloadAmmo = 90;
        this.loadBulletholes();


        this.fireRate = 100;


        this.damage = 15;
    
        
    }


    async CreateG(): Promise<void> {
        //const mesh = await SceneLoader.ImportMeshAsync('', './models/', 'rifle.glb');

        const {meshes, animationGroups} = await SceneLoader.ImportMeshAsync('', './models/', 'rifle.glb');

        this.gunMeshChild = meshes[1];
    
        // Create a new TransformNode to hold the gun meshes
        const transformNode = new TransformNode('glb');
        
        // Parent each mesh in the loaded model to the TransformNode
       
            meshes[0].parent = transformNode;
            meshes[0].isVisible = true;
            meshes[0].renderingGroupId = 100;
            this.gunMesh = meshes[0];


            const start = 190;
            const end = 250;
           
            this.animationGroups = animationGroups;
            animationGroups.forEach(function (animationGroup) {
                animationGroup.stop();
                //animationGroup.start(true, 0.1, 0, 10); // shoot
                
                animationGroup.start(true, 0.3, 397, 458); //
              
               

               
            });












       // animationGroups[0].stop();
        
        // Parent the TransformNode to the camera
        transformNode.parent = this.camera;
        
        // Adjust the position of the gun relative to the camera
        transformNode.position.y -= 0.2;
        transformNode.position.z += 0.60;
        transformNode.position.x += 0.32;
        
        // Adjust the rotation of the gun
     
        //transformNode.rotation.set(-Math.PI/2, (9 * Math.PI / 16), (-7*Math.PI/12));    //Gun8
      // transformNode.rotation.set(0, (8 * Math.PI / 16), 0);  // gun
        // Adjust the scaling of the gun
        transformNode.scaling.set(0.01,0.01,0.01);
        // transformNode.scaling.set(0.5, 0.5, 0.5  ); // gun


        this.CreateCrosshair();


        
        this.shootSound = new Sound(
            "shootSound",
            "./audio/shoot.mp3", // Chemin vers le fichier audio
            this.scene,
            null,
            {
                spatialSound: true,
                volume: 1,
                autoplay: false
            }
        );
        this.shootSound.attachToMesh(this.gunMesh);



        this.emptySound = new Sound(
            "emptySound",
            "./audio/empty.mp3", // Chemin vers le fichier audio
            this.scene,
            null,
            {
                spatialSound: true,
                volume: 1,
                autoplay: false
            }
        );
        this.emptySound.attachToMesh(this.gunMesh);

        this.reloadSound = new Sound(
            "reloadSound",
            "./audio/reload.mp3", // Chemin vers le fichier audio
            this.scene,
            null,
            {
                spatialSound: true,
                volume: 1,
                autoplay: false
            }
        );
        this.reloadSound.attachToMesh(this.gunMesh);



        this.readySound = new Sound(
            "reloadSound",
            "./audio/weapons/readyRifle2.mp3", // Chemin vers le fichier audio
            this.scene,
            null,
            {
                spatialSound: true,
                volume: 1,
                autoplay: false
            }
        );
        this.readySound.attachToMesh(this.gunMesh);


        this.createMuzzleFlashParticleSystem();
        this.isMeshCreated = true;
    }



    CreateCrosshair(): Mesh {
        const size = 1;
        const plane = MeshBuilder.CreatePlane('crosshair',{size});
        // plane.position.x= -size/2;
        // plane.position.y= -size/2;
        const material = new StandardMaterial('crossHairMaterial',this.scene);
        plane.material = material;
        const texture = new Texture('./textures/crosshair.png', this.scene);
        material.diffuseTexture=texture;
        material.diffuseColor=Color3.White();
        material.opacityTexture = material.diffuseTexture
        material.transparencyMode = Material.MATERIAL_ALPHABLEND;
        material.alpha = 1
        texture.hasAlpha = true;
        plane.parent = this.camera;
        plane.position.z = 1;
        plane.scaling = new Vector3(0.3/4,0.3/4,0.3/4);
        plane.checkCollisions = false;
        plane.isPickable = false;
        return plane;
    }



    
    shootAnimation(gun: Weapon) {

       
        

        gun.animationGroups.forEach( (animationGroup) => {
            animationGroup.stop();
            animationGroup.start(false, 0.85, 0, 16);
    




        // Start the muzzle flash particle system when the shooting animation begins
        if (gun.muzzleFlashParticleSystem) {
            gun.muzzleFlashParticleSystem.start();
            setTimeout(() => {
                gun.muzzleFlashParticleSystem!.stop();
            }, 10); // Adjust duration of the muzzle flash

           /*  // Update the position of the particle system on each frame
            this.scene.onBeforeRenderObservable.add(() => {
                // Update the position of the particle system to match the position of the gun mesh
                this.muzzleFlashParticleSystem!.emitter = this.gunMesh;
            }); */
            
        }

    

            // Register a callback for when the animation ends
            animationGroup.onAnimationEndObservable.addOnce(() => {
                // Start the idle animation when the shoot animation ends
                gun.isFiring = true;
                gun.idleAnimation(gun);
            });
        });
    }
    
    idleAnimation(gun: Weapon) {
        if(!this.player.isDead()) {
        if (gun.isFiring || !gun.isReloading) {
            gun.animationGroups.forEach(function (animationGroup) {
                animationGroup.stop();
                animationGroup.start(true, 0.3, 397, 458);
            });
            gun.isFiring = false; // Reset the flag
        }
    }
    }


    reloadAnimation(gun: Weapon) {
        gun.isReloading = true;
            gun.animationGroups.forEach(function (animationGroup) {
            animationGroup.stop();
            animationGroup.start(false, 1, 16, 176);
    
            // Register a callback for when the animation ends
            animationGroup.onAnimationEndObservable.addOnce(() => {
                // Start the idle animation when the shoot animation ends
                gun.isReloading = false;
                gun.idleAnimation(gun);
            });
        });
    }


    readyAnimation(gun: Weapon) {
        gun.animationGroups.forEach( (animationGroup) => {
            animationGroup.stop();
            //animationGroup.start(false, 1.25, 120, 176);
            animationGroup.start(false, 1, 320, 396);


            animationGroup.onAnimationEndObservable.addOnce(() => {
                // Start the idle animation when the shoot animation ends
                
                gun.idleAnimation(gun);
            });
        });
    }



    readySfx() {
        this.readySound.play();
    }

    shoot(): void {
        if (this.ammo > 0 && !this.isReloading) {

            this.shootSound.play();
            
         // Create the picking ray from the center of the screen with random deviation
            const deviationAngle = Math.random() * Math.PI * 2; // Random angle between 0 and 2*pi
            const deviationAmount = Math.random() * 0.04; // Random deviation amount, adjust as needed
            const deviationVector = new Vector3(Math.cos(deviationAngle) * deviationAmount, 0, Math.sin(deviationAngle) * deviationAmount);
            
            // Calculate the new ray direction with deviation
            const rayDirection = this.camera.getForwardRay().direction.add(deviationVector);

            // Create the picking ray from the center of the screen
            const ray = this.scene.createPickingRay(
                this.scene.getEngine().getRenderingCanvas()!.width / 2,
                this.scene.getEngine().getRenderingCanvas()!.height / 2,
                null,
                this.camera
            );
        
            // Perform the raycast and check for hits
            const raycastHit = this.scene.pickWithRay(ray);
    
            // Check if the ray hit something
            if (raycastHit && raycastHit.hit) {
                // Check if the hit object has the "enemy" tag
                if (Tags.MatchesQuery(raycastHit.pickedMesh!, "enemy")) {

                    // Get the enemy instance associated with the hit object
                    const enemy = this.getEnemyFromMesh(raycastHit.pickedMesh!);
    
                    // Reduce the enemy's HP by 10
                    enemy.health -= this.damage;

                    console.log("dead?" , enemy.states.DESTROYED);

                    if (enemy.health > 0) {
                        // Play shot animation on the enemy
                        this.playShotAnimation(enemy);
                       
                    }
    
                    // Check if the enemy's HP has reached 0
                    if (enemy.health <= 0) {
                        if(!enemy.states.DESTROYED) {
                        // Play death animation if the enemy is killed
                        this.playDeathAnimation(enemy);



                        this.player.score += 1;
                        console.log("Player Score", this.player.score);
                        //enemy.rootMesh!.physicsImpostor!.setLinearVelocity(new Vector3(0,0,0));

                        enemy.states.DESTROYED = true;
                        }
                    }
                }
    
                // Create a decal to indicate the impact of the shot
                const size = 0.1;
                const decal = MeshBuilder.CreateDecal("decal", raycastHit.pickedMesh!, {
                    position: raycastHit.pickedPoint!,
                    normal: raycastHit.getNormal(true)!,
                    size: new Vector3(size, size, size)
                });
                decal.material = this.bulletHoleMaterial;
                console.log("Raycast hit something");
// Dispose of the decal after 10 seconds
                    setTimeout(() => {
                        decal.dispose();
                    }, 10000);
                                
                
            }
    
            // Reduce ammo count and update UI
            this.ammo -= 1;
            // this.updateAmmoText(); // You may want to update the UI here if needed
        }
    }
    


    reloadWeapon() {
        const remainingAmmo = this.ammo;
        const reloadAmount = Math.min(30 - remainingAmmo, this.reloadAmmo);
        this.ammo += reloadAmount;
        this.reloadAmmo -= reloadAmount;
        //this.updateAmmoText();
    }







    
    



    playShotAnimation(enemy: Enemy): void {
        // Trigger shot animation on the enemy that was hit
        enemy.shotAnimation();
    }
    playDeathAnimation(enemy: Enemy): void {
        // Trigger death animation on the enemy that was hit
        enemy.deathAnimation();
    }


    getEnemyFromMesh(mesh: AbstractMesh): Enemy {
        // Loop through the enemies array and find the enemy with matching mesh
        for (const enemy of this.enemies) {
            if (enemy.mesh === mesh) {
                return enemy;
            }
        }
        throw new Error("Enemy not found for the given mesh.");
    }
    

    async loadBulletholes() {
        this.bulletHoleMaterial = new PBRMaterial("bulletHoleMaterial", this.scene);

        
        // Load the bullet hole texture
       this.bulletHoleMaterial.albedoTexture = new Texture("textures/bullet_hole.png", this.scene);

        // Create a material with the bullet hole texture
        
        this.bulletHoleMaterial.albedoTexture.hasAlpha = true;
        this.bulletHoleMaterial.zOffset = -0.25;
        this.bulletHoleMaterial.roughness = 0.5;
       //this.bulletHoleMaterial.zOffset = -0.25;
        /* this.splatter = new PBRMaterial("greenSplatter", this.scene);
        this.splatter.roughness = 1;
        this.splatter.albedoTexture = new Texture("textures/green.png", this.scene);
        this.splatter.albedoTexture.hasAlpha = true;
*/
      
    
}

createMuzzleFlashParticleSystem(): void {
    // Create particle system
    this.muzzleFlashParticleSystem = new ParticleSystem("muzzleFlash", 200, this.scene);
    
    // Set particle texture
    const texture = new Texture("./textures/particles/muzzle_05.png", this.scene);
    texture._parentContainer = this.gunMesh;
    this.muzzleFlashParticleSystem.particleTexture = texture;
    
    // Set particle system properties
    this.muzzleFlashParticleSystem.emitter = this.gunMesh; // Set emitter to gun mesh
    this.muzzleFlashParticleSystem.minEmitBox = new Vector3(15, 14, 100); // Adjust position
    this.muzzleFlashParticleSystem.maxEmitBox = new Vector3(15, 14, 100); // Adjust position
       // Set colors to resemble real muzzle flash
    // Set colors to resemble real muzzle flash with increased opacity
    this.muzzleFlashParticleSystem.color1 = new Color4(0.8, 0.5, 0, 1); // Bright yellow-orange with 80% opacity
    this.muzzleFlashParticleSystem.color2 = new Color4(0.8, 0.5, 0, 1); // Transparent red with 50% opacity
    this.muzzleFlashParticleSystem.colorDead = new Color4(1, 0.5, 0, 1); // Transparent red with 50% opacity
    
       
    this.muzzleFlashParticleSystem.minSize = 0.3; // Adjust size
    this.muzzleFlashParticleSystem.maxSize = 0.74; // Adjust size
    this.muzzleFlashParticleSystem.minLifeTime = 0.01; // Adjust lifetime
    this.muzzleFlashParticleSystem.maxLifeTime = 0.01; // Adjust lifetime
    this.muzzleFlashParticleSystem.emitRate = 100; // Adjust emission rate

    // Set particle system direction to align with the forward direction of the gun
    

    
    
    // Start the particle system in paused mode
    this.muzzleFlashParticleSystem.start();
    this.muzzleFlashParticleSystem.stop(); 


    
}







dispose(): void {
    // Dispose of the gun mesh
     // Dispose of the gun mesh and its children
     if (this.gunMesh) {
        this.gunMesh.dispose();
        this.gunMesh = null;
    }

    // Optionally, set other properties to null or dispose of other objects
}

// Inside your Weapon class (or a superclass)
async preloadMesh(): Promise<void> {
    if (!this.isMeshCreated) {
        await this.CreateG(); // Create the mesh if it's not already created
        if (this.gunMesh) {
            this.gunMesh.setEnabled(false); // Hide the mesh
        }
    }
}






}