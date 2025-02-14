"use client";

import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

interface CameraContextType {
  stream: MediaStream | null;
  playerRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  notSupported: boolean;
  permissionDenied: boolean;
  activeDeviceId: string | undefined;
  devices: MediaDeviceInfo[];
  numberOfCameras: number;
  images: string[];
  initCameraStream: () => Promise<void>;
  takePhoto: () => string | undefined;
  stopStream: () => void;
  switchCamera: () => void;
  addImage: (imageData: string) => void;
  removeImage: (index: number) => void;
  resetImages: () => void;
  setActiveDeviceId: (deviceId: string) => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [notSupported, setNotSupported] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [activeDeviceId, setActiveDeviceId] = useState<string>();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  const playerRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (playerRef.current) {
        playerRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const initCameraStream = async () => {
    stopStream();

    if (!navigator.mediaDevices?.getUserMedia) {
      setNotSupported(true);
      return;
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: activeDeviceId ? { exact: activeDeviceId } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 16/9 }
        }
      });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      setDevices(videoDevices);
      setNumberOfCameras(videoDevices.length);
      setStream(newStream);
      
      if (playerRef.current) {
        playerRef.current.srcObject = newStream;
      }

      if (!activeDeviceId && videoDevices.length > 0) {
        setActiveDeviceId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Camera initialization error:', error);
      if ((error as Error).name === 'NotAllowedError') {
        setPermissionDenied(true);
      } else {
        setNotSupported(true);
      }
    }
  };

  const takePhoto = (): string | undefined => {
    if (!playerRef.current || !canvasRef.current || !containerRef.current) return;

    const video = playerRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const videoAspect = videoWidth / videoHeight;
    const containerAspect = containerWidth / containerHeight;

    let drawWidth: number;
    let drawHeight: number;
    let offsetX = 0;
    let offsetY = 0;

    if (videoAspect > containerAspect) {
      drawHeight = videoHeight;
      drawWidth = videoHeight * containerAspect;
      offsetX = (videoWidth - drawWidth) / 2;
    } else {
      drawWidth = videoWidth;
      drawHeight = videoWidth / containerAspect;
      offsetY = (videoHeight - drawHeight) / 2;
    }

    canvas.width = drawWidth;
    canvas.height = drawHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight, 0, 0, drawWidth, drawHeight);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const switchCamera = () => {
    if (devices.length <= 1) return;
    
    const currentIndex = devices.findIndex(d => d.deviceId === activeDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setActiveDeviceId(devices[nextIndex].deviceId);
  };

  const addImage = (imageData: string) => {
    setImages(prev => [...prev, imageData]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const resetImages = () => {
    setImages([]);
  };

  return (
    <CameraContext.Provider value={{
      stream,
      playerRef,
      canvasRef,
      containerRef,
      notSupported,
      permissionDenied,
      activeDeviceId,
      devices,
      numberOfCameras,
      images,
      initCameraStream,
      takePhoto,
      stopStream,
      switchCamera,
      addImage,
      removeImage,
      resetImages,
      setActiveDeviceId
    }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return context;
};