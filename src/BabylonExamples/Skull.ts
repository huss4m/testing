import { AbstractMesh, SceneLoader, Vector3, Scene, Mesh } from "@babylonjs/core";
import "@babylonjs/loaders";

export class Skull {
    mesh!: Mesh | null;

    constructor() {
        this.mesh = null;
    }

    async CreateSkull(scene: Scene) {
        // Load the skull model
        await SceneLoader.ImportMeshAsync("", "models/", "skull.glb", scene).then((result) => {
            // The imported meshes are stored in the result.meshes array
            // For simplicity, we assume the first mesh is the skull mesh
            this.mesh = result.meshes[1] as Mesh;

            // Scale down the skull model by a factor of 10
            this.mesh.position = new Vector3(5,0,5);
            
        });
    }

    rotateTowardsPosition(targetPosition: Vector3): void {
        if (this.mesh) {
            // Calculate the direction from the skull mesh to the target position
            const direction = targetPosition.subtract(this.mesh.position).normalize();

            // Calculate the angle between the direction vector and the forward vector of the skull mesh
            const alpha = Math.atan2(-direction.x, direction.z);

            // Set the rotation of the skull mesh to face the target position
            this.mesh.rotation.y = alpha;
        }
    }
}
