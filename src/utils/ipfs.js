const IPFS = require('ipfs-api');
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

const uploadFile = async (info) => {
    
    const data = Buffer.from(JSON.stringify(info));
    const result = await ipfs.files.add(data);
    
    return result[0].hash;
}

const getFile = async (hash) => {
    const buf = await ipfs.files.cat(`/ipfs/${hash}`);
    try {
        return buf.toString();
    } catch (e) {
      throw new Error(`error getting file with hash ${hash}`);
    }
  }

export { uploadFile, getFile };