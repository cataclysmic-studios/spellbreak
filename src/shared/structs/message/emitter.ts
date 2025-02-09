import { Modding } from "@flamework/core";
import { createBinarySerializer, type Serializer, type SerializerMetadata } from "@rbxts/flamework-binary-serializer";
import { RunService } from "@rbxts/services";

import { Message } from ".";
import { MessageData } from "./data";
import { GlobalEvents } from "shared/network";

let ServerEvents: ReturnType<typeof GlobalEvents.createServer>;
let ClientEvents: ReturnType<typeof GlobalEvents.createClient>;
if (RunService.IsServer())
  ServerEvents = GlobalEvents.createServer({});
else
  ClientEvents = GlobalEvents.createClient({});

/** @metadata macro */
function createMessageSerializer<Kind extends Message>(meta?: Modding.Many<SerializerMetadata<MessageData[Kind]>>): Serializer<MessageData[Kind]> {
  return createBinarySerializer(meta);
}

type MessageCallback<T = unknown> = ClientMessageCallback<T> | ServerMessageCallback<T>;
type ClientMessageCallback<T = unknown> = (data: T) => void;
type ServerMessageCallback<T = unknown> = (player: Player, data: T) => void;

export class MessageEmitter {
  private static readonly clientCallbacks = new Map<Message, ClientMessageCallback[]>;
  private static readonly serverCallbacks = new Map<Message, ServerMessageCallback[]>;
  private static readonly serializers = {
    [Message.TOGGLE_MOVEMENT]: createMessageSerializer<Message.TOGGLE_MOVEMENT>()
  };

  public static initialize(): RBXScriptConnection {
    if (RunService.IsClient()) {
      return ClientEvents.sendClientMessage.connect((sentMessage, { buffer, blobs }) => {
        const messageCallbacks = this.clientCallbacks.get(sentMessage) ?? [];
        if (messageCallbacks.size() === 0) return;

        const serializer = this.getSerializer(sentMessage)
        const data = serializer.deserialize(buffer, blobs);
        for (const callback of messageCallbacks)
          callback(data);
      });
    } else {
      return ServerEvents.sendServerMessage.connect((player, sentMessage, { buffer, blobs }) => {
        const messageCallbacks = this.serverCallbacks.get(sentMessage) ?? [];
        if (messageCallbacks.size() === 0) return;

        const serializer = this.getSerializer(sentMessage)
        const data = serializer.deserialize(buffer, blobs);
        for (const callback of messageCallbacks)
          callback(player, data);
      });
    }
  }

  public static onServerMessage<Kind extends Message>(message: Kind, callback: ServerMessageCallback<MessageData[Kind]>): () => void {
    if (!this.serverCallbacks.has(message))
      this.serverCallbacks.set(message, []);

    const callbacks = this.serverCallbacks.get(message)!;
    callbacks.push(callback as ClientMessageCallback);
    this.serverCallbacks.set(message, callbacks);
    return () => callbacks.remove(callbacks.indexOf(callback as ClientMessageCallback));
  }

  public static onClientMessage<Kind extends Message>(message: Kind, callback: ClientMessageCallback<MessageData[Kind]>): () => void {
    if (!this.clientCallbacks.has(message))
      this.clientCallbacks.set(message, []);

    const callbacks = this.clientCallbacks.get(message)!;
    callbacks.push(callback as ClientMessageCallback);
    this.clientCallbacks.set(message, callbacks);
    return () => callbacks.remove(callbacks.indexOf(callback as ClientMessageCallback));
  }

  public static emitServer<Kind extends Message>(message: Kind, data: MessageData[Kind], unreliable = false): void {
    const send = unreliable ? ClientEvents.sendUnreliableServerMessage : ClientEvents.sendServerMessage;
    send(message, this.getPacket(message, data));
  }

  public static emitClient<Kind extends Message>(player: Player, message: Kind, data: MessageData[Kind], unreliable = false): void {
    const send = unreliable ? ServerEvents.sendUnreliableClientMessage : ServerEvents.sendClientMessage;
    send(player, message, this.getPacket(message, data));
  }

  public static emitAllClients<Kind extends Message>(message: Kind, data: MessageData[Kind], unreliable = false): void {
    const send = unreliable ? ServerEvents.sendUnreliableClientMessage : ServerEvents.sendClientMessage;
    send.broadcast(message, this.getPacket(message, data));
  }

  private static getPacket<Kind extends Message>(message: Kind, data: MessageData[Kind], unreliable = false): SerializedPacket {
    const serializer = this.getSerializer(message);
    return serializer.serialize(data);
  }

  private static getSerializer<Kind extends Message>(message: Kind): Serializer<MessageData[Kind]> {
    return this.serializers[message];
  }
}