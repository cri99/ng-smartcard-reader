const {ipcMain} = require('electron');
const smartcard = require('smartcard');

const { SmartCardReaderProcedures } = require('./smartcard-reader.procedures');

const Devices = smartcard.Devices;
const Iso7816Application = smartcard.Iso7816Application;

const devices = new Devices();

let userDataFromCardReader = null;

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
      
      // Chiamata procedure a cascata -> Le procedure non possono andare in parallelo!
      SmartCardReaderProcedures.readPersonalData(application)
      .then((userData) => {
        userDataFromCardReader = userData;
      })
      .then(_ => {
        return SmartCardReaderProcedures.readPublicKey(application).then(publicKey => { 
          console.info("Public Key: ", publicKey)
        });
      })
      .then(_ => {
        SmartCardReaderProcedures.readCertificate(application).then(certificate => { 
          console.info("Certificate: ", certificate);
        });
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