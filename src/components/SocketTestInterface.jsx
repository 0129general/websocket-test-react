import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const SocketTestInterface = () => {
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [orders, setOrders] = useState([]);
  const [socket, setSocket] = useState(null);
  const [kitchenName, setKitchenName] = useState("MainKitchen");
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prev) => [
      ...prev,
      { timestamp: new Date().toISOString(), message },
    ]);
  };

  const node_server_url =
    "https://websocket-apptest-b6c51ecc78a9.herokuapp.com";
  const socket_server_url =
    "wss://websocket-apptest-b6c51ecc78a9.herokuapp.com";
  // console.log("node:", node_server_url);
  // console.log("socket:", socket_server_url);
  console.log("socket:", socket);
  useEffect(() => {
    const newSocket = io(socket_server_url || "http://localhost:3001", {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      query: {
        type: "kitchen_frontend_app",
        KitchenName: kitchenName,
      },
      transports: ["websocket"],
      forceNew: true,
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setConnectionStatus("Connected");
      addLog(`Connected to server (Socket ID: ${newSocket.id})`);
    });

    newSocket.on("disconnect", (reason) => {
      setConnectionStatus(`Disconnected: ${reason}`);
      addLog(`Disconnected: ${reason}`);
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      addLog(`Reconnection attempt #${attemptNumber}`);
    });

    newSocket.on("reconnect", () => {
      setConnectionStatus("Reconnected");
      addLog("Reconnected successfully");
    });

    newSocket.on("connect_error", (error) => {
      addLog(`Connection error: ${error.message}`);
    });

    newSocket.on(kitchenName, (order) => {
      addLog(`Received order: ${JSON.stringify(order)}`);
      setOrders((prev) => [...prev, order]);
    });

    // Custom ping/pong
    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit("ping");
        addLog("Ping sent");
      }
    }, 25000);

    newSocket.on("pong", () => {
      addLog("Pong received");
    });

    return () => {
      clearInterval(pingInterval);
      newSocket.disconnect();
    };
  }, [kitchenName, socket_server_url]);

  const createTestOrder = async () => {
    try {
      const response = await fetch(`${node_server_url}/test-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kitchen_name: kitchenName,
        }),
      });
      const data = await response.json();
      addLog(`Test order created: ${JSON.stringify(data)}`);
    } catch (error) {
      addLog(`Error creating test order: ${error.message}`);
    }
  };

  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${node_server_url}/status`);
      const data = await response.json();
      addLog(`Server status: ${JSON.stringify(data)}`);
    } catch (error) {
      addLog(`Error checking server status: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>Socket.IO Test Interface</h2>

      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      >
        <h3>Connection Status</h3>
        <p
          style={{
            color: connectionStatus.includes("Connected") ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {connectionStatus}
        </p>
        <input
          type="text"
          value={kitchenName}
          onChange={(e) => setKitchenName(e.target.value)}
          placeholder="Kitchen Name"
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button
          onClick={createTestOrder}
          style={{ marginRight: "10px", padding: "5px 10px" }}
        >
          Create Test Order
        </button>
        <button onClick={checkServerStatus} style={{ padding: "5px 10px" }}>
          Check Server Status
        </button>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        <div
          style={{
            flex: 1,
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "15px",
          }}
        >
          <h3>Received Orders</h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {orders.map((order, index) => (
              <div
                key={index}
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "3px",
                }}
              >
                <p>
                  <strong>Order ID:</strong> {order.order_id}
                </p>
                <p>
                  <strong>Status:</strong> {order.internal_order_status}
                </p>
                <p>
                  <strong>Kitchen:</strong> {order.kitchen_name}
                </p>
                <p>
                  <strong>Delivery Date:</strong> {order.delivery_date}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "15px",
          }}
        >
          <h3>Connection Logs</h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {logs.map((log, index) => (
              <div
                key={index}
                style={{
                  padding: "5px",
                  marginBottom: "5px",
                  borderBottom: "1px solid #eee",
                  fontSize: "0.9em",
                }}
              >
                <span style={{ color: "#666" }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span style={{ marginLeft: "10px" }}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocketTestInterface;
