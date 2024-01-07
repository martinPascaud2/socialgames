import { subCategories } from "@/assets/globals";

export const checkGuestAllowed = (href) => {
  const allowedPaths = [];
  for (const subCat in subCategories) {
    subCategories[subCat].map((game) => {
      allowedPaths.push(`categories/${subCat}/${game.path}`);
    });
  }

  const pattern = new RegExp(
    `^${process.env.NEXT_PUBLIC_APP_URL}\\/(?:${allowedPaths.join(
      "|"
    )})\\?token=[A-Za-z0-9]+&guestName=[A-Za-z0-9]+$`
  );
  const isGuestAllowed = pattern.test(href);

  return isGuestAllowed;
};
