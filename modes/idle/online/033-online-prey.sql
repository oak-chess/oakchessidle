-- Install after 032. Server owns options, prices, activation and charge consumption.
begin;
-- BEGIN GENERATED CATALOG
create table if not exists oakchess_server.prey_catalog(area integer,min_level integer,species jsonb not null);
alter table oakchess_server.prey_catalog enable row level security;
revoke all on oakchess_server.prey_catalog from public,anon,authenticated;
truncate oakchess_server.prey_catalog;
insert into oakchess_server.prey_catalog(area,min_level,species) values
(0,1,'[{"id":10,"name":"Caterpie"},{"id":13,"name":"Weedle"},{"id":16,"name":"Pidgey"},{"id":19,"name":"Rattata"},{"id":21,"name":"Spearow"}]'),
(0,5,'[{"id":1,"name":"Bulbasaur"},{"id":4,"name":"Charmander"},{"id":7,"name":"Squirtle"},{"id":25,"name":"Pikachu"},{"id":133,"name":"Eevee"}]'),
(0,10,'[{"id":74,"name":"Geodude"},{"id":41,"name":"Zubat"},{"id":27,"name":"Sandshrew"},{"id":35,"name":"Clefairy"},{"id":95,"name":"Onix"}]'),
(1,12,'[{"id":43,"name":"Oddish"},{"id":69,"name":"Bellsprout"},{"id":63,"name":"Abra"},{"id":52,"name":"Meowth"},{"id":39,"name":"Jigglypuff"},{"id":56,"name":"Mankey"}]'),
(1,62,'[{"id":54,"name":"Psyduck"},{"id":60,"name":"Poliwag"},{"id":118,"name":"Goldeen"},{"id":129,"name":"Magikarp"},{"id":7,"name":"Squirtle"}]'),
(1,112,'[{"id":46,"name":"Paras"},{"id":35,"name":"Clefairy"},{"id":41,"name":"Zubat"},{"id":74,"name":"Geodude"},{"id":27,"name":"Sandshrew"}]'),
(2,167,'[{"id":96,"name":"Drowzee"},{"id":21,"name":"Spearow"},{"id":52,"name":"Meowth"},{"id":23,"name":"Ekans"},{"id":83,"name":"Farfetch''d"},{"id":84,"name":"Doduo"}]'),
(2,217,'[{"id":72,"name":"Tentacool"},{"id":98,"name":"Krabby"},{"id":90,"name":"Shellder"},{"id":118,"name":"Goldeen"},{"id":129,"name":"Magikarp"}]'),
(2,267,'[{"id":100,"name":"Voltorb"},{"id":81,"name":"Magnemite"},{"id":25,"name":"Pikachu"},{"id":50,"name":"Diglett"},{"id":51,"name":"Dugtrio"}]'),
(3,322,'[{"id":44,"name":"Gloom"},{"id":70,"name":"Weepinbell"},{"id":47,"name":"Parasect"},{"id":102,"name":"Exeggcute"},{"id":114,"name":"Tangela"}]'),
(3,372,'[{"id":133,"name":"Eevee"},{"id":37,"name":"Vulpix"},{"id":58,"name":"Growlithe"},{"id":17,"name":"Pidgeotto"},{"id":20,"name":"Raticate"},{"id":132,"name":"Ditto"},{"id":137,"name":"Porygon"}]'),
(3,422,'[{"id":92,"name":"Gastly"},{"id":93,"name":"Haunter"},{"id":104,"name":"Cubone"},{"id":96,"name":"Drowzee"},{"id":63,"name":"Abra"}]'),
(4,477,'[{"id":33,"name":"Nidorino"},{"id":30,"name":"Nidorina"},{"id":111,"name":"Rhyhorn"},{"id":123,"name":"Scyther"},{"id":115,"name":"Kangaskhan"},{"id":127,"name":"Pinsir"},{"id":113,"name":"Chansey"},{"id":108,"name":"Lickitung"}]'),
(4,527,'[{"id":116,"name":"Horsea"},{"id":117,"name":"Seadra"},{"id":147,"name":"Dratini"},{"id":118,"name":"Goldeen"},{"id":61,"name":"Poliwhirl"}]'),
(4,577,'[{"id":49,"name":"Venomoth"},{"id":88,"name":"Grimer"},{"id":109,"name":"Koffing"},{"id":24,"name":"Arbok"},{"id":42,"name":"Golbat"}]'),
(5,632,'[{"id":64,"name":"Kadabra"},{"id":97,"name":"Hypno"},{"id":122,"name":"Mr. Mime"},{"id":93,"name":"Haunter"},{"id":124,"name":"Jynx"}]'),
(5,682,'[{"id":67,"name":"Machoke"},{"id":81,"name":"Magnemite"},{"id":82,"name":"Magneton"},{"id":100,"name":"Voltorb"},{"id":101,"name":"Electrode"},{"id":106,"name":"Hitmonlee"},{"id":107,"name":"Hitmonchan"},{"id":125,"name":"Electabuzz"}]'),
(5,732,'[{"id":53,"name":"Persian"},{"id":18,"name":"Pidgeot"},{"id":22,"name":"Fearow"},{"id":143,"name":"Snorlax"},{"id":128,"name":"Tauros"}]'),
(6,787,'[{"id":77,"name":"Ponyta"},{"id":78,"name":"Rapidash"},{"id":126,"name":"Magmar"},{"id":58,"name":"Growlithe"},{"id":37,"name":"Vulpix"}]'),
(6,837,'[{"id":120,"name":"Staryu"},{"id":121,"name":"Starmie"},{"id":86,"name":"Seel"},{"id":87,"name":"Dewgong"},{"id":73,"name":"Tentacruel"}]'),
(6,887,'[{"id":90,"name":"Shellder"},{"id":91,"name":"Cloyster"},{"id":79,"name":"Slowpoke"},{"id":80,"name":"Slowbro"},{"id":131,"name":"Lapras"}]'),
(7,942,'[{"id":112,"name":"Rhydon"},{"id":28,"name":"Sandslash"},{"id":105,"name":"Marowak"},{"id":76,"name":"Golem"},{"id":95,"name":"Onix"}]'),
(7,992,'[{"id":148,"name":"Dragonair"},{"id":149,"name":"Dragonite"},{"id":130,"name":"Gyarados"},{"id":142,"name":"Aerodactyl"},{"id":68,"name":"Machamp"}]'),
(7,1042,'[{"id":3,"name":"Venusaur"},{"id":6,"name":"Charizard"},{"id":9,"name":"Blastoise"},{"id":141,"name":"Kabutops"},{"id":139,"name":"Omastar"}]'),
(7,1137,'[{"id":34,"name":"Nidoking"},{"id":31,"name":"Nidoqueen"},{"id":65,"name":"Alakazam"},{"id":94,"name":"Gengar"},{"id":143,"name":"Snorlax"}]'),
(8,1192,'[{"id":161,"name":"Sentret"},{"id":163,"name":"Hoothoot"},{"id":165,"name":"Ledyba"},{"id":167,"name":"Spinarak"},{"id":191,"name":"Sunkern"}]'),
(8,1242,'[{"id":74,"name":"Geodude"},{"id":41,"name":"Zubat"},{"id":206,"name":"Dunsparce"},{"id":194,"name":"Wooper"},{"id":179,"name":"Mareep"}]'),
(8,1292,'[{"id":152,"name":"Chikorita"},{"id":155,"name":"Cyndaquil"},{"id":158,"name":"Totodile"},{"id":175,"name":"Togepi"},{"id":187,"name":"Hoppip"}]'),
(9,1347,'[{"id":166,"name":"Ledian"},{"id":168,"name":"Ariados"},{"id":204,"name":"Pineco"},{"id":190,"name":"Aipom"},{"id":193,"name":"Yanma"}]'),
(9,1397,'[{"id":177,"name":"Natu"},{"id":188,"name":"Skiploom"},{"id":192,"name":"Sunflora"},{"id":214,"name":"Heracross"},{"id":213,"name":"Shuckle"}]'),
(9,1447,'[{"id":183,"name":"Marill"},{"id":184,"name":"Azumarill"},{"id":60,"name":"Poliwag"},{"id":79,"name":"Slowpoke"},{"id":118,"name":"Goldeen"}]'),
(10,1502,'[{"id":162,"name":"Furret"},{"id":164,"name":"Noctowl"},{"id":209,"name":"Snubbull"},{"id":241,"name":"Miltank"},{"id":234,"name":"Stantler"}]'),
(10,1552,'[{"id":185,"name":"Sudowoodo"},{"id":235,"name":"Smeargle"},{"id":132,"name":"Ditto"},{"id":133,"name":"Eevee"},{"id":137,"name":"Porygon"}]'),
(10,1602,'[{"id":173,"name":"Cleffa"},{"id":174,"name":"Igglybuff"},{"id":172,"name":"Pichu"},{"id":238,"name":"Smoochum"},{"id":240,"name":"Magby"}]'),
(11,1657,'[{"id":200,"name":"Misdreavus"},{"id":92,"name":"Gastly"},{"id":93,"name":"Haunter"},{"id":198,"name":"Murkrow"},{"id":228,"name":"Houndour"}]'),
(11,1707,'[{"id":201,"name":"Unown"},{"id":177,"name":"Natu"},{"id":178,"name":"Xatu"},{"id":203,"name":"Girafarig"},{"id":202,"name":"Wobbuffet"}]'),
(11,1757,'[{"id":153,"name":"Bayleef"},{"id":156,"name":"Quilava"},{"id":159,"name":"Croconaw"},{"id":196,"name":"Espeon"},{"id":197,"name":"Umbreon"}]'),
(12,1812,'[{"id":170,"name":"Chinchou"},{"id":171,"name":"Lanturn"},{"id":211,"name":"Qwilfish"},{"id":222,"name":"Corsola"},{"id":226,"name":"Mantine"}]'),
(12,1862,'[{"id":223,"name":"Remoraid"},{"id":224,"name":"Octillery"},{"id":72,"name":"Tentacool"},{"id":98,"name":"Krabby"},{"id":213,"name":"Shuckle"}]'),
(12,1912,'[{"id":236,"name":"Tyrogue"},{"id":106,"name":"Hitmonlee"},{"id":107,"name":"Hitmonchan"},{"id":237,"name":"Hitmontop"},{"id":214,"name":"Heracross"}]'),
(13,1967,'[{"id":205,"name":"Forretress"},{"id":208,"name":"Steelix"},{"id":212,"name":"Scizor"},{"id":227,"name":"Skarmory"},{"id":207,"name":"Gligar"}]'),
(13,2017,'[{"id":210,"name":"Granbull"},{"id":216,"name":"Teddiursa"},{"id":217,"name":"Ursaring"},{"id":231,"name":"Phanpy"},{"id":232,"name":"Donphan"}]'),
(13,2067,'[{"id":195,"name":"Quagsire"},{"id":186,"name":"Politoed"},{"id":199,"name":"Slowking"},{"id":117,"name":"Seadra"},{"id":230,"name":"Kingdra"}]'),
(14,2122,'[{"id":220,"name":"Swinub"},{"id":221,"name":"Piloswine"},{"id":215,"name":"Sneasel"},{"id":225,"name":"Delibird"},{"id":124,"name":"Jynx"}]'),
(14,2172,'[{"id":129,"name":"Magikarp"},{"id":130,"name":"Gyarados"},{"id":86,"name":"Seel"},{"id":87,"name":"Dewgong"},{"id":131,"name":"Lapras"}]'),
(14,2222,'[{"id":218,"name":"Slugma"},{"id":219,"name":"Magcargo"},{"id":229,"name":"Houndoom"},{"id":126,"name":"Magmar"},{"id":125,"name":"Electabuzz"}]'),
(15,2277,'[{"id":147,"name":"Dratini"},{"id":148,"name":"Dragonair"},{"id":230,"name":"Kingdra"},{"id":169,"name":"Crobat"},{"id":181,"name":"Ampharos"}]'),
(15,2327,'[{"id":246,"name":"Larvitar"},{"id":247,"name":"Pupitar"},{"id":248,"name":"Tyranitar"},{"id":233,"name":"Porygon2"},{"id":242,"name":"Blissey"}]'),
(15,2377,'[{"id":154,"name":"Meganium"},{"id":157,"name":"Typhlosion"},{"id":160,"name":"Feraligatr"},{"id":182,"name":"Bellossom"},{"id":189,"name":"Jumpluff"}]'),
(16,2432,'[{"id":261,"name":"Poochyena"},{"id":263,"name":"Zigzagoon"},{"id":265,"name":"Wurmple"},{"id":285,"name":"Shroomish"},{"id":287,"name":"Slakoth"}]'),
(16,2482,'[{"id":293,"name":"Whismur"},{"id":296,"name":"Makuhita"},{"id":299,"name":"Nosepass"},{"id":304,"name":"Aron"},{"id":307,"name":"Meditite"}]'),
(16,2532,'[{"id":252,"name":"Treecko"},{"id":255,"name":"Torchic"},{"id":258,"name":"Mudkip"},{"id":280,"name":"Ralts"},{"id":290,"name":"Nincada"}]'),
(17,2587,'[{"id":302,"name":"Sableye"},{"id":303,"name":"Mawile"},{"id":74,"name":"Geodude"},{"id":41,"name":"Zubat"},{"id":325,"name":"Spoink"}]'),
(17,2637,'[{"id":278,"name":"Wingull"},{"id":283,"name":"Surskit"},{"id":341,"name":"Corphish"},{"id":339,"name":"Barboach"},{"id":370,"name":"Luvdisc"}]'),
(17,2687,'[{"id":318,"name":"Carvanha"},{"id":320,"name":"Wailmer"},{"id":170,"name":"Chinchou"},{"id":72,"name":"Tentacool"},{"id":54,"name":"Psyduck"}]'),
(18,2742,'[{"id":270,"name":"Lotad"},{"id":273,"name":"Seedot"},{"id":300,"name":"Skitty"},{"id":315,"name":"Roselia"},{"id":311,"name":"Plusle"}]'),
(18,2792,'[{"id":309,"name":"Electrike"},{"id":312,"name":"Minun"},{"id":100,"name":"Voltorb"},{"id":81,"name":"Magnemite"},{"id":26,"name":"Raichu"}]'),
(18,2842,'[{"id":313,"name":"Volbeat"},{"id":314,"name":"Illumise"},{"id":327,"name":"Spinda"},{"id":316,"name":"Gulpin"},{"id":324,"name":"Torkoal"}]'),
(19,2897,'[{"id":218,"name":"Slugma"},{"id":219,"name":"Magcargo"},{"id":322,"name":"Numel"},{"id":323,"name":"Camerupt"},{"id":324,"name":"Torkoal"}]'),
(19,2947,'[{"id":328,"name":"Trapinch"},{"id":331,"name":"Cacnea"},{"id":343,"name":"Baltoy"},{"id":335,"name":"Zangoose"},{"id":336,"name":"Seviper"}]'),
(19,2997,'[{"id":337,"name":"Lunatone"},{"id":338,"name":"Solrock"},{"id":305,"name":"Lairon"},{"id":75,"name":"Graveler"},{"id":299,"name":"Nosepass"}]'),
(20,3052,'[{"id":264,"name":"Linoone"},{"id":262,"name":"Mightyena"},{"id":288,"name":"Vigoroth"},{"id":284,"name":"Masquerain"},{"id":286,"name":"Breloom"}]'),
(20,3102,'[{"id":241,"name":"Miltank"},{"id":235,"name":"Smeargle"},{"id":234,"name":"Stantler"},{"id":128,"name":"Tauros"},{"id":289,"name":"Slaking"}]'),
(20,3152,'[{"id":271,"name":"Lombre"},{"id":274,"name":"Nuzleaf"},{"id":301,"name":"Delcatty"},{"id":332,"name":"Cacturne"},{"id":276,"name":"Taillow"}]'),
(21,3207,'[{"id":276,"name":"Taillow"},{"id":277,"name":"Swellow"},{"id":333,"name":"Swablu"},{"id":357,"name":"Tropius"},{"id":352,"name":"Kecleon"}]'),
(21,3257,'[{"id":353,"name":"Shuppet"},{"id":355,"name":"Duskull"},{"id":358,"name":"Chimecho"},{"id":359,"name":"Absol"},{"id":200,"name":"Misdreavus"}]'),
(21,3307,'[{"id":349,"name":"Feebas"},{"id":351,"name":"Castform"},{"id":193,"name":"Yanma"},{"id":177,"name":"Natu"},{"id":178,"name":"Xatu"}]'),
(22,3362,'[{"id":339,"name":"Barboach"},{"id":340,"name":"Whiscash"},{"id":341,"name":"Corphish"},{"id":342,"name":"Crawdaunt"},{"id":366,"name":"Clamperl"}]'),
(22,3412,'[{"id":361,"name":"Snorunt"},{"id":362,"name":"Glalie"},{"id":363,"name":"Spheal"},{"id":364,"name":"Sealeo"},{"id":365,"name":"Walrein"}]'),
(22,3462,'[{"id":369,"name":"Relicanth"},{"id":222,"name":"Corsola"},{"id":223,"name":"Remoraid"},{"id":224,"name":"Octillery"},{"id":226,"name":"Mantine"}]'),
(23,3517,'[{"id":371,"name":"Bagon"},{"id":372,"name":"Shelgon"},{"id":373,"name":"Salamence"},{"id":334,"name":"Altaria"},{"id":230,"name":"Kingdra"}]'),
(23,3567,'[{"id":374,"name":"Beldum"},{"id":375,"name":"Metang"},{"id":376,"name":"Metagross"},{"id":354,"name":"Banette"},{"id":356,"name":"Dusclops"}]'),
(23,3617,'[{"id":367,"name":"Huntail"},{"id":368,"name":"Gorebyss"},{"id":319,"name":"Sharpedo"},{"id":321,"name":"Wailord"},{"id":350,"name":"Milotic"}]'),
(24,3672,'[{"id":396,"name":"Starly"},{"id":399,"name":"Bidoof"},{"id":403,"name":"Shinx"},{"id":401,"name":"Kricketot"},{"id":412,"name":"Burmy"}]'),
(24,3722,'[{"id":408,"name":"Cranidos"},{"id":410,"name":"Shieldon"},{"id":436,"name":"Bronzor"},{"id":449,"name":"Hippopotas"},{"id":443,"name":"Gible"}]'),
(24,3772,'[{"id":387,"name":"Turtwig"},{"id":390,"name":"Chimchar"},{"id":393,"name":"Piplup"},{"id":406,"name":"Budew"},{"id":427,"name":"Buneary"}]'),
(25,3827,'[{"id":420,"name":"Cherubi"},{"id":415,"name":"Combee"},{"id":417,"name":"Pachirisu"},{"id":418,"name":"Buizel"},{"id":422,"name":"Shellos"}]'),
(25,3877,'[{"id":315,"name":"Roselia"},{"id":407,"name":"Roserade"},{"id":421,"name":"Cherrim"},{"id":416,"name":"Vespiquen"},{"id":413,"name":"Wormadam"}]'),
(25,3927,'[{"id":414,"name":"Mothim"},{"id":402,"name":"Kricketune"},{"id":404,"name":"Luxio"},{"id":400,"name":"Bibarel"},{"id":397,"name":"Staravia"}]'),
(26,3982,'[{"id":447,"name":"Riolu"},{"id":453,"name":"Croagunk"},{"id":307,"name":"Meditite"},{"id":67,"name":"Machoke"},{"id":446,"name":"Munchlax"}]'),
(26,4032,'[{"id":433,"name":"Chingling"},{"id":358,"name":"Chimecho"},{"id":439,"name":"Mime Jr."},{"id":438,"name":"Bonsly"},{"id":122,"name":"Mr. Mime"}]'),
(26,4082,'[{"id":451,"name":"Skorupi"},{"id":452,"name":"Drapion"},{"id":434,"name":"Stunky"},{"id":435,"name":"Skuntank"},{"id":431,"name":"Glameow"}]'),
(27,4137,'[{"id":453,"name":"Croagunk"},{"id":454,"name":"Toxicroak"},{"id":451,"name":"Skorupi"},{"id":455,"name":"Carnivine"},{"id":193,"name":"Yanma"}]'),
(27,4187,'[{"id":456,"name":"Finneon"},{"id":457,"name":"Lumineon"},{"id":458,"name":"Mantyke"},{"id":419,"name":"Floatzel"},{"id":423,"name":"Gastrodon"}]'),
(27,4237,'[{"id":418,"name":"Buizel"},{"id":422,"name":"Shellos"},{"id":441,"name":"Chatot"},{"id":425,"name":"Drifloon"},{"id":440,"name":"Happiny"}]'),
(28,4292,'[{"id":425,"name":"Drifloon"},{"id":426,"name":"Drifblim"},{"id":442,"name":"Spiritomb"},{"id":355,"name":"Duskull"},{"id":356,"name":"Dusclops"}]'),
(28,4342,'[{"id":479,"name":"Rotom"},{"id":200,"name":"Misdreavus"},{"id":429,"name":"Mismagius"},{"id":198,"name":"Murkrow"},{"id":430,"name":"Honchkrow"}]'),
(28,4392,'[{"id":431,"name":"Glameow"},{"id":432,"name":"Purugly"},{"id":427,"name":"Buneary"},{"id":428,"name":"Lopunny"},{"id":477,"name":"Dusknoir"}]'),
(29,4447,'[{"id":436,"name":"Bronzor"},{"id":437,"name":"Bronzong"},{"id":81,"name":"Magnemite"},{"id":82,"name":"Magneton"},{"id":462,"name":"Magnezone"}]'),
(29,4497,'[{"id":408,"name":"Cranidos"},{"id":409,"name":"Rampardos"},{"id":410,"name":"Shieldon"},{"id":411,"name":"Bastiodon"},{"id":476,"name":"Probopass"}]'),
(29,4547,'[{"id":111,"name":"Rhyhorn"},{"id":112,"name":"Rhydon"},{"id":464,"name":"Rhyperior"},{"id":114,"name":"Tangela"},{"id":465,"name":"Tangrowth"}]'),
(30,4602,'[{"id":459,"name":"Snover"},{"id":460,"name":"Abomasnow"},{"id":215,"name":"Sneasel"},{"id":461,"name":"Weavile"},{"id":478,"name":"Froslass"}]'),
(30,4652,'[{"id":220,"name":"Swinub"},{"id":221,"name":"Piloswine"},{"id":473,"name":"Mamoswine"},{"id":361,"name":"Snorunt"},{"id":471,"name":"Glaceon"}]'),
(30,4702,'[{"id":207,"name":"Gligar"},{"id":472,"name":"Gliscor"},{"id":424,"name":"Ambipom"},{"id":463,"name":"Lickilicky"},{"id":469,"name":"Yanmega"}]'),
(31,4757,'[{"id":403,"name":"Shinx"},{"id":404,"name":"Luxio"},{"id":405,"name":"Luxray"},{"id":125,"name":"Electabuzz"},{"id":466,"name":"Electivire"}]'),
(31,4807,'[{"id":126,"name":"Magmar"},{"id":467,"name":"Magmortar"},{"id":233,"name":"Porygon2"},{"id":474,"name":"Porygon Z"},{"id":468,"name":"Togekiss"}]'),
(31,4857,'[{"id":443,"name":"Gible"},{"id":444,"name":"Gabite"},{"id":445,"name":"Garchomp"},{"id":470,"name":"Leafeon"},{"id":475,"name":"Gallade"}]'),
(32,4912,'[{"id":495,"name":"Snivy"},{"id":498,"name":"Tepig"},{"id":501,"name":"Oshawott"},{"id":504,"name":"Patrat"},{"id":506,"name":"Lillipup"},{"id":509,"name":"Purrloin"}]'),
(32,4962,'[{"id":511,"name":"Pansage"},{"id":513,"name":"Pansear"},{"id":515,"name":"Panpour"},{"id":517,"name":"Munna"},{"id":519,"name":"Pidove"},{"id":522,"name":"Blitzle"}]'),
(32,5012,'[{"id":505,"name":"Watchog"},{"id":507,"name":"Herdier"},{"id":510,"name":"Liepard"},{"id":512,"name":"Simisage"},{"id":514,"name":"Simisear"},{"id":516,"name":"Simipour"}]'),
(33,5067,'[{"id":524,"name":"Roggenrola"},{"id":525,"name":"Boldore"},{"id":527,"name":"Woobat"},{"id":528,"name":"Swoobat"},{"id":529,"name":"Drilbur"},{"id":530,"name":"Excadrill"}]'),
(33,5117,'[{"id":531,"name":"Audino"},{"id":532,"name":"Timburr"},{"id":533,"name":"Gurdurr"},{"id":538,"name":"Throh"},{"id":539,"name":"Sawk"}]'),
(33,5167,'[{"id":540,"name":"Sewaddle"},{"id":541,"name":"Swadloon"},{"id":543,"name":"Venipede"},{"id":544,"name":"Whirlipede"},{"id":546,"name":"Cottonee"},{"id":548,"name":"Petilil"},{"id":496,"name":"Servine"}]'),
(34,5222,'[{"id":542,"name":"Leavanny"},{"id":545,"name":"Scolipede"},{"id":547,"name":"Whimsicott"},{"id":549,"name":"Lilligant"},{"id":570,"name":"Zorua"},{"id":572,"name":"Minccino"},{"id":497,"name":"Serperior"}]'),
(34,5272,'[{"id":568,"name":"Trubbish"},{"id":569,"name":"Garbodor"},{"id":571,"name":"Zoroark"},{"id":573,"name":"Cinccino"},{"id":574,"name":"Gothita"},{"id":577,"name":"Solosis"}]'),
(34,5322,'[{"id":550,"name":"Basculin"},{"id":535,"name":"Tympole"},{"id":536,"name":"Palpitoad"},{"id":580,"name":"Ducklett"},{"id":592,"name":"Frillish"},{"id":594,"name":"Alomomola"},{"id":502,"name":"Dewott"}]'),
(35,5377,'[{"id":523,"name":"Zebstrika"},{"id":587,"name":"Emolga"},{"id":595,"name":"Joltik"},{"id":596,"name":"Galvantula"},{"id":602,"name":"Tynamo"},{"id":603,"name":"Eelektrik"}]'),
(35,5427,'[{"id":551,"name":"Sandile"},{"id":554,"name":"Darumaka"},{"id":556,"name":"Maractus"},{"id":557,"name":"Dwebble"},{"id":559,"name":"Scraggy"},{"id":561,"name":"Sigilyph"},{"id":499,"name":"Pignite"}]'),
(35,5477,'[{"id":552,"name":"Krokorok"},{"id":553,"name":"Krookodile"},{"id":555,"name":"Darmanitan"},{"id":558,"name":"Crustle"},{"id":560,"name":"Scrafty"},{"id":562,"name":"Yamask"},{"id":563,"name":"Cofagrigus"}]'),
(36,5532,'[{"id":526,"name":"Gigalith"},{"id":534,"name":"Conkeldurr"},{"id":597,"name":"Ferroseed"},{"id":598,"name":"Ferrothorn"},{"id":599,"name":"Klink"},{"id":600,"name":"Klang"},{"id":601,"name":"Klinklang"},{"id":500,"name":"Emboar"}]'),
(36,5582,'[{"id":564,"name":"Tirtouga"},{"id":565,"name":"Carracosta"},{"id":566,"name":"Archen"},{"id":567,"name":"Archeops"},{"id":622,"name":"Golett"},{"id":623,"name":"Golurk"}]'),
(36,5632,'[{"id":537,"name":"Seismitoad"},{"id":581,"name":"Swanna"},{"id":593,"name":"Jellicent"},{"id":618,"name":"Stunfisk"},{"id":590,"name":"Foongus"},{"id":591,"name":"Amoonguss"},{"id":503,"name":"Samurott"}]'),
(37,5687,'[{"id":520,"name":"Tranquill"},{"id":521,"name":"Unfezant"},{"id":627,"name":"Rufflet"},{"id":629,"name":"Vullaby"},{"id":585,"name":"Deerling"},{"id":588,"name":"Karrablast"}]'),
(37,5737,'[{"id":628,"name":"Braviary"},{"id":630,"name":"Mandibuzz"},{"id":586,"name":"Sawsbuck"},{"id":589,"name":"Escavalier"},{"id":616,"name":"Shelmet"},{"id":617,"name":"Accelgor"}]'),
(37,5787,'[{"id":575,"name":"Gothorita"},{"id":576,"name":"Gothitelle"},{"id":578,"name":"Duosion"},{"id":579,"name":"Reuniclus"},{"id":605,"name":"Elgyem"},{"id":606,"name":"Beheeyem"}]'),
(38,5842,'[{"id":582,"name":"Vanillite"},{"id":583,"name":"Vanillish"},{"id":584,"name":"Vanilluxe"},{"id":613,"name":"Cubchoo"},{"id":614,"name":"Beartic"},{"id":615,"name":"Cryogonal"}]'),
(38,5892,'[{"id":604,"name":"Eelektross"},{"id":607,"name":"Litwick"},{"id":608,"name":"Lampent"},{"id":609,"name":"Chandelure"}]'),
(38,5942,'[{"id":619,"name":"Mienfoo"},{"id":620,"name":"Mienshao"},{"id":624,"name":"Pawniard"},{"id":625,"name":"Bisharp"},{"id":626,"name":"Bouffalant"}]'),
(39,5997,'[{"id":610,"name":"Axew"},{"id":611,"name":"Fraxure"},{"id":612,"name":"Haxorus"},{"id":621,"name":"Druddigon"}]'),
(39,6047,'[{"id":633,"name":"Deino"},{"id":634,"name":"Zweilous"},{"id":635,"name":"Hydreigon"}]'),
(39,6097,'[{"id":631,"name":"Heatmor"},{"id":632,"name":"Durant"},{"id":636,"name":"Larvesta"},{"id":637,"name":"Volcarona"},{"id":508,"name":"Stoutland"},{"id":518,"name":"Musharna"}]');
-- END GENERATED CATALOG
alter table oakchess_server.hunt_profiles add column if not exists prey jsonb not null default '{"version":1,"online":true,"slots":[{}, {}, {}],"options":[],"introduced":false}';

