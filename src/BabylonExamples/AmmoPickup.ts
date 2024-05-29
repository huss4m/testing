import { AbstractMesh, Vector3, Scene, SceneLoader, FreeCamera, Sound } from "@babylonjs/core";

export class AmmoPickup {

    mesh: AbstractMesh | null;
    scene!: Scene;
    camera!: FreeCamera; 
    pickupSound: Sound;

    constructor(scene: Scene) {
        this.mesh = null;
        this.scene = scene;
       this.pickupSound = new Sound(
        "ammoBoxPickup",
        "./audio/pickups/ammobox.mp3", 
        this.scene,
        null,
        {
            //spatialSound: true,
            volume: 1,
            autoplay: false
        });

        
    }

    async CreateAmmoPickup(position: Vector3) {
        const { meshes } = await SceneLoader.ImportMeshAsync('', './models/', 'ammocrate.glb');
        this.mesh = meshes[0]; 
        this.mesh.scaling = new Vector3(-2.5, 2.5, 2.5);
        this.mesh.position = position; 
      
        meshes[1].checkCollisions = true;
        meshes[1].id = "ammoBox";
       
        
    }

    collectAmmo() {

        if (this.mesh) {
            this.mesh.dispose();
            this.mesh = null;
        }
    }
}
