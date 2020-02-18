import io from "socket.io-client";
import { socketUrl } from "../constants/serverConstants";

function generateSocket() {
  return io(socketUrl);
}

export default generateSocket;
