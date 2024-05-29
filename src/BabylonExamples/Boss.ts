import { AnimationGroup, GizmoManager, PhysicsImpostor, Scene, SceneLoader, Sound, Tags, Vector3, TransformNode, MeshBuilder, StandardMaterial, Color3, ParticleSystem, Texture, Color4, GlowLayer } from "@babylonjs/core";
import { Enemy } from "./Enemy";
import { Instances } from "./Instances";
import { Player } from "./Player";


export class Boss extends Enemy {
    
  
    spellcast!: AnimationGroup;

    spellParticles!: ParticleSystem;
    isSpellCasting: boolean;
    spellInterval!: number;

    isVulnerable!: boolean;


    player: Player;
    glowInterval!: number;
    glowLayer: any;
    shockWaveSound: Sound;
    shockWaveCastSound: Sound;

    constructor(scene: Scene, instances: Instances, player: Player) {
        super(scene, instances);
        this.name = "Boss";
        this.player = player;
        this.attackSpeed = 0.4;
        this.attackSound = new Sound(
            "shootSound",
            "./audio/attack/mutant.mp3", // Chemin vers le fichier audio
            this.scene,
            null,
            {
                //spatialSound: true,
                volume: 0.6,
                autoplay: false
            }
        );


        this.shockWaveSound = new Sound(
            "shockWaveSound",
            "./audio/attack/shockwave.mp3",
            this.scene,
            null,
            {
                volume: 1,
                autoplay: false
            }
        );
        
        this.shockWaveCastSound = new Sound(
            "shockWaveSound",
            "./audio/attack/shockwaveCast.mp3",
            this.scene,
            null,
            {
                spatialSound: true,
                volume: 1,
                autoplay: false
            }
        );

        

        //this.attackSound.attachToMesh(this.rootMesh);

        this.aggroRange = 200;

        this.health = 5000;

        this.damage = 40;
        this.isSpellCasting = false;


        this.isVulnerable = true; // Initially, the boss is vulnerable
        this.startVulnerabilityTimer();

        
    this.transformNode = new TransformNode("RotationNode", this.scene);
    
    }

    async CreateMonster(position: Vector3): Promise<void> {


        this.createBoxCollider();
    

        this.collider.scaling = new Vector3(3,3,3);
        this.collider.isVisible = false;
        
        const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync('', './models/', 'maw.glb');
    
    // Set monster properties
        this.mesh = meshes[1];
        this.rootMesh = meshes[0];

        this.mesh.scaling = new Vector3(3,3,3);

        /* this.rootMesh.physicsImpostor = new PhysicsImpostor(
            this.rootMesh,
            PhysicsImpostor.BoxImpostor,
            { mass: 1, restitution: 0.1, friction: 0 },
            this.scene
        );
 */

        this.rootMesh.checkCollisions = true;
        //this.rootMesh.physicsImpostor = new PhysicsImpostor(this.rootMesh, PhysicsImpostor.MeshImpostor, { mass: 100, restitution: 0.1 }, this.scene);
        this.rootMesh!.rotationQuaternion = null;
        
        this.rootMesh.position = position;
        this.collider.position = this.rootMesh.position.clone();
        this.collider.position.y += 1;
        //this.mesh.showBoundingBox = true;

        //this.rootMesh.scaling = new Vector3(1.5,1.5,1.5);
   
            
        //this.rootMesh.physicsImpostor.setScalingUpdated();
        //this.mesh.checkCollisions = true;
      // Create a box collider
      

        //this.rootMesh!.parent = this.collider;
        //this.rootMesh!.setParent(this.collider);

        // Set animation groups
        this.animationGroups = animationGroups;
        this.death = animationGroups[1];
        this.idle = animationGroups[2];
        this.punch = animationGroups[3];
        this.run = animationGroups[4];
        this.shot = animationGroups[5];
        this.uppercut = animationGroups[6];
        this.spellcast = animationGroups[6];
        this.walk = animationGroups[7];
        
    
     
        this.run.speedRatio = 0.2;
        // Add tags
        Tags.AddTagsTo(this.mesh, "enemy");
    
        // Start animations
        animationGroups[0].stop();
        animationGroups[4].play(true);
    
        // Set movement speeds
        this.runSpeed = 0.1;
        this.walkSpeed = 0.07;
    
        console.log("AnimationGROUPS", animationGroups);

  // Add physics impostor
     



       
     

            console.log("Boss POSITION:", this.rootMesh!.position.x, this.rootMesh!.position.y, this.rootMesh!.position.z)
            console.log("COLLIDER", this.collider.position);


            this.scene.registerBeforeRender(() => {
                // Call the function to update the position of the rootMesh
                this.rootMesh!.position.x = this.collider.position.x;
                this.rootMesh!.position.z = this.collider.position.z;
            });









            this.loadParticleSystem();




            this.startSpellcastingInterval();


 
            this.shockWaveCastSound.attachToMesh(this.mesh);

      
    }
    
