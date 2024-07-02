# EasyCodef 활용 다건요청 예제 (Python)

### About
[aio-esaycodefpy](https://github.com/codef-io/aio-easycodefpy) 라이브러리를 활용한 다건 요청 사용 예제입니다.<br>
비동기 EasyCodef 라이브러리를 활용해 다건 요청을 간편하게 호출하실 수 있습니다.

### Quick Start
```bash
$ python -m pip install aio-easycodefpy
$ pip install asyncio
```

---

### Set Up

각 예제를 사용할 때 인증 정보와 암호화 키 정보를 세팅해서 사용합니다.<br>
사용자 구분에 맞게, 데모, 정식 서비스 타입을 올바르게 지정해주세요.

```python
# CLIENT SECRET 설정
# https://codef.io/account/keys

demo_client_id = 'abcdefg-hijklmnop'
demo_client_secret = '123456-789012'
public_key = 'wjsms-dlwlzhemdpvmdlqslek'

# 서비스 타입 (데모 : ServiceType.DEMO | 정식 : ServiceType.PRODUCT)
service_type = ServiceType.DEMO
```

실제 테스트 간 사용할 개인 정보를 입력해주세요.
아래는 예제 데이터 형식을 제시합니다.

```python
# 조회 대상 개인정보 설정
# 생년월일 (19990101 형식 [String))
identity = '20000101'

# 사용자 이름 [String]
user_name = '장원영'

# 전화번호 (01012345678 형식 [String])
phone_no = '01012345678'

# 통신사 (SKT/알뜰폰: '0', KT/알뜰폰 = '1', LGU+/알뜰폰 = '2' [String])
telecom = '0'
```

---

### Use It

[CODEF] 건강나이 알아보기 API 1차 요청부 | 요청 

```json
 {
  "organization": "0002",
  "loginType": "5",
  "loginTypeLevel": "1",
  "type": "0",
  "id": "84e077ce-3817-11ef-8fc2-326225ea6dab",
  "identity": "20000101",
  "userName": "장원영",
  "phoneNo": "01012345678",
  "telecom": "0"
}
```
 

[CODEF] 검진대상 API 요청부 | 요청 
 ```json
 {
  "organization": "0002",
  "loginType": "5",
  "loginTypeLevel": "1",
  "id": "84e077ce-3817-11ef-8fc2-326225ea6dab",
  "identity": "20000101",
  "userName": "장원영",
  "phoneNo": "01012345678",
  "telecom": "0"
}
 ``` 

[CODEF] 건강나이 알아보기 API 추가인증 응답부
```json
 {
  "result": {
    "code": "CF-03002",
    "extraMessage": "API 요청 처리가 정상 진행 중입니다. 추가 정보를 입력하세요.",
    "message": "성공",
    "transactionId": "66836059ec826ce7d6a72b50"
  },
  "data": {
    "jobIndex": 0,
    "threadIndex": 0,
    "jti": "66836059ec826ce7d6a72b50",
    "twoWayTimestamp": 1719885914576,
    "continue2Way": true,
    "extraInfo": {
      "commSimpleAuth": ""
    },
    "method": "simpleAuth"
  }
}
```


[CODEF] 건강나이 알아보기 1차 요청 정상 성공 검증 완료 (CF-03002) 

[CODEF] 간편인증 요청 시간 :  2024-07-02 11:05:14.598726<br>
[CODEF] 엔드유저에게 카카오톡 간편인증 요청을 송신했습니다. 간편인증을 완료하고 콘솔에 '1'을 입력해주세요. : 1

[CODEF] 간편인증 완료 FLAG

[CODEF] 건강나이 알아보기 2차 요청부 | 요청
 ```json
 {
  "organization": "0002",
  "loginType": "5",
  "loginTypeLevel": "1",
  "type": "0",
  "id": "84e077ce-3817-11ef-8fc2-326225ea6dab",
  "identity": "20000101",
  "userName": "장원영",
  "phoneNo": "01012345678",
  "telecom": "0",
  "twoWayInfo": {
    "jobIndex": 0,
    "threadIndex": 0,
    "jti": "66836059ec826ce7d6a72b50",
    "twoWayTimestamp": 1719885914576,
    "continue2Way": true,
    "extraInfo": {
      "commSimpleAuth": ""
    },
    "method": "simpleAuth"
  },
  "is2Way": true,
  "simpleAuth": "1"
}

 ``` 

[CODEF] 검진 대상 응답대기 해소 | 응답
```json
{
  "result": {
    "code": "CF-00000",
    "extraMessage": "조회 결과가 없습니다.",
    "message": "성공",
    "transactionId": "6683605aec826ce7d6a72b51"
  },
  "data": []
}
```
 

[CODEF] 건강나이 알아보기 2차 응답부
```json
{
  "result": {
    "code": "CF-00000",
    "extraMessage": "",
    "message": "성공",
    "transactionId": "66836059ec826ce7d6a72b50"
  },
  "data": {
    "resUserNm": "장원영",
    "resAge": "27",
    "resChronologicalAge": "23",
    "resNote": "당신의 건강나이는 실제 나이보다 4살 많습니다.",
    "commBirthDate": "20000101",
    "resGender": "여성",
    "resCheckupDate": "20230221",
    "resHeight": "176",
    "resWeight": "76",
    "resNote1": "검사결과 귀하는 이상지질혈증, 간 질환과 관련된 질병 위험이 상대적으로 높아 관리가 필요합니다. 건강수명 향상을 위해 생활습관 개선이 필요하며 정확한 진단과 관리를 위해 의사의 상담 및 지속적인 관리를 받으시길 권장해 드립니다.",
    "resChangeAfter": "위험요인 조절시 건강나이 27세 실제나이 23세",
    "resDetailList": [
      {
        "resRiskFactor": "허리둘레",
        "resState": "75",
        "resType": "적절한 허리둘레를 유지하면",
        "resDecreaseValue": "",
        "resRecommendValue": "남 : 90 미만, 여 85 미만"
      },
      {
        "resRiskFactor": "혈압(수축기)",
        "resState": "127",
        "resType": "혈압을 이상적으로 유지하면",
        "resDecreaseValue": "",
        "resRecommendValue": "120 미만"
      },
      {
        "resRiskFactor": "공복혈당",
        "resState": "74",
        "resType": "혈당을 좀 더 낮춘다면",
        "resDecreaseValue": "",
        "resRecommendValue": "100 미만"
      },
      {
        "resRiskFactor": "HDL콜레스테롤",
        "resState": "58",
        "resType": "HDL콜레스테롤",
        "resDecreaseValue": "",
        "resRecommendValue": "남:35~55 mg/dL 여:45~65 mg/dL"
      },
      {
        "resRiskFactor": "중성지방",
        "resState": "103",
        "resType": "중성지방",
        "resDecreaseValue": "",
        "resRecommendValue": "0~200 mg/dL"
      }
    ]
  }
}
```