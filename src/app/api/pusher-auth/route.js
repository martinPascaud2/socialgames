// import PusherServer from "pusher"

// const pusher = new Pusher({
//   appId: process.env.PUSHER_APP_ID,
//   key: process.env.PUSHER_KEY,
//   secret: process.env.PUSHER_SECRET,
//   cluster: process.env.PUSHER_CLUSTER,
//   useTLS: true,
// });

// // export default function handler(req, res) {
// //   const { socket_id, channel_name, user_id, user_name } = req.body;

// //   const presenceData = {
// //     user_id,
// //     user_info: {
// //       name: user_name,
// //     },
// //   };

// //   const auth = pusher.authenticate(socket_id, channel_name, presenceData);
// //   res.status(200).send(auth);
// // }

// export async function POST(req) {
//     console.log("authenticating pusher perms...")
//     const data = await req.text();
//     const [socketId, channelName] = data
//       .split("&")
//       .map((str) => str.split("=")[1]);

//     // logic to check user permissions

//     const authResponse = pusherServer.authorizeChannel(socketId, channelName);

//     return new Response(JSON.stringify(authResponse));
//   }

import pusher from "@/utils/pusher";

export async function POST(req) {
  console.log("authenticating pusher perms...");
  console.log("req", req);
  const data = await req.text();
  const [socketId, channelName] = data
    .split("&")
    .map((str) => str.split("=")[1]);

  console.log("socketId", socketId);
  console.log("channelName", channelName);

  // logic to check user permissions

  const authResponse = pusher.authorizeChannel(socketId, channelName);
  console.log("authResponse", authResponse);

  return new Response(JSON.stringify(authResponse));
}