    createBoxCollider() {
        // Create a box that matches the size of the mutant
        this.collider = MeshBuilder.CreateBox("collider", { height: 1.5, width: 1, depth: 1 }, this.scene);
       // this.collider.scaling = new Vector3(1.5, 3, 1.5); // Adjust the size to fit the mutant

   

       //this.collider.scaling.y = 0.5;
    
 
      
        this.collider.visibility = 0.3;
    
        this.collider.checkCollisions = true;
        this.collider.isPickable = false;
    
       
    }

deathAnimation() {
    

       this.isDead = true;


       this.animationGroups[2].stop();
       this.animationGroups[3].stop();
       this.animationGroups[4].stop();
       this.animationGroups[5].stop();


        this.death.start(false);

           
    this.collider.dispose();
    this.remove();
 
    console.log(" DEAD");
    
}

idleAnimation() {

    if(!this.isSpellCasting) {
        this.idle.start(true);
    }
    console.log("IDLE");
}

shotAnimation() {
    this.shot.play(false);
    console.log(" SHOT");
}


punchAnimation() {

    this.animationGroups.forEach(animationGroup => {
        animationGroup.stop();
    });

   this.punch.start(false);
   
   //return this.animationGroups[1];
    console.log("PUNCH");
}


walkAnimation() {

    this.walk.start(false);
    //console.log("WALKING");
}

runAnimation() {
    // Check if any other animation group is currently playing

    this.idle.stop();
    this.walk.stop();

    const isAnyAnimationPlaying = this.animationGroups.some(animationGroup => animationGroup.isPlaying);

    // Start the "run" animation group only if no other animation is currently playing
    if (!isAnyAnimationPlaying) {
        this.run.speedRatio = 0.2; // Set the speed ratio to 0.5 to play at half speed

        this.run.start(true);
        console.log("speed", this.run.speedRatio);
        console.log("RUN");
    }
}


smashAnimation() {


    console.log("SMASH");
}



spellAnimation() {
    this.animationGroups.forEach(animationGroup => {
        animationGroup.stop();
    });

    this.isSpellCasting = true;
    this.spellcast.start(false);
    this.spellParticles.start();
    this.shockWaveCastSound.play();

    this.spellcast.onAnimationEndObservable.addOnce(() => {
        this.isSpellCasting = false;
        this.spellParticles.stop();
        this.player.applyShockwave();

        this.shockWaveCastSound.stop();
        this.shockWaveSound.play();

    });
}


kickAnimation() {
  


    console.log("place");
}

takeDamage(damageAmount: number): void {
   

    console.log("takedamage");
}


loadParticleSystem() {
               // Create and configure the particle system
const particleSystem = new ParticleSystem("particles", 2000, this.scene);

// Texture of each particle
particleSystem.particleTexture = new Texture("./textures/particles/star_08.png", this.scene);

// Where the particles come from
particleSystem.emitter = this.rootMesh; // Attach to the monster
particleSystem.minEmitBox = new Vector3(-1, 0, 0); // Starting position
particleSystem.maxEmitBox = new Vector3(1, 0, 0); // Ending position
particleSystem.createSphereEmitter(10); // 2 is the radius of the circle

// Colors of all particles
particleSystem.color1 = new Color4(0, 1, 1, 1.0);
particleSystem.color2 = new Color4(0, 1, 1, 1.0);
particleSystem.colorDead = new Color4(0, 1, 1, 0.0);

// Size of each particle (random between...)
particleSystem.minSize = 0.5;
particleSystem.maxSize = 1;

// Life time of each particle (random between...)
particleSystem.minLifeTime = 0.3;
particleSystem.maxLifeTime = 1.5;

// Emission rate
particleSystem.emitRate = 500;

// Blend mode: BLENDMODE_ONEONE, or BLENDMODE_STANDARD
particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;

// Set the gravity of all particles
particleSystem.gravity = new Vector3(0, -9.81, 0);

// Direction of each particle after it has been emitted
particleSystem.direction1 = new Vector3(0, 15, 0);
particleSystem.direction2 = new Vector3(0, 15, 0);

// Angular speed, in radians
particleSystem.minAngularSpeed = 0;
particleSystem.maxAngularSpeed = Math.PI;

// Speed
particleSystem.minEmitPower = 1;
particleSystem.maxEmitPower = 3;
particleSystem.updateSpeed = 0.005;

// Don't start the particle system immediately
this.spellParticles = particleSystem;
//this.spellParticles.start();
}
















move(player: Player): void {
    if(this.states.DESTROYED) return;
    const distanceFromPlayer = player.position.subtract(this.rootMesh!.position).length();

    if(distanceFromPlayer <= 5 && !this.isSpellCasting) 
    {
        this.attackPlayer(player);

    } 
    else if(distanceFromPlayer <= this.aggroRange && !this.isSpellCasting) 
    {

        this.followPlayer(player);
    } 
    else {
        this.gotToRandomDirection(); 
      
    }
}



followPlayer(player: Player): void {
    this.run.speedRatio = 0.2;
    this.runAnimation();
    this.states.ATTACKING = false;
    this.states.FOLLOWING = true;

       

    const direction = player.position.subtract(this.rootMesh!.position).normalize();

    
    const alpha = Math.atan2(-direction.x, -direction.z);
  

    this.rootMesh!.rotation.y =  alpha;
 

      
       this.collider!.moveWithCollisions(direction.multiplyByFloats(this.runSpeed, 0, this.runSpeed));

    this.rootMesh!.onCollide = (collidedMesh) => {
        console.log("Collided with: " + collidedMesh!.name);

        console.log("x :",this.rootMesh!.position.x);
        console.log("y :",this.rootMesh!.position.y);
        console.log("z :",this.rootMesh!.position.z);
       
    };
    
   
}

attackPlayer(player: Player): void {
 

    this.states.FOLLOWING = false;
    this.states.ATTACKING = true;


    if (!this.attackTimer) {
        const attackInterval = 1000 / this.attackSpeed; // Interval between attacks in milliseconds

        const attackOnce = () => {
            if (this.states.DESTROYED) {
                
                clearInterval(this.attackTimer);
                this.attackTimer = null;
                return;
            }

            if (this.isPlayerInRange(player)) {
                if (player.health > 0) {
                    player.health = Math.max(player.health-this.damage);

                    if(this.appliesDot && !player.hasDot) {
                        player.applyDot(2, 5000);
                    }
                   
                    this.punchAnimation();
                    this.attackSound.play();
                    console.log(`Player attacked! Player's health: ${player.health}`);
                } else {
                    console.log("Player defeated!");
                }
            }
        };

     
        attackOnce();

        this.attackTimer = setInterval(attackOnce, attackInterval);
    }
}


isPlayerInRange(player: Player): boolean {

    const distanceFromPlayer = player.position.subtract(this.rootMesh!.position).length();
    return distanceFromPlayer <= 5; 
}


startSpellcastingInterval() {
    this.spellInterval = setInterval(() => {
        if (!this.isSpellCasting && !this.isDead) {
            this.spellAnimation();
        }
    }, 15000); // 15000 milliseconds = 15 seconds
}






startVulnerabilityTimer() {
    this.glowInterval = setInterval(() => {
        this.isVulnerable = !this.isVulnerable; // Toggle vulnerability
        if (!this.isVulnerable) {
            // If boss is not vulnerable, add glow effect
            this.addGlowEffect();
        } else {
            // If boss is vulnerable, remove glow effect
            this.removeGlowEffect();
        }
    }, 10000); // 10000 milliseconds = 10 seconds
}

addGlowEffect() {
    // Create a glow layer
    this.glowLayer = new GlowLayer("glow", this.scene);
    this.glowLayer.addIncludedOnlyMesh(this.rootMesh);

    // Set glow properties
    this.glowLayer.intensity = 3; // Adjust the intensity as needed
    this.glowLayer.glowColor = new Color3(0, 1, 1);
}

removeGlowEffect() {
    // Dispose the glow layer
    if (this.glowLayer) {
        this.glowLayer.dispose();
        this.glowLayer = null;
    }
}

}