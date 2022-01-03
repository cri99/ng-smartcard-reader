
const BASE_SELECT_COMMAND = [0x00, 0xA4, 0x00, 0x00, 0x02];

module.exports = {
  INFOS_TO_EXTRACT: [
    {
      code: 'emitterCode',
      label: 'Codice Emittente',
      lengthPrefix: 2,
      isDate: false,
      order: 1
    },
    {
      code: 'releasedDate',
      label: 'Data di rilascio',
      lengthPrefix: 2,
      isDate: true,
      order: 2
    },
    {
      code: 'expirationDate',
      label: 'Data di scadenza',
      lengthPrefix: 2,
      isDate: true,
      order: 3
    },
    {
      code: 'lastname',
      label: 'Cognome',
      lengthPrefix: 2,
      isDate: false,
      order: 4
    },
    {
      code: 'name',
      label: 'Nome',
      lengthPrefix: 2,
      isDate: false,
      order: 5
    },
    {
      code: 'birthDate',
      label: 'Data di nascita',
      lengthPrefix: 2,
      isDate: true,
      order: 6
    },
    {
      code: 'sex',
      label: 'Sesso',
      lengthPrefix: 2,
      isDate: false,
      order: 7
    },
    {
      code: 'fiscalCode',
      label: 'Codice fiscale',
      lengthPrefix: 4,
      isDate: false,
      order: 8
    },
    {
      code: 'birthCityCode',
      label: 'Comune di nascita',
      lengthPrefix: 4,
      isDate: false,
      order: 9
    },
    {
      code: 'residenceCityCode',
      label: 'Comune di residenza',
      lengthPrefix: 6,
      isDate: false,
      order: 10
    },
    {
      code: 'residenceAddress',
      label: 'Via di residenza',
      lengthPrefix: 2,
      isDate: false,
      order: 11
    }
  ],

  APDU_COMMAND: {
    SELECT_MF:  BASE_SELECT_COMMAND.concat([0x3F, 0x00]),
    SELECT_DF1:  BASE_SELECT_COMMAND.concat([0x11, 0x00]),
    SELECT_EF_PERS:  BASE_SELECT_COMMAND.concat([0x11, 0x02]),
    READ_BIN: [0x00, 0xB0, 0x00, 0x00, 0x00]
  }
}

