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
      <div className="absolute h-full w-full z-0 bg-white">
        <div
          className={`overflow-y-auto z-[60] w-full`}
          style={{
            height: "100vh",
            paddingTop: `${barsSizes.top / 4}rem`,
            paddingBottom: `${barsSizes.bottom / 4}rem`,
          }}
        >
          <Tools user={user} />
        </div>
      </div>
    </>
  );
}
