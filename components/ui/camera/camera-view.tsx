"use client";

import React, { useEffect, useImperativeHandle } from 'react';
import { useCamera } from './camera-provider';
import { CameraProps, defaultErrorMessages } from './camera-types';
import { TriangleAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WarningMessage = ({ 
  message, 
  show, 
  onDismiss 
}: { 
  message: string; 
  show: boolean; 
  onDismiss: () => void;
}) => {
  if (!show) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-50 m-4">
      <div className="rounded-lg bg-yellow-50 p-4 shadow-lg">
        <div className="flex items-center">
          <TriangleAlert className="h-5 w-5 text-yellow-400" />
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-yellow-800">{message}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-yellow-500 hover:text-yellow-600"
            onClick={onDismiss}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const CameraView = React.forwardRef<unknown, CameraProps>(
  ({ 
    errorMessages = defaultErrorMessages,
    videoReadyCallback = () => null,
  }, ref) => {
    const {
      playerRef,
      canvasRef,
      containerRef,
      notSupported,
      permissionDenied,
      activeDeviceId,
      initCameraStream,
      takePhoto,
      stopStream,
    } = useCamera();

    useImperativeHandle(ref, () => ({
      takePhoto,
      stopCamera: stopStream,
    }));

    useEffect(() => {
      initCameraStream();
      return () => {
        stopStream();
      };
    }, [activeDeviceId]);

    return (
      <div 
        ref={containerRef}
        className="relative h-full min-h-[calc(100vh-4rem)] w-full bg-muted"
      >
        <WarningMessage
          message={errorMessages.noCameraAccessible || defaultErrorMessages.noCameraAccessible!}
          show={notSupported}
          onDismiss={() => window.location.reload()}
        />
        
        <WarningMessage
          message={errorMessages.permissionDenied || defaultErrorMessages.permissionDenied!}
          show={permissionDenied}
          onDismiss={() => window.location.reload()}
        />

        <video
          ref={playerRef}
          className="h-full w-full object-cover"
          autoPlay
          playsInline
          muted
          onLoadedData={videoReadyCallback}
        />
        
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>
    );
  }
);

CameraView.displayName = 'CameraView';