# Central de invasões Rocket

Painel baseado na imagem aprovada, gerada pela ferramenta de imagem integrada. Arte: modes/idle/assets/rocket-invasions/panel-v1.png. Edição preservou moldura, retratos, ilustração, ícones e botão; removeu somente campos variáveis para sobreposição nativa. Prompt: preservar composição e detalhes e deixar vazios contador, resgate, adversários, valores de recompensa e estado para dados reais.

Modos → Equipe Rocket → Invasão Rocket. Cartões consultam grupos; não escolhem o evento. Recrutas e dupla desde o início; executivos após oito insígnias; Giovanni após dezesseis. Executivos alternam Proton, Petrel, Ariana e Archer. Sem repetição consecutiva de grupo quando houver alternativa.

Intervalo de 45 minutos, janela de cinco minutos para aceitar. Entrada usa a equipe Idle, sem tokens/tentativas do portal. Ao surgir, grava grupo, inimigos, nível, região, resgate e recompensas. Nível regional conforme a versão 3 descrita abaixo. Coins = arredondar((70 + nível × 0,5) × fator). Materiais 3/7/10. Resgate de espécie base não lendária das caçadas normais da área, nível metade do boss; cada vitória entrega um novo indivíduo. PC cheio bloqueia entrada.

Cada vitória: duas chances independentes de 10%/20%/25% (básicos/executivos/Giovanni) para um Fragmento de Escritura e um Fragmento Mega universal. Equipamento mantém 1%. Recompensas protegidas pelo identificador da invasão. Derrota não recompensa. Desafios antigos sem dossiê mantêm recompensa anterior.

Radar em CSS com animação única, desligado quando oculto ou com redução de movimento. Sem loop de canvas adicional. Contador acompanha o ciclo existente do evento. A cena do balão identifica Jessie e James; recrutas possuem sua própria ilustração. Executivos e Giovanni usam ilustrações próprias com os personagens integrados, sem sprites sobrepostos. O executivo ativo é identificado pelo dossiê. Na arena, os sprites de cada responsável usam suas folhas originais e o recolhimento continua apontando para o treinador correto.


## Equipes reforçadas (versão 2)
Todos os grupos usam seis unidades em duas fileiras, com espécies das famílias usadas pelos responsáveis. A dupla usa Arbok, Weezing, Persian, Victreebel, Wobbuffet e Seviper; recrutas usam Raticate, Golbat, Muk, Arbok, Weezing e Hypno. Executivos possuem equipes próprias; Giovanni usa Persian, Nidoking, Nidoqueen, Rhyperior, Dugtrio e Kangaskhan.
Nível de referência: maior nível da equipe em campo. Fatores de nível, escala de combate, PS extras, potência e IV por atributo, respectivamente: recrutas 1,10 / 2 / 1,25 / P3 / 24; dupla 1,15 / 2,2 / 1,4 / P3 / 26; executivos 1,25 / 2,5 / 1,6 / P4 / 29; Giovanni 1,35 / 2,8 / 1,8 / P5 / 31. Escala multiplica a curva normal 1 + (nível−1) × 0,12. Não altera o dano elemental nem as regras dos golpes.
Invasões anteriores ainda não iniciadas migram uma vez; combates em andamento permanecem preservados. Dossiê v2 não recalcula ao trocar a equipe ou usar F5. Resgate e recompensas anteriores são mantidos na migração.

## Referência regional (versão 3)
O teto utiliza todas as caçadas finitas da geração da área onde a invasão surgiu: Kanto, Johto, Hoenn, Sinnoh ou Unova, idêntico à base dos lendários. Exclui fronteiras sem fim. Recrutas: teto; dupla: +10%; executivos: +20%; Giovanni: +30%, arredondados para cima. Referência salva em invasion.reference, inclusive região, área, teto e percentual. A equipe do jogador não altera o nível.
Multiplicador sobre a curva normal / PS extras: recrutas 1,1 / 1,1; dupla 1,2 / 1,2; executivos 1,3 / 1,3; Giovanni 1,4 / 1,4. Potências e IVs permanecem P3/24, P3/26, P4/29, P5/31. As seis unidades e as famílias permanecem. Migração de dossiês anteriores usa a área original; batalhas iniciadas não são recalculadas.

Arte atual: panel-neutral.png remove o contorno fixo da dupla; grunts.png, executives-illustrated.png e giovanni-illustrated.png são cenas locais. O brilho nativo acompanha a próxima invasão ou a ativa; seleção de consulta tem indicação discreta separada. A previsão usa o mesmo seletor puro da rotação, sem alterar o save.
