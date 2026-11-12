import { randomInt } from 'node:crypto';

// First online slice: wave 1 of Trilhas de Viridian. This pool corresponds
// to the forest entry in region-hunts.js, using National Pokédex IDs.
export const FIRST_ONLINE_HUNT = 'viridian-trails';
const VIRIDIAN_SPECIES = [10, 13, 16, 19, 21];

export class HuntUnavailableError extends Error {}

export async function buildFirstHuntSnapshot(connection, playerId, huntKey) {
  if (huntKey !== FIRST_ONLINE_HUNT) {
    throw new HuntUnavailableError('Esta caçada ainda não está disponível online.');
  }

  // Until formation editing is available online, use one eligible partner.
  // Lock it so a concurrent inventory operation cannot change this snapshot.
  const { rows: [partner] } = await connection.query(
    `SELECT id, pokemon_id, level, stars
       FROM public.inventory
      WHERE owner_id = $1 AND is_listed = false
      ORDER BY id
      LIMIT 1
      FOR UPDATE`,
    [playerId]
  );
  if (!partner) {
    throw new HuntUnavailableError('Você precisa de um Pokémon disponível para explorar.');
  }

  return {
    version: 1,
    wave: 1,
    allies: [partner],
    enemies: [{ pokemon_id: VIRIDIAN_SPECIES[randomInt(VIRIDIAN_SPECIES.length)], level: 1 }]
  };
}
