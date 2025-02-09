import { Networking } from "@flamework/networking";
import { Message } from "./structs/message";

type MessageEvent = (kind: Message, packet: SerializedPacket) => void;
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