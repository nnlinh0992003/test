import { defineConfig } from 'vite';
import { Route } from 'react-router-dom';
export type ApiResponse<T> = {
  code: number;
  message: string;
  data?: T;
};

export type PageResponse<T> = {
  pageData: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
};

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  address?: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
  fcmToken?: string | null;
};

export type Token = {
  token: string;
};

export enum Role {
  ROLE_USER, ROLE_ADMIN
};

export type User = {
  userId: string; 
  fullName: string;
  phone?: string | null;
  address?: string | null;
};

export type UserUpdateMeRequest = {
  fullName?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type ObjectFilterRequest = {
  name: string | null;
  location: string | null;
  dateCaptured: string | null;
  status: string | null;
  category: string | null;
  cameraId: string | null;
  keyword: string | null;
  type: string | "";
  keyId: string | null;
  isPaged?: boolean | null;
  page: number | null;
  size: number | null;
  scheduleId: string | null;
};

export type EventFilterRequest = {
  startTime: string | null;
  endTime: string | null;
  eventStatus: string | null;
  status: string | null;
  category: string | null;
  cameraId: string | null;
  location: string | null;
  name: string | null;
  confidence: number | null;
  level: number | null;
  keyword: string | null;
  page: number | null;
  size: number | null;
};

export type SearchObjectsParams = {
  keyword: string;
  page: number;
  size: number;
};

export type StatisticParams = {
  cameraId?: string | null,
  startDate?: string | null;
  endDate?: string | null;
}

export enum EventStatus {
  NEW = "NEW",
  UPDATED = "UPDATED",
  REPAIR = "REPAIR",
  LOST = "LOST"
};

export type Event = {
  id: string;
  infraObject: InfraObject;
  dateCaptured: string;
  description: string;
  eventStatus: EventStatus;
  status: InfraStatus;
  endTime: string;
  level: number;
  confidence: number;
  image: InfraImage;
  scheduleId: string;
  verified: boolean;
  bbox: string;
  realWidth: number;
  realHeight: number;
  eventTicket: ProcessTicket
};

export type FakeEvent = {
  id: string;
  latitude: string;
  longitude: string;
  category: InfraCategory;
  name: string;
  confidence: number;
  status: InfraStatus;
  time: string;
  location: string;
  image: InfraImage;
};

export type InfraImage = {
  id: string;
  fileName: string;
  height: number;
  width: number;
  pathUrl: string;
  frame?: number;
};

export type InfraObject = {
  manageUnit: string;
  id: string;
  cameraId: string;
  dateCaptured: string;
  longitude: number;
  latitude: number;
  location: string;
  category: InfraCategory;
  name: string;
  image: InfraImage;
  status: InfraStatus;
  confidence: number;
  level:number;
  scheduleId: string;
  isUpdated: boolean;
  type: InfraType;
  bbox: string;
  realWidth: number;
  realHeight: number;
  info: InfraInfo;
};

export type CameraUser = {
  id: string;
  userId: string;  
};

export enum CameraStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
};

export type Camera = {
  id: string;
  name: string;
  rtsp: string;
  ipAddress: string;
  port: number;
  cameraStatus: CameraStatus;
  createdAt: string;
  updatedAt: string;
  cameraUserList: CameraUser[];
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt: string;
  additionalData?: string | null; // e.g., {cameraId=1, latitude=15.345678, name=lamp post, time=2024-11-17T21:02:52, type=New object detected, category=lamp, status=NOT OK, urlImage=data/052507897132.jpg, longitude=-32.123132}
};

export type ReportGenerateRequest = {
  cameraId: string;
  startTime?: string;
  endTime?: string;
};

export enum InfraCategory {
  SIGN = "SIGN",
  ROAD = "ROAD",
  LAMP = "LAMP",
  GUARDRAIL = "GUARDRAIL"
};

export enum InfraType {
  ASSET = "ASSET",
  ABNORMALITY = "ABNORMALITY",
};


export enum InfraStatus {
  OK = "OK", 
  NOT_OK = "NOT OK",
  LOST = "LOST",
};

