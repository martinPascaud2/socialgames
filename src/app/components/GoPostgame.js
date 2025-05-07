import { deleteRoom } from "./Room/actions";
import cancelBack from "@/utils/cancelBack";

import { StaticNextStep } from "./NextStep";

export default function GoPostgame({ postgameRef, isAdmin, roomId, user }) {
  return (
    <StaticNextStep
      onClick={async () => {
        isAdmin && (await deleteRoom({ roomId }));
        await cancelBack({ userId: user.id });

        if (!user.multiGuest) {
          window.location.href = postgameRef;
        } else {
          window.location.href = "/";
        }
      }}
    >
      Quitter
    </StaticNextStep>
  );
}
