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

async function addDomainToVercel() {
  console.log('Step 1: Adding domain to Vercel project...');
  try {
    const response = await axios.post(
      `https://api.vercel.com/v9/projects/${config.PROJECT_NAME}/domains`,
      { name: config.DOMAIN },
      { 
        headers: { 
          Authorization: `Bearer ${config.VERCEL_API_KEY}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log('Domain added to Vercel:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding domain to Vercel:', error.response?.data || error.message);
    // If domain already exists, continue anyway
    if (error.response?.status === 409) {
      console.log('Domain already exists in Vercel, continuing...');
      return { name: config.DOMAIN };
    }
    throw error;
  }
}

async function updateNamecheapDNS(clientIP) {
  console.log('Step 2: Updating DNS settings in Namecheap with standard Vercel DNS records...');
  
  // Parse domain into SLD and TLD
  const domainParts = config.DOMAIN.split('.');
  const TLD = domainParts.pop();
  const SLD = domainParts.join('.');
  
  // Build parameters for DNS update with standard Vercel DNS settings
  let params = {
    ApiUser: config.NAMECHEAP_USERNAME,
    ApiKey: config.NAMECHEAP_API_KEY,
    UserName: config.NAMECHEAP_USERNAME,
    ClientIp: clientIP,
    Command: 'namecheap.domains.dns.setHosts',
    SLD: SLD,
    TLD: TLD,
    
    // Standard Vercel A record for root domain
    HostName1: '@',
    RecordType1: 'A',
    Address1: '76.76.21.21', // Vercel's standard A record
    TTL1: config.TTL, // 1 minute TTL
    
    // CNAME for www subdomain pointing to Vercel
    HostName2: 'www',
    RecordType2: 'CNAME',
    Address2: 'cname.vercel-dns.com',
    TTL2: config.TTL, // 1 minute TTL
  };
  
  try {
    const response = await axios.get('https://api.namecheap.com/xml.response', { params });
    console.log('DNS settings updated in Namecheap');
    
    // Parse XML response to check success
    const responseText = response.data;
    if (responseText.includes('Status="OK"')) {
      console.log('DNS records successfully updated in Namecheap');
    } else {
      console.error('Error in Namecheap response:', responseText);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error updating DNS settings:', error.response?.data || error.message);
    throw error;
  }
}

async function checkDomainStatus() {
  console.log('Step 3: Checking domain status in Vercel...');
  try {
    const response = await axios.get(
      `https://api.vercel.com/v9/projects/${config.PROJECT_NAME}/domains/${config.DOMAIN}`,
      { 
        headers: { 
          Authorization: `Bearer ${config.VERCEL_API_KEY}` 
        } 
      }
    );
    
    console.log('Domain status:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error checking domain status:', error.response?.data || error.message);
    throw error;
  }
}

// Run all steps in sequence
async function connectDomain() {
  try {
    const clientIP = await getPublicIP();
    await addDomainToVercel();
    await updateNamecheapDNS(clientIP);
    console.log('DNS records have been updated with 1-minute TTL for fastest propagation.');
    console.log('Waiting 1 minute before checking domain status...');
    
    // Check status after a delay to allow for some propagation
    setTimeout(async () => {
      await checkDomainStatus();
      console.log('Domain setup process complete. While we used minimum TTL values, full propagation may still take some time depending on ISP caching.');
    }, 60000); // 1 minute delay
    
  } catch (error) {
    console.error('Domain connection process failed:', error);
  }
}

// Execute the domain connection process
connectDomain();