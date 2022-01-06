const { INFOS_TO_EXTRACT } = require('./smartcard-reader.data');

const decodeUserData = (encodedData) => {
    
  let encodedDataAsString = encodedData;
  if(encodedData instanceof Uint8Array) {
    encodedDataAsString = binToHex(encodedData);
  }

  console.info('Decoding string: ' + encodedDataAsString);

  const userData = {};
  let startPos = 6;

  INFOS_TO_EXTRACT
    .sort((a, b) => a.order - b.order)
    .forEach(info => {
      const readNextDataResult = readNextData(encodedDataAsString, startPos, info.isDate, info.lengthPrefix);
      userData[info.code] = readNextDataResult.value;
      startPos = readNextDataResult.nextPos;
    });

  return userData;
}


const readNextData = (encodedData, startPos, isDate, prefixLength) => {
  
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


const binToHex = (arrayBuffer) => {
  const textEncoder = new TextDecoder("utf-8");
  return textEncoder.decode(arrayBuffer);
} 

const asciiToHex = (asciiText) => {
    Array(...asciiText).map(asciiChar => +Number(asciiChar.charCodeAt()).toString(16))
}


const removeTrailingZeros = (stringWithTrailingZeros) => {
  const stringReversedAsArray = stringWithTrailingZeros.split('').reverse();
  const firstCharIndexDifferentFromZero = stringReversedAsArray.findIndex(char => char !== '0');
  stringReversedAsArray.splice(0, firstCharIndexDifferentFromZero);
  return stringReversedAsArray.reverse().join('');
}

module.exports = {
    SmartCardReaderUtility: {
      decodeUserData,
      binToHex,
      removeTrailingZeros,
      asciiToHex
    }
}