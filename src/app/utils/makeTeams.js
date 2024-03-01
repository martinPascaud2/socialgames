import shuffleArray from "./shuffleArray";

export default function makeTeams({ gamersList, numberByTeam }) {
  const shuffled = shuffleArray(gamersList);

  const teams = {};
  let index = 0;
  while (shuffled.length >= numberByTeam) {
    const team = shuffled.splice(0, numberByTeam);
    teams[index] = team;
    index++;
  }

  index = 0;
  while (index < shuffled.length) {
    const team = teams[index];
    const newTeam = [...team, shuffled[index]];
    teams[index] = newTeam;
    index++;
  }

  return teams;
}
