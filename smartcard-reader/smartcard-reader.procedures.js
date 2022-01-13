const { SmartCardReaderData } = require('./smartcard-reader.data');
const { SmartCardReaderUtility }  = require('./smartcard-reader.utility');

const APDU_COMMAND = SmartCardReaderData.APDU_COMMAND;

/**
 * Legge e restituisce i dati personali dell'intestatario della smartcard
 * @param {*} application 
 * @returns 
 */
const readPersonalData = (application) => {
    printStartNewProcedureMessage("START READ PERSONAL DATA");
  
    return application
    .issueCommand(APDU_COMMAND.SELECT_MF)
    .then((response) => {
        console.info(
        `Select MF Response: '${response.meaning()}'`
        );
        return application.issueCommand(APDU_COMMAND.SELECT_DF1);
    })
    .then((response) => {
        console.info(
        `Select DF1 Response: '${response.meaning()}'`
        );
        return application.issueCommand(APDU_COMMAND.SELECT_EF_PERS);
    
    })
    .then((response) => {
        console.info(
        `Select EF_PERS Response: '${response.meaning()}'`
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


  /**
   * Legge e restituisce i dati del certificato dell'intestatario della smartcard in formato ASN.1
   */
  readCertificate = async (application) => {
    printStartNewProcedureMessage("START READ CERTIFICATE");
  
    return application
    .issueCommand(APDU_COMMAND.SELECT_MF)
    .then((response) => {
        console.info(
        `Select MF Response: '${response.meaning()}'`
        );
        return application.issueCommand(APDU_COMMAND.SELECT_DF1);
    })
    .then((response) => {
        console.info(
        `Select DF1 Response: '${response.meaning()}'`
        );
        return application.issueCommand(APDU_COMMAND.SELECT_EF_CERTIFICATE);
    
    })
    .then(async () => {
        let aggregateCertificate = '';
        let reading = 0;
    
        do {
          aggregateCertificate += (await application.issueCommand(APDU_COMMAND.READ_BIN_CUSTOM_P1(reading))).data.slice(0, -4);
        } while(++reading < 7)

        return SmartCardReaderUtility.removeTrailingZeros(aggregateCertificate);
    
    })
    .catch((error) => {
        console.error('Error:', error, error.stack);
    });
  };



  verifyPin = (application, pin) => {
    printStartNewProcedureMessage("START VERIFY PIN");
  
    return application
    .issueCommand(APDU_COMMAND.SELECT_MF)
    .then((response) => {
        console.info(`Select MF Response: '${response.meaning()}'`);
        return application.issueCommand(APDU_COMMAND.VERIFY_PIN(pin));
    })
    .then((response) => {
      console.info(`Verify PIN Response: '${response.meaning()}'`);
      return response
    })
    .catch((error) => {
        console.error('Error:', error, error.stack);
    });
  }


  readRemainingPinTries = (application) => {
    printStartNewProcedureMessage("START READ REMAINING PIN TRIES");
  
    return application
    .issueCommand(APDU_COMMAND.SELECT_MF)
    .then((response) => {
        console.info(`Select MF Response: '${response.meaning()}'`);
        return application.issueCommand(APDU_COMMAND.REMAINING_PIN_TRIES);
    })
    .then((response) => {
      console.info(`Remaining PIN tries Response: '${response.meaning()}'`);
      return +response.data.slice(3, 4);
    })
    .catch((error) => {
        console.error('Error:', error, error.stack);
    });
  }




  /**
   * Legge e restituisce la chiave pubblica della smartcard
   * @param {*} application 
   * @returns 
   */
  const readPublicKey = (application) => {
    printStartNewProcedureMessage("START READ PUBLIC KEY");
  
    return application
    .issueCommand(APDU_COMMAND.SELECT_MF)
    .then((response) => {
        console.info(
        `Select MF Response: '${response.meaning()}'`
        );
        return application.issueCommand(APDU_COMMAND.SELECT_EF_KEY_PUB);
    })
    .then((response) => {
      console.info(
        `Select EF_KeyPub Response: '${response.meaning()}'`
      );
       
      return application.issueCommand(APDU_COMMAND.READ_RECORD);
    })
    .then((response) => {
      console.info(
        `READ RECORD: '${response.meaning()}'`
      );
      return response.data.slice(0, -4);
    })
    .catch((error) => {
        console.error('Error:', error, error.stack);
    });
  };




  mseSetDigitalSignatureMode = (application, pin) => {
    printStartNewProcedureMessage("START MSE SET DS");
  
    return application
    .issueCommand(APDU_COMMAND.SELECT_MF)
    .then((response) => {
        console.info(`Select MF Response: '${response.meaning()}'`);
        return application.issueCommand(APDU_COMMAND.MSE.SET_DIGITAL_SIGNATURE);
    })
    .then((response) => {
      console.info(`MSE SET DS Response: '${response.meaning()}'`);
      return response
    })
    .catch((error) => {
        console.error('Error:', error, error.stack);
    });
  }




  printStartNewProcedureMessage = (procedureName) => {
    console.info("\n\n***" + procedureName + "***\n")
  }



module.exports = {
   SmartCardReaderProcedures: {
       readPersonalData,
       readPublicKey,
       readCertificate,
       verifyPin,
       readRemainingPinTries,
       mseSetDigitalSignatureMode
   }
}