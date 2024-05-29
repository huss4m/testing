import { Scene, SceneLoader, Mesh, HemisphericLight, CubeTexture, Engine, Vector3, MeshBuilder, StandardMaterial, Color3, Sound, PBRMaterial, Texture, CannonJSPlugin , PhysicsImpostor, PointLight, ShadowGenerator, DirectionalLight, Light, LightGizmo, GizmoManager} from "@babylonjs/core";
import "@babylonjs/loaders";
import { Enemy } from "./Enemy";
import { Mutant } from "./Mutant";
import * as CANNON from "cannon";
import { FirstPersonController } from "./FirstPersonController";
import { WeaponPickups } from "./WeaponPickups";
import { Weapon } from "./Weapon";
import { AmmoPickup } from "./AmmoPickup";
import { FirstAidPickup } from "./FirstAidPickup";
import { Warrok } from "./Warrok";
import { Boss } from "./Boss";
import { SkeletonZombie } from "./SkeletonZombie";
import { TorchPowerup } from "./TorchPowerup";
import { MedalPowerup } from "./MedalPowerup";
import { Instances } from "./Instances";

export class Level {
    scene: Scene;
    enemies!: Enemy[];
    engine: Engine;
    firstPersonController: FirstPersonController;
    waveIntervalId: number | undefined; // Store the interval ID

    waveNumber!: number;
    nextWaveTime: number;

    enemyNumber!: number;
    weaponPickups: WeaponPickups;
    firstaid: FirstAidPickup;
    ammopickup: AmmoPickup;
    torchPowerup: any;
    medalPowerup: MedalPowerup;

    instances!: Instances;

    constructor(engine: Engine, firstPersonController: FirstPersonController) {
        this.engine = engine;

        this.scene = this.CreateScene();
        this.firstPersonController = firstPersonController;

        this.waveNumber = 0;
        this.nextWaveTime = 60;

        this.engine.displayLoadingUI();
        this.CreateEnvironment();
        this.CreateImpostors();

        this.createWall(new Vector3(-35, 0, -13));
         this.createWall(new Vector3(-35, 0, 122));


        this.createHWall(new Vector3(12,0,55));
        this.createHWall(new Vector3(-82,0,55));


        //this.CreateTorch();

        this.weaponPickups = new WeaponPickups();
        this.ammopickup = new AmmoPickup(this.scene);
        this.firstaid = new FirstAidPickup(this.scene);
        
        this.torchPowerup = new TorchPowerup(this.scene);
        this.medalPowerup = new MedalPowerup(this.scene);
  
        this.instances = new Instances();
    }

    
    CreateScene(): Scene {
        const scene = new Scene(this.engine);
    
        const hemilight = new HemisphericLight("hemi", new Vector3(0,1,0), this.scene);
    
        hemilight.intensity = 0.2;
        //const light = new PointLight("pointLight", new Vector3(75, 50, -70), scene)
        const light = new DirectionalLight("DirectionalLight", new Vector3(-1, -1, -0.75), scene);

        const envTex = CubeTexture.CreateFromPrefilteredData(
            "./environment/environment.env",
            scene
          );

          
          light.intensity = 3;
          //light.position = new Vector3(0,10,0);
          light.shadowEnabled = true;
          light.shadowMinZ = 1;
          light.shadowMaxZ = 10; 

       //this.CreateGizmos(light);

          const shadowGen = new ShadowGenerator(2048, light);
          shadowGen.useBlurCloseExponentialShadowMap = true;
      
          scene.environmentTexture = envTex;
      
          scene.createDefaultSkybox(envTex, true);
      
          scene.environmentIntensity = 0.5;
    
          scene.enablePhysics(new Vector3(0,-9.81,0), new CannonJSPlugin(true, 10, CANNON));
    
    
    
        
        scene.collisionsEnabled = true;
    
        return scene;
      }
      CreateAsphalt(): PBRMaterial {
        const pbr = new PBRMaterial("pbr", this.scene);
    
        // Albedo texture
        const albedoTexture = new Texture("./textures/grass/grass_diff.png", this.scene);
        albedoTexture.uScale = 200;// Adjust as needed
        albedoTexture.vScale = 200;// Adjust as needed
        pbr.albedoTexture = albedoTexture;
    
        // Bump texture
        const bumpTexture = new Texture("./textures/grass/grass_norm.png", this.scene);
        bumpTexture.uScale = 200;// Adjust as needed
        bumpTexture.vScale = 200;// Adjust as needed

        pbr.bumpTexture = bumpTexture;
        pbr.invertNormalMapX = true;
        pbr.invertNormalMapY = true;
    
        // Metallic texture
        const metallicTexture = new Texture("./textures/grass/grass_arm.jpg", this.scene);
        metallicTexture.uScale = 200;// Adjust as needed
        metallicTexture.vScale = 200;// Adjust as needed
        
        pbr.metallicTexture = metallicTexture;
    
        pbr._useAmbientOcclusionFromMetallicTextureRed = true;
        pbr.useRoughnessFromMetallicTextureGreen = true;
        pbr.useMetallnessFromMetallicTextureBlue = true;
    
        return pbr;
    }
    
  
      async CreateEnvironment(): Promise<void> {
         
     const { meshes } = await SceneLoader.ImportMeshAsync(
            "",
             "./models/",
             "stadetest4.glb",
             this.scene
         );


    console.log("STADIUM MESHES: ", meshes);
     // Iterate through each mesh
     meshes.forEach((mesh) => {
        // Set rendering group ID to 0
       
        // Enable collisions
        //mesh.checkCollisions = true;
        mesh.receiveShadows = true;
        
     }); 
    
        // Instead of importing a mesh, create a ground
        const ground = MeshBuilder.CreateGround( "ground",
        {width: 500, height: 500},
        this.scene);
        //ground.position.y -= 0.02;
        // Create a new standard material
        const groundMaterial = this.CreateAsphalt();

       

        ground.position = new Vector3(-35, 0.05, 55);
        // Assign the material to the ground mesh
        ground.material = groundMaterial;
                
        // Optionally, you can set other properties of the ground
        ground.checkCollisions = true; 
        ground.receiveShadows = true;
        //ground.isVisible = false;

        //ground.renderingGroupId = 0;

         ground.physicsImpostor = new PhysicsImpostor(
            ground,
            PhysicsImpostor.BoxImpostor,
            {mass:0, restitution:0}
        ); 
        
      
 

        // Set hardware scaling level for better performance
        this.engine.setHardwareScalingLevel(1 / window.devicePixelRatio);

     
        //this.CreateTrack();

         const backgroundMusic = new Sound(
            "backgroundMusic",
            "./audio/background2.mp3",
            this.scene,
            null,
            {
                volume: 0.7,
                autoplay: true,
                loop: true
          }
        );


        this.engine.hideLoadingUI();

    }




