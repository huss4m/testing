import { AnimationGroup, GizmoManager, PhysicsImpostor, Scene, SceneLoader, Sound, Tags, Vector3, TransformNode, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";
import { Enemy } from "./Enemy";
import { Instances } from "./Instances";

export class Mutant extends Enemy {
    
  
    


    constructor(scene: Scene, instances: Instances) {
        super(scene, instances);
        this.name = "Mutant";
        this.damage = 5;
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

        //this.attackSound.attachToMesh(this.rootMesh);

        this.aggroRange = 200;

        this.health = 150;

    this.transformNode = new TransformNode("RotationNode", this.scene);
    
    }

    async CreateMonster(position: Vector3): Promise<void> {


        this.createBoxCollider();
    

        
        const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync('', './models/', 'mutant2.glb');
    
    // Set monster properties
        this.mesh = meshes[1];
        this.rootMesh = meshes[0];

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
        this.walk = animationGroups[7];
    
     
    
        // Add tags
        Tags.AddTagsTo(this.mesh, "enemy");
    
        // Start animations
        animationGroups[0].stop();
        animationGroups[4].play(true);
    
        // Set movement speeds
        this.runSpeed = 0.2;
        this.walkSpeed = 0.07;
    
        console.log(animationGroups);

  // Add physics impostor
     



       
     

            console.log("Mutant POSITION:", this.rootMesh!.position.x, this.rootMesh!.position.y, this.rootMesh!.position.z)
            console.log("COLLIDER", this.collider.position);


            this.scene.registerBeforeRender(() => {
                // Call the function to update the position of the rootMesh
                this.rootMesh!.position.x = this.collider.position.x;
                this.rootMesh!.position.z = this.collider.position.z;
            });
      
    }
    
    createBoxCollider() {
        // Create a box that matches the size of the mutant
        this.collider = MeshBuilder.CreateBox("collider", { height: 1.5, width: 1, depth: 1 }, this.scene);
       // this.collider.scaling = new Vector3(1.5, 3, 1.5); // Adjust the size to fit the mutant

   

       //this.collider.scaling.y = 0.5;
    
 
      
        this.collider.visibility = 0.3;
        this.collider.isVisible = false;
    
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

    this.idle.start(false);
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
        this.run.start(true);
        console.log("RUN");
    }
}


smashAnimation() {


    console.log("SMASH");
}


kickAnimation() {
  


    console.log("place");
}

takeDamage(damageAmount: number): void {
   

    console.log("takedamage");
}
}