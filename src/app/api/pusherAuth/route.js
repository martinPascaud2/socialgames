import { NextResponse } from "next/server";

import pusher from "@/utils/pusher";

export async function POST(request) {
  const body = await request.text();
  const params = new URLSearchParams(body);

  const channelName = params.get("channel_name");
  const socketId = params.get("socket_id");
  const userId = params.get("userId");
  const userName = params.get("userName");
  const multiguest = params.get("multiGuest") === true;
  //   const lastPing = params.get("lastPing");

  //to be done?: check user_authorization

  const presenceData = {
    user_id: userId,
    user_info: { userId, userName, multiguest },
    // user_info: { userId, userName, multiguest, lastPing },
  };
  const authResponse = pusher.authorizeChannel(
    socketId,
    channelName,
    presenceData
  );
  return NextResponse.json(authResponse);
}
