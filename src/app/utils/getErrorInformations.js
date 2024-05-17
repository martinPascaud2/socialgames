import { getIsIos, getBrowserName, getIsPwa } from "./detectEnvironment";

export default function getErrorInformations({ window, fail }) {
  const isIos = getIsIos({ window });
  const browserName = getBrowserName({ window });
  const isPwa = getIsPwa({ window });

  let response = ["Veuillez activer votre géolocalisation."];

  switch (fail) {
    case "location_permission":
      if (isIos) {
        if (isPwa) {
          ["Paramètres", browserName, "Position"].map((info) =>
            response.push(info)
          );
        } else {
          switch (browserName) {
            case "Safari":
              [
                "aA (à gauche de l'adresse de ce site)",
                "Réglages du site web",
                "Position",
              ].map((info) => response.push(info));
              break;
            default:
              ["Paramètres", browserName, "Position"].map((info) =>
                response.push(info)
              );
          }
        }
      } else {
        if (isPwa) {
          ["Paramètres", "Applications", browserName, "Autorisations"].map(
            (info) => response.push(info)
          );
        } else {
          switch (browserName) {
            case "Chrome":
              [
                "...",
                "Paramètres",
                "Confidentialité et sécurité",
                "Paramètres des sites",
                "Position",
              ].map((info) => response.push(info));
              break;
            case "Firefox":
              [
                "Paramètres",
                "Vie privée et sécurité",
                "Localisation",
                "Autoriser",
              ].map((info) => response.push(info));
              break;
            case "Edge":
              [
                "Verrouiller (coin de la barre d'adresse)",
                "Autorisations du site",
                "Localisation",
                "Autoriser",
              ].map((info) => response.push(info));
              break;
            case "Opera":
              [
                "...",
                "Paramètres",
                "Site Web",
                "Autorisations de localisation",
                "Autoriser",
              ].map((info) => response.push(info));
              break;
            default:
              ["Paramètres", "Applications", browserName, "Autorisations"].map(
                (info) => response.push(info)
              );
          }
        }
      }
      break;
  }
  response.push("Rafraîchissez cette page");

  return response;
}
