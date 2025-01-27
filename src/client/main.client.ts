import { MessageEmitter } from "shared/structs/messages/emitter";
import { SystemManager } from "shared/system-manager";

MessageEmitter.initialize();

const systemManager = new SystemManager;
systemManager.loadFromRoot(script.Parent!.WaitForChild("systems"));
systemManager.start();