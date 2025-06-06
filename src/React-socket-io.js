import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function ReactSocket({
  KitchenName,
  currentDate,
  FetchOrders,
  setOrderDataFromSocket,
  setOpenOrderAlert,
}) {
  const socketRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");

  useEffect(() => {
    const socket = io(process.env.REACT_APP_NOTIFICATION_SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 2000,
      timeout: 5000,
      query: { type: "kitchen_frontend_app", KitchenName },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionStatus("Connected");
      console.log("Connected", socket.id);
    });

    socket.on("disconnect", (reason) => {
      setConnectionStatus("Disconnected: " + reason);
    });

    socket.on("reconnect", () => {
      setConnectionStatus("Reconnected");
    });

    socket.on("connect_error", (e) => {
      console.error("Connection error", e);
    });

    const pingInterval = setInterval(() => {
      if (socket.connected) socket.emit("ping");
    }, 30000);

    socket.on("pong", () => {
      console.log("Pong received");
    });

    socket.on(KitchenName, (arg) => {
      console.log("Received order", arg);
      if (
        arg?.internal_order_status === "pending" &&
        arg?.delivery_date === currentDate
      ) {
        setOpenOrderAlert(true);
      }

      if (
        [
          "driver pickup pending",
          "driver picked the order",
          "order delivered",
        ].includes(arg?.internal_order_status)
      ) {
        FetchOrders();
      } else {
        setOrderDataFromSocket(arg);
      }
    });

    return () => {
      clearInterval(pingInterval);
      socket.disconnect();
    };
  }, [KitchenName]);

  return <div>Socket Status: {connectionStatus}</div>;
}
