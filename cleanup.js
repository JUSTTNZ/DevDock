const {ConfigManager} = require('./dist/main/ConfigManager');
const cm = new ConfigManager();

console.log('Current services:');
const services = cm.getAllServices();
services.forEach(s => console.log('-', s.id, s.name));

console.log('\nDeleting all services...');
services.forEach(s => cm.deleteService(s.id));

console.log('✅ All services deleted');
console.log('Remaining services:', cm.getAllServices().length);
