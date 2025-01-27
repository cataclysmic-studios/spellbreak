import { Networking } from "@flamework/networking";
import { MessageKind } from "./structs/messages/kind";

type MessageEvent = (kind: MessageKind, packet: SerializedPacket) => void;
type UnreliableMessageEvent = Networking.Unreliable<MessageEvent>;

interface ServerEvents {
	sendServerMessage: MessageEvent;
	sendUnreliableServerMessage: UnreliableMessageEvent;
}

interface ClientEvents {
	sendClientMessage: MessageEvent;
	sendUnreliableClientMessage: UnreliableMessageEvent;
}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();