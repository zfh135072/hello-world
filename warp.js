// Fake register for referrer to get warp plus bandwidth
const referrer = "b8153192-de67-4135-852a-e176aeabd24b"; // 左侧引号内填你的AFF ID
const timesToLoop = 1024; // 循环次数，相当于多少G
const retryTimes = 10; // 重试次数
const sleepTimes = 60000; //错误后等待重试时间
const https = require("https");
const zlib = require("zlib");

async function sendReq(){
  let okCount = 0, nokCount = 0;
  while(okCount < timesToLoop && nokCount < retryTimes){
    if(await run()){
      okCount ++;
      console.log(okCount, "Response OK #" + okCount);
      nokCount = 0;
    } else {
      nokCount ++;
      console.log(okCount, "Error and wait " + (sleepTimes/1000) + "s to next retry ...");
      await sleep(sleepTimes);
      console.log(okCount, "Error retry #" + nokCount);
    }
  }
}

//sleep ms
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function run() {
  return new Promise(resolve => {
    const install_id = genString(11);
    const postData = JSON.stringify({
      key: `${genString(43)}=`,
      install_id: install_id,
      fcm_token: `${install_id}:APA91b${genString(134)}`,
      referrer: referrer,
      warp_enabled: false,
      tos: new Date().toISOString().replace("Z", "+07:00"),
      type: "Android",
      locale: "zh_CN"
    });

    const options = {
      hostname: "api.cloudflareclient.com",
      port: 443,
      path: "/v0a745/reg",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Host: "api.cloudflareclient.com",
        Connection: "Keep-Alive",
        "Accept-Encoding": "gzip",
        "User-Agent": "okhttp/3.12.1",
        "Content-Length": postData.length
      }
    };

    const req = https.request(options, res => {
      const gzip = zlib.createGunzip();
      // const buffer = [];
      res.pipe(gzip);
      gzip
        .on("data", function(data) {
          // buffer.push(data.toString());
        })
        .on("end", function() {
          // console.dir(JSON.parse(buffer.join("")));
          resolve(true);
        })
        .on("error", function(e) {
          // console.error(e);
          resolve(false);
        });
    });

    req.on("error", error => {
      // console.error(error);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

function genString(length) {
  // https://gist.github.com/6174/6062387#gistcomment-2651745
  return [...Array(length)]
    .map(i => (~~(Math.random() * 36)).toString(36))
    .join("");
}

sendReq();