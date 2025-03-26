import { Modding } from "@flamework/core";
import { BaseStandardAction } from "@rbxts/mechanism/out/standard-action";
import { callMethodOnDependencies, resolveDependencies } from "@rbxts/flamework-meta-utils";
import { InputManager, type AxisAction } from "@rbxts/mechanism";

import { Message, MessageData, messaging } from "shared/messaging";
import { flameworkIgnited } from "shared/constants";
import Log from "shared/log";
import { Constructor } from "@flamework/core/out/utility";

export const inputManager = new InputManager;

export const OnInput = Modding.createDecorator<[binding: BaseStandardAction]>(
  "Method",
  (descriptor, [action]) => {
    flameworkIgnited.Once(() => {
      inputManager.bind(action);
      action.activated.Connect(() => {
        const object = <Record<string, Callback>>Modding.resolveSingleton(descriptor.constructor!);
        void task.spawn(object[descriptor.property], object, action);
      });
    });
  }
);

export const OnAxisInput = Modding.createDecorator<[binding: AxisAction]>(
  "Method",
  (descriptor, [axis]) => {
    flameworkIgnited.Once(() => {
      inputManager.bind(axis);
      axis.updated.Connect(() => {
        const [object] = resolveDependencies(descriptor.constructor! as Constructor<Record<string, Callback>>);
        void task.spawn(object[descriptor.property], object, axis);
      });
    });
  }
);

/** **Note:** You need to provide an action ID to the OnInput decorator to use this decorator, with which you will use the same action ID. */
export const OnInputRelease = Modding.createDecorator<[actionID: string | number]>(
  "Method",
  (descriptor, [actionID]) => task.spawn(() => {
    flameworkIgnited.Once(() => {
      let action = inputManager.getActionByID(actionID, BaseStandardAction);
      if (action === undefined) {
        // RETARDED
        task.wait(0.1);
        action = inputManager.getActionByID(actionID, BaseStandardAction);
      }

      if (action === undefined)
        throw Log.fatal(`Failed to bind method "${descriptor.property}" using @OnInputRelease decorator: No input action with ID "${actionID}" exists`);

      action.deactivated.Connect(() => {
        const object = <Record<string, Callback>>Modding.resolveSingleton(descriptor.constructor!);
        void task.spawn(object[descriptor.property], object, action);
      });
    });
  })
);

/** @metadata reflect identifier*/
export function OnMessage<Kind extends Message>(message: Kind) {
  return (ctor: object, propertyKey: string, descriptor: TypedPropertyDescriptor<(this: unknown, data: MessageData[Kind]) => void>) => {
    messaging.onClientMessage(message, data => callMethodOnDependencies(ctor, descriptor, data));
  };
}