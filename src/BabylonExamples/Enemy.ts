import { AbstractMesh, Tags, Animation, AnimationGroup, Color3, FreeCamera, Material, Mesh, MeshBuilder, PBRMaterial, Ray, Scene, SceneLoader, Sound, StandardMaterial, Texture, TransformNode, Vector3, Axis } from "@babylonjs/core";
import "@babylonjs/loaders";
import { Player } from "./Player";
import { Instances } from "./Instances";

export class Enemy {
    scene: Scene;
    animationGroups: AnimationGroup[] = [];
    health: number;
    name: string;
    mesh: AbstractMesh | null; // Property to store the mesh
    rootMesh: AbstractMesh | null;
    id: number; // Unique identifier for the enemy
    isDead: boolean;

    runSpeed!: number;
    walkSpeed!: number;

    damage!: number;
    attackSpeed!: number;

    attackSound!: Sound;



    punch!: AnimationGroup;
    run!: AnimationGroup;
    idle!: AnimationGroup;
    death!: AnimationGroup;
    shot!: AnimationGroup;
    walk!: AnimationGroup;
    uppercut!: AnimationGroup;


    randPosition!: Vector3;


    aggroRange!: number;

 

    transformNode!: TransformNode;
    enemyCollider!: any;

    collider: any;


    appliesDot: boolean;
    isSpellCasting!: boolean;

    static enemyCount = 0; // Static variable to keep track of the number of enemies created
    states: { DESTROYED: boolean; FOLLOWING: boolean; ATTACKING: boolean; CLOSE_TO_PLAYER: boolean; WANDERING: boolean; };
    attackTimer: any;
    instances: Instances;

    constructor(scene: Scene, instances: Instances) {
        this.scene = scene;

        this.instances = instances;


        this.isSpellCasting = false;
        this.health = 100;
        this.name = "Monster";
        this.mesh = null; // Initialize mesh as null
        this.rootMesh = null;
        this.isDead = false;
        
        this.appliesDot = false;
        this.id = ++Enemy.enemyCount; // Assign a unique ID to each enemy instance

        this.states = {
            'DESTROYED': false,
            'FOLLOWING': false,
            'ATTACKING': false,
            'CLOSE_TO_PLAYER': false,
            
            'WANDERING': false
        };
        this.generateRandomPosition();

    }