create or replace function public.journey_prey(p_request uuid,p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare player uuid:=auth.uid(); h oakchess_server.hunt_profiles%rowtype; j public.journeys%rowtype;
 old oakchess_server.shop_operations%rowtype; d jsonb; option jsonb; entry jsonb; choices jsonb:='[]';
 pool jsonb; species jsonb; kind text; percent integer; slot integer; slots integer; price bigint:=0;
 today text:=to_char(clock_timestamp() at time zone 'America/Sao_Paulo','YYYY-MM-DD'); receipt jsonb;
begin
 if player is null then raise exception 'Entre na sua conta.' using errcode='42501';end if;
 if p_request is null or p_action not in('load','renew','activate','introduce') or p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>1024 then raise exception 'Operação Prey inválida.';end if;
 select * into j from public.journeys where owner_id=player for update;
 select * into h from oakchess_server.hunt_profiles where owner_id=player for update;
 if not found then raise exception 'Carregue sua jornada.';end if;
 select * into old from oakchess_server.shop_operations where owner_id=player and request_id=p_request;
 if found then
  if old.action<>'prey:'||p_action or old.payload<>p_payload then raise exception 'Confirmação já utilizada.';end if;
  return jsonb_build_object('receipt',old.receipt,'state',oakchess_server.hunt_view(player));
 end if;
 slots:=case when cardinality(h.badges)>=16 then 3 when cardinality(h.badges)>=8 then 2 when cardinality(h.badges)>=1 then 1 else 0 end;
 if slots=0 then raise exception 'Conquiste sua primeira insígnia para liberar o Prey.';end if;
 d:=h.prey;
 if p_action='renew' or (p_action='load' and not coalesce((d->>'initialized')::boolean,false)) then
  if p_action='renew' and d->>'lastFreeDay'=today then price:=least(50000,greatest(100,j.trainer_level*100));end if;
  if j.gold<price then raise exception 'Coins insuficientes.';end if;
  select coalesce(jsonb_agg(s),'[]') into pool from (
   select distinct species_row.value from oakchess_server.prey_catalog c cross join lateral jsonb_array_elements(c.species) species_row(value)
   where c.area<=h.unlocked_area and c.min_level<=j.trainer_level
  ) available(s);
  for species in select value from jsonb_array_elements(pool) order by random() limit 3 loop
   kind:=(array['damage','defense','xp','loot'])[1+floor(random()*4)::integer];
   percent:=(case when kind='xp' then array[10,15,20,25] else array[10,15,20] end)[1+floor(random()*(case when kind='xp' then 4 else 3 end))::integer];
   choices:=choices||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'name',species->>'name','pokemonId',species->'id','kind',kind,'percent',percent,'remaining',100));
  end loop;
  if jsonb_array_length(choices)=0 then raise exception 'Nenhuma espécie disponível.';end if;
  d:=d||jsonb_build_object('options',choices,'initialized',true,'optionsExhausted',false,'selected',null);
  if p_action='renew' and price=0 then d:=d||jsonb_build_object('lastFreeDay',today);end if;
  update public.journeys set gold=gold-price where owner_id=player;
 elsif p_action='activate' then
  if p_payload-array['optionId','slot','confirm']<>'{}' or coalesce(p_payload->>'slot','')!~'^[0-2]$' then raise exception 'Vaga inválida.';end if;
  slot:=(p_payload->>'slot')::integer;
  if slot>=slots then raise exception 'Esta vaga ainda está bloqueada.';end if;
  select value into option from jsonb_array_elements(d->'options') where value->>'id'=p_payload->>'optionId';
  if option is null then raise exception 'Escolha uma opção disponível.';end if;
  if exists(select 1 from jsonb_array_elements(d->'slots') with ordinality s(value,n) where n<>slot+1 and (value->'active'->>'name'=option->>'name' or value->'pending'->>'name'=option->>'name'))then raise exception 'Esta espécie já está em outra vaga.';end if;
  entry:=d->'slots'->slot;
  if ((entry->'active') is not null and entry->'active'<>'null') or ((entry->'pending') is not null and entry->'pending'<>'null') then
   if p_payload->>'confirm' is distinct from 'true' then raise exception 'Confirme a substituição do Prey atual.';end if;
  end if;
  d:=jsonb_set(d,array['slots',slot::text],entry||jsonb_build_object('pending',option));
  select coalesce(jsonb_agg(value),'[]') into choices from jsonb_array_elements(d->'options') where value->>'id'<>option->>'id';
  d:=d||jsonb_build_object('options',choices,'optionsExhausted',jsonb_array_length(choices)=0,'selected',null);
 elsif p_action='introduce' then d:=d||'{"introduced":true}';
 end if;
 update oakchess_server.hunt_profiles set prey=d where owner_id=player;
 receipt:=jsonb_build_object('ok',true,'message',case p_action when 'renew' then case when price=0 then 'Opções renovadas gratuitamente.' else 'Opções renovadas por '||price||' Coins.' end when 'activate' then 'Prey preparado para o próximo encontro.' else 'Prey sincronizado.' end);
 insert into oakchess_server.shop_operations(owner_id,request_id,action,payload,receipt)values(player,p_request,'prey:'||p_action,p_payload,receipt);
 return jsonb_build_object('receipt',receipt,'state',oakchess_server.hunt_view(player));
