import { AbstractMesh, AnimationGroup, SceneLoader } from "@babylonjs/core";

export class Instances {

    
    skeletonZombieMeshRoot!: AbstractMesh | null;
    skeletonZombieMesh!: AbstractMesh | null;
    skeletonZombieAnimationGroups: AnimationGroup[] = [];

    constructor() {
        this.CreateSkeletonZombie();
  

        
    }




    async CreateSkeletonZombie() {
            /* const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync('', './models/', 'skelezombie.glb');
    
        // Set monster properties
            this.skeletonZombieMesh = meshes[1];
            this.skeletonZombieMeshRoot = meshes[0];
            this.skeletonZombieAnimationGroups = animationGroups;

            this.skeletonZombieMesh.setEnabled(false);
            this.skeletonZombieMeshRoot.setEnabled(false); */
            console.log("test");
    }

}