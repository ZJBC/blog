// 实现一个简易promise    then   all    race



/*
  看下promise的构造
  let pro = new Promise(function(resove, reject) {
    resolve('promise')
  })
  成功就resolve
  失败就reject

  下面实现下这个构造函数的主体
*/
function Promise(executor) {
  this.status = 'pending'   // 状态
  this.data = ''            // 结果值
  this.resolveCallback = [] // 成功的集合
  this.rejectCallback = []  // 失败的集合

  
  executor(resolve, reject)
  function resolve(res) {  // 成功
    if(this.status === 'pending') {
      self.status = 'resolved'
      for(let i = 0; i < this.resolveCallback.length; i++) {
        self.resolveCallback[i](res)
      }
    }
  }
  function reject(res) {   // 失败
    if(this.status === 'pending') {
      self.status = 'rejected'
      for(let i = 0; i < this.rejectCallback.length; i++) {
        self.rejectCallback[i](res)
      }
    }
  }
}


/*
  原型 .then的方法 构造
  pro.then(function(value) {
    console.log("法发顺丰的", value)
  },function(){

  })
  .then 返回也是一个promise的新对象

  下面实现下then
*/

Promise.prototype.then = function(onresove, onreject) {
  let promise2  // 返回新的promise2
  if(this.status === 'resolved') {  // 查看promise1   现在的状态
    promise2 = new Promise(function(resolve, reject) {
      let promise1val = onresove(this.data)  // 取得promise1结果
      resolve(promise1val)
    })
    return promise2
  }
  if(this.status === 'reject') {  // 查看promise1   现在的状态
    promise2 = new Promise(function(resolve, reject) {
      let promise1val = onreject(this.data)  // 取得promise1结果
      reject(promise1val)    // 返回then值作为promise2的结果
    })
    return promise2
  }
  if(this.status === 'pending') {  //等到promise状态确定后在去处理
    promise2 = new Promise(function (resolve, reject){
      this.resolveCallback.push(function(value) {
        let promise1val = onresove(this.data)
        resolve(promise1val)
      })
      this.rejectCallback.push(function(value) {
        let promise1val = onreject(this.data)
        reject(promise1val)
      })
    })
    return promise2
  }
}

/*
  没有考虑边界情况的简易promise 就实现了   
  下面实现promise 其他静态方法  all  race   
*/

function Promiseall (promsies) {
  if(!Array.isArray(promsies)) {
    console.log("不是数组")
  }
  return new Promise(function(resove, reject) {
    let promiseleng = promsies.length
    let promisenum = 0
    let res = new Array(promiseleng)
    for(let i=0; i<promiseleng; i++) {
      Promise.resove(promsies[i]).then(function(res){
        promisenum++
        res[i] = res
        if(promisenum == promiseleng) {
          resove(res)
        }
      }, function(reason){
        return reject(reason)
      })
    }
  })
}

function Promiserace(promises) {
  if(!Array.isArray(promises)) {
    console.log("不是数组")
  }
  return new Promise(function(resolve, reject) {
    let promiseleng = promises.length
    for (let i = 0; i < promiseleng; i++) {
      Promise.resolve(promises[i]).then(function(value) {
        return resolve(value)
      }, function(reason) {
        return reject(reason)
      })
    }
  })
}
/*
  场景 所有错才算错
*/
function Promisesome(promises) {
  if(!Array.isArray(promises)) {
    console.log("不是数组")
  }
  return new Promise(function(resovle, reject){
    let promiseleng = promises.length
    let filled = false
    let res = []
    for(let i=0; i<promiseleng; i++) {
      Promise.resolve(promises[i]).then(function(value){
        filled = true
        resolve(value)
      }, function(reason) {
        if(filled) {
          return
        } else {
          res.push(reason)
          if(res.length === promiseleng) {
            reject(new Error("错误"))
          }
        }
      })
    }
  })
}

/*
  场景 处理多个异步处理顺序执行
*/
function Promisereduce(promises) {
  if(!Array.isArray(promises)) {
    console.log("不是数组")
  }
  promises.reduce(function(previousValue, currentValue, currentIndex, promises){
    previousValue.then(function(res){
      ajax(currentValue(res))
    })
  }, Promise.resolve())
}


/*
  场景 应用bluebirdjs map    http://bluebirdjs.com/docs/api/promise.map.html
  结合promiseall 不用构造promsie数组
  Promise.map(fileNames, function(fileName) {
    // Promise.map awaits for returned promises as well.
      return fs.readFileAsync(fileName);
  }).then(function() {
      console.log("done");
  });
*/
function Promisemap(fielNames, cb) {
  return new Promise((resolve, reject) => {
    let curnum = 0
    let promiseleng = fielNames.length
    let res = new Array(promiseleng)


    fielNames.map((item, index) => {
      Promise.resolve(item).then(function(val){
        curnum++;
        res[index] = cb(val)
        if (curnum === promiseleng) {
          return resolve(res)
        }
      }, function(reason){
          reject(reason)
      })
    })
  })
}