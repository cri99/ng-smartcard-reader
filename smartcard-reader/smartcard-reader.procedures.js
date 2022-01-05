const { APDU_COMMAND } = require('./smartcard-reader.data');
const { SmartCardReaderUtility }  = require('./smartcard-reader.utility');

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
      return response.data;
    })
    .catch((error) => {
        console.error('Error:', error, error.stack);
    });
  };

  printStartNewProcedureMessage = (procedureName) => {
    console.info("\n\n***" + procedureName + "***\n")
  }

module.exports = {
   SmartCardReaderProcedures: {
       readPersonalData,
       readPublicKey,
       readCertificate
   }
}