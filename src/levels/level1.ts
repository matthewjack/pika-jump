// Each character is one 16x16 tile. The level is 14 rows tall.
//
//   #  ground          X  stone block      B  brick
//   ?  Poké Ball block o  Poké Ball        E  Rattata
//   P  player start    F  goal flag
//
// Rows don't need to be the same length — short rows are padded with empty space.
export const LEVEL_1 = [
  '',
  '',
  '',
  '',
  '                      ?                                                  BBB?BBB                                                         X',
  '                                                                                                                                        XX',
  '                                                                                                                                       XXX',
  '                                                                  oooooo                                                              XXXX',
  '                ?   B?B?B                                         BB?BBB                       BB?BB                                 XXXXX',
  '                                       o o o                XX               o o o                             o o o                XXXXXX',
  '        o o o                   XX                          XX                                          ooooo                      XXXXXXX',
  '   P                        E   XX                E  E      XX                            E  E                          E   E     XXXXXXXX        F',
  '########################################   ###################################   ###############################   #########################################',
  '########################################   ###################################   ###############################   #########################################',
];
