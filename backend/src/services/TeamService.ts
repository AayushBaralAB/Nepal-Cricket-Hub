import { cricketData } from './CricketDataService';

export class TeamService {
  list() {
    return cricketData.getTeams();
  }

  getBySlug(slug: string) {
    return cricketData.getTeamBySlug(slug);
  }

  listForType(teamType: string) {
    return cricketData.getTeams().filter((t) => t.teamType === teamType);
  }

  squadByTeamSlug(slug: string) {
    const team = cricketData.getTeamBySlug(slug);
    if (!team) return [];
    return cricketData
      .getPlayers()
      .filter((p) => p.teamId === team.externalId || p.country?.toLowerCase() === team.name.toLowerCase())
      .map((p) => ({ ...p, teamName: team.name }));
  }
}

export const teamService = new TeamService();
