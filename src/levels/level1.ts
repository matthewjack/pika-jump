// Each character is one 16x16 tile. The level is 14 rows tall.
//
//   #  ground          X  stone block      B  brick
//   ?  Poké Ball block o  Poké Ball        P  player start
//   F  goal flag
//
// Wild Pokémon (lowercase letters):
//   r  Rattata     p  Pidgey (flies)   c  Caterpie
//   b  Bulbasaur   h  Charmander       s  Squirtle
//   E  a random wild Pokémon
//
// Rows don't need to be the same length — short rows are padded with empty space.
export const LEVEL_1 = [
  '',
  '',
  '',
  '',
  '                      ?                                                  BBB?BBB                                                         X',
  '                                                                                                                                        XX',
  '                                                                                                                 p                     XXX',
  '                                                                  oooooo                                                              XXXX',
  '                ?   B?B?B                p                        BB?BBB                       BB?BB                                 XXXXX',
  '                                       o o o                XX               o o o                             o o o                XXXXXX',
  '        o o o                   XX                          XX                                          ooooo                      XXXXXXX',
  '   P                rs       c  XX                r  b      XX         E                   h  r                          s   E    XXXXXXXX        F',
  '########################################   ###################################   ###############################   #########################################',
  '########################################   ###################################   ###############################   #########################################',
];