end $$;
revoke all on function public.journey_prey(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.journey_prey(uuid,text,jsonb) to authenticated;

-- Only a NEW encounter promotes pending choices. Repeated begin calls keep the same snapshot.
create or replace function oakchess_server.prey_encounter() returns trigger
language plpgsql security definer set search_path='' as $$
declare d jsonb; slot integer; entry jsonb; active jsonb:='[]'; used jsonb; amount integer; remaining integer;
begin
 if tg_op='INSERT' then
  select prey into d from oakchess_server.hunt_profiles where owner_id=new.owner_id for update;
  if new.route like '%:gym' then return new;end if;
  for slot in 0..2 loop
   entry:=d->'slots'->slot;
   if entry->'pending' is not null and entry->'pending'<>'null' then
    entry:=jsonb_build_object('active',entry->'pending');d:=jsonb_set(d,array['slots',slot::text],entry);
   end if;
   if coalesce((entry->'active'->>'remaining')::integer,0)>0 then active:=active||jsonb_build_array(entry->'active');end if;
  end loop;
  update oakchess_server.hunt_profiles set prey=d where owner_id=new.owner_id;
  new.snapshot:=new.snapshot||jsonb_build_object('prey',active);return new;
 end if;
 if old.finished_at is null and new.finished_at is not null and new.plan is not null then
  select prey into d from oakchess_server.hunt_profiles where owner_id=new.owner_id for update;
  for used in select value from jsonb_array_elements(coalesce(new.plan->'preyUsage','[]')) loop
   amount:=(used->>'count')::integer;
   if amount not between 1 and 6 then raise exception 'Consumo Prey inválido.';end if;
   for slot in 0..2 loop
    entry:=d->'slots'->slot;
    if entry->'active'->>'id'=used->>'id' then
     remaining:=greatest(0,(entry->'active'->>'remaining')::integer-amount);
     entry:=case when remaining=0 then entry-'active' else jsonb_set(entry,'{active,remaining}',to_jsonb(remaining)) end;
     d:=jsonb_set(d,array['slots',slot::text],entry);
    end if;
   end loop;
  end loop;
  update oakchess_server.hunt_profiles set prey=d where owner_id=new.owner_id;
 end if;
 return new;
end $$;
revoke all on function oakchess_server.prey_encounter() from public,anon,authenticated;
drop trigger if exists prey_encounter_insert on oakchess_server.online_hunts;
drop trigger if exists prey_encounter_finish on oakchess_server.online_hunts;
create trigger prey_encounter_insert before insert on oakchess_server.online_hunts for each row execute function oakchess_server.prey_encounter();
create trigger prey_encounter_finish before update of finished_at on oakchess_server.online_hunts for each row execute function oakchess_server.prey_encounter();
notify pgrst,'reload schema';
commit;
