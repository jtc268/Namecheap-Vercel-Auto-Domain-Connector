const axios = require('axios');
const config = require('./config');

// First, let's get our public IP
async function getPublicIP() {
  console.log('Getting your public IP address...');
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    console.log('Your public IP:', response.data.ip);
    return response.data.ip;
  } catch (error) {
    console.error('Error getting public IP:', error.message);
    throw error;
  }
}

async function getNamecheapDNSRecords(clientIP) {
  console.log('Checking current DNS settings for', config.DOMAIN);
  
  // Parse domain into SLD and TLD
  const domainParts = config.DOMAIN.split('.');
  const TLD = domainParts.pop();
  const SLD = domainParts.join('.');
  
  try {
    const params = {
      ApiUser: config.NAMECHEAP_USERNAME,
      ApiKey: config.NAMECHEAP_API_KEY,
      UserName: config.NAMECHEAP_USERNAME,
      ClientIp: clientIP,
      Command: 'namecheap.domains.dns.getHosts',
      SLD: SLD,
      TLD: TLD
    };
    
    const response = await axios.get('https://api.namecheap.com/xml.response', { params });
    console.log('Current DNS settings:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting DNS settings:', error.message);
  }
}

// Run the check
async function checkDNS() {
  try {
    const clientIP = await getPublicIP();
    await getNamecheapDNSRecords(clientIP);
  } catch (error) {
    console.error('DNS check failed:', error);
  }
}

checkDNS();