    async generateEnemies(number: number): Promise<void> {
        this.waveNumber+=1;

        const minX = -82; // Minimum X coordinate of the walls
        const maxX = 12; // Maximum X coordinate of the walls
        const minZ = -8; // Minimum Z coordinate of the walls
        const maxZ = 115; // Maximum Z coordinate of the walls
   

        if(this.waveNumber  == 2) {
            this.weaponPickups.CreateRiflePickup(new Vector3(Math.random() * (maxX - minX) + minX,0.1,Math.random() * (maxZ - minZ) + minZ));
           
        }

        if(this.waveNumber == 5) {
            this.weaponPickups.CreateLMGPickup(new Vector3(Math.random() * (maxX - minX) + minX,0.1,Math.random() * (maxZ - minZ) + minZ));
        }

        if(this.waveNumber == 8) {
            this.weaponPickups.CreateMinigunPickup(new Vector3(Math.random() * (maxX - minX) + minX,0.1,Math.random() * (maxZ - minZ) + minZ));
        }



        for (let i = 0; i < number + 1; i++) {
      
    
            // Generate random positions within the boundaries of the walls
            const randomX = Math.random() * (maxX - minX) + minX;
            const randomZ = Math.random() * (maxZ - minZ) + minZ;
    
            // Create a mutant at the randomly generated position
            const position = new Vector3(randomX, 0.1, randomZ);
            const mutant = new Mutant(this.scene, this.instances);
            await mutant.CreateMonster(position);
    
            this.firstPersonController.enemies.push(mutant);
        }



        if(this.waveNumber >= 2) {
            for (let i = 0; i < number -2 + 1; i++) {
      
    
                // Generate random positions within the boundaries of the walls
                const randomX = Math.random() * (maxX - minX) + minX;
                const randomZ = Math.random() * (maxZ - minZ) + minZ;
        
                // Create a mutant at the randomly generated position
                const position = new Vector3(randomX, 0.1, randomZ);
                const warrok = new Warrok(this.scene, this.instances);
                await warrok.CreateMonster(position);
        
                this.firstPersonController.enemies.push(warrok);
            }
        }



        if(this.waveNumber >= 4) {
            for (let i = 0; i < number -2 + 1; i++) {
      
    
                // Generate random positions within the boundaries of the walls
                const randomX = Math.random() * (maxX - minX) + minX;
                const randomZ = Math.random() * (maxZ - minZ) + minZ;
        
                // Create a mutant at the randomly generated position
                const position = new Vector3(randomX, 0.1, randomZ);
                const skeletonZombie = new SkeletonZombie(this.scene, this.instances);
                await skeletonZombie.CreateMonster(position);
        
                this.firstPersonController.enemies.push(skeletonZombie);
        }
    }


    if(this.waveNumber === 8) {
        // Generate random positions within the boundaries of the walls
        const randomX = Math.random() * (maxX - minX) + minX;
        const randomZ = Math.random() * (maxZ - minZ) + minZ;

        // Create a mutant at the randomly generated position
        const position = new Vector3(randomX, 0.1, randomZ);
        const boss = new Boss(this.scene, this.instances, this.firstPersonController.player);
        await boss.CreateMonster(position);

        this.firstPersonController.enemies.push(boss);
    }
}
    