    async CreateMonster(position: Vector3): Promise<void> {
        
            const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync('', './models/', 'mutant.glb');
    
            
            meshes[1].scaling= new Vector3(2,2,2);
            
            //meshes[0].position = position;
            meshes[1].position = position;


            
            this.animationGroups = animationGroups;

            this.mesh = meshes[1];
            this.rootMesh = meshes[0];
            this.mesh.checkCollisions = true;


            Tags.AddTagsTo(this.mesh, "enemy");
            console.log("meshes[0]: ", meshes[0].name);
            console.log("meshes[1]: ", meshes[1].name);
            
            animationGroups[0].stop();
            animationGroups[2].play(true);

            console.log(animationGroups);

/* 
        
        this.enemyCollider = MeshBuilder.CreateBox("enemyCollider", {
                width:1,
                height: 1.7,
                depth: 1
            });
            this.enemyCollider.isPickable = false;
            
           this.enemyCollider.position = this.mesh.position;
           this.enemyCollider.position.y = 1; */

    }

deathAnimation() {
    
    // Ajouter un observateur pour détecter la fin de l'animation du groupe 3
       this.isDead = true;


       this.animationGroups[2].stop();
       this.animationGroups[3].stop();
       this.animationGroups[4].stop();
       this.animationGroups[5].stop();

           // Une fois que l'animation du groupe 3 est terminée, reprendre l'animation du groupe 1
           this.animationGroups[1].start(false);
 this.animationGroups[1].onAnimationEndObservable.addOnce(() => {
   
    this.animationGroups[1].pause();
}
 );
 

    console.log("WARROK DEAD");
    
}

idleAnimation() {
    console.log("IDLE");
}

shotAnimation() {

    this.animationGroups[5].play(false);
 // Ajouter un observateur pour détecter la fin de l'animation du groupe 3
    this.animationGroups[5].onAnimationEndObservable.addOnce(() => {
        // Une fois que l'animation du groupe 3 est terminée, reprendre l'animation du groupe 1
        this.animationGroups[2].start(true);
    });


    console.log("WARROK SHOT");
}


punchAnimation() {
    console.log("PUNCH");
}


walkAnimation() {
    console.log("WALKING");
}

runAnimation() {
    console.log("RUN");
}

updateEnemyAnimations() {
    if (this.states.DESTROYED) return;

    if (this.states.FOLLOWING || this.states.ATTACKING) {
  
        this.runAnimation();
    } else {


        if(!this.isSpellCasting) {
        this.idleAnimation();
        }
    }
}



move(player: Player): void {
    if(this.states.DESTROYED) return;
    const distanceFromPlayer = player.position.subtract(this.rootMesh!.position).length();

    if(distanceFromPlayer <= 5) 
    {
        this.attackPlayer(player);

    } 
    else if(distanceFromPlayer <= this.aggroRange) 
    {

        this.followPlayer(player);
    } 
    else {

        this.gotToRandomDirection(); 
      
    }
}

gotToRandomDirection() {
    if(this.states.WANDERING) {
    this.walkAnimation();

    
    const direction = this.randPosition.subtract(this.rootMesh!.position).normalize();
    const alpha = Math.atan2(-direction.x, -direction.z);

    this.rootMesh!.rotation.y =  alpha;

    this.collider!.moveWithCollisions(direction.multiplyByFloats(this.walkSpeed, 0, this.walkSpeed));



    this.rootMesh!.onCollide = (collidedMesh) => {
        console.log("Collided with: " + collidedMesh!.name);

        console.log("x :",this.rootMesh!.position.x);
        console.log("y :",this.rootMesh!.position.y);
        console.log("z :",this.rootMesh!.position.z);
        
    };


    if (this.randPosition.subtract(this.rootMesh!.position).length() <= 1) {

         this.generateRandomPosition();
       
        }
    }

    else {
        this.idleAnimation();
        
    }
}

generateRandomPosition() {
    const randomPositionX = Math.floor((Math.random() * 100)) - (100 / 2);
    const randomPositionZ = Math.floor((Math.random() * 100)) - (100 / 2);
    

    this.randPosition = new Vector3(randomPositionX, 0, randomPositionZ);
}

followPlayer(player: Player): void {
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
        // Handle collision as needed
    };
    
   
}

attackPlayer(player: Player): void {
    /* if (this.states.DESTROYED) {
        // Stop the attack timer if the enemy is destroyed
        clearInterval(this.attackTimer);
        this.attackTimer = null;
        return;
    } */

    this.states.FOLLOWING = false;
    this.states.ATTACKING = true;

    //this.rootMesh!.physicsImpostor!.setLinearVelocity(new Vector3(0,0,0));

    if (!this.attackTimer) {
        const attackInterval = 1000 / this.attackSpeed; // Interval between attacks in milliseconds

        const attackOnce = () => {
            if (this.states.DESTROYED) {
                // Stop the attack timer if the enemy is destroyed
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
                    //player.screenJerk();
                    this.punchAnimation();
                    this.attackSound.play();
                    console.log(`Player attacked! Player's health: ${player.health}`);
                } else {
                    console.log("Player defeated!");
                }
            }
        };

        // Initial attack
        attackOnce();

        // Set interval for subsequent attacks
        this.attackTimer = setInterval(attackOnce, attackInterval);
    }
}


isPlayerInRange(player: Player): boolean {
    // Implement the logic to check if the player is in range
    const distanceFromPlayer = player.position.subtract(this.rootMesh!.position).length();
    return distanceFromPlayer <= 5; // Adjust this value according to your game's requirements
}


remove() {
        if(!this.mesh) return;
        
        setTimeout(() => {
            this.mesh!.dispose();
            this.rootMesh!.dispose();
            this.mesh = null;
        }, 25000);
    }



}