// dashboard
export type EventStatistic = {
  dateCaptured: string,
  count: number 
}

export type ObjectStatistic={
  category:string,
  status: InfraStatus,
  count: number
}

export type Statistic = {
  eventStatistics: EventStatistic[],
  objectStatistics: ObjectStatistic[]
}

export enum ReportType {
  PDF = "PDF", 
  EXCEL = "EXCEL"
};

export type UpdateObjectRequest = {
  infraId: string;
  longitude: number;
  latitude: number;
  category: string;
  name: string;
  status: string;
  additional: string;
  manageUnit: string;
};

export type DataCreateScheduling = {
  startTime: string;
  endTime: string;
  cameraId: string;
  deviceCode: string;
  vehicle: string;
  driver: string;
  route: string;
};

export type SchedulingFilterRequest = {
  cameraId: string;
  startTime: string;
  endTime: string;
  status: string;
};

export type Scheduling = {
  id: string,
  startTime: string,
  endTime: string,
  cameraId: string,
  videoUrl: string,
  gpsLogsUrl: string,
  schedulingStatus: SchedulingStatus
  videoDetectUrl: string;
  deviceCode: string;
  vehicle: string;
  driver: string;
  route: string;
};

export enum SchedulingStatus{
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  DONE = "DONE",
  FAILED = "FAILED",
};

export type CreateCameraRequest = {
  name: string;
  // rtsp: string;
  ipAddress: string;
  port: string;
  username: string;
  password: string;
  cameraUserList: { userId: string }[];
};

export type UpdateCameraRequest = {
  name?: string;
  rtsp?: string;
  ipAddress?: string;
  port?: number;
  username?: string;
  password?: string;
  cameraUserList?: { userId: string }[];
};

export type History = {
  id: string;
  dateCaptured: string;
  status: InfraStatus;
  confidence: number;
  level: number;
  scheduleId: string;
  image: InfraImage;
};

export type GpsLog = {
  timestamp: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  altitude: number;
  bearing: number;
};

export type AddInfrastructureObjectRequest = {
  cameraId: string;
  longitude: number;
  latitude: number;
  category: string;
  name: string;
  status: string;
  additional: string;
  manageUnit: string;
};

export type InfraInfo = {
  id: string;
  keyId: string;
  originalImage: string;
  avatar: string;
  manageUnit: string;
  additionalData: string;
  createdAt: string;
};

export enum ProcessStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
};

export type InfraObjectProcess = {
  id: string;
  cameraId: string;
  dateCaptured: string;
  longitude: number;
  latitude: number;
  category: InfraCategory;
  name: string;
  status: InfraStatus;
  confidence: number;
  level: number;
  location: string;
  scheduleId: string;
  bbox: string;
  realWidth: number;
  realHeight: number;
  eventStatus: EventStatus;
  type: InfraType;
  image: InfraImage;
  processStatus: ProcessStatus;
  infraObject: InfraObject;
  keyId: string;
  processTicket: ProcessTicket;
};

export type FilterProcessRequests = {
  scheduleId: string;
  status: string;
  processStatus: string;
  eventStatus: string;
  category: string;
  type: string;
};

export type UndetectedObject = {
  id: number;
  scheduleId: string;
  timeStamp: number;
  infraObject: InfraObject;
}

export type ProcessModelRequest = {
  processStatus?: string;
  status?: string;
  priority?: string;
  note?: string;
  eventStatus?: string;
  assignedTo?: string;
  subname?: string;
  subcategory?: string;
  additionalData?: string;
  manageUnit?: string;
}


export type RejectProcessRequest = {
  infraProcessId?: string;
  title: string;
  description: string;
}

export type AcceptProcessRequest = {
  infraProcessId: string;
  title: string;
  description: string;
  name:string;
  additionalData: string;
  manageUnit: string;
  level: number;
  assignedTo: string;
}

export type ProcessTicket = {
  id:number;
  title: string;
  description: string;
  createAt: string;
  updatedAt: string;
  level: number;
  ticketStatus: string;
  assignedTo: string;
}
