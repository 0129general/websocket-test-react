import React from "react";
// import ReactSocket from "./React-socket-io";
import SocketTestInterface from "./components/SocketTestInterface";

function App() {
  return (
    <div>
      <SocketTestInterface />
      {/* <hr style={{ margin: '20px 0' }} />
      <ReactSocket
        KitchenName="MainKitchen"
        currentDate="2025-06-05"
        FetchOrders={() => console.log("FetchOrders called")}
        setOrderDataFromSocket={(data) => console.log("SetOrderData", data)}
        setOpenOrderAlert={(bool) => console.log("Show Alert", bool)}
      /> */}
    </div>
  );
}

export default App;
