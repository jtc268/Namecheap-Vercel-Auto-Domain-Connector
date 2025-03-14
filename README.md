# Namecheap+Vercel Auto Domain Connector

A simple tool to automatically connect your Namecheap domains to Vercel projects without manual configuration.

## What This Does

This tool automates the process of:
1. Adding your domain to a Vercel project
2. Configuring the correct DNS records in Namecheap
3. Setting minimum TTL values (1 minute) for fastest propagation

## Requirements

- Node.js installed
- A Namecheap account with API access enabled
- A Vercel account with a project you want to connect
- Your domain registered with Namecheap

## Setup

1. Clone this repository
2. Run `npm install` to install dependencies
3. Edit `config.js` with your credentials:
   ```javascript
   // config.js
   module.exports = {
     NAMECHEAP_USERNAME: 'your-username',
     NAMECHEAP_API_KEY: 'your-api-key',
     VERCEL_API_KEY: 'your-vercel-api-key',
     DOMAIN: 'yourdomain.com',
     PROJECT_NAME: 'your-vercel-project-name'
   };
   ```
4. Make sure your IP address is whitelisted in Namecheap API settings

## Usage

Simply run:
```
node connect-domain.js
```

This will:
- Add your domain to your Vercel project
- Set up the standard Vercel DNS records in Namecheap:
  - A record for root domain pointing to 76.76.21.21
  - CNAME record for www subdomain pointing to cname.vercel-dns.com
- Set 1-minute TTL for fastest DNS propagation

## Additional Tools

- `check-dns.js` - Verify your current DNS settings
- `connect-domain-direct.js` - A simplified version that skips verification steps

## Important Notes

- DNS changes may take some time to propagate (typically 1-12 hours, sometimes up to 48 hours)
- Using 1-minute TTL helps speed up the propagation process
- You must whitelist your IP address in Namecheap API settings

## License

MIT