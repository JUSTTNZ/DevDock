const {ConfigManager} = require('./dist/main/ConfigManager');
const {ServiceManager} = require('./dist/main/ServiceManager');

console.log('íº€ Testing Dev Dashboard Backend\n');

// Initialize
const cm = new ConfigManager();
const sm = new ServiceManager(cm);

console.log('âœ… ConfigManager initialized');
console.log('âœ… ServiceManager initialized\n');

// Add a test service
console.log('í³ Adding test service...');
const serviceId = cm.addService({
  name: 'Test Service',
  command: 'node -e "console.log(\'Service running...\'); setInterval(() => console.log(\'Still running:\', new Date().toLocaleTimeString()), 2000)"',
  cwd: process.cwd(),
  autoRestart: false,
  autoStart: false
});

console.log('âœ… Service added with ID:', serviceId);

// Get all services
const services = cm.getAllServices();
console.log('í³‹ Total services:', services.length);
console.log('Service details:', services[0]);

console.log('\ní¾¬ Starting service...');
sm.startService(serviceId);

// Wait 5 seconds then stop
setTimeout(() => {
  console.log('\ní»‘ Stopping service...');
  sm.stopService(serviceId);
  
  setTimeout(() => {
    console.log('\nâœ… Test complete!');
    process.exit(0);
  }, 1000);
}, 5000);
