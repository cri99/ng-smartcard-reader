const {ipcMain} = require('electron');
const smartcard = require('smartcard');

const Devices = smartcard.Devices;
const Iso7816Application = smartcard.Iso7816Application;

const devices = new Devices();

let userDataFromCardReader = null;
const infosToExtract = [
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
];

const init = () => {

    ipcMain.on('checkSmartCardReader', (checkSmartCardReaderEvent) => {
        checkSmartCardReaderEvent.sender.send('newUserData', userDataFromCardReader);
      });
      
      devices.on('device-activated', (event) => {
      const currentDevices = event.devices;
      let device = event.device;
      console.log(`Device '${device}' activated, devices: ${currentDevices}`);
      currentDevices.map((device, index) => {
          console.log(`Device #${index + 1}: ${device.name}`);
      });
      
      device.on('card-inserted', (event) => {
          let card = event.card;
          console.log(`\nCard '${card.getAtr()}' inserted into '${event.device}'`);
      
          card.on('command-issued', (event) => {
          console.log(`Command '${event.command}' issued to '${event.card}' `);
          });
      
          card.on('response-received', (event) => {
          /*
          console.log(
              `Response '${event.response}' received from '${event.card}' in response to '${event.command}'`
          );
          */
          });
      
          const SELECT_MF =       [0x00, 0xA4, 0x00, 0x00, 0x02, 0x3F, 0x00];
          const SELECT_DF1 =      [0x00, 0xA4, 0x00, 0x00, 0x02, 0x11, 0x00];
          const SELECT_EF_PERS =  [0x00, 0xA4, 0x00, 0x00, 0x02, 0x11, 0x02];
          const READ_BIN =        [0x00, 0xB0, 0x00, 0x00, 0x00];
      
          const application = new Iso7816Application(card);
      
          application.on('application-selected', (event) => {
          console.log(`Application Selected ${event.application}`);
          });
      
      
          application
          .issueCommand(SELECT_MF)
          .then((response) => {
              console.info(
              `Select MF Response: '${response}' '${response.meaning()}'`
              );
              return application.issueCommand(SELECT_DF1);
          })
          .then((response) => {
              console.info(
              `Select DF1 Response: '${response}' '${response.meaning()}'`
              );
              return application.issueCommand(SELECT_EF_PERS);
          
          })
          .then((response) => {
              console.info(
              `Select EF_PERS Response: '${response}' '${response.meaning()}'`
              );
              return application.issueCommand(READ_BIN);
          
          })
          .then((response) => {
              userDataFromCardReader = decodeUserData(response.buffer);
              console.info("New user data from card reader:", userDataFromCardReader);
              
              return response;
          })
          .catch((error) => {
              console.error('Error:', error, error.stack);
          });
      
      });
      device.on('card-removed', (event) => {
          console.log(`Card ${event.card} removed from '${event.name}' `);
          userDataFromCardReader = null;
      });
      });
      
      devices.on('device-deactivated', (event) => {
          console.log(
              `Device '${event.device}' deactivated, devices: [${event.devices}]`
          );
      });
      
      
      const decodeUserData = (encodedData) => {
      
        let encodedDataAsString = encodedData;
        if(encodedData instanceof Uint8Array) {
          const textEncoder = new TextDecoder("utf-8");
          encodedDataAsString = textEncoder.decode(encodedData);
        }
       
      
        console.info('Decoding string: ' + encodedDataAsString);
      
        const userData = {};
        let startPos = 6;
      
        infosToExtract
          .sort((a, b) => a.order - b.order)
          .forEach(info => {
            const readNextDataResult = readNextData(encodedDataAsString, startPos, info.isDate, info.lengthPrefix);
            userData[info.code] = readNextDataResult.value;
            startPos = readNextDataResult.nextPos;
          });
      
        return userData;
      }
      
      
      readNextData = (encodedData, startPos, isDate, prefixLength) => {
        
        let lastCharPos = startPos + prefixLength;
        
        if(encodedData.length < lastCharPos) {
          return '';
        }
        const nextFieldSizeHex = encodedData.substring(startPos, lastCharPos);
        let nextFieldSize = parseInt(nextFieldSizeHex, 16);
        let result;
      
        if(nextFieldSize < 0 || encodedData.length < nextFieldSize + lastCharPos) {
          return '';
        }
      
        startPos += prefixLength;
        lastCharPos += nextFieldSize;
      
        if(isDate) {
          const dateToFormat = encodedData.substring(startPos, lastCharPos);
          const year = dateToFormat.substring(4,8);
          const month = dateToFormat.substring(2,4);
          const day = dateToFormat.substring(0,2);
          result = new Date(year, month, day);
        } else {
          result = encodedData.substring(startPos, lastCharPos);
        }
      
        return { value: result, nextPos: lastCharPos } ;  
      }
}




module.exports = {
    init
}