const {ipcMain} = require('electron');
const smartcard = require('smartcard');
const { APDU_COMMAND } = require('./smartcard-reader.data');
const { SmartCardReaderUtility }  = require('./smartcard-reader.utility');

const Devices = smartcard.Devices;
const Iso7816Application = smartcard.Iso7816Application;

const devices = new Devices();

let userDataFromCardReader = null;


const getPersonalDataFromCard = (application) => {
  return application
  .issueCommand(APDU_COMMAND.SELECT_MF)
  .then((response) => {
      console.info(
      `Select MF Response: '${response}' '${response.meaning()}'`
      );
      return application.issueCommand(APDU_COMMAND.SELECT_DF1);
  })
  .then((response) => {
      console.info(
      `Select DF1 Response: '${response}' '${response.meaning()}'`
      );
      return application.issueCommand(APDU_COMMAND.SELECT_EF_PERS);
  
  })
  .then((response) => {
      console.info(
      `Select EF_PERS Response: '${response}' '${response.meaning()}'`
      );
      return application.issueCommand(APDU_COMMAND.READ_BIN);
  
  })
  .then((response) => {
      const userDataFromCardReader = SmartCardReaderUtility.decodeUserData(response.buffer);
      console.info("New user data from card reader:", userDataFromCardReader);
      return userDataFromCardReader;
  })
  .catch((error) => {
      console.error('Error:', error, error.stack);
  });
};


const init = () => {

  ipcMain.on('checkSmartCardReader', (checkSmartCardReaderEvent) => {
      checkSmartCardReaderEvent.sender.send('newUserData', userDataFromCardReader);
  });
    
  devices.on('device-activated', (event) => {
    let device = event.device;
    console.log(`Device '${device}' activated`);
  
  
    device.on('card-inserted', (event) => {
      let card = event.card;
      console.log(`\nCard '${card.getAtr()}' inserted into '${event.device}'`);
  
      card.on('command-issued', (event) => {
        console.log(`Command '${event.command}' issued to '${event.card}' `);
      });
  
      const application = new Iso7816Application(card);
      getPersonalDataFromCard(application).then((userData) => {
        userDataFromCardReader = userData;
      });
        
    });

    device.on('card-removed', (event) => {
        console.log(`Card ${event.card} removed from '${event.name}' `);
        userDataFromCardReader = null;
    });

  });
}


module.exports = {
    init
}