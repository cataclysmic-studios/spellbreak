import { Controller, OnRender, type OnInit } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";

import type { LogStart } from "shared/hooks";
import { AerialCamera } from "client/components/cameras/aerial";
import { FixedCamera } from "client/components/cameras/fixed";
import { FollowCamera } from "client/components/cameras/follow";
import { BattleCamera } from "client/components/cameras/battle";

import type { CameraControllerComponent } from "client/base-components/camera-controller-component";

// add new camera components here
interface Cameras {
  readonly Aerial: AerialCamera;
  readonly Fixed: FixedCamera;
  readonly Follow: FollowCamera;
  readonly Battle: BattleCamera;
}

@Controller()
export class CameraController implements OnInit, OnRender, LogStart {
  public readonly cameraStorage = new Instance("Actor", World);
  public cameras!: Cameras;
  public currentName!: keyof typeof this.cameras;

  public onInit(): void {
    this.cameraStorage.Name = "Cameras";
    this.cameras = {
      Aerial: AerialCamera.create(this),
      Fixed: FixedCamera.create(this),
      Follow: FollowCamera.create(this),
      Battle: BattleCamera.create(this)
    };
  }

  public onRender(dt: number): void {
    const camera = this.get();
    if (camera !== undefined && "onRender" in camera && typeOf(camera.onRender) === "function") {
      const update = <(camera: CameraControllerComponent, dt: number) => void>camera.onRender;
      update(camera, dt);
    }
  }

  public set(cameraName: keyof typeof this.cameras): void {
    this.currentName = cameraName;
    for (const [otherCameraName] of pairs(this.cameras))
      this.get(otherCameraName).toggle(cameraName === otherCameraName);
  }

  public setAtLastCFrame(cameraName: keyof typeof this.cameras): void {
    const camera = this.get(cameraName);
    camera.setCFrame(this.getLastCFrame());
    this.set(cameraName);
  }

  public get<T extends CameraControllerComponent>(cameraName: keyof typeof this.cameras = this.currentName): T {
    return <T>this.cameras[cameraName];
  }

  public getLastCFrame(cameraName: keyof typeof this.cameras = this.currentName): CFrame {
    return this.get(cameraName).instance.CFrame;
  }
}