import { AbstractMesh, Vector3, Scene, SceneLoader, FreeCamera, Sound, Mesh, StandardMaterial, MeshBuilder, GlowLayer, Color3 } from "@babylonjs/core";

export class TorchPowerup {

    mesh: AbstractMesh | null;
    scene!: Scene;
    camera!: FreeCamera; 
    pickupSound: Sound;
    glowLayer: GlowLayer;

    constructor(scene: Scene) {
        this.mesh = null;
        this.scene = scene;
        this.pickupSound = new Sound(
            "",
            "./audio/pickups/ammobox.mp3", 
            this.scene,
            null,
            {
                volume: 1,
                autoplay: false
            }
        );
        // Create a glow layer and add it to the scene
        this.glowLayer = new GlowLayer("glow", this.scene);
        this.glowLayer.intensity = 1; // Adjust glow intensity as needed
    }

    async CreateTorchPowerup(position: Vector3) {
        // Create a box collider mesh
        const boxCollider = MeshBuilder.CreateBox("boxCollider", {size: 1}, this.scene);
        boxCollider.isVisible = false; // Hide the collider mesh
        boxCollider.visibility = 0.5;
        boxCollider.isPickable = false;
        boxCollider.scaling = new Vector3(1.5, 2, 1.5); // Adjust the size as needed
        boxCollider.position = position.clone(); // Position it at the same location as the torch
        boxCollider.checkCollisions = true;
        boxCollider.position.y += 1.7;

        const { meshes } = await SceneLoader.ImportMeshAsync('', './models/pickups/', 'torch.glb');
        this.mesh = meshes[0]; 
        this.mesh.scaling = new Vector3(0.3, 0.3, 0.3);
        this.mesh.position = position; 

        // Apply glow material to the torch mesh
        const glowMaterial = new StandardMaterial("glowMaterial", this.scene);
        glowMaterial.emissiveColor = new Color3(1, 1, 1); // Adjust color as needed
        glowMaterial.alpha = 0.5; // Adjust alpha as needed
        this.mesh.material = glowMaterial;

        // Parent the torch mesh to the box collider
        this.mesh.setParent(boxCollider);

        // Assign the ID "torchPowerup" to the box collider
        boxCollider.id = "torchPowerup";

        // Schedule the removal of the torch power-up after 20 seconds
        setTimeout(() => {
            boxCollider.dispose();
        }, 20000);
    }

    collectTorch() {
        if (this.mesh && this.mesh.parent) {
            // Dispose the parent mesh of the torch (which is the box collider)
            this.mesh.parent.dispose();
            this.mesh = null;
        }
    }
}
