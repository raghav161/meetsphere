"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";

import { useGetCallById } from "@/hooks/useGetCallById";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Table = ({
  title,
  description,
  editable = false,
  onDescriptionChange,
}: {
  title: string;
  description: string;
  editable?: boolean;
  onDescriptionChange?: (newDescription: string) => void;
}) => {
  return (
    <div className="flex flex-col items-start gap-2 xl:flex-row">
      <h1 className="text-base font-medium text-sky-1 lg:text-xl xl:min-w-32">
        {title}:
      </h1>
      {editable ? (
        <input
          type="text"
          value={description}
          onChange={(e) => onDescriptionChange?.(e.target.value)}
          className="truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl bg-transparent border-b border-white outline-none"
        />
      ) : (
        <h1 className="truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl">
          {description}
        </h1>
      )}
    </div>
  );
};

const PersonalRoom = () => {
  const router = useRouter();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const { toast } = useToast();

  const meetingId = user?.id;
  const [topic, setTopic] = useState(`${user?.username}'s Meeting Room`);

  const { call } = useGetCallById(meetingId!);

  const startRoom = async () => {
    if (!client || !user) 
      return;

    const newCall = client.call("default", meetingId!);

    if (!call) {
      await newCall.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
        },
      });
    }

    router.push(`/meeting/${meetingId}?personal=true`);
  };

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}?personal=true`;

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-xl font-bold lg:text-3xl">Personal Meeting Room</h1>
      <div className="flex w-full flex-col gap-8 xl:max-w-[900px]">
        <Table 
          title="Topic" 
          description={topic}
          editable={true}
          onDescriptionChange={setTopic}
        />
        <Table title="Meeting ID" description={meetingId!} />
        <Table title="Invite Link" description={meetingLink} />
      </div>
      <div className="flex gap-5">
        <Button className="bg-blue-1" onClick={startRoom}>
          Start Meeting
        </Button>
        <Button
          className="bg-dark-3"
          onClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({
              title: "Link Copied",
            });
          }}
        >
          Copy Invitation
        </Button>
      </div>
    </section>
  );
};

export default PersonalRoom;