    startWaveSystem(): void {
        // Call generateEnemies every 60 seconds
        this.waveIntervalId = setInterval(() => {
            this.generateEnemies(this.waveNumber);
            this.nextWaveTime = 60; // Reset timer for the next wave
        }, 60000); // 60 seconds in milliseconds



        setInterval(() => {
            if (this.nextWaveTime > 0) {
                this.nextWaveTime -= 1;
            }
        }, 1000); // 1 second in milliseconds
    
    
    
        this.startPickupGeneration();
    
    }

    stopWaveSystem(): void {
        // Stop the wave system
        if (this.waveIntervalId !== undefined) {
            clearInterval(this.waveIntervalId);
        }
    }




    startPickupGeneration(): void {
        

        const minX = -82; // Minimum X coordinate of the walls
        const maxX = 12; // Maximum X coordinate of the walls
        const minZ = -8; // Minimum Z coordinate of the walls
        const maxZ = 115; // Maximum Z coordinate of the walls


        const minY = 0.1;
        const maxY = 1;
   

        setInterval(() => {
            this.ammopickup.CreateAmmoPickup(new Vector3(Math.random() * (maxX - minX) + minX,0.1,Math.random() * (maxZ - minZ) + minZ));
        }, 60000); // 60 secondes en millisecondes


        setInterval(() => {
            this.firstaid.CreateFirstAidPickup(new Vector3(Math.random() * (maxX - minX) + minX,0.1,Math.random() * (maxZ - minZ) + minZ));
        }, 60000); // 60 secondes en millisecondes



        

        setInterval(() => {
            this.torchPowerup.CreateTorchPowerup(new Vector3(Math.random() * (maxX - minX) + minX,
            Math.random() * (maxY - minY) + minY,
            Math.random() * (maxZ - minZ) + minZ));
          }, 20000); // 60 secondes en millisecondes


        setInterval(() => {
            this.medalPowerup.CreateMedalPowerup(new Vector3(Math.random() * (maxX - minX) + minX,
            Math.random() * (maxY - minY) + minY,
            Math.random() * (maxZ - minZ) + minZ));
        }, 20000); // 60 secondes en millisecondes



    }


    createWall(position: Vector3): void {
        // Define the dimensions and position of the wall
        const wallWidth = 95;
        const wallHeight = 5;
        const wallDepth = 0.5;
        const wallPosition = position; // Example position

        // Create a box mesh for the wall
        const wall = MeshBuilder.CreateBox("wall", { width: wallWidth, height: wallHeight, depth: wallDepth }, this.scene);

        // Position the wall
        wall.position = wallPosition;

        // Apply a material to the wall
        const wallMaterial = new StandardMaterial("wallMaterial", this.scene);
        wallMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5); // Set a color for the wall
        wall.material = wallMaterial;

        wall.physicsImpostor = new PhysicsImpostor(
            wall,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0, friction: 0 },
            this.scene
        );
        // Enable collisions for the wall
        wall.checkCollisions = true;

        wall.isVisible = false;
        
    }
      
    createHWall(position: Vector3): void {
        // Define the dimensions and position of the wall
        const wallWidth = 135;
        const wallHeight = 5;
        const wallDepth = 0.5;
        const wallPosition = position; // Example position

        // Create a box mesh for the wall
        const wall = MeshBuilder.CreateBox("wall", { width: wallWidth, height: wallHeight, depth: wallDepth }, this.scene);

        // Position the wall
        wall.position = wallPosition;
        wall.rotation.y = Math.PI/2;

        // Apply a material to the wall
        const wallMaterial = new StandardMaterial("wallMaterial", this.scene);
        wallMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5); // Set a color for the wall
        wall.material = wallMaterial;

        wall.physicsImpostor = new PhysicsImpostor(
            wall,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0, friction: 0 },
            this.scene
        );
        // Enable collisions for the wall
        wall.checkCollisions = true;
        wall.isVisible = false;
        
    }

    async CreateTorch() {
        const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync("", "./models/pickups/", "torch.glb");
        meshes[0].position = new Vector3(-25, 0.5, 50);
    }

    CreateImpostors(): void {
         const ground = MeshBuilder.CreateGround("groundImpostor", {width:1000, height:1000});
         ground.isVisible = false;
          ground.physicsImpostor = new PhysicsImpostor(
             ground,
             PhysicsImpostor.BoxImpostor,
             {mass:0, restitution:0}
         ); 

         
         this.firstPersonController.ground = ground;

   

        
     }


     async CreateTrack() {
        const {meshes} = await SceneLoader.ImportMeshAsync(
            "",
             "./models/",
             "runtrack.glb",
             this.scene
         );

         meshes.forEach((mesh) => {
            // Set rendering group ID to 0
           
            // Enable collisions
            //mesh.checkCollisions = true;
            mesh.receiveShadows = true;
            mesh.position.y = 0.9
            //mesh.isVisible = false;
         }); 
     }

}