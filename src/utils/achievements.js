import { supabase } from '../lib/supabase';

export async function checkAchievements(playerId) {
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();

  if (playerError) {
    console.error('Error fetching player data:', playerError);
    return;
  }

  const { data: achievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*');

  if (achievementsError) {
    console.error('Error fetching achievements:', achievementsError);
    return;
  }

  const { data: unlockedAchievements, error: unlockedError } = await supabase
    .from('player_achievements')
    .select('achievement_id')
    .eq('player_id', playerId);

  if (unlockedError) {
    console.error('Error fetching unlocked achievements:', unlockedError);
    return;
  }

  const unlockedIds = unlockedAchievements.map(a => a.achievement_id);

  for (const achievement of achievements) {
    if (!unlockedIds.includes(achievement.id)) {
      if (evaluateCondition(achievement.condition, playerData)) {
        await supabase
          .from('player_achievements')
          .insert([{ player_id: playerId, achievement_id: achievement.id }]);

        console.log(`Achievement unlocked: ${achievement.name}`);
      }
    }
  }
}

function evaluateCondition(condition, playerData) {
  // Replace this with a safer way to evaluate conditions
  // For example, you could use a switch statement or if-else clauses
  // based on predefined condition types
  switch (condition) {
    case 'games_played > 10':
      return playerData.games_played > 10;
    case 'wins > 5':
      return playerData.wins > 5;
    // Add more cases as needed
    default:
      return false;
  }
}
