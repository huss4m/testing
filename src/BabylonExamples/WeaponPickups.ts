import { AbstractMesh, Vector3, Scene, SceneLoader, FreeCamera, Sound } from "@babylonjs/core";

export class WeaponPickups {

    mesh: AbstractMesh | null;
    scene!: Scene;
    camera!: FreeCamera; // Assuming FreeCamera is imported from "@babylonjs/core"
    pickupSound: Sound;

    constructor() {
        this.mesh = null;
       this.pickupSound = new Sound(
        "weaponPickup",
        "./audio/pickups/ammobox.mp3", // Chemin vers le fichier audio
        this.scene,
        null,
        {
            //spatialSound: true,
            volume: 1,
            autoplay: false
        });
    }



    async CreateMinigunPickup(position: Vector3) {

        const { meshes } = await SceneLoader.ImportMeshAsync('', './models/pickups/', 'minigun.glb');
        this.mesh = meshes[0]; 
        this.mesh.scaling = new Vector3(0.01, 0.01, 0.01);
        this.mesh.position = position;
        this.mesh.position.y += 0.1; 
      
        meshes[1].checkCollisions = true;
        meshes[1].id = "minigunPickup";

        console.log("MINIGUN MESH:", meshes);
       
        
    }


    async CreatePistolPickup(position: Vector3) {

        const { meshes } = await SceneLoader.ImportMeshAsync('', './models/pickups/', 'pistol2.glb');
        this.mesh = meshes[0]; 
       this.mesh.scaling = new Vector3(0.02, 0.02, 0.02);
        this.mesh.position = position;
        this.mesh.position.y += 0.1; 
      
        meshes[1].checkCollisions = true;
        meshes[1].id = "pistolPickup";

        console.log("PISTOL MESH:", meshes);
       
        
    }

    async CreateRiflePickup(position: Vector3) {

        const { meshes } = await SceneLoader.ImportMeshAsync('', './models/pickups/', 'rifle2.glb');
        this.mesh = meshes[0]; 
        this.mesh.scaling = new Vector3(0.02, 0.02, 0.02);
        this.mesh.position = position;
        this.mesh.position.y += 0.1; 
      
        meshes[1].checkCollisions = true;
        meshes[1].id = "riflePickup";

        console.log("RIFLE MESH:", meshes);
       
        
    }

    async CreateLMGPickup(position: Vector3) {

        const { meshes } = await SceneLoader.ImportMeshAsync('', './models/pickups/', 'lmg2.glb');
        this.mesh = meshes[0]; 
        this.mesh.scaling = new Vector3(2, 2, 2);
        this.mesh.position = position;
        this.mesh.position.y += 0.1; 
      
        meshes[1].checkCollisions = true;
        meshes[1].id = "lmgPickup";

        console.log("LMG MESH:", meshes);
       
        
    }

   
}