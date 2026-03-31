// Maps IPL team full names to their logo paths in public/assets/
export const TEAM_LOGOS: Record<string, string> = {
  "Mumbai Indians": "/assets/mumbai-indian.png",
  "Chennai Super Kings": "/assets/chennai-super-kings.png",
  "Royal Challengers Bengaluru": "/assets/royal-challenger-bangalore.png",
  "Kolkata Knight Riders": "/assets/kolkatta-knight-rider.png",
  "Delhi Capitals": "/assets/delhi-capitals.png",
  "Punjab Kings": "/assets/panjab-kings.png",
  "Rajasthan Royals": "/assets/rajasthan-royals.png",
  "Sunrisers Hyderabad": "/assets/hydrabad.png",
  "Gujarat Titans": "/assets/gujarat-titan.png",
  "Lucknow Super Giants": "/assets/lucknow-super-giants.png",
};

export function getTeamLogo(teamName: string): string | null {
  return TEAM_LOGOS[teamName] ?? null;
}
