export type FacingMode = 'user' | 'environment';
export type Stream = MediaStream | null;

export interface CameraProps {
  numberOfCamerasCallback?(numberOfCameras: number): void;
  videoSourceDeviceId?: string;
  errorMessages?: ErrorMessages;
  videoReadyCallback?(): void;
}

export interface ErrorMessages {
  noCameraAccessible?: string;
  permissionDenied?: string;
  switchCamera?: string;
  canvas?: string;
}

export const defaultErrorMessages: ErrorMessages = {
  noCameraAccessible: "No camera device accessible. Please connect your camera or try a different browser.",
  permissionDenied: "Permission denied. Please refresh and give camera permission.",
  switchCamera: "It is not possible to switch camera to different one because there is only one video device accessible.",
  canvas: "Canvas is not supported.",
};