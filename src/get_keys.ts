import { IncomingOutgoing } from "./types";

export function getKeyInOutNext(incomingOutgoing: IncomingOutgoing, nextNodeId: string): string {
    switch (incomingOutgoing) {
        case IncomingOutgoing.Incoming:
            return "incoming-fromnext-" + nextNodeId;
        case IncomingOutgoing.Outgoing:
            return "outgoing-tonext-" + nextNodeId;
        default:
            throw new Error("Not possible");
    }
}
