let obsConnectInfo = { address: '127.0.0.1:4444', password: 'password4obs' }

let mainUser = {}
helix.getUsers({login: bot.account}).then((users) => mainUser = users.data[0]).catch(err => console.log(err))

const mainChannel = `#${bot.account}`
const fs = require('fs');


// npm install obs-websocket-js
const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();

let obsConnected = false
obs.connect(obsConnectInfo).then(() => {
  console.log('connected');
  obsConnected = true
}).catch((error) => {
  // obs connect failed
  console.error(error);
});

obs.on('SwitchScenes', data => { console.log(`New Active Scene: ${data.sceneName}`); });
obs.on('error', err => { console.error('socket error:', err); });

function obsGoOffline(){
  if (obsConnected) {
    obs.sendCallback('StopStreaming', (error) => {
      if (error) {
        console.log(`ERROR Stopping Stream: ${JSON.stringify(error)}`)
      }else {
        console.log(`Stopping Stream: OK`)
      }
    });
  }
}

function obsGoOnline(){
  if (obsConnected) {
    obs.sendCallback('StartStreaming', (error) => {
      if (error) {
        console.log(`ERROR Starting Stream: ${JSON.stringify(error)}`)
      }else {
        console.log(`Starting Stream: OK`)
      }
    })
  }
}


async function obsResetScene(){
  if (obsConnected) {
    obs.send('SetCurrentScene', {'scene-name': 'blank'}).catch((error) => {console.error(error);});
    await delay(1500)
    obs.send('SetCurrentScene', {'scene-name': 'MAIN_hosted_new'}).catch((error) => {console.error(error);});
  }
}



function delay(milleseconds) {
  return new Promise(resolve => setTimeout(resolve, milleseconds))
}


bot.addCommandHandler('online', async (channel, data, args) => {
  if (mainUser && data['room-id'] == mainUser.id) {
    if (data.username == bot.account) {
      obsGoOnline()
    }
  }
})
bot.addCommandHandler('offline', async (channel, data, args) => {
  if (mainUser && data['room-id'] == mainUser.id) {
    if (data.username == bot.account) {
      obsGoOffline()
    }
  }
})
bot.addCommandHandler('reset', async (channel, data, args) => {
  if (mainUser && data['room-id'] == mainUser.id) {
    if (data.username == bot.account) {
      obsResetScene()
    }
  }
})
