'use client';
import { useEffect, useState } from 'react';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';

import Alert from './Alert';
import { Button } from './ui/button';

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#call-state
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived = callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();

  if (!call) {
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );
  }

  // https://getstream.io/video/docs/react/ui-cookbook/replacing-call-controls/
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  useEffect(() => {
    if (isCamOn) {
      call.camera.enable();
    } else {
      call.camera.disable();
    }
  }, [isCamOn, call.camera]);

  useEffect(() => {
    if (isMicOn) {
      call.microphone.enable();
    } else {
      call.microphone.disable();
    }
  }, [isMicOn, call.microphone]);

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
      />
    );

  if (callHasEnded)
    return (
      <Alert
        title="The call has been ended by the host"
        iconUrl="/icons/call-ended.svg"
      />
    );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
      <VideoPreview />
      <div className="flex h-16 items-center justify-center gap-3">
        <Button
          className={`rounded-md px-2 py-2 ${isMicOn ? 'bg-red-500' : 'bg-green-500'}`}
          size='sm'
          onClick={() => setIsMicOn((prev) => !prev)}
        >
          {isMicOn ? 'Turn Mic Off' : 'Turn Mic On'}
        </Button>
        <Button
          className={`rounded-md px-2 py-2 ${isCamOn ? 'bg-red-500' : 'bg-green-500'}`}
          size='sm'
          onClick={() => setIsCamOn((prev) => !prev)}
        >
          {isCamOn ? 'Turn Camera Off' : 'Turn Camera On'}
        </Button>
        <DeviceSettings />
      </div>
      <Button
        className="rounded-md bg-blue-500 px-4 py-2.5"
        onClick={() => {
          call.join();
          setIsSetupComplete(true);
        }}
      >
        Join meeting
      </Button>
    </div>
  );
};

export default MeetingSetup;
