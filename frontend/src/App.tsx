import { Route, Routes } from "react-router-dom";
import Login from "./page/auth/Login";
import Register from "./page/auth/Register";
import NotFound from "./page/NotFound";
import Dashboard from "./page/dashboard/Dashboard";
import Layout from "./page/Layout";
import { useEffect, useRef, useState } from "react";
import { onMessageListener, requestToken } from "./firebase";
import Home from "./page/Home";
import MapPage from "./page/map/MapPage";
import useCustomToast from "./hook/useCustomToast";
import { MessagePayload } from "firebase/messaging";
import NotificationDetails from "./page/notification/NotificationDetails";
import { useDispatch } from "react-redux";
import { notificationApi } from "./redux/service/notification";
import Events from "./page/events/Events";
import { infrastructureApi } from "./redux/service/infrastructure";
import ObjectsPage from "./page/objects/Objects";
import Report from "./page/report/Report";
import CameraDashboard from "./page/monitor/MonitorPage.tsx";
import EventDetails from "./page/events/EventDetails";
import InfraJsonViewer from "./component/monitor/InfraJsonViewer.tsx";
import CameraManagementPage from "./page/cameras/CameraManagementPage.tsx";
import FakeEvents from "./page/fake_events/FakeEvents.tsx";
import ObjectDetails from "./page/objects/ObjectDetails.tsx";
import ProcessPage from "./page/monitor/ProcessPage.tsx";
import { FilePage } from "./page/file/File.tsx";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import WebSocket from "./component/common/WebSocket.tsx";
import DevicePage from "./page/cameras/DevicePage.tsx";
export default function App() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const showToast = useCustomToast();
  const dispatch = useDispatch();

  useEffect(() => {
    requestToken(setFcmToken);
    onMessageListener()
      .then((payload: MessagePayload) => {
        console.log("Received FCM message: ", payload);

        // invalidate cache tags to trigger refetch
        dispatch(notificationApi.util.invalidateTags(["Notifications"]));
        dispatch(infrastructureApi.util.invalidateTags(["Objects", "Events"]));

        showToast(
          payload?.notification?.title as string,
          payload?.notification?.body as string,
          "success"
        );
      })
      .catch((err) => console.error("Failed to handle FCM message: ", err));

    navigator?.serviceWorker?.addEventListener("message", (event) => {
      if (event.data?.type === "BACKGROUND_MESSAGE_RECEIVED") {
        console.log("Background message received:", event.data.payload);
        dispatch(notificationApi.util.invalidateTags(["Notifications"]));
        dispatch(infrastructureApi.util.invalidateTags(["Objects", "Events"]));
      }
    });
  }, []);

  const [stompClient, setStompClient] = useState<Client | null>(null);

  useEffect(() => {
    // const socket = new SockJS("http://infrastructure-service:8084/ws");
    const socket = new SockJS("/ws");
    console.log(socket);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Connected to WebSocket");
        setStompClient(client); // ✅ chỉ set sau khi kết nối thành công
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });
  
    client.activate();
  
    // Cleanup nếu component bị unmount
    return () => {
      if (client.active) client.deactivate();
    };
  }, []);
  

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login fcmToken={fcmToken} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/infrastructure" element={<ObjectsPage />} />
          <Route path="/infrastructure/type/:type" element={<ObjectsPage />} />
          <Route path="/infrastructure/:objectId" element={<ObjectDetails />} />
          <Route path="/infrastructure/scheduling/:scheduleId" element={<ObjectsPage />} />
          <Route path="/monitor" element={<CameraDashboard mode="monitor"/>} />
          <Route path="/monitor/status/:status" element={<CameraDashboard mode="monitor"/>} />
          <Route path="/process" element={<CameraDashboard mode="process"/>} />
          <Route path="/process/:scheduleId" element={<ProcessPage stompClient={stompClient} />} />
          <Route path="/notifications/:notificationId" element={<NotificationDetails />} />
          <Route path="/events" element={<Events />} />
          <Route path="/file" element={<FilePage />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="/report" element={<Report />} />a
          <Route path="/schedule/:scheduleId" element={<InfraJsonViewer />} />
          <Route path="/cameras" element={<CameraManagementPage />} />
          <Route path="/devices" element={<DevicePage />} />
          <Route path="/fake-events" element={<FakeEvents />} />
          <Route path="/chat" element={<WebSocket stompClient={stompClient} />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
