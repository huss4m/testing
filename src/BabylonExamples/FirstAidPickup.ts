import { AbstractMesh, Tags, Animation, AnimationGroup, Color3, FreeCamera, Material, Mesh, MeshBuilder, PBRMaterial, Ray, Scene, SceneLoader, Sound, StandardMaterial, Texture, TransformNode, Vector3, Axis } from "@babylonjs/core";
import "@babylonjs/loaders";


export class FirstAidPickup {

    mesh: AbstractMesh | null;
    pickupSound: Sound;
    scene!: Scene;


    constructor(scene: Scene) {
        this.mesh = null;
        this.scene = scene;
        this.pickupSound = new Sound(
            "firstAidPickup",
            "./audio/pickups/firstaid.mp3", 
            this.scene,
            null,
            {
                //spatialSound: true,
                volume: 1,
                autoplay: false
            });
    }

    async CreateFirstAidPickup(position: Vector3) {
        const { meshes } = await SceneLoader.ImportMeshAsync('', './models/', 'firstaid.glb');
        meshes[1].checkCollisions = true;
        this.mesh = meshes[0];
        meshes[0].scaling = new Vector3(-2.5,2.5,2.5);
        this.mesh.position = position; 
        //this.mesh.checkCollisions = true;
        meshes[1].id = "firstAid";
    }

}