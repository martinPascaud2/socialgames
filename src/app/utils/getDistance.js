export default function getDistance({ adminLocation, incomerLocation }) {
  const { latitude: adminLat, longitude: adminLon } = adminLocation;
  const { latitude: incomerLat, longitude: incomerLon } = incomerLocation;

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const earthRadius = 6371;
  const dLat = deg2rad(incomerLat - adminLat);
  const dLon = deg2rad(incomerLon - adminLon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(adminLat)) *
      Math.cos(deg2rad(incomerLat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c * 1000;
  return distance;
}
