/* A Mega uses the final species' complete legal profile, independently of its
 * internal line/star position. Ordinary Pokémon retain their progression. */
window.IDLE_MEGA_MOVES={
 complete(line,star,resolve){
  const names={SHADOW_BALL:'Bola Sombria',DRAGON_BREATH:'Sopro do Dragão',DOUBLE_KICK:'Chute Duplo',NIGHT_SLASH:'Talho Noturno'};
  return resolve(line,star,true).map(move=>({...move,n:names[move.emerald]||move.n}));
 }
};
