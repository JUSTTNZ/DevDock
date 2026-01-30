const {ConfigManager} = require('./dist/main/ConfigManager');
const {ServiceManager} = require('./dist/main/ServiceManager');

const cm = new ConfigManager();
const sm = new ServiceManager(cm);

console.log('íº€ Full Backend Test\n');

// Add 3 services
const frontend = cm.addService({
  name: 'Frontend',
  command: 'node -e "console.log(\'Frontend: Server started on port 3000\'); setInterval(() => console.log(\'Frontend: Request processed\'), 3000)"',
  cwd: process.cwd(),
  port: 3000,
  autoRestart: false,
  autoStart: false
});

const backend = cm.addService({
  name: 'Backend API',
  command: 'node -e "console.log(\'Backend: API server running on port 8000\'); setInterval(() => console.log(\'Backend: Database query executed\'), 2000)"',
  cwd: process.cwd(),
  port: 8000,
  autoRestart: false,
  autoStart: false
});

const database = cm.addService({
  name: 'Database',
  command: 'node -e "console.log(\'Database: PostgreSQL started\'); setInterval(() => console.log(\'Database: Active connections: 5\'), 4000)"',
  cwd: process.cwd(),
  port: 5432,
  autoRestart: false,
  autoStart: false
});

console.log('âœ… Added 3 services:');
cm.getAllServices().forEach(s => console.log('  -', s.name));

console.log('\ní¾¬ Starting all services...\n');
sm.startService(frontend);
setTimeout(() => sm.startService(backend), 500);
setTimeout(() => sm.startService(database), 1000);

// Let them run for 8 seconds
setTimeout(() => {
  console.log('\ní»‘ Stopping all services...\n');
  sm.stopService(frontend);
  sm.stopService(backend);
  sm.stopService(database);
  
  setTimeout(() => {
    console.log('\ní·¹ Cleaning up...');
    cm.deleteService(frontend);
    cm.deleteService(backend);
    cm.deleteService(database);
    console.log('âœ… Test complete!\n');
    process.exit(0);
  }, 1000);
}, 8000);
