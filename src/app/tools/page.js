import getUser from "@/utils/getUser";

import Tools from "./Tools";

export default async function ToolsPage() {
  const user = await getUser();

  const userParams = user.params;
  const barsSizes = {
    bottom: userParams?.bottomBarSize || 8,
    top: userParams?.topBarSize || 8,
  };

  return (
    <>
      <div
        className={`fixed h-[${barsSizes.top / 4}rem] w-full z-[70] bg-black`}
        style={{
          height: `${barsSizes.top / 4}rem`,
        }}
      />
      <div
        className={`fixed h-[${
          barsSizes.bottom / 4
        }rem] w-full z-[70] bg-black bottom-0`}
        style={{ height: `${barsSizes.bottom / 4}rem` }}
      />

      <div className="absolute h-full w-full z-0 flex flex-col items-center justify-start">
        <div
          className={`overflow-y-auto z-[60] w-full`}
          style={{
            height: `calc(100dvh - ${barsSizes.top / 4}rem)`,
            marginTop: `${barsSizes.top / 4}rem`,
            marginBottom: `${barsSizes.bottom / 4}rem`,
          }}
        >
          <Tools user={user} />
        </div>
      </div>
    </>
  );
}
