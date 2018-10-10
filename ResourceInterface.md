## 1.查看资源信息

请求url Resource获取所有资源的具体信息，使用get请求。

```
Curl:

curl -X GET --header 'Accept: application/json' 'http://localhost:3000/api/Resource'

GET Response：
[
  {
    "$class": "org.demo.network.Resource",
    "resourceId": "A-6",
    "headline": "block1",
    "coverUrl": "http://img0.imgtn.bdimg.com/it/u=1127002307,2148588769&fm=26&gp=0.jpg",
    "readPrice": 12,
    "ownershipPrice": 15,
    "owner": "resource:org.demo.network.Customer#A-peng",  //资源所有者ID
    "ownerChain": [],
    "readCount": 0,
    "liked": 0
  }
]
```

请求url Resource/Id获取某个资源的具体信息，使用get请求，如：

```
Curl:

curl -X GET --header 'Accept: application/json' 'http://localhost:3000/api/Resource/A-6'

GET Response：
[
  {
    "$class": "org.demo.network.Resource",
    "resourceId": "A-6",
    "headline": "block1",
    "coverUrl": "http://img0.imgtn.bdimg.com/it/u=1127002307,2148588769&fm=26&gp=0.jpg",
    "readPrice": 12,
    "ownershipPrice": 15,
    "owner": "resource:org.demo.network.Customer#A-peng",  //资源所有者ID
    "ownerChain": [],
    "readCount": 0,
    "liked": 0
  }
]
```


## 2.用户注册

功能描述：输入用户个人信息，提交，在区块链上注册用户。

需要提交的参数：

用户Id： userId 注册网站： website 用户余额： token（0）

```
POST JSON Parameters:
{
    "$class": "org.demo.network.Customer",
    "website": "A",
    "token": 0,
    "userId": "A-Alice"
}

Curl:

curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{ \ 
    "$class":"org.demo.network.Customer", \
    "website":"A", \
    "token":0, \
    "userId":"A-Alice" \ 
 }' 'http://localhost:3000/api/Customer'

```



## 3.用户上传资源信息

功能描述：输入资源信息，提交，上传成功显示资源信息。

需要提交的参数：

资源Id：resourceId， 标题：headline， 图片：coverUrl, 阅读权价格：readPrice， 所有权价格：ownershipPrice

```
POST JSON Parameters:
{
    "$class": "org.demo.network.Resource",
    "resourceId": "A-10",
    "headline": "block1",
    "coverUrl"："https://rails365.oss-cn-shenzhen.aliyuncs.com/uploads/playlist/image/14/2018/b522189b81e2f94057269b60b3ffff1e.png",
    "readPrice": 20,
    "ownershipPrice": 100,
    "owner": "resource:org.demo.network.Customer#A-qian",
    "ownerChain": [],
    "readCount": 0,
    "liked": 0
}

Curl:

curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{ \ 
    "$class":"org.demo.network.Resource", \ 
    "resourceId":"A-10", \ 
    "headline":"block1", \ 
    "coverUrl"："https://rails365.oss-cn-shenzhen.aliyuncs.com/uploads/playlist/image/14/2018/b522189b81e2f94057269b60b3ffff1e.png", \ 
    "readPrice":20, \ 
    "ownershipPrice":100, \ 
    "owner":"resource:org.demo.network.Customer#A-qian", \ 
    "readCount":0, \ 
    "liked":0 \ 
}' 'http://localhost:3000/api/Resource'

```


## 4.用户提出一个充值请求

功能描述：输入充值金额，提交，充值成功。

需要提交的参数：

用户ID: customer  充值金额: rechargeToken 

```
POST JSON Parameters:
{
    "$class": "org.demo.network.RechargeTransaction",
    "customer": "resource:org.demo.network.Customer#A-qian",
    "rechargeToken": 100,
}

Curl:

curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{ \ 
    "$class":"org.demo.network.RechargeTransaction",\ 
    "customer":"resource:org.demo.network.Customer#A-qian",\ 
    "rechargeToken":100 \ 
 }' 'http://localhost:3000/api/RechargeTransaction'

```


## 5.1 阅读权的交易

功能描述：输入要购买的资源id和购买用户id，实现阅读权的交易。

需要提交的参数：

资源id: resourceId  购买用户id： buyerId

```
POST JSON Parameters：
{
    "$class": "org.demo.network.BuyReadRightTransaction",
    "resource": "org.demo.network.Resource#A-10",  //资源id
    "buyer": "org.demo.network.Customer#A-peng",  //购买用户id
}

Curl：

curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{ \ 
    "$class": "org.demo.network.BuyReadRightTransaction", \ 
    "resource":"org.demo.network.Resource#A-10", \ 
    "buyer":"org.demo.network.Customer#A-peng" \ 
 }' '

```


## 5.2 所有权的交易

功能描述：输入要购买的资源id和购买用户id，实现阅读权的交易。

需要提交的参数：

资源id: resourceId  购买用户id： buyerId

```
POST JSON Parameters：
{
    "$class": "org.demo.network.BuyOwnershipTransaction",
    "resource": "org.demo.network.Resource#A-10",  //资源id
    "buyer": "org.demo.network.Customer#A-peng",  //购买用户id
}

Curl：

curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{ \ 
    "$class": "org.demo.network.BuyOwnershipTransaction", \ 
    "resource":"org.demo.network.Resource#A-10", \ 
    "buyer":"org.demo.network.Customer#A-peng" \ 
 }' '

```

