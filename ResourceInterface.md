## 1.查看管理员中央账户

用户标识符 email : centralbank@email.com

用户余额 accountBalance : 0

总共发行课程币数量 totalIssueToken: 0

```
Curl:

curl -X GET --header 'Accept: application/json' 'http://IP:3040/api/CentralBank'

GET Response：
[
  {
    "$class": "token.CentralBank",
    "totalIssueToken": 222,
    "email": "centralbank@email.com",
    "accountBalance": 0.1065
  }
]
```